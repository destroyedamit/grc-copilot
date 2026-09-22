import {
  Search,
  Filter,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileCheck2,
  Upload,
  X,
  FileText,
  Paperclip,
  Layers3,
  CalendarDays,
  FolderOpen,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
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
  if (status === "Pending") {
    return (
      <span className="status-badge pending">
        <Clock3 size={14} />
        Pending
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
  const {
    isAuthenticated,
  } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [controls, setControls] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* =========================
     ADD CONTROL
  ========================= */

  const [showForm, setShowForm] = useState(false);


  const [formData, setFormData] = useState({
    control_id: "",
    framework: "SOC 2",
    domain: "",
    title: "",
    description: "",
    requirement: "",
    evidence_requested: "",
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

  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  /* =========================
   IMPORT CONTROLS
========================= */

  const handleImportControls = async () => {
    if (!importFile) {
      alert("Please select a CSV or XLSX file.");
      return;
    }

    const fileName = importFile.name.toLowerCase();

    if (
      !fileName.endsWith(".csv") &&
      !fileName.endsWith(".xlsx")
    ) {
      alert("Only CSV and XLSX files are supported.");
      return;
    }

    try {
      setImportLoading(true);
      setImportResult(null);

      const formData = new FormData();
      formData.append("file", importFile);

      const response = await fetch(
        "/api/controls/import",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail?.message ||
          data?.detail ||
          "Failed to import controls"
        );
      }

      setImportResult(data);

      // Refresh controls from backend
      const controlsResponse =
        await fetch("/api/controls");

      if (controlsResponse.ok) {
        const controlsData =
          await controlsResponse.json();

        setControls(controlsData);
      }

      setImportFile(null);

    } catch (error) {
      console.error(error);

      setImportResult({
        message: error.message ||
          "Unable to import controls",
        inserted: 0,
        skipped: 0,
        errors: [],
      });

    } finally {
      setImportLoading(false);
    }
  };

  /* =========================
     FETCH CONTROLS
  ========================= */

  useEffect(() => {

    /*
     * Guest users can see the Controls screen,
     * but we do not request protected control data.
     */
    if (!isAuthenticated) {
      setControls([]);
      setLoading(false);
      setError("");
      return;
    }

    const loadControls = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await fetch("/api/controls");

        if (!response.ok) {
          throw new Error(
            "Failed to fetch controls"
          );
        }

        const data =
          await response.json();

        setControls(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Controls loading error:",
          error
        );

        setError(
          "Unable to load controls"
        );

      } finally {

        setLoading(false);

      }
    };

    loadControls();

  }, [isAuthenticated]);

  const requireLogin = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return false;
    }

    return true;
  };



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

        const params = new URLSearchParams({
          control_id: formData.control_id,
          title: formData.title,
          framework: formData.framework,
          domain: formData.domain,
          description: formData.description,
          requirement: formData.requirement,
          evidence_requested: formData.evidence_requested,
          status: formData.status,
        });


        const response =
          await fetch(
            `/api/controls?${params}`,
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
          framework: "SOC 2",
          domain: "",
          title: "",
          description: "",
          requirement: "",
          evidence_requested: "",
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

        <div className="controls-header-actions">

          <button
            className="import-control-button"
            onClick={() => {
              if (!requireLogin()) return;

              setShowImport(true);
              setImportResult(null);
            }}
          >
            <Upload size={14} />
            Import Controls
          </button>

          <button
            className="add-control-button"
            onClick={() => {
              if (!requireLogin()) return;

              setShowForm(true);
            }}
          >
            + Add Control
          </button>

        </div>

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
            {isAuthenticated ? totalControls : "—"}
          </strong>

        </div>


        <div>

          <span>
            Compliant
          </span>

          <strong className="green-number">
            {isAuthenticated ? compliantControls : "—"}
          </strong>

        </div>


        <div>

          <span>
            Partial
          </span>

          <strong className="orange-number">
            {isAuthenticated ? partialControls : "—"}
          </strong>

        </div>


        <div>

          <span>
            Non-Compliant
          </span>

          <strong className="red-number">
            {isAuthenticated ? nonCompliantControls : "—"}
          </strong>

        </div>


        <div>

          <span>
            Evidence Missing
          </span>

          <strong>
            {isAuthenticated ? evidenceMissing : "—"}
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

              </select>

            </div>
            <div className="form-field">
              <label>Domain</label>
              <select
                value={formData.domain}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    domain: e.target.value,
                  })
                }
              >
                <option value="">Select Domain</option>
                <option>Governance Risk Management</option>
                <option>Identity & Access Management</option>
                <option>Change Control & Configuration</option>
                <option>Cryptography, Encryption & Key Management</option>
                <option>Supplier / Third-Party Management</option>
                <option>Threat & Vulnerability Management</option>
                <option>Data Security & Privacy</option>
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
                placeholder="Enter control title"
              />

            </div>

            <div className="form-field full-width">
              <label>Control Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe what this control is intended to achieve..."
                rows="3"
              />
            </div>
            <div className="form-field full-width">
              <label>Requirement</label>
              <textarea
                value={formData.requirement}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirement: e.target.value,
                  })
                }
                placeholder="Enter the compliance requirement..."
                rows="3"
              />
            </div>
            <div className="form-field full-width">
              <label>Evidence Requested</label>
              <textarea
                value={formData.evidence_requested}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    evidence_requested: e.target.value,
                  })
                }
                placeholder="Specify the evidence required to validate this control..."
                rows="3"
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
          IMPORT CONTROLS MODAL
      ========================= */}

      {showImport && (

        <div className="import-modal-overlay">

          <div className="import-modal">

            <div className="import-modal-header">

              <div>
                <span>CONTROL IMPORT</span>

                <h3>
                  Import Compliance Controls
                </h3>

                <p>
                  Upload a CSV or Excel file to
                  bulk import controls.
                </p>
              </div>

              <button
                className="import-modal-close"
                onClick={() => {
                  setShowImport(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
              >
                <X size={18} />
              </button>

            </div>


            {/* FILE UPLOAD */}

            <label className="import-dropzone">

              <Upload size={24} />

              <strong>
                {importFile
                  ? importFile.name
                  : "Choose CSV or XLSX file"}
              </strong>

              <span>
                {importFile
                  ? `${(
                    importFile.size / 1024
                  ).toFixed(1)} KB`
                  : "Supported formats: .csv, .xlsx"}
              </span>

              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  setImportFile(file || null);
                  setImportResult(null);
                }}
              />

            </label>


            {/* EXPECTED COLUMNS */}

            <div className="import-info">

              <strong>
                Required columns
              </strong>

              <p>
                domain, control_id, control_title,
                control_description, requirement,
                evidence_requested, framework, status
              </p>

            </div>


            {/* RESULT */}

            {importResult && (

              <div
                className={
                  importResult.errors?.length
                    ? "import-result warning"
                    : "import-result success"
                }
              >

                <strong>
                  {importResult.message}
                </strong>

                <div className="import-result-stats">

                  <span>
                    Imported:
                    <b>
                      {importResult.inserted ?? 0}
                    </b>
                  </span>

                  <span>
                    Skipped:
                    <b>
                      {importResult.skipped ?? 0}
                    </b>
                  </span>

                  <span>
                    Errors:
                    <b>
                      {importResult.errors?.length ?? 0}
                    </b>
                  </span>

                </div>

                {importResult.errors?.length > 0 && (

                  <div className="import-errors">

                    {importResult.errors
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index}>
                          Row {item.row}: {item.error}
                        </div>
                      ))}

                    {importResult.errors.length > 5 && (
                      <div>
                        +
                        {importResult.errors.length - 5}
                        {" "}more errors
                      </div>
                    )}

                  </div>

                )}

              </div>

            )}


            {/* ACTIONS */}

            <div className="import-modal-footer">

              <button
                className="cancel-button"
                onClick={() => {
                  setShowImport(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
              >
                Close
              </button>

              <button
                className="save-control-button"
                onClick={handleImportControls}
                disabled={
                  !importFile ||
                  importLoading
                }
              >
                {importLoading
                  ? "Importing..."
                  : "Import Controls"}
              </button>

            </div>

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

              {!loading &&
                !isAuthenticated && (

                  <tr>
                    <td
                      colSpan="6"
                      className="login-required-cell"
                    >

                      <div className="login-required-content">

                        <div className="login-required-icon">
                          🔐
                        </div>

                        <h3>
                          Sign in to view compliance controls
                        </h3>

                        <p>
                          Compliance control data is available
                          to authenticated users.
                        </p>

                        <button
                          className="login-required-button"
                          onClick={() => setShowLogin(true)}
                        >
                          Sign In
                        </button>

                      </div>

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
                        <button
                          type="button"
                          className="evidence-count evidence-count-btn"
                          onClick={() => {
                            if ((control.evidence_count ?? 0) > 0) {
                              navigate(
                                `/evidence?control=${encodeURIComponent(control.control_id)}`
                              );
                            }
                          }}
                          disabled={(control.evidence_count ?? 0) === 0}
                          title={
                            (control.evidence_count ?? 0) > 0
                              ? `View evidence for ${control.control_id}`
                              : "No evidence uploaded"
                          }
                        >
                          <FileCheck2 size={15} />
                          {control.evidence_count ?? 0} files
                        </button>
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
                          onClick={() => {

                            if (!requireLogin()) {
                              return;
                            }

                            setSelectedControl(control);

                          }}
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

            {/* HEADER */}

            <div className="control-modal-header">

              <div className="control-modal-title">

                <span>
                  CONTROL DETAILS
                </span>

                <h3>
                  {selectedControl.control_id}
                </h3>

                <p>
                  {selectedControl.title}
                </p>

              </div>

              <button
                className="control-modal-close"
                onClick={() =>
                  setSelectedControl(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            {/* DESCRIPTION + EVIDENCE REQUESTED */}
            <div className="control-info-cards">

              <div className="control-info-card">
                <div className="control-info-icon description-icon">
                  <Layers3 size={19} />
                </div>

                <div>
                  <h4>Domain</h4>
                  <p>
                    {selectedControl.domain || "No domain specified."}
                  </p>
                </div>
              </div>

              <div className="control-info-card">
                <div className="control-info-icon description-icon">
                  <FileText size={19} />
                </div>

                <div>
                  <h4>Control Description</h4>
                  <p>
                    {selectedControl.description ||
                      "No control description has been provided."}
                  </p>
                </div>
              </div>

              <div className="control-info-card">
                <div className="control-info-icon description-icon">
                  <FileText size={19} />
                </div>

                <div>
                  <h4>Requirement</h4>
                  <p>
                    {selectedControl.requirement ||
                      "No requirement has been specified."}
                  </p>
                </div>
              </div>

              <div className="control-info-card">
                <div className="control-info-icon evidence-icon">
                  <Paperclip size={19} />
                </div>

                <div>
                  <h4>Evidence Requested</h4>
                  <p>
                    {selectedControl.evidence_requested ||
                      "No evidence requirement has been specified."}
                  </p>
                </div>
              </div>

            </div>


            {/* BASIC DETAILS */}

            <div className="control-detail-grid">

              {/* FRAMEWORK */}

              <div className="control-detail-card">

                <div className="detail-icon framework-icon">
                  <Layers3 size={18} />
                </div>

                <span>
                  Framework
                </span>

                <strong>
                  {selectedControl.framework || "—"}
                </strong>

              </div>


              {/* STATUS */}

              <div className="control-detail-card">

                <div className="detail-icon status-icon">
                  <Clock3 size={18} />
                </div>

                <span>
                  Status
                </span>

                <StatusBadge
                  status={selectedControl.status}
                />

              </div>


              {/* EVIDENCE */}

              <div className="control-detail-card">

                <div className="detail-icon evidence-folder-icon">
                  <FolderOpen size={18} />
                </div>

                <span>
                  Evidence
                </span>

                <strong>
                  {selectedControl.evidence_count ?? 0} files
                </strong>

              </div>


              {/* LAST TESTED */}

              <div className="control-detail-card">

                <div className="detail-icon tested-icon">
                  <CalendarDays size={18} />
                </div>

                <span>
                  Last Tested
                </span>

                <strong>
                  {selectedControl.last_tested
                    ? new Date(
                      selectedControl.last_tested
                    ).toLocaleDateString()
                    : "Not tested"}
                </strong>

              </div>

            </div>


            {/* FOOTER */}

            <div className="control-modal-footer">

              <button
                onClick={() =>
                  setSelectedControl(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
        />
      )}

    </div>

  );

}


export default Controls;