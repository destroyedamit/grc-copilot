import {
  Search,
  Plus,
  FileQuestion,
  Clock3,
  CircleCheck,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";

import { useEffect, useState } from "react";

import "./RFIManagement.css";


function PriorityBadge({ priority }) {
  if (priority === "High") {
    return (
      <span className="priority-badge high">
        <AlertTriangle size={13} />
        High
      </span>
    );
  }

  if (priority === "Medium") {
    return (
      <span className="priority-badge medium">
        <Clock3 size={13} />
        Medium
      </span>
    );
  }

  return (
    <span className="priority-badge low">
      <CircleCheck size={13} />
      Low
    </span>
  );
}


function StatusBadge({ status }) {
  if (status === "Closed") {
    return (
      <span className="rfi-status completed">
        <CircleCheck size={13} />
        Closed
      </span>
    );
  }

  if (status === "In Progress") {
    return (
      <span className="rfi-status progress">
        <Clock3 size={13} />
        In Progress
      </span>
    );
  }

  return (
    <span className="rfi-status pending">
      <Clock3 size={13} />
      {status}
    </span>
  );
}


function RFIManagement() {

  const [rfiItems, setRfiItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedRfi, setSelectedRfi] = useState(null);

  const [statusLoading, setStatusLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [priorityFilter, setPriorityFilter] = useState("All");

  const [frameworkFilter, setFrameworkFilter] = useState("All");

  const [showCreateModal, setShowCreateModal] = useState(false);


  /* =========================
     CREATE RISK STATES
  ========================= */

  const [showRiskModal, setShowRiskModal] = useState(false);

  const [creatingRisk, setCreatingRisk] = useState(false);

  const [newRisk, setNewRisk] = useState({
    control_id: "",
    framework: "SOC 2",
    title: "",
    description: "",
    likelihood: 1,
    impact: 1,
    owner: "Compliance Team",
    mitigation: "",
    rfi_id: null,
  });


  /* =========================
     CREATE RFI STATES
  ========================= */

  const [newRfi, setNewRfi] = useState({
    control_id: "",
    framework: "SOC 2",
    title: "",
    description: "",
    evidence_requested: "",
    priority: "Medium",
  });


  /* =========================
     FETCH RFIs
  ========================= */

  useEffect(() => {

    fetch("/api/rfi")

      .then((response) => {

        if (!response.ok) {
          throw new Error("Failed to fetch RFIs");
        }

        return response.json();

      })

      .then((data) => {

        setRfiItems(data);

        setLoading(false);

      })

      .catch((error) => {

        console.error(error);

        setError("Unable to load RFIs");

        setLoading(false);

      });

  }, []);


  /* =========================
     UPDATE RFI STATUS
  ========================= */

  const updateRfiStatus = async (rfiId, newStatus) => {

    setStatusLoading(true);

    try {

      const response = await fetch(
        `/api/rfi${rfiId}/status?status=${encodeURIComponent(
          newStatus
        )}`,
        {
          method: "PATCH",
        }
      );


      if (!response.ok) {
        throw new Error("Failed to update RFI status");
      }


      const updatedRfi = await response.json();


      setRfiItems((items) =>
        items.map((item) =>
          item.id === updatedRfi.id
            ? updatedRfi
            : item
        )
      );


      setSelectedRfi(updatedRfi);

    } catch (error) {

      console.error(error);

      alert("Unable to update RFI status.");

    } finally {

      setStatusLoading(false);

    }

  };


  /* =========================
     SUMMARY COUNTS
  ========================= */

  const pendingCount = rfiItems.filter(
    (item) => item.status === "Open"
  ).length;


  const inProgressCount = rfiItems.filter(
    (item) => item.status === "In Progress"
  ).length;


  const completedCount = rfiItems.filter(
    (item) => item.status === "Closed"
  ).length;


  /* =========================
     SEARCH + FILTER
  ========================= */

  const filteredRfis = rfiItems.filter((item) => {

    const search = searchTerm.toLowerCase();


    const matchesSearch =
      item.rfi_number
        ?.toLowerCase()
        .includes(search) ||

      item.title
        ?.toLowerCase()
        .includes(search) ||

      item.control_id
        ?.toLowerCase()
        .includes(search) ||

      item.framework
        ?.toLowerCase()
        .includes(search);


    const matchesStatus =
      statusFilter === "All" ||
      item.status === statusFilter;


    const matchesPriority =
      priorityFilter === "All" ||
      item.priority === priorityFilter;


    const matchesFramework =
      frameworkFilter === "All" ||
      item.framework === frameworkFilter;


    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesFramework
    );

  });


  /* =========================
     CREATE RFI
  ========================= */

  const handleCreateRFI = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(
        "/api/rfi",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(newRfi),

        }
      );


      if (!response.ok) {
        throw new Error("Failed to create RFI");
      }


      const createdRfi = await response.json();


      setRfiItems((items) => [
        ...items,
        createdRfi,
      ]);


      setShowCreateModal(false);


      setNewRfi({
        control_id: "",
        framework: "SOC 2",
        title: "",
        description: "",
        evidence_requested: "",
        priority: "Medium",
      });


    } catch (error) {

      console.error(error);

      alert("Unable to create RFI.");

    }

  };


  /* =========================
     OPEN CREATE RISK
  ========================= */

  const openCreateRisk = () => {

    if (!selectedRfi) {
      return;
    }


    setNewRisk({

      control_id:
        selectedRfi.control_id || "",

      framework:
        selectedRfi.framework || "SOC 2",

      title:
        selectedRfi.title || "",

      description:
        selectedRfi.description || "",

      likelihood: 1,

      impact: 1,

      owner: "Compliance Team",

      mitigation: "",

      rfi_id: selectedRfi.id,

    });


    setShowRiskModal(true);

  };


  /* =========================
     CREATE RISK
  ========================= */

  const handleCreateRisk = async (e) => {

    e.preventDefault();


    if (!selectedRfi) {
      return;
    }


    setCreatingRisk(true);


    try {

      const response = await fetch(
        "/api/risks",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            control_id:
              newRisk.control_id,

            framework:
              newRisk.framework,

            title:
              newRisk.title,

            description:
              newRisk.description,

            likelihood:
              Number(newRisk.likelihood),

            impact:
              Number(newRisk.impact),

            owner:
              newRisk.owner,

            mitigation:
              newRisk.mitigation,

            rfi_id:
              selectedRfi.id,

          }),

        }
      );


      if (!response.ok) {

        const errorData =
          await response.json().catch(() => null);

        console.error(
          "Risk creation error:",
          errorData
        );

        throw new Error(
          "Failed to create risk"
        );

      }


      const data =
        await response.json();


      console.log(
        "Risk created successfully:",
        data
      );


      setShowRiskModal(false);


      setNewRisk({

        control_id: "",

        framework: "SOC 2",

        title: "",

        description: "",

        likelihood: 1,

        impact: 1,

        owner: "Compliance Team",

        mitigation: "",

        rfi_id: null,

      });


      alert(
        `Risk created successfully for ${selectedRfi.rfi_number}`
      );


    } catch (error) {

      console.error(error);

      alert(
        "Unable to create risk."
      );

    } finally {

      setCreatingRisk(false);

    }

  };


  return (

    <div className="rfi-page">


      {/* =========================
          HEADER
      ========================= */}

      <div className="rfi-header">

        <div>

          <h2>
            RFI Management
          </h2>

          <p>
            Track information requests, evidence dependencies and responses.
          </p>

        </div>


        <button
          className="create-rfi-button"
          onClick={() =>
            setShowCreateModal(true)
          }
        >

          <Plus size={16} />

          Create RFI

        </button>

      </div>



      {/* =========================
          SUMMARY
      ========================= */}

      <div className="rfi-summary">


        <div className="rfi-summary-card">

          <div className="summary-icon blue">

            <FileQuestion size={18} />

          </div>

          <div>

            <span>
              Total RFIs
            </span>

            <strong>
              {rfiItems.length}
            </strong>

          </div>

        </div>



        <div className="rfi-summary-card">

          <div className="summary-icon orange">

            <Clock3 size={18} />

          </div>

          <div>

            <span>
              Pending
            </span>

            <strong className="orange-number">
              {pendingCount}
            </strong>

          </div>

        </div>



        <div className="rfi-summary-card">

          <div className="summary-icon blue">

            <Clock3 size={18} />

          </div>

          <div>

            <span>
              In Progress
            </span>

            <strong>
              {inProgressCount}
            </strong>

          </div>

        </div>



        <div className="rfi-summary-card">

          <div className="summary-icon green">

            <CircleCheck size={18} />

          </div>

          <div>

            <span>
              Completed
            </span>

            <strong className="green-number">
              {completedCount}
            </strong>

          </div>

        </div>


      </div>



      {/* =========================
          MAIN PANEL
      ========================= */}

      <div className="rfi-panel">


        {/* TOOLBAR */}

        <div className="rfi-toolbar">


          <div className="rfi-search">

            <Search size={17} />

            <input
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search RFI, control or framework..."
            />

          </div>



          <select
            className="rfi-filter"
            value={frameworkFilter}
            onChange={(e) =>
              setFrameworkFilter(e.target.value)
            }
          >

            <option value="All">
              All Frameworks
            </option>


            {[
              ...new Set(
                rfiItems.map(
                  (item) => item.framework
                )
              ),
            ]
              .filter(Boolean)
              .map((framework) => (

                <option
                  key={framework}
                  value={framework}
                >
                  {framework}
                </option>

              ))}

          </select>



          <select
            className="rfi-filter"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
          >

            <option value="All">
              All Priority
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

          </select>



          <select
            className="rfi-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="All">
              All Status
            </option>

            <option value="Open">
              Open
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Closed">
              Closed
            </option>

          </select>


        </div>



        {/* LOADING */}

        {loading && (

          <div className="rfi-message">

            Loading RFIs...

          </div>

        )}



        {/* ERROR */}

        {error && (

          <div className="rfi-message error">

            {error}

          </div>

        )}



        {/* NO RESULTS */}

        {!loading &&
          !error &&
          filteredRfis.length === 0 && (

            <div className="rfi-message">

              No RFIs match your search or filters.

            </div>

          )}



        {/* TABLE */}

        {!loading &&
          !error &&
          filteredRfis.length > 0 && (

            <div className="rfi-table-wrapper">

              <table>


                <thead>

                  <tr>

                    <th>
                      RFI
                    </th>

                    <th>
                      CONTROL
                    </th>

                    <th>
                      FRAMEWORK
                    </th>

                    <th>
                      OWNER
                    </th>

                    <th>
                      PRIORITY
                    </th>

                    <th>
                      DUE DATE
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th></th>

                  </tr>

                </thead>



                <tbody>


                  {filteredRfis.map(
                    (item) => (

                      <tr key={item.id}>


                        {/* RFI */}

                        <td>

                          <div className="rfi-name">

                            <div className="rfi-icon">

                              <FileQuestion
                                size={16}
                              />

                            </div>


                            <div>

                              <strong>
                                {item.rfi_number}
                              </strong>

                              <span>
                                {item.title}
                              </span>

                            </div>

                          </div>

                        </td>



                        {/* CONTROL */}

                        <td>

                          <span className="product-tag">

                            {item.control_id}

                          </span>

                        </td>



                        {/* FRAMEWORK */}

                        <td>

                          <span className="assessment-tag">

                            {item.framework}

                          </span>

                        </td>



                        {/* OWNER */}

                        <td className="owner-text">

                          Compliance Team

                        </td>



                        {/* PRIORITY */}

                        <td>

                          <PriorityBadge
                            priority={
                              item.priority
                            }
                          />

                        </td>



                        {/* DUE DATE */}

                        <td className="due-date">

                          {item.due_date
                            ? new Date(
                                item.due_date
                              ).toLocaleDateString()
                            : "-"}

                        </td>



                        {/* STATUS */}

                        <td>

                          <StatusBadge
                            status={
                              item.status
                            }
                          />

                        </td>



                        {/* ACTION */}

                        <td>

                          <button
                            className="rfi-more"
                            onClick={() =>
                              setSelectedRfi(item)
                            }
                          >

                            <MoreHorizontal
                              size={17}
                            />

                          </button>

                        </td>


                      </tr>

                    )
                  )}


                </tbody>


              </table>

            </div>

          )}


      </div>



      {/* =========================
          RFI DETAILS MODAL
      ========================= */}

      {selectedRfi && (

        <div className="rfi-modal-overlay">

          <div className="rfi-modal">


            <div className="rfi-modal-header">

              <div>

                <span>
                  RFI DETAILS
                </span>

                <h3>
                  {selectedRfi.rfi_number}
                </h3>

                <p>
                  {selectedRfi.title}
                </p>

              </div>


              <button
                className="rfi-close"
                onClick={() =>
                  setSelectedRfi(null)
                }
              >
                ×
              </button>

            </div>



            {/* DETAILS */}

            <div className="rfi-detail-grid">


              <div>

                <span>
                  Control
                </span>

                <strong>
                  {selectedRfi.control_id}
                </strong>

              </div>


              <div>

                <span>
                  Framework
                </span>

                <strong>
                  {selectedRfi.framework}
                </strong>

              </div>


              <div>

                <span>
                  Priority
                </span>

                <PriorityBadge
                  priority={
                    selectedRfi.priority
                  }
                />

              </div>


              <div>

                <span>
                  Status
                </span>

                <StatusBadge
                  status={
                    selectedRfi.status
                  }
                />

              </div>


            </div>



            {/* DESCRIPTION */}

            <div className="rfi-detail-section">

              <h4>
                Request Description
              </h4>

              <p>
                {selectedRfi.description ||
                  "No description provided."}
              </p>

            </div>



            {/* EVIDENCE */}

            <div className="rfi-detail-section">

              <h4>
                Evidence Requested
              </h4>

              <p>
                {selectedRfi.evidence_requested ||
                  "No evidence requirement provided."}
              </p>

            </div>



            {/* STATUS */}

            <div className="rfi-status-actions">

              <span>
                Update Status
              </span>


              <div>


                <button
                  disabled={statusLoading}
                  onClick={() =>
                    updateRfiStatus(
                      selectedRfi.id,
                      "Open"
                    )
                  }
                >
                  Open
                </button>


                <button
                  disabled={statusLoading}
                  onClick={() =>
                    updateRfiStatus(
                      selectedRfi.id,
                      "In Progress"
                    )
                  }
                >
                  In Progress
                </button>


                <button
                  disabled={statusLoading}
                  onClick={() =>
                    updateRfiStatus(
                      selectedRfi.id,
                      "Closed"
                    )
                  }
                >
                  Close
                </button>


              </div>

            </div>



            {/* CREATE RISK */}

            <div className="rfi-risk-action">

              <div>

                <strong>
                  Create Risk from this RFI
                </strong>

                <p>
                  Create a risk linked to{" "}
                  {selectedRfi.rfi_number}.
                </p>

              </div>


              <button
                className="create-risk-from-rfi"
                onClick={openCreateRisk}
              >
                Create Risk
              </button>

            </div>



            {/* FOOTER */}

            <div className="rfi-modal-footer">

              <button
                onClick={() =>
                  setSelectedRfi(null)
                }
              >
                Close
              </button>

            </div>


          </div>

        </div>

      )}



      {/* =========================
          CREATE RISK FROM RFI MODAL
      ========================= */}

      {showRiskModal &&
        selectedRfi && (

          <div className="rfi-modal-overlay">

            <div className="rfi-modal create-risk-from-rfi-modal">


              <div className="rfi-modal-header">

                <div>

                  <span>
                    CREATE RISK
                  </span>

                  <h3>
                    Create Risk from RFI
                  </h3>

                  <p>
                    Risk will automatically be linked to{" "}
                    {selectedRfi.rfi_number}.
                  </p>

                </div>


                <button
                  className="rfi-close"
                  onClick={() =>
                    setShowRiskModal(false)
                  }
                >
                  ×
                </button>

              </div>



              <form onSubmit={handleCreateRisk}>


                <div className="create-rfi-form">


                  {/* CONTROL */}

                  <div className="form-field">

                    <label>
                      Control ID
                    </label>

                    <input
                      required
                      value={
                        newRisk.control_id
                      }
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          control_id:
                            e.target.value,
                        })
                      }
                    />

                  </div>



                  {/* FRAMEWORK */}

                  <div className="form-field">

                    <label>
                      Framework
                    </label>

                    <select
                      value={
                        newRisk.framework
                      }
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          framework:
                            e.target.value,
                        })
                      }
                    >

                      <option value="SOC 2">
                        SOC 2
                      </option>

                      <option value="ISO 27001">
                        ISO 27001
                      </option>

                      <option value="PCI DSS">
                        PCI DSS
                      </option>

                      <option value="HIPAA">
                        HIPAA
                      </option>

                    </select>

                  </div>



                  {/* TITLE */}

                  <div className="form-field full">

                    <label>
                      Risk Title
                    </label>

                    <input
                      required
                      value={
                        newRisk.title
                      }
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          title:
                            e.target.value,
                        })
                      }
                    />

                  </div>



                  {/* DESCRIPTION */}

                  <div className="form-field full">

                    <label>
                      Description
                    </label>

                    <textarea
                      value={
                        newRisk.description
                      }
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          description:
                            e.target.value,
                        })
                      }
                    />

                  </div>



                  {/* LIKELIHOOD */}

                  <div className="form-field">

                    <label>
                      Likelihood
                    </label>

                    <select
                      value={
                        newRisk.likelihood
                      }
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          likelihood:
                            Number(
                              e.target.value
                            ),
                        })
                      }
                    >

                      <option value={1}>
                        1 - Rare
                      </option>

                      <option value={2}>
                        2 - Unlikely
                      </option>

                      <option value={3}>
                        3 - Possible
                      </option>

                      <option value={4}>
                        4 - Likely
                      </option>

                      <option value={5}>
                        5 - Almost Certain
                      </option>

                    </select>

                  </div>



                  {/* IMPACT */}

                  <div className="form-field">

                    <label>
                      Impact
                    </label>

                    <select
                      value={
                        newRisk.impact
                      }
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          impact:
                            Number(
                              e.target.value
                            ),
                        })
                      }
                    >

                      <option value={1}>
                        1 - Low
                      </option>

                      <option value={2}>
                        2 - Minor
                      </option>

                      <option value={3}>
                        3 - Moderate
                      </option>

                      <option value={4}>
                        4 - Major
                      </option>

                      <option value={5}>
                        5 - Critical
                      </option>

                    </select>

                  </div>



                  {/* OWNER */}

                  <div className="form-field">

                    <label>
                      Owner
                    </label>

                    <input
                      value={
                        newRisk.owner
                      }
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          owner:
                            e.target.value,
                        })
                      }
                    />

                  </div>



                  {/* MITIGATION */}

                  <div className="form-field full">

                    <label>
                      Mitigation
                    </label>

                    <textarea
                      value={
                        newRisk.mitigation
                      }
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          mitigation:
                            e.target.value,
                        })
                      }
                      placeholder="Describe the mitigation plan..."
                    />

                  </div>


                </div>



                {/* ACTIONS */}

                <div className="create-rfi-actions">


                  <button
                    type="button"
                    className="cancel-rfi-button"
                    onClick={() =>
                      setShowRiskModal(false)
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="submit-rfi-button"
                    disabled={creatingRisk}
                  >

                    {creatingRisk
                      ? "Creating..."
                      : "Create Risk"}

                  </button>


                </div>


              </form>


            </div>

          </div>

        )}



      {/* =========================
          CREATE RFI MODAL
      ========================= */}

      {showCreateModal && (

        <div className="rfi-modal-overlay">

          <div className="rfi-modal create-rfi-modal">


            <div className="rfi-modal-header">

              <div>

                <span>
                  CREATE RFI
                </span>

                <h3>
                  New Request for Information
                </h3>

                <p>
                  Create a request for missing evidence or information.
                </p>

              </div>


              <button
                className="rfi-close"
                onClick={() =>
                  setShowCreateModal(false)
                }
              >
                ×
              </button>

            </div>



            <form onSubmit={handleCreateRFI}>


              <div className="create-rfi-form">


                {/* CONTROL */}

                <div className="form-field">

                  <label>
                    Control ID
                  </label>

                  <input
                    required
                    value={
                      newRfi.control_id
                    }
                    onChange={(e) =>
                      setNewRfi({
                        ...newRfi,
                        control_id:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. SEF.2.02"
                  />

                </div>



                {/* FRAMEWORK */}

                <div className="form-field">

                  <label>
                    Framework
                  </label>

                  <select
                    value={
                      newRfi.framework
                    }
                    onChange={(e) =>
                      setNewRfi({
                        ...newRfi,
                        framework:
                          e.target.value,
                      })
                    }
                  >

                    <option value="SOC 2">
                      SOC 2
                    </option>

                    <option value="ISO 27001">
                      ISO 27001
                    </option>

                    <option value="PCI DSS">
                      PCI DSS
                    </option>

                    <option value="HIPAA">
                      HIPAA
                    </option>

                  </select>

                </div>



                {/* TITLE */}

                <div className="form-field full">

                  <label>
                    RFI Title
                  </label>

                  <input
                    required
                    value={
                      newRfi.title
                    }
                    onChange={(e) =>
                      setNewRfi({
                        ...newRfi,
                        title:
                          e.target.value,
                      })
                    }
                    placeholder="Enter RFI title"
                  />

                </div>



                {/* DESCRIPTION */}

                <div className="form-field full">

                  <label>
                    Description
                  </label>

                  <textarea
                    required
                    value={
                      newRfi.description
                    }
                    onChange={(e) =>
                      setNewRfi({
                        ...newRfi,
                        description:
                          e.target.value,
                      })
                    }
                    placeholder="Describe what information is required..."
                  />

                </div>



                {/* EVIDENCE */}

                <div className="form-field full">

                  <label>
                    Evidence Requested
                  </label>

                  <input
                    required
                    value={
                      newRfi.evidence_requested
                    }
                    onChange={(e) =>
                      setNewRfi({
                        ...newRfi,
                        evidence_requested:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. Periodic User Access Review Report"
                  />

                </div>



                {/* PRIORITY */}

                <div className="form-field">

                  <label>
                    Priority
                  </label>

                  <select
                    value={
                      newRfi.priority
                    }
                    onChange={(e) =>
                      setNewRfi({
                        ...newRfi,
                        priority:
                          e.target.value,
                      })
                    }
                  >

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>

                  </select>

                </div>


              </div>



              <div className="create-rfi-actions">


                <button
                  type="button"
                  className="cancel-rfi-button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="submit-rfi-button"
                >
                  Create RFI
                </button>


              </div>


            </form>


          </div>

        </div>

      )}



      {/* =========================
          AI RFI CARD
      ========================= */}

      <div className="rfi-ai-card">


        <div className="rfi-ai-left">

          <div className="rfi-ai-icon">

            <FileQuestion size={21} />

          </div>


          <div>

            <h3>
              AI-Assisted RFI Generation
            </h3>

            <p>
              Generate an RFI automatically when required evidence is missing
              or a control has an identified gap.
            </p>

          </div>

        </div>


        <button className="generate-rfi-button">

          Generate RFI with AI

        </button>


      </div>


    </div>

  );

}


export default RFIManagement;