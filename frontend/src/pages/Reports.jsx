import {
  FileText,
  Download,
  Eye,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import "./Reports.css";

const reports = [
  {
    name: "SOC 2 Compliance Assessment",
    type: "Compliance Assessment",
    framework: "SOC 2",
    period: "FY 2026",
    controls: 120,
    compliant: 82,
    findings: 10,
    status: "Ready",
    updated: "Aug 18, 2026",
  },
  {
    name: "CSA Security Assessment",
    type: "Security Assessment",
    framework: "CSA",
    period: "Q2 2026",
    controls: 86,
    compliant: 69,
    findings: 7,
    status: "Ready",
    updated: "Aug 17, 2026",
  },
  {
    name: "Umbrella SOC 2 Assessment",
    type: "Compliance Assessment",
    framework: "SOC 2",
    period: "Q2 2026",
    controls: 94,
    compliant: 76,
    findings: 6,
    status: "Ready",
    updated: "Aug 16, 2026",
  },
  {
    name: "Risk Assessment Report",
    type: "Risk Report",
    framework: "Enterprise Risk",
    period: "FY 2026",
    controls: 48,
    compliant: 39,
    findings: 9,
    status: "Draft",
    updated: "Aug 15, 2026",
  },
];

function ReportStatus({ status }) {
  if (status === "Ready") {
    return (
      <span className="report-status ready">
        <CheckCircle2 size={13} />
        Ready
      </span>
    );
  }

  return (
    <span className="report-status draft">
      <Clock3 size={13} />
      Draft
    </span>
  );
}

function Reports() {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const requireLogin = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return false;
    }

    return true;
  };

  return (
    <div className="reports-page">

      {/* Header */}
      <div className="reports-header">

        <div>
          <h2>Reports</h2>
          <p>
            Generate, review and export compliance and risk reports.
          </p>
        </div>

        <button
  className="generate-report-button"
  onClick={() => requireLogin()}
>
  + Generate Report
</button>

      </div>

      {/* Summary */}
      <div className="reports-summary">

        <div className="report-summary-card">
          <div className="report-summary-icon blue">
            <FileText size={18} />
          </div>

          <div>
            <span>Total Reports</span>
            <strong>
  {isAuthenticated ? "16" : "—"}
</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon green">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Completed</span>
            <strong className="green-number">
  {isAuthenticated ? "12" : "—"}
</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon orange">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Drafts</span>
            <strong className="orange-number">
  {isAuthenticated ? "4" : "—"}
</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon red">
            <AlertTriangle size={18} />
          </div>

          <div>
            <span>Open Findings</span>
            <strong className="red-number">
  {isAuthenticated ? "32" : "—"}
</strong>
          </div>
        </div>

      </div>

      {/* Reports Panel */}
      <div className="reports-panel">

        <div className="reports-panel-header">

          <div>
            <h3>Generated Reports</h3>
            <p>Recent compliance and risk reports</p>
          </div>

          <div className="report-period">
            <CalendarDays size={15} />
            FY 2026
          </div>

        </div>

       {isAuthenticated ? (
  <div className="reports-table-wrapper">

    <table>

      <thead>
        <tr>
          <th>REPORT</th>
          <th>FRAMEWORK</th>
          <th>PERIOD</th>
          <th>CONTROLS</th>
          <th>FINDINGS</th>
          <th>STATUS</th>
          <th>UPDATED</th>
          <th>ACTION</th>
        </tr>
      </thead>

      <tbody>

        {reports.map((report) => (

          <tr key={report.name}>

            <td>
              <div className="report-name">

                <div className="report-file-icon">
                  <FileText size={17} />
                </div>

                <div>
                  <strong>{report.name}</strong>
                  <span>{report.type}</span>
                </div>

              </div>
            </td>

            <td>
              <span className="framework-tag">
                {report.framework}
              </span>
            </td>

            <td className="period-text">
              {report.period}
            </td>

            <td>
              <div className="control-result">
                <strong>{report.compliant}</strong>
                <span>/ {report.controls}</span>
              </div>
            </td>

            <td>
              <span className="finding-count">
                {report.findings}
              </span>
            </td>

            <td>
              <ReportStatus status={report.status} />
            </td>

            <td className="updated-text">
              {report.updated}
            </td>

            <td>
              <div className="report-actions">

                <button
                  className="report-action"
                  onClick={() => requireLogin()}
                >
                  <Eye size={15} />
                </button>

                <button
                  className="report-action"
                  onClick={() => requireLogin()}
                >
                  <Download size={15} />
                </button>

              </div>
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>
) : (
  <div className="reports-login-required">

    <div className="reports-login-icon">
      🔒
    </div>

    <h3>
      Sign in to view reports
    </h3>

    <p>
      Compliance reports, assessment results, findings
      and analytics are available to authenticated users.
    </p>

    <button
      className="reports-login-button"
      onClick={() => setShowLogin(true)}
    >
      Sign In
    </button>

  </div>
)}

      </div>

      {/* Analytics */}
      <div className="report-analytics">

        <div className="analytics-panel">

          <div className="analytics-header">
            <div>
              <h3>Compliance Summary</h3>
              <p>Overall control assessment status</p>
            </div>

            <BarChart3 size={19} />
          </div>

          {isAuthenticated ? (
  <div className="compliance-bars">

    <div className="bar-item">

      <div className="bar-label">
        <span>Compliant</span>
        <strong>68.3%</strong>
      </div>

      <div className="bar">
        <div
          className="bar-fill compliant-bar"
          style={{ width: "68.3%" }}
        />
      </div>

    </div>

    <div className="bar-item">

      <div className="bar-label">
        <span>Partial</span>
        <strong>17.5%</strong>
      </div>

      <div className="bar">
        <div
          className="bar-fill partial-bar"
          style={{ width: "17.5%" }}
        />
      </div>

    </div>

    <div className="bar-item">

      <div className="bar-label">
        <span>Non-Compliant</span>
        <strong>8.3%</strong>
      </div>

      <div className="bar">
        <div
          className="bar-fill noncompliant-bar"
          style={{ width: "8.3%" }}
        />
      </div>

    </div>

  </div>
) : (
  <div className="reports-analytics-guest">

    <div className="analytics-info-item">
      <CheckCircle2 size={17} />
      <div>
        <strong>Compliance Posture</strong>
        <span>
          View overall control assessment results.
        </span>
      </div>
    </div>

    <div className="analytics-info-item">
      <AlertTriangle size={17} />
      <div>
        <strong>Findings</strong>
        <span>
          Track open compliance gaps and findings.
        </span>
      </div>
    </div>

    <div className="analytics-info-item">
      <BarChart3 size={17} />
      <div>
        <strong>Assessment Trends</strong>
        <span>
          Monitor compliance performance over time.
        </span>
      </div>
    </div>

  </div>
)}

        </div>

        {/* AI Report */}
        <div className="report-ai-card">

          <div className="report-ai-icon">
            <BarChart3 size={21} />
          </div>

          <div>
            <h3>AI Report Summary</h3>

            <p>
              Generate an executive summary of compliance posture,
              major findings, evidence gaps and high-risk areas.
            </p>

            <button
  className="ai-report-button"
  onClick={() => requireLogin()}
>
  Generate AI Summary
</button>
          </div>

        </div>

      </div>
{showLogin && (
  <LoginModal
    onClose={() => setShowLogin(false)}
  />
)}
    </div>
  );
}

export default Reports;