import {
  ShieldCheck,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  Clock3,
  CircleCheck,
  CircleAlert,
  Bot,
  AlertTriangle,
  FileQuestion,
  ShieldAlert,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";


function Dashboard() {

  const navigate = useNavigate();

  const [controls, setControls] = useState([]);
  const [rfis, setRfis] = useState([]);
  const [risks, setRisks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dashboardSearch, setDashboardSearch] =
    useState("");

  const [selectedPeriod, setSelectedPeriod] =
    useState("FY 2026");

  const [showNotifications, setShowNotifications] =
    useState(false);


  /* =========================
     FETCH DATA
  ========================= */

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);
        setError("");

        const [
          controlsResponse,
          rfiResponse,
          risksResponse,
        ] = await Promise.all([

          fetch(
            "http://127.0.0.1:8000/api/controls/"
          ),

          fetch(
            "http://127.0.0.1:8000/api/rfi/"
          ),

          fetch(
            "http://127.0.0.1:8000/api/risks/"
          ),

        ]);


        if (
          !controlsResponse.ok ||
          !rfiResponse.ok ||
          !risksResponse.ok
        ) {
          throw new Error(
            "Failed to load dashboard data"
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
          "Unable to load dashboard data."
        );

      } finally {

        setLoading(false);

      }

    };


    loadDashboard();

  }, []);


  /* =========================
     CONTROL STATS
  ========================= */

  const totalControls =
    controls.length;


  const compliantControls =
    controls.filter(
      (control) =>
        control.status === "Compliant"
    ).length;


  const partialControls =
    controls.filter(
      (control) =>
        control.status === "Partial"
    ).length;


  const nonCompliantControls =
    controls.filter(
      (control) =>
        control.status === "Non-Compliant"
    ).length;


  const evidenceGaps =
    controls.filter(
      (control) =>
        Number(
          control.evidence_count || 0
        ) === 0
    ).length;


  const complianceRate =
    totalControls > 0
      ? (
          (compliantControls /
            totalControls) *
          100
        ).toFixed(1)
      : "0.0";


  const partialRate =
    totalControls > 0
      ? (
          (partialControls /
            totalControls) *
          100
        ).toFixed(1)
      : "0.0";


  const nonCompliantRate =
    totalControls > 0
      ? (
          (nonCompliantControls /
            totalControls) *
          100
        ).toFixed(1)
      : "0.0";


  /* =========================
     RFI STATS
  ========================= */

  const openRfis =
    rfis.filter(
      (rfi) =>
        rfi.status === "Open"
    ).length;


  const inProgressRfis =
    rfis.filter(
      (rfi) =>
        rfi.status === "In Progress"
    ).length;


  const closedRfis =
    rfis.filter(
      (rfi) =>
        rfi.status === "Closed"
    ).length;


  /* =========================
     RISK STATS
  ========================= */

  const highRisks =
    risks.filter(
      (risk) =>
        risk.risk_level === "High"
    ).length;


  const mediumRisks =
    risks.filter(
      (risk) =>
        risk.risk_level === "Medium"
    ).length;


  const lowRisks =
    risks.filter(
      (risk) =>
        risk.risk_level === "Low"
    ).length;


  /* =========================
     FRAMEWORK PROGRESS
  ========================= */

  const frameworkProgress =
    useMemo(() => {

      const frameworks = [

        {
          name: "SOC 2",
          short: "S",
          className: "",
          description:
            "Security & Availability",
        },

        {
          name: "ISO 27001",
          short: "I",
          className: "iso",
          description:
            "Information Security",
        },

        {
          name: "NIST CSF",
          short: "N",
          className: "nist",
          description:
            "Cybersecurity Framework",
        },

      ];


      return frameworks.map(
        (framework) => {

          const frameworkControls =
            controls.filter(
              (control) =>
                control.framework ===
                framework.name
            );


          const total =
            frameworkControls.length;


          const compliant =
            frameworkControls.filter(
              (control) =>
                control.status ===
                "Compliant"
            ).length;


          const percentage =
            total > 0
              ? Math.round(
                  (compliant /
                    total) *
                    100
                )
              : 0;


          return {
            ...framework,
            total,
            compliant,
            percentage,
          };

        }
      );

    }, [controls]);


  /* =========================
     RECENT ACTIVITY
  ========================= */

  const recentActivity =
    useMemo(() => {

      const activities = [];


      rfis.forEach((rfi) => {

        activities.push({

          type: "rfi",

          title:
            rfi.status === "Closed"
              ? "RFI closed"
              : rfi.status ===
                "In Progress"
              ? "RFI in progress"
              : "RFI pending response",

          subtitle:
            `${rfi.framework} • ${rfi.control_id}`,

          date:
            rfi.created_at,

          id:
            rfi.id,

        });

      });


      risks.forEach((risk) => {

        activities.push({

          type: "risk",

          title:
            risk.risk_level === "High"
              ? "High risk identified"
              : "Risk assessment created",

          subtitle:
            `${risk.framework} • ${risk.control_id}`,

          date:
            risk.created_at,

          id:
            risk.id,

        });

      });


      return activities

        .sort((a, b) => {

          if (!a.date) return 1;

          if (!b.date) return -1;

          return (
            new Date(b.date) -
            new Date(a.date)
          );

        })

        .slice(0, 5);

    }, [
      rfis,
      risks,
    ]);


  /* =========================
     SEARCH RESULTS
  ========================= */

  const searchResults =
    useMemo(() => {

      const search =
        dashboardSearch
          .trim()
          .toLowerCase();


      if (!search) {
        return [];
      }


      const results = [];


      controls.forEach((control) => {

        if (
          control.control_id
            ?.toLowerCase()
            .includes(search) ||

          control.title
            ?.toLowerCase()
            .includes(search) ||

          control.framework
            ?.toLowerCase()
            .includes(search)
        ) {

          results.push({

            type: "Control",

            title:
              control.control_id,

            subtitle:
              `${control.title} • ${control.framework}`,

            action: () =>
              navigate("/controls"),

          });

        }

      });


      rfis.forEach((rfi) => {

        if (
          rfi.rfi_number
            ?.toLowerCase()
            .includes(search) ||

          rfi.title
            ?.toLowerCase()
            .includes(search) ||

          rfi.control_id
            ?.toLowerCase()
            .includes(search)
        ) {

          results.push({

            type: "RFI",

            title:
              rfi.rfi_number,

            subtitle:
              `${rfi.title} • ${rfi.status}`,

            action: () =>
              navigate("/rfi"),

          });

        }

      });


      risks.forEach((risk) => {

        if (
          risk.risk_id
            ?.toLowerCase()
            .includes(search) ||

          risk.title
            ?.toLowerCase()
            .includes(search) ||

          risk.control_id
            ?.toLowerCase()
            .includes(search)
        ) {

          results.push({

            type: "Risk",

            title:
              risk.risk_id,

            subtitle:
              `${risk.title} • ${risk.risk_level}`,

            action: () =>
              navigate(
                "/risk-assessments"
              ),

          });

        }

      });


      return results.slice(0, 8);

    }, [
      dashboardSearch,
      controls,
      rfis,
      risks,
      navigate,
    ]);


  /* =========================
     TIME FORMAT
  ========================= */

  const formatActivityTime =
    (date) => {

      if (!date) {
        return "Recently";
      }


      const activityDate =
        new Date(date);

      const now =
        new Date();

      const diff =
        now - activityDate;


      const minutes =
        Math.floor(
          diff / 60000
        );


      if (minutes < 1) {
        return "Just now";
      }


      if (minutes < 60) {
        return `${minutes} min ago`;
      }


      const hours =
        Math.floor(
          minutes / 60
        );


      if (hours < 24) {
        return `${hours} ${
          hours === 1
            ? "hour"
            : "hours"
        } ago`;
      }


      const days =
        Math.floor(
          hours / 24
        );


      if (days === 1) {
        return "Yesterday";
      }


      return `${days} days ago`;

    };


  /* =========================
     ACTIVITY ICON
  ========================= */

  const ActivityIcon =
    ({ activity }) => {

      if (
        activity.type ===
        "risk"
      ) {

        return (

          <div className="activity-icon red">

            <AlertTriangle
              size={18}
            />

          </div>

        );

      }


      return (

        <div className="activity-icon orange">

          <Clock3
            size={18}
          />

        </div>

      );

    };


  /* =========================
     NOTIFICATION COUNT
  ========================= */

  const notificationCount =
    openRfis +
    highRisks;


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <div className="dashboard-loading">

        Loading dashboard...

      </div>

    );

  }


  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (

      <div className="dashboard-error">

        {error}

      </div>

    );

  }


  return (

    <>


      {/* =========================
          HEADER
      ========================= */}

      <header className="header">

        <div>

          <h2>
            Dashboard
          </h2>

          <p>
            Monitor your compliance posture
            and assessment progress.
          </p>

        </div>


        <div className="header-actions">


          {/* SEARCH */}

          <div
            className="search"
            style={{
              position: "relative",
            }}
          >

            <Search size={18} />

            <input
              value={
                dashboardSearch
              }
              onChange={(e) =>
                setDashboardSearch(
                  e.target.value
                )
              }
              placeholder="Search..."
            />


            {searchResults.length >
              0 && (

              <div
                className="dashboard-search-results"
                style={{
                  position:
                    "absolute",
                  top: "42px",
                  left: 0,
                  right: 0,
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e6e9ee",
                  borderRadius:
                    "8px",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.12)",
                  zIndex: 100,
                  overflow:
                    "hidden",
                }}
              >

                {searchResults.map(
                  (
                    result,
                    index
                  ) => (

                    <button
                      key={`${result.type}-${index}`}
                      onClick={() => {

                        result.action();

                        setDashboardSearch(
                          ""
                        );

                      }}
                      style={{
                        width:
                          "100%",
                        border:
                          "none",
                        background:
                          "white",
                        padding:
                          "10px 12px",
                        textAlign:
                          "left",
                        cursor:
                          "pointer",
                        borderBottom:
                          "1px solid #f0f1f3",
                      }}
                    >

                      <strong
                        style={{
                          display:
                            "block",
                          fontSize:
                            "11px",
                        }}
                      >
                        {result.type}{" "}
                        •{" "}
                        {result.title}
                      </strong>

                      <span
                        style={{
                          display:
                            "block",
                          marginTop:
                            "3px",
                          fontSize:
                            "9px",
                          color:
                            "#667085",
                        }}
                      >
                        {
                          result.subtitle
                        }
                      </span>

                    </button>

                  )
                )}

              </div>

            )}

          </div>



          {/* NOTIFICATIONS */}

          <div
            style={{
              position:
                "relative",
            }}
          >

            <button
              className="icon-button"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
            >

              <Bell
                size={19}
              />

              {notificationCount >
                0 && (

                <span className="notification-dot"></span>

              )}

            </button>


            {showNotifications && (

              <div
                style={{
                  position:
                    "absolute",
                  right: 0,
                  top: "44px",
                  width:
                    "270px",
                  background:
                    "white",
                  border:
                    "1px solid #e6e9ee",
                  borderRadius:
                    "10px",
                  boxShadow:
                    "0 15px 40px rgba(0,0,0,0.15)",
                  padding:
                    "14px",
                  zIndex: 200,
                }}
              >

                <strong
                  style={{
                    fontSize:
                      "12px",
                  }}
                >
                  Notifications
                </strong>


                <div
                  style={{
                    marginTop:
                      "12px",
                    fontSize:
                      "10px",
                    color:
                      "#667085",
                  }}
                >

                  {openRfis > 0 && (

                    <p>
                      {openRfis} RFI
                      {openRfis > 1
                        ? "s"
                        : ""}{" "}
                      require attention.
                    </p>

                  )}


                  {highRisks > 0 && (

                    <p>
                      {highRisks} high
                      risk
                      {highRisks > 1
                        ? "s"
                        : ""}{" "}
                      identified.
                    </p>

                  )}


                  {notificationCount ===
                    0 && (

                    <p>
                      No new notifications.
                    </p>

                  )}

                </div>


                <button
                  onClick={() => {

                    setShowNotifications(
                      false
                    );

                    navigate(
                      "/rfi-management"
                    );

                  }}
                  style={{
                    marginTop:
                      "5px",
                    border:
                      "none",
                    background:
                      "transparent",
                    padding: 0,
                    fontSize:
                      "10px",
                    fontWeight:
                      600,
                    cursor:
                      "pointer",
                  }}
                >
                  View RFIs
                </button>

              </div>

            )}

          </div>


        </div>

      </header>



      {/* =========================
          OVERVIEW
      ========================= */}

      <section className="section-header">

        <div>

          <h3>
            Compliance Overview
          </h3>

          <p>
            Current status across all active assessments
          </p>

        </div>


        <select
          className="period-button"
          value={
            selectedPeriod
          }
          onChange={(e) =>
            setSelectedPeriod(
              e.target.value
            )
          }
        >

          <option>
            FY 2026
          </option>

          <option>
            FY 2025
          </option>

          <option>
            FY 2024
          </option>

        </select>

      </section>



      {/* =========================
          STATS
      ========================= */}

      <section className="stats-grid">


        <div
          className="stat-card"
          onClick={() =>
            navigate("/controls")
          }
          style={{
            cursor: "pointer",
          }}
        >

          <div className="stat-top">

            <span>
              Total Controls
            </span>

            <div className="stat-icon blue">

              <ShieldCheck
                size={20}
              />

            </div>

          </div>

          <h4>
            {totalControls}
          </h4>

          <div className="stat-footer">

            <TrendingUp
              size={15}
            />

            <span>
              View all controls
            </span>

          </div>

        </div>



        <div
          className="stat-card"
          onClick={() =>
            navigate("/controls")
          }
          style={{
            cursor: "pointer",
          }}
        >

          <div className="stat-top">

            <span>
              Compliant
            </span>

            <div className="stat-icon green">

              <CircleCheck
                size={20}
              />

            </div>

          </div>

          <h4>
            {compliantControls}
          </h4>

          <div className="stat-footer green-text">

            <span>
              {complianceRate}%
              compliance rate
            </span>

          </div>

        </div>



        <div
          className="stat-card"
          onClick={() =>
            navigate("/controls")
          }
          style={{
            cursor: "pointer",
          }}
        >

          <div className="stat-top">

            <span>
              Partial
            </span>

            <div className="stat-icon orange">

              <Clock3
                size={20}
              />

            </div>

          </div>

          <h4>
            {partialControls}
          </h4>

          <div className="stat-footer orange-text">

            <span>
              {partialRate}%
              require attention
            </span>

          </div>

        </div>



        <div
          className="stat-card"
          onClick={() =>
            navigate("/controls")
          }
          style={{
            cursor: "pointer",
          }}
        >

          <div className="stat-top">

            <span>
              Non-Compliant
            </span>

            <div className="stat-icon red">

              <CircleAlert
                size={20}
              />

            </div>

          </div>

          <h4>
            {nonCompliantControls}
          </h4>

          <div className="stat-footer red-text">

            <span>
              {nonCompliantRate}%
              critical findings
            </span>

          </div>

        </div>


      </section>



      {/* =========================
          ASSESSMENT + AI
      ========================= */}

      <section className="content-grid">


        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Assessment Progress
              </h3>

              <p>
                Active compliance frameworks
              </p>

            </div>


            <button
              className="view-button"
              onClick={() =>
                navigate(
                  "/controls"
                )
              }
            >
              View all
            </button>

          </div>



          {frameworkProgress.map(
            (framework) => (

              <div
                className="assessment"
                key={
                  framework.name
                }
              >

                <div className="assessment-info">

                  <div
                    className={`framework-icon ${
                      framework.className
                    }`}
                  >
                    {
                      framework.short
                    }
                  </div>

                  <div>

                    <strong>
                      {
                        framework.name
                      }
                    </strong>

                    <span>
                      {
                        framework.description
                      }
                    </span>

                  </div>

                </div>


                <div className="progress-area">

                  <div className="progress-label">

                    <span>
                      {
                        framework.percentage
                      }%
                    </span>

                    <span>
                      {
                        framework.compliant
                      } / {
                        framework.total
                      } controls
                    </span>

                  </div>


                  <div className="progress">

                    <div
                      className="progress-fill"
                      style={{
                        width:
                          `${framework.percentage}%`,
                      }}
                    ></div>

                  </div>

                </div>

              </div>

            )
          )}

        </div>



        {/* AI CARD */}

        <div className="ai-card">

          <div className="ai-header">

            <div className="ai-icon">

              <Bot
                size={22}
              />

            </div>

            <div>

              <h3>
                AI Compliance Copilot
              </h3>

              <p>
                AI-powered insights
              </p>

            </div>

          </div>


          <div className="ai-insight">

            <span className="ai-label">
              AI INSIGHT
            </span>

            <p>
              {evidenceGaps} controls have
              missing or incomplete evidence.
              Review these items before the
              upcoming assessment deadline.
            </p>

          </div>


          <div className="ai-stat">

            <div>

              <strong>
                {evidenceGaps}
              </strong>

              <span>
                Evidence gaps
              </span>

            </div>


            <div>

              <strong>
                {highRisks}
              </strong>

              <span>
                High priority
              </span>

            </div>

          </div>


          <button
            className="ai-button"
            onClick={() =>
              navigate(
                "/ai-review"
              )
            }
          >

            <Bot
              size={17}
            />

            Review with AI

          </button>

        </div>

      </section>



      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <section className="dashboard-quick-actions">

        <button
          onClick={() =>
            navigate("/controls")
          }
        >

          <ShieldCheck
            size={17}
          />

          Controls

        </button>


        <button
          onClick={() =>
            navigate("/rfi-management")
          }
        >

          <FileQuestion
            size={17}
          />

          RFI Management

        </button>


        <button
          onClick={() =>
            navigate(
              "/risk-assessments"
            )
          }
        >

          <ShieldAlert
            size={17}
          />

          Risk Assessments

        </button>

      </section>



      {/* =========================
          RECENT ACTIVITY
      ========================= */}

      <section className="panel activity-panel">


        <div className="panel-header">

          <div>

            <h3>
              Recent Activity
            </h3>

            <p>
              Latest compliance activities
            </p>

          </div>


          <button
            className="view-button"
            onClick={() =>
              navigate("/rfi-management")
            }
          >
            View all
          </button>

        </div>



        {recentActivity.length ===
          0 && (

          <div className="activity-row">

            <div className="activity-text">

              <strong>
                No recent activity
              </strong>

              <span>
                Compliance activity will appear here.
              </span>

            </div>

          </div>

        )}



        {recentActivity.map(
          (activity, index) => (

            <div
              className="activity-row"
              key={`${activity.type}-${activity.id}-${index}`}
              onClick={() => {

                if (
                  activity.type ===
                  "rfi"
                ) {

                  navigate("/rfi");

                } else {

                  navigate(
                    "/risk-assessments"
                  );

                }

              }}
              style={{
                cursor:
                  "pointer",
              }}
            >

              <ActivityIcon
                activity={
                  activity
                }
              />


              <div className="activity-text">

                <strong>
                  {
                    activity.title
                  }
                </strong>

                <span>
                  {
                    activity.subtitle
                  }
                </span>

              </div>


              <time>

                {
                  formatActivityTime(
                    activity.date
                  )
                }

              </time>

            </div>

          )
        )}


      </section>


    </>

  );

}


export default Dashboard;