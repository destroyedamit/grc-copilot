import {
  Search,
  Filter,
  AlertTriangle,
  ShieldAlert,
  CircleCheck,
  Clock3,
  MoreHorizontal,
} from "lucide-react";

import { useEffect, useState } from "react";

import "./RiskAssessments.css";


function RiskScore({ score }) {
  if (score >= 10) {
    return (
      <span className="risk-score high">
        {score}
      </span>
    );
  }

  if (score >= 7) {
    return (
      <span className="risk-score medium">
        {score}
      </span>
    );
  }

  return (
    <span className="risk-score low">
      {score}
    </span>
  );
}


function RiskLevel({ score }) {
  if (score >= 10) {
    return (
      <span className="risk-level high-level">
        <AlertTriangle size={14} />
        High
      </span>
    );
  }

  if (score >= 7) {
    return (
      <span className="risk-level medium-level">
        <Clock3 size={14} />
        Medium
      </span>
    );
  }

  return (
    <span className="risk-level low-level">
      <CircleCheck size={14} />
      Low
    </span>
  );
}


function RiskStatus({ status }) {
  if (status === "Resolved" || status === "Closed") {
    return (
      <span className="risk-status resolved">
        <CircleCheck size={14} />
        {status}
      </span>
    );
  }

  if (status === "In Progress") {
    return (
      <span className="risk-status progress-status">
        <Clock3 size={14} />
        In Progress
      </span>
    );
  }

  return (
    <span className="risk-status open-status">
      <AlertTriangle size={14} />
      Open
    </span>
  );
}


function RiskAssessments() {

  const [risks, setRisks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
const [selectedRisk, setSelectedRisk] = useState(null);
const [riskStatusLoading, setRiskStatusLoading] = useState(false);
const [newRisk, setNewRisk] = useState({
  control_id: "",
  framework: "SOC 2",
  title: "",
  description: "",
  likelihood: 1,
  impact: 1,
  owner: "",
  mitigation: "",
});
  /*
   * Fetch risks from FastAPI
   */
  useEffect(() => {

    fetch("/api/risks")

      .then((response) => {

        if (!response.ok) {
          throw new Error("Failed to fetch risks");
        }

        return response.json();

      })

      .then((data) => {

        setRisks(data);

        setLoading(false);

      })

      .catch((error) => {

        console.error(error);

        setError("Unable to load risks");

        setLoading(false);

      });

  }, []);


  /*
   * Summary counts
   */

  const totalRisks = risks.length;


  const highRisks = risks.filter(
    (risk) => risk.risk_level === "High"
  ).length;


  const mediumRisks = risks.filter(
    (risk) => risk.risk_level === "Medium"
  ).length;


  const lowRisks = risks.filter(
    (risk) => risk.risk_level === "Low"
  ).length;


  const openRisks = risks.filter(
    (risk) => risk.status === "Open"
  ).length;

  const filteredRisks = risks.filter((risk) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      risk.risk_id?.toLowerCase().includes(search) ||
      risk.title?.toLowerCase().includes(search) ||
      risk.control_id?.toLowerCase().includes(search) ||
      risk.framework?.toLowerCase().includes(search);

    const matchesFramework =
      frameworkFilter === "All" ||
      risk.framework === frameworkFilter;

    const matchesSeverity =
      severityFilter === "All" ||
      risk.risk_level === severityFilter;

    const matchesStatus =
      statusFilter === "All" ||
      risk.status === statusFilter;

    return (
      matchesSearch &&
      matchesFramework &&
      matchesSeverity &&
      matchesStatus
    );
  });

  const handleCreateRisk = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "/api/risks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newRisk,
          likelihood: Number(newRisk.likelihood),
          impact: Number(newRisk.impact),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create risk");
    }

    const data = await response.json();

    setRisks((currentRisks) => [
      data.risk,
      ...currentRisks,
    ]);

    setShowCreateModal(false);

    setNewRisk({
      control_id: "",
      framework: "SOC 2",
      title: "",
      description: "",
      likelihood: 1,
      impact: 1,
      owner: "",
      mitigation: "",
    });

  } catch (error) {
    console.error(error);
    alert("Unable to create risk.");
  }
};

