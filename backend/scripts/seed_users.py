from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password


users = [
    {
        "name": "Admin",
        "email": "admin@gmail.com",
        "password": "Admin@123",
        "role": "ADMINISTRATOR",
        "business_unit": "GRC",
    },
    {
        "name": "Amit Kumar",
        "email": "auditor@gmail.com",
        "password": "Auditor@123",
        "role": "AUDITOR",
        "business_unit": "Internal Audit",
    },
    {
        "name": "Noah Green",
        "email": "owner@gmail.com",
        "password": "Owner@123",
        "role": "CONTROL_OWNER",
        "business_unit": "Engineering",
    },
]


db = SessionLocal()

try:
    for data in users:

        existing_user = (
            db.query(User)
            .filter(User.email == data["email"])
            .first()
        )

        if existing_user:
            print(f"ℹ️ Already exists: {data['email']}")
            continue

        user = User(
            name=data["name"],
            email=data["email"],
            password_hash=hash_password(data["password"]),
            role=data["role"],
            business_unit=data["business_unit"],
            is_active=True,
        )

        db.add(user)

    db.commit()

    print("✅ Test users created.")

finally:
    db.close()