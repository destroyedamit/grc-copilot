import {
  Bot,
  ShieldAlert,
  FileWarning,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import "./AIReview.css";


function AIReview() {

  const [controls, setControls] = useState([]);
  const [rfis, setRfis] = useState([]);
  const [risks, setRisks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysisRun, setAnalysisRun] = useState(false);


  /* =========================
     LOAD DATA
  ========================= */

  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        controlsResponse,
        rfiResponse,
        risksResponse,
      ] = await Promise.all([

        fetch(
          "/api/controls"
        ),

        fetch(
          "/api/rfi"
        ),

        fetch(
          "/api/risks"
        ),

      ]);


      if (
        !controlsResponse.ok ||
        !rfiResponse.ok ||
        !risksResponse.ok
      ) {
        throw new Error(
          "Unable to load compliance data"
        );
      }


      const [
        controlsData,
        rfiData,
        risksData,
      ] = await Promise.all([

        controlsResponse.json(),

        rfiResponse.json(),

        risksResponse.json(),

      ]);


      setControls(
        Array.isArray(controlsData)
          ? controlsData
          : []
      );

      setRfis(
        Array.isArray(rfiData)
          ? rfiData
          : []
      );

      setRisks(
        Array.isArray(risksData)
          ? risksData
          : []
      );


    } catch (err) {

      console.error(err);

      setError(
        "Unable to load compliance data."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadData();

  }, []);


  /* =========================
     ANALYSIS
  ========================= */

  const analysis = useMemo(() => {

    const evidenceGaps =
      controls.filter(
        (control) =>
          Number(
            control.evidence_count || 0
          ) === 0
      );


    const partialControls =
      controls.filter(
        (control) =>
          control.status === "Partial"
      );


    const nonCompliantControls =
      controls.filter(
        (control) =>
          control.status ===
          "Non-Compliant"
      );


    const highRisks =
      risks.filter(
        (risk) =>
          risk.risk_level === "High"
      );


    const highPriorityRfis =
      rfis.filter(
        (rfi) =>
          rfi.priority === "High" &&
          rfi.status !== "Closed"
      );


    const openRfis =
      rfis.filter(
        (rfi) =>
          rfi.status === "Open"
      );


    return {

      evidenceGaps,

      partialControls,

      nonCompliantControls,

      highRisks,

      highPriorityRfis,

      openRfis,

    };

  }, [
    controls,
    rfis,
    risks,
  ]);


  /* =========================
     RUN ANALYSIS
  ========================= */

  const runAnalysis = () => {

    setAnalyzing(true);

    setTimeout(() => {

      setAnalyzing(false);
      setAnalysisRun(true);

    }, 800);

  };


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <div className="ai-review-loading">

        <Bot size={22} />

        Loading AI Compliance Review...

      </div>

    );

  }


  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (

      <div className="ai-review-error">

        {error}

        <button
          onClick={loadData}
        >
          Retry
        </button>

      </div>

    );

  }


  return (

    <div className="ai-review-page">


      {/* =========================
          HEADER
      ========================= */}

      <div className="ai-review-header">

        <div>

          <div className="ai-title-row">

            <div className="ai-main-icon">

              <Bot size={24} />

            </div>

            <div>

              <h2>
                AI Compliance Review
              </h2>

              <p>
                Analyze controls, evidence gaps,
                RFIs and risk findings.
              </p>

            </div>

          </div>

        </div>


        <button
          className="run-analysis-button"
          onClick={runAnalysis}
          disabled={analyzing}
        >

          <RefreshCw
            size={15}
            className={
              analyzing
                ? "ai-spin"
                : ""
            }
          />

          {analyzing
            ? "Analyzing..."
            : "Run AI Analysis"}

        </button>

      </div>



      {/* =========================
          SUMMARY
      ========================= */}

      <div className="ai-summary-grid">


        <div className="ai-summary-card">

          <div className="ai-summary-icon red">

            <FileWarning
              size={19}
            />

          </div>

          <div>

            <span>
              Evidence Gaps
            </span>

            <strong>
              {
                analysis
                  .evidenceGaps
                  .length
              }
            </strong>

          </div>

        </div>



        <div className="ai-summary-card">

          <div className="ai-summary-icon red">

            <ShieldAlert
              size={19}
            />

          </div>

          <div>

            <span>
              High Risks
            </span>

            <strong>
              {
                analysis
                  .highRisks
                  .length
              }
            </strong>

          </div>

        </div>



        <div className="ai-summary-card">

          <div className="ai-summary-icon orange">

            <Clock3
              size={19}
            />

          </div>

          <div>

            <span>
              Open RFIs
            </span>

            <strong>
              {
                analysis
                  .openRfis
                  .length
              }
            </strong>

          </div>

        </div>



        <div className="ai-summary-card">

          <div className="ai-summary-icon orange">

            <AlertTriangle
              size={19}
            />

          </div>

          <div>

            <span>
              Partial Controls
            </span>

            <strong>
              {
                analysis
                  .partialControls
                  .length
              }
            </strong>

          </div>

        </div>


      </div>



      {/* =========================
          AI INSIGHT
      ========================= */}

      <div className="ai-insight-panel">

        <div className="ai-insight-heading">

          <div className="ai-small-icon">

            <Bot size={18} />

          </div>

          <div>

            <h3>
              AI Compliance Insight
            </h3>

            <span>
              Based on current compliance data
            </span>

          </div>

        </div>


        <p>

          {analysis.highRisks.length > 0
            ? `There are ${
                analysis.highRisks.length
              } high-risk findings that require
              immediate attention. `
            : "No high-risk findings were detected. "}

          {analysis.evidenceGaps.length > 0
            ? `${
                analysis.evidenceGaps.length
              } controls currently have
              missing evidence. `
            : "All controls currently have evidence. "}

          {analysis.highPriorityRfis.length > 0
            ? `${
                analysis.highPriorityRfis.length
              } high-priority RFI${
                analysis.highPriorityRfis.length > 1
                  ? "s"
                  : ""
              } remain unresolved.`
            : "There are no unresolved high-priority RFIs."}

        </p>


        {analysisRun && (

          <div className="analysis-complete">

            <CheckCircle2
              size={15}
            />

            Analysis completed using
            current control, RFI and risk data.

          </div>

        )}

      </div>



      {/* =========================
          FINDINGS
      ========================= */}

      <div className="ai-section">

        <div className="ai-section-header">

          <div>

            <h3>
              AI Findings
            </h3>

            <p>
              Items that may require compliance
              team attention.
            </p>

          </div>

        </div>



        {/* HIGH RISKS */}

        {analysis.highRisks.map(
          (risk) => (

            <div
              className="ai-finding-card critical"
              key={`risk-${risk.id}`}
            >

              <div className="finding-icon">

                <ShieldAlert
                  size={19}
                />

              </div>


              <div className="finding-content">

                <div className="finding-top">

                  <span className="finding-label critical-label">
                    HIGH RISK
                  </span>

                  <span>
                    Score {risk.risk_score}
                  </span>

                </div>


                <h4>
                  {risk.title}
                </h4>


                <p>

                  {risk.description ||
                    "High-risk finding requires review and remediation."}

                </p>


                <div className="finding-meta">

                  <span>
                    {risk.control_id}
                  </span>

                  <span>
                    {risk.framework}
                  </span>

                  <span>
                    {risk.status}
                  </span>

                </div>

              </div>

            </div>

          )
        )}


{/* EVIDENCE GAPS */}

{analysis.evidenceGaps.slice(0, 5).map((control) => (
  <div
    className="ai-finding-card warning"
    key={`evidence-${control.id}`}
  >

    <div className="finding-icon">
      <FileWarning size={19} />
    </div>

    <div className="finding-content">

      <div className="finding-top">

        <span className="finding-label warning-label">
          EVIDENCE GAP
        </span>

        <span>
          {control.framework}
        </span>

      </div>

      <h4>
        {control.control_id} — {control.title}
      </h4>

      <p>
        No evidence is currently associated with this control.
        Evidence should be reviewed before the next assessment.
      </p>

      <div className="finding-meta">

        <span>
          {control.status}
        </span>

        <span>
          Evidence: 0 files
        </span>

      </div>

    </div>

  </div>
))}

   {/* PARTIAL CONTROLS */}

{analysis.partialControls.slice(0, 5).map((control) => (
  <div
    className="ai-finding-card partial"
    key={`partial-${control.id}`}
  >

    <div className="finding-icon">
      <Clock3 size={19} />
    </div>

    <div className="finding-content">

      <div className="finding-top">

        <span className="finding-label partial-label">
          ATTENTION
        </span>

        <span>
          Partial
        </span>

      </div>

      <h4>
        {control.control_id} — {control.title}
      </h4>

      <p>
        This control is partially compliant and should be
        reviewed for outstanding requirements.
      </p>

      <div className="finding-meta">

        <span>
          {control.framework}
        </span>

        <span>
          Partial compliance
        </span>

      </div>

    </div>

  </div>
))}


        {/* NOTHING FOUND */}

        {analysis.highRisks.length === 0 &&
          analysis.evidenceGaps.length === 0 &&
          analysis.partialControls.length === 0 && (

          <div className="ai-empty">

            <CheckCircle2
              size={22}
            />

            <strong>
              No significant findings
            </strong>

            <span>
              Current compliance data looks healthy.
            </span>

          </div>

        )}

      </div>



      {/* =========================
          RECOMMENDATIONS
      ========================= */}

      <div className="ai-recommendation-panel">

        <div className="ai-section-header">

          <div>

            <h3>
              Recommended Actions
            </h3>

            <p>
              Suggested next steps based on
              current findings.
            </p>

          </div>

        </div>


        <div className="recommendation-list">


          {analysis.evidenceGaps.length >
            0 && (

            <div className="recommendation">

              <div>

                <strong>
                  Review missing evidence
                </strong>

                <span>
                  {
                    analysis
                      .evidenceGaps
                      .length
                  }{" "}
                  controls require evidence.
                </span>

              </div>

              <ArrowRight
                size={16}
              />

            </div>

          )}



          {analysis.highPriorityRfis.length >
            0 && (

            <div className="recommendation">

              <div>

                <strong>
                  Address high-priority RFIs
                </strong>

                <span>
                  {
                    analysis
                      .highPriorityRfis
                      .length
                  }{" "}
                  high-priority RFIs are
                  unresolved.
                </span>

              </div>

              <ArrowRight
                size={16}
              />

            </div>

          )}



          {analysis.highRisks.length >
            0 && (

            <div className="recommendation">

              <div>

                <strong>
                  Review high-risk findings
                </strong>

                <span>
                  {
                    analysis
                      .highRisks
                      .length
                  }{" "}
                  high-risk items require
                  attention.
                </span>

              </div>

              <ArrowRight
                size={16}
              />

            </div>

          )}



          {analysis.partialControls.length >
            0 && (

            <div className="recommendation">

              <div>

                <strong>
                  Improve partial controls
                </strong>

                <span>
                  {
                    analysis
                      .partialControls
                      .length
                  }{" "}
                  controls are partially
                  compliant.
                </span>

              </div>

              <ArrowRight
                size={16}
              />

            </div>

          )}


        </div>

      </div>


    </div>

  );

}


export default AIReview;