const updateRiskStatus = async (riskId, newStatus) => {
  setRiskStatusLoading(true);

  try {
    const response = await fetch(
      `/api/risks${riskId}/status?status=${encodeURIComponent(newStatus)}`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update risk status");
    }

    const updatedRisk = await response.json();

    setRisks((currentRisks) =>
      currentRisks.map((risk) =>
        risk.id === updatedRisk.id ? updatedRisk : risk
      )
    );

    setSelectedRisk(updatedRisk);

  } catch (error) {
    console.error(error);
    alert("Unable to update risk status.");
  } finally {
    setRiskStatusLoading(false);
  }
};
  return (

    <div className="risk-page">


      {/* =========================
          HEADER
      ========================= */}

      <div className="risk-header">

        <div>

          <h2>
            Risk Assessments
          </h2>

          <p>
            Identify, evaluate and manage security and compliance risks.
          </p>

        </div>


       <button
  className="create-risk-button"
  onClick={() => setShowCreateModal(true)}
>
  + Create Risk
</button>

      </div>



      {/* =========================
          SUMMARY
      ========================= */}

      <div className="risk-summary">


        <div className="risk-summary-card">

          <span>
            Total Risks
          </span>

          <strong>
            {totalRisks}
          </strong>

        </div>



        <div className="risk-summary-card">

          <span>
            High Risk
          </span>

          <strong className="high-number">
            {highRisks}
          </strong>

        </div>



        <div className="risk-summary-card">

          <span>
            Medium Risk
          </span>

          <strong className="medium-number">
            {mediumRisks}
          </strong>

        </div>



        <div className="risk-summary-card">

          <span>
            Low Risk
          </span>

          <strong className="low-number">
            {lowRisks}
          </strong>

        </div>



        <div className="risk-summary-card">

          <span>
            Open
          </span>

          <strong>
            {openRisks}
          </strong>

        </div>


      </div>



      {/* =========================
          CONTENT GRID
      ========================= */}

      <div className="risk-content-grid">


        {/* =========================
            RISK REGISTER
        ========================= */}

        <div className="risk-panel">


          <div className="risk-panel-header">

            <div>

              <h3>
                Risk Register
              </h3>

              <p>
                Current identified risks and treatment status
              </p>

            </div>


            <button className="filter-button">

              <Filter size={15} />

              Filter

            </button>

          </div>



          {/* Toolbar */}

          <div className="risk-toolbar">


            <div className="risk-search">

              <Search size={17} />

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search risk ID, title or control..."
              />

            </div>


            <select
              className="risk-filter"
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
            >
              <option value="All">All Frameworks</option>

              {[...new Set(risks.map((risk) => risk.framework))]
                .filter(Boolean)
                .map((framework) => (
                  <option key={framework} value={framework}>
                    {framework}
                  </option>
                ))}
            </select>


            <select
              className="risk-filter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severity</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              className="risk-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>


          </div>



          {/* Loading */}

          {loading && (

            <div className="risk-message">

              Loading risks...

            </div>

          )}



          {/* Error */}

          {error && (

            <div className="risk-message error">

              {error}

            </div>

          )}



          {/* Empty */}
          {!loading &&
            !error &&
            filteredRisks.length === 0 && (
              <div className="risk-message">
                No risks match your search or filters.
              </div>
            )}



          {/* =========================
              TABLE
          ========================= */}

          {!loading &&
            !error &&
            filteredRisks.length > 0 && (

              <div className="risk-table-wrapper">

                <table>


                  <thead>

                    <tr>

                      <th>
                        RISK
                      </th>

                      <th>
                        CONTROL
                      </th>

                      <th>
                        IMPACT
                      </th>

                      <th>
                        LIKELIHOOD
                      </th>

                      <th>
                        SCORE
                      </th>

                      <th>
                        LEVEL
                      </th>

                      <th>
                        STATUS
                      </th>

                      <th></th>

                    </tr>

                  </thead>



                  <tbody>


                    {filteredRisks.map((risk) => (

                      <tr key={risk.id}>


                        {/* RISK */}

                        <td>

                          <div className="risk-name">


                            <div className="risk-id">

                              <ShieldAlert size={16} />

                            </div>


                            <div>

                              <strong>
                                {risk.risk_id}
                              </strong>

                              <span>
                                {risk.title}
                              </span>

                            </div>


                          </div>

                        </td>



                        {/* CONTROL */}

                        <td>

                          <div className="product-info">

                            <strong>
                              {risk.control_id}
                            </strong>

                            <span>
                              {risk.framework}
                            </span>

                          </div>

                        </td>



                        {/* IMPACT */}

                        <td>

                          <span className="value-text">

                            {risk.impact}

                          </span>

                        </td>



                        {/* LIKELIHOOD */}

                        <td>

                          <span className="value-text">

                            {risk.likelihood}

                          </span>

                        </td>



                        {/* SCORE */}

                        <td>

                          <RiskScore
                            score={risk.risk_score}
                          />

                        </td>



                        {/* LEVEL */}

                        <td>

                          <RiskLevel
                            score={risk.risk_score}
                          />

                        </td>



                        {/* STATUS */}

                        <td>

                          <RiskStatus
                            status={risk.status}
                          />

                        </td>



                        {/* ACTION */}

                        <td>

                       <button
  className="more-button"
  onClick={() => setSelectedRisk(risk)}
>
  <MoreHorizontal size={17} />
</button>

                        </td>


                      </tr>

                    ))}


                  </tbody>


                </table>

              </div>

            )}


        </div>



        {/* =========================
            RISK MATRIX
        ========================= */}

        <div className="matrix-panel">


          <div className="matrix-header">

            <div>

              <h3>
                Risk Matrix
              </h3>

              <p>
                Impact vs. likelihood
              </p>

            </div>

          </div>



          <div className="matrix">


            <div className="matrix-y-label">
              IMPACT
            </div>


            <div className="matrix-grid">

              {[5, 4, 3, 2, 1].map((impact) =>
                [1, 2, 3, 4, 5].map((likelihood) => {

                  const score = impact * likelihood;

                  const matchingRisks = risks.filter(
                    (risk) =>
                      Number(risk.impact) === impact &&
                      Number(risk.likelihood) === likelihood
                  );

                  let cellClass = "low-cell";

                  if (score >= 15) {
                    cellClass = "critical-cell";
                  } else if (score >= 10) {
                    cellClass = "high-cell";
                  } else if (score >= 5) {
                    cellClass = "medium-cell";
                  }

                  return (
                    <div
                      key={`${impact}-${likelihood}`}
                      className={`matrix-cell ${cellClass}`}
                      title={
                        matchingRisks.length > 0
                          ? matchingRisks
                            .map((risk) => risk.risk_id)
                            .join(", ")
                          : `Risk Score: ${score}`
                      }
                    >
                      {matchingRisks.length > 0
                        ? matchingRisks.length
                        : score}
                    </div>
                  );

                })
              )}

            </div>


            <div className="matrix-x-label">
              LIKELIHOOD
            </div>


          </div>



          {/* Matrix Legend */}

          <div className="matrix-legend">


            <span>

              <i className="legend-dot low"></i>

              Low

            </span>


            <span>

              <i className="legend-dot medium"></i>

              Medium

            </span>


            <span>

              <i className="legend-dot high"></i>

              High

            </span>


            <span>

              <i className="legend-dot critical"></i>

              Critical

            </span>


          </div>


        </div>


      </div>
      {selectedRisk && (
  <div className="risk-modal-overlay">

    <div className="risk-modal risk-details-modal">

      <div className="risk-modal-header">

        <div>
          <span>RISK DETAILS</span>

          <h3>
            {selectedRisk.risk_id}
          </h3>

          <p>
            {selectedRisk.title}
          </p>
        </div>

        <button
          className="risk-modal-close"
          onClick={() => setSelectedRisk(null)}
        >
          ×
        </button>

      </div>


      <div className="risk-detail-grid">

        <div>
          <span>Control</span>
          <strong>
            {selectedRisk.control_id}
          </strong>
        </div>

        <div>
          <span>Framework</span>
          <strong>
            {selectedRisk.framework}
          </strong>
        </div>

        <div>
          <span>Likelihood</span>
          <strong>
            {selectedRisk.likelihood}
          </strong>
        </div>

        <div>
          <span>Impact</span>
          <strong>
            {selectedRisk.impact}
          </strong>
        </div>

        <div>
          <span>Risk Score</span>
          <RiskScore
            score={selectedRisk.risk_score}
          />
        </div>

        <div>
          <span>Risk Level</span>
          <RiskLevel
            score={selectedRisk.risk_score}
          />
        </div>

        <div>
          <span>Owner</span>
          <strong>
            {selectedRisk.owner || "-"}
          </strong>
        </div>

        <div>
          <span>Status</span>
          <RiskStatus
            status={selectedRisk.status}
          />
        </div>

      </div>


      <div className="risk-detail-section">

        <h4>
          Description
        </h4>

        <p>
          {selectedRisk.description || "No description provided."}
        </p>

      </div>


      <div className="risk-detail-section">

        <h4>
          Mitigation
        </h4>

        <p>
          {selectedRisk.mitigation || "No mitigation plan provided."}
        </p>

      </div>


      <div className="risk-status-actions">

        <span>
          Update Risk Status
        </span>

        <div>

          <button
            disabled={riskStatusLoading}
            onClick={() =>
              updateRiskStatus(
                selectedRisk.id,
                "Open"
              )
            }
          >
            Open
          </button>

          <button
            disabled={riskStatusLoading}
            onClick={() =>
              updateRiskStatus(
                selectedRisk.id,
                "In Progress"
              )
            }
          >
            In Progress
          </button>

          <button
            disabled={riskStatusLoading}
            onClick={() =>
              updateRiskStatus(
                selectedRisk.id,
                "Resolved"
              )
            }
          >
            Resolve
          </button>

          <button
            disabled={riskStatusLoading}
            onClick={() =>
              updateRiskStatus(
                selectedRisk.id,
                "Closed"
              )
            }
          >
            Close
          </button>

        </div>

      </div>


      <div className="risk-form-actions">

        <button
          type="button"
          className="risk-cancel-button"
          onClick={() => setSelectedRisk(null)}
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}

{showCreateModal && (
  <div className="risk-modal-overlay">

    <div className="risk-modal">

      <div className="risk-modal-header">

        <div>
          <span>CREATE RISK</span>

          <h3>New Risk Assessment</h3>

          <p>
            Create and assess a security or compliance risk.
          </p>
        </div>

        <button
          className="risk-modal-close"
          onClick={() => setShowCreateModal(false)}
        >
          ×
        </button>

      </div>


      <form onSubmit={handleCreateRisk}>

        <div className="risk-form-grid">

          <div className="risk-form-field">

            <label>Control ID</label>

            <input
              required
              value={newRisk.control_id}
              onChange={(e) =>
                setNewRisk({
                  ...newRisk,
                  control_id: e.target.value,
                })
              }
              placeholder="e.g. SEF.2.02"
            />

          </div>


          <div className="risk-form-field">

            <label>Framework</label>

            <select
              value={newRisk.framework}
              onChange={(e) =>
                setNewRisk({
                  ...newRisk,
                  framework: e.target.value,
                })
              }
            >
              <option value="SOC 2">SOC 2</option>
              <option value="ISO 27001">ISO 27001</option>
              <option value="PCI DSS">PCI DSS</option>
              <option value="HIPAA">HIPAA</option>
            </select>

          </div>


          <div className="risk-form-field full">

            <label>Risk Title</label>

            <input
              required
              value={newRisk.title}
              onChange={(e) =>
                setNewRisk({
                  ...newRisk,
                  title: e.target.value,
                })
              }
              placeholder="Enter risk title"
            />

          </div>


          <div className="risk-form-field full">

            <label>Description</label>

            <textarea
              value={newRisk.description}
              onChange={(e) =>
                setNewRisk({
                  ...newRisk,
                  description: e.target.value,
                })
              }
              placeholder="Describe the identified risk..."
            />

          </div>


          <div className="risk-form-field">

            <label>Likelihood</label>

            <select
              value={newRisk.likelihood}
              onChange={(e) =>
                setNewRisk({
                  ...newRisk,
                  likelihood: Number(e.target.value),
                })
              }
            >
              <option value={1}>1 - Rare</option>
              <option value={2}>2 - Unlikely</option>
              <option value={3}>3 - Possible</option>
              <option value={4}>4 - Likely</option>
              <option value={5}>5 - Almost Certain</option>
            </select>

          </div>


          <div className="risk-form-field">

            <label>Impact</label>

            <select
              value={newRisk.impact}
              onChange={(e) =>
                setNewRisk({
                  ...newRisk,
                  impact: Number(e.target.value),
                })
              }
            >
              <option value={1}>1 - Low</option>
              <option value={2}>2 - Minor</option>
              <option value={3}>3 - Moderate</option>
              <option value={4}>4 - Major</option>
              <option value={5}>5 - Critical</option>
            </select>

          </div>


          <div className="risk-form-field">

            <label>Owner</label>

            <input
              value={newRisk.owner}
              onChange={(e) =>
                setNewRisk({
                  ...newRisk,
                  owner: e.target.value,
                })
              }
              placeholder="e.g. Security Team"
            />

          </div>


          <div className="risk-form-field full">

            <label>Mitigation</label>

            <textarea
              value={newRisk.mitigation}
              onChange={(e) =>
                setNewRisk({
                  ...newRisk,
                  mitigation: e.target.value,
                })
              }
              placeholder="Describe the mitigation or treatment plan..."
            />

          </div>

        </div>


        <div className="risk-form-actions">

          <button
            type="button"
            className="risk-cancel-button"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="risk-submit-button"
          >
            Create Risk
          </button>

        </div>

      </form>

    </div>

  </div>
)}

    </div>

  );
}


export default RiskAssessments;