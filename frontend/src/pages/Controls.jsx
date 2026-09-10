import {
  Search,
  Filter,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileCheck2,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

import "./Controls.css";


function StatusBadge({ status }) {

  if (status === "Compliant") {
    return (
      <span className="status-badge compliant">
        <CheckCircle2 size={14} />
        Compliant
      </span>
    );
  }


  if (status === "Partial") {
    return (
      <span className="status-badge partial">
        <Clock3 size={14} />
        Partial
      </span>
    );
  }


  return (
    <span className="status-badge non-compliant">
      <AlertCircle size={14} />
      {status || "Non-Compliant"}
    </span>
  );
}



function Controls() {

  const [controls, setControls] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =========================
     ADD CONTROL
  ========================= */

  const [showForm, setShowForm] = useState(false);


  const [formData, setFormData] = useState({
    control_id: "",
    title: "",
    framework: "SOC 2",
    status: "Pending",
  });


  /* =========================
     SEARCH + FILTER
  ========================= */

  const [searchTerm, setSearchTerm] = useState("");

  const [frameworkFilter, setFrameworkFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");


  /* =========================
     VIEW MODAL
  ========================= */

  const [selectedControl, setSelectedControl] =
    useState(null);



  /* =========================
     FETCH CONTROLS
  ========================= */

  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/controls/")

      .then((response) => {

        if (!response.ok) {
          throw new Error(
            "Failed to fetch controls"
          );
        }

        return response.json();

      })

      .then((data) => {

        setControls(data);

        setLoading(false);

      })

      .catch((error) => {

        console.error(error);

        setError(
          "Unable to load controls"
        );

        setLoading(false);

      });

  }, []);



  /* =========================
     SUMMARY COUNTS
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


  const evidenceMissing =
    controls.filter(
      (control) =>
        !control.evidence_count ||
        Number(control.evidence_count) === 0
    ).length;



  /* =========================
     FILTER CONTROLS
  ========================= */

  const filteredControls =
    controls.filter((control) => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      const matchesSearch =
        !search ||

        control.control_id
          ?.toLowerCase()
          .includes(search) ||

        control.title
          ?.toLowerCase()
          .includes(search);


      const matchesFramework =
        frameworkFilter === "All" ||

        control.framework ===
          frameworkFilter;


      const matchesStatus =
        statusFilter === "All" ||

        control.status ===
          statusFilter;


      return (
        matchesSearch &&
        matchesFramework &&
        matchesStatus
      );

    });



  /* =========================
     CREATE CONTROL
  ========================= */

  const handleCreateControl =
    async () => {

      if (
        !formData.control_id.trim() ||
        !formData.title.trim()
      ) {

        alert(
          "Please enter Control ID and Control Title."
        );

        return;
      }


      try {

        const params =
          new URLSearchParams({

            control_id:
              formData.control_id,

            title:
              formData.title,

            framework:
              formData.framework,

            status:
              formData.status,

          });


        const response =
          await fetch(
            `http://127.0.0.1:8000/api/controls/?${params}`,
            {
              method: "POST",
            }
          );


        if (!response.ok) {
          throw new Error(
            "Failed to create control"
          );
        }


        const newControl =
          await response.json();


        setControls(
          (previous) => [
            ...previous,
            newControl,
          ]
        );


        setFormData({

          control_id: "",

          title: "",

          framework: "SOC 2",

          status: "Pending",

        });


        setShowForm(false);


      } catch (error) {

        console.error(error);

        alert(
          "Unable to create control"
        );

      }

    };



  /* =========================
     AVAILABLE FRAMEWORKS
  ========================= */

  const frameworks = [
    ...new Set(
      controls
        .map(
          (control) =>
            control.framework
        )
        .filter(Boolean)
    ),
  ];



  return (

    <div className="controls-page">


      {/* =========================
          HEADER
      ========================= */}

      <div className="controls-header">

        <div>

          <h2>
            Controls
          </h2>

          <p>
            Manage and assess compliance
            controls across frameworks.
          </p>

        </div>


        <button
          className="add-control-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          + Add Control
        </button>

      </div>



      {/* =========================
          SUMMARY
      ========================= */}

      <div className="controls-summary">


        <div>

          <span>
            Total Controls
          </span>

          <strong>
            {totalControls}
          </strong>

        </div>


        <div>

          <span>
            Compliant
          </span>

          <strong className="green-number">
            {compliantControls}
          </strong>

        </div>


        <div>

          <span>
            Partial
          </span>

          <strong className="orange-number">
            {partialControls}
          </strong>

        </div>


        <div>

          <span>
            Non-Compliant
          </span>

          <strong className="red-number">
            {nonCompliantControls}
          </strong>

        </div>


        <div>

          <span>
            Evidence Missing
          </span>

          <strong>
            {evidenceMissing}
          </strong>

        </div>


      </div>



      {/* =========================
          ADD CONTROL FORM
      ========================= */}

      {showForm && (

        <div className="add-control-form">


          <div className="form-header">

            <div>

              <h3>
                Add Compliance Control
              </h3>

              <p>
                Create a new control in
                the GRC database.
              </p>

            </div>


            <button
              className="close-form"
              onClick={() =>
                setShowForm(false)
              }
            >
              ×
            </button>

          </div>



          <div className="form-grid">


            {/* CONTROL ID */}

            <div className="form-field">

              <label>
                Control ID
              </label>

              <input
                value={
                  formData.control_id
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    control_id:
                      e.target.value,
                  })
                }
                placeholder="e.g. SOC2-CC6.2"
              />

            </div>



            {/* FRAMEWORK */}

            <div className="form-field">

              <label>
                Framework
              </label>

              <select
                value={
                  formData.framework
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    framework:
                      e.target.value,
                  })
                }
              >

                <option>
                  SOC 2
                </option>

                <option>
                  ISO 27001
                </option>

                <option>
                  NIST CSF
                </option>

                <option>
                  CSA
                </option>

                <option>
                  CAIQ
                </option>

              </select>

            </div>



            {/* TITLE */}

            <div className="form-field full-width">

              <label>
                Control Title
              </label>

              <input
                value={
                  formData.title
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title:
                      e.target.value,
                  })
                }
                placeholder="Enter control description"
              />

            </div>



            {/* STATUS */}

            <div className="form-field">

              <label>
                Status
              </label>

              <select
                value={
                  formData.status
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status:
                      e.target.value,
                  })
                }
              >

                <option>
                  Pending
                </option>

                <option>
                  Compliant
                </option>

                <option>
                  Partial
                </option>

                <option>
                  Non-Compliant
                </option>

              </select>

            </div>


          </div>



          <div className="form-actions">


            <button
              className="cancel-button"
              onClick={() =>
                setShowForm(false)
              }
            >
              Cancel
            </button>


            <button
              className="save-control-button"
              onClick={
                handleCreateControl
              }
            >
              Save Control
            </button>


          </div>


        </div>

      )}



      {/* =========================
          CONTROLS PANEL
      ========================= */}

      <div className="controls-panel">


        {/* TOOLBAR */}

        <div className="controls-toolbar">


          {/* SEARCH */}

          <div className="control-search">

            <Search size={17} />

            <input
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="Search by control ID or title..."
            />

          </div>



          {/* FRAMEWORK */}

          <select
            className="filter-button"
            value={
              frameworkFilter
            }
            onChange={(e) =>
              setFrameworkFilter(
                e.target.value
              )
            }
          >

            <option value="All">
              All Frameworks
            </option>


            {frameworks.map(
              (framework) => (

                <option
                  key={framework}
                  value={framework}
                >
                  {framework}
                </option>

              )
            )}

          </select>



          {/* STATUS */}

          <select
            className="filter-button"
            value={
              statusFilter
            }
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >

            <option value="All">
              All Status
            </option>

            <option value="Compliant">
              Compliant
            </option>

            <option value="Partial">
              Partial
            </option>

            <option value="Non-Compliant">
              Non-Compliant
            </option>

            <option value="Pending">
              Pending
            </option>

          </select>



          {/* CLEAR */}

          {(searchTerm ||
            frameworkFilter !==
              "All" ||
            statusFilter !==
              "All") && (

            <button
              className="clear-filter-button"
              onClick={() => {

                setSearchTerm("");

                setFrameworkFilter(
                  "All"
                );

                setStatusFilter(
                  "All"
                );

              }}
            >
              Clear
            </button>

          )}


        </div>



        {/* =========================
            TABLE
        ========================= */}

        <div className="table-wrapper">

          <table>


            <thead>

              <tr>

                <th>
                  CONTROL
                </th>

                <th>
                  FRAMEWORK
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  EVIDENCE
                </th>

                <th>
                  LAST TESTED
                </th>

                <th>
                  ACTION
                </th>

              </tr>

            </thead>



            <tbody>


              {/* LOADING */}

              {loading && (

                <tr>

                  <td
                    colSpan="6"
                    className="loading-text"
                  >
                    Loading controls...
                  </td>

                </tr>

              )}



              {/* ERROR */}

              {error && (

                <tr>

                  <td
                    colSpan="6"
                    className="error-text"
                  >
                    {error}
                  </td>

                </tr>

              )}



              {/* NO RESULTS */}

              {!loading &&
                !error &&
                filteredControls.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan="6"
                      className="loading-text"
                    >
                      No controls found.
                    </td>

                  </tr>

                )}



              {/* DATA */}

              {!loading &&
                !error &&
                filteredControls.map(
                  (control) => (

                    <tr
                      key={
                        control.id
                      }
                    >


                      {/* CONTROL */}

                      <td>

                        <div className="control-name">

                          <strong>
                            {
                              control.control_id
                            }
                          </strong>

                          <span>
                            {
                              control.title
                            }
                          </span>

                        </div>

                      </td>



                      {/* FRAMEWORK */}

                      <td>

                        <span className="framework-badge">

                          {
                            control.framework
                          }

                        </span>

                      </td>



                      {/* STATUS */}

                      <td>

                        <StatusBadge
                          status={
                            control.status
                          }
                        />

                      </td>



                      {/* EVIDENCE */}

                      <td>

                        <div className="evidence-count">

                          <FileCheck2
                            size={15}
                          />

                          {
                            control.evidence_count ??
                            0
                          }{" "}
                          files

                        </div>

                      </td>



                      {/* LAST TESTED */}

                      <td className="tested-date">

                        {control.last_tested
                          ? new Date(
                              control.last_tested
                            ).toLocaleDateString()
                          : "Not tested"}

                      </td>



                      {/* ACTION */}

                      <td>

                        <button
                          className="view-control"
                          onClick={() =>
                            setSelectedControl(
                              control
                            )
                          }
                        >
                          View
                        </button>

                      </td>


                    </tr>

                  )
                )}


            </tbody>


          </table>

        </div>


      </div>



      {/* =========================
          CONTROL DETAILS MODAL
      ========================= */}

      {selectedControl && (

        <div className="control-modal-overlay">


          <div className="control-modal">


            <div className="control-modal-header">

              <div>

                <span>
                  CONTROL DETAILS
                </span>

                <h3>
                  {
                    selectedControl.control_id
                  }
                </h3>

                <p>
                  {
                    selectedControl.title
                  }
                </p>

              </div>


              <button
                className="control-modal-close"
                onClick={() =>
                  setSelectedControl(
                    null
                  )
                }
              >
                <X size={18} />
              </button>

            </div>



            <div className="control-detail-grid">


              <div>

                <span>
                  Control ID
                </span>

                <strong>
                  {
                    selectedControl.control_id
                  }
                </strong>

              </div>


              <div>

                <span>
                  Framework
                </span>

                <strong>
                  {
                    selectedControl.framework
                  }
                </strong>

              </div>


              <div>

                <span>
                  Status
                </span>

                <StatusBadge
                  status={
                    selectedControl.status
                  }
                />

              </div>


              <div>

                <span>
                  Evidence
                </span>

                <strong>
                  {
                    selectedControl.evidence_count ??
                    0
                  }{" "}
                  files
                </strong>

              </div>


            </div>



            <div className="control-detail-section">

              <h4>
                Control Title
              </h4>

              <p>
                {
                  selectedControl.title
                }
              </p>

            </div>



            <div className="control-detail-section">

              <h4>
                Last Tested
              </h4>

              <p>
                {
                  selectedControl.last_tested
                    ? new Date(
                        selectedControl.last_tested
                      ).toLocaleDateString()
                    : "This control has not been tested yet."
                }
              </p>

            </div>



            <div className="control-modal-footer">

              <button
                onClick={() =>
                  setSelectedControl(
                    null
                  )
                }
              >
                Close
              </button>

            </div>


          </div>

        </div>

      )}


    </div>

  );

}


export default Controls;