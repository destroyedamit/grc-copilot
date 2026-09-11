import os
from pathlib import Path

from sqlalchemy import create_engine, text


POSTGRES_URL = os.getenv("DATABASE_URL")

if not POSTGRES_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Export your Neon PostgreSQL connection string first."
    )

if POSTGRES_URL.startswith("sqlite"):
    raise RuntimeError(
        "DATABASE_URL must be a PostgreSQL connection string."
    )

if POSTGRES_URL.startswith("postgresql://"):
    POSTGRES_URL = POSTGRES_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1,
    )


BASE_DIR = Path(__file__).resolve().parents[1]
SQLITE_DB = BASE_DIR / "grc_copilot.db"

if not SQLITE_DB.exists():
    raise FileNotFoundError(
        f"Local SQLite database not found: {SQLITE_DB}"
    )


sqlite_engine = create_engine(
    f"sqlite:///{SQLITE_DB}"
)

postgres_engine = create_engine(
    POSTGRES_URL,
    pool_pre_ping=True
)


TABLES = [
    "controls",
    "evidence",
    "rfis",
    "risks",
]


def main():
    from app.database import Base
    from app.models.control import Control
    from app.models.evidence import Evidence
    from app.models.rfi import RFI
    from app.models.risk import Risk

    print(f"Local database: {SQLITE_DB}")

    # Create tables in PostgreSQL.
    Base.metadata.create_all(bind=postgres_engine)

    # Safety check: never overwrite an existing production database.
    with postgres_engine.connect() as conn:
        counts = {}

        for table in TABLES:
            counts[table] = conn.execute(
                text(f'SELECT COUNT(*) FROM "{table}"')
            ).scalar_one()

        print("\nCurrent PostgreSQL data:")
        for table, count in counts.items():
            print(f"  {table}: {count}")

        if any(counts.values()):
            raise RuntimeError(
                "Migration stopped because PostgreSQL already contains data."
            )

    # Read SQLite.
    with sqlite_engine.connect() as conn:
        source_data = {}

        print("\nLocal SQLite data:")

        for table in TABLES:
            rows = conn.execute(
                text(f'SELECT * FROM "{table}"')
            ).mappings().all()

            source_data[table] = rows
            print(f"  {table}: {len(rows)}")

    # Copy rows while preserving IDs.
    with postgres_engine.begin() as conn:
        for table in TABLES:
            rows = source_data[table]

            if not rows:
                continue

            columns = list(rows[0].keys())

            column_sql = ", ".join(
                f'"{column}"' for column in columns
            )

            values_sql = ", ".join(
                f":{column}" for column in columns
            )

            statement = text(
                f'INSERT INTO "{table}" ({column_sql}) '
                f"VALUES ({values_sql})"
            )

            conn.execute(statement, rows)

    # Move PostgreSQL ID sequences beyond the imported IDs.
    with postgres_engine.begin() as conn:
        for table in TABLES:
            max_id = conn.execute(
                text(f'SELECT MAX(id) FROM "{table}"')
            ).scalar_one()

            if max_id is not None:
                sequence_name = conn.execute(
                    text(
                        """
                        SELECT pg_get_serial_sequence(:table_name, 'id')
                        """
                    ),
                    {"table_name": table},
                ).scalar_one()

                if sequence_name:
                    conn.execute(
                        text(
                            f"SELECT setval('{sequence_name}', :max_id, true)"
                        ),
                        {"max_id": max_id},
                    )

    print("\nMigration completed successfully.")

    with postgres_engine.connect() as conn:
        print("\nPostgreSQL data after migration:")

        for table in TABLES:
            count = conn.execute(
                text(f'SELECT COUNT(*) FROM "{table}"')
            ).scalar_one()

            print(f"  {table}: {count}")


if __name__ == "__main__":
    main()