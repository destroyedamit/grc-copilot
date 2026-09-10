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

        <button className="generate-report-button">
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
            <strong>16</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon green">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Completed</span>
            <strong className="green-number">12</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon orange">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Drafts</span>
            <strong className="orange-number">4</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon red">
            <AlertTriangle size={18} />
          </div>

          <div>
            <span>Open Findings</span>
            <strong className="red-number">32</strong>
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

                      <button className="report-action">
                        <Eye size={15} />
                      </button>

                      <button className="report-action">
                        <Download size={15} />
                      </button>

                    </div>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

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

            <button className="ai-report-button">
              Generate AI Summary
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Reports;