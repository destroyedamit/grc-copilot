import {
    Search,
    Upload,
    FileText,
    CheckCircle2,
    Clock3,
    AlertCircle,
} from "lucide-react";

import "./Evidence.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";

function StatusBadge({ status }) {

    if (
        status === "Validated" ||
        status === "Compliant"
    ) {
        return (
            <span className="evidence-status validated">
                <CheckCircle2 size={14} />
                {status}
            </span>
        );
    }

    if (
        status === "Pending Review"
    ) {
        return (
            <span className="evidence-status pending">
                <Clock3 size={14} />
                Pending Review
            </span>
        );
    }

    if (status === "Partial") {
        return (
            <span className="evidence-status partial">
                <Clock3 size={14} />
                Partial
            </span>
        );
    }

    if (status === "Insufficient") {
        return (
            <span className="evidence-status missing">
                <AlertCircle size={14} />
                Insufficient
            </span>
        );
    }

    return (
        <span className="evidence-status missing">
            <AlertCircle size={14} />
            Missing
        </span>
    );
}

function Evidence() {
    const {
        isAuthenticated,
        user,
    } = useAuth();
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [controls, setControls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showLogin, setShowLogin] = useState(false);
    const [aiReview, setAiReview] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [rfiLoading, setRfiLoading] = useState(false);
    const [showManualReview, setShowManualReview] = useState(false);
    const [manualReviewEvidence, setManualReviewEvidence] = useState(null);
    const [manualStatus, setManualStatus] = useState("Compliant");
    const [manualRisk, setManualRisk] = useState("Medium");
    const [manualComments, setManualComments] = useState("");
    const [manualReviewLoading, setManualReviewLoading] = useState(false);
    // AI provider selection
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [validationProvider, setValidationProvider] = useState("gemini");

    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const controlFilter = searchParams.get("control");
    const [uploadData, setUploadData] = useState({
        control_id: "",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [frameworkFilter, setFrameworkFilter] = useState("All Frameworks");
    const [statusFilter, setStatusFilter] = useState("All Status");
    useEffect(() => {

        /*
         * Guest users can see the Evidence screen,
         * but protected evidence data should not be loaded.
         */
        if (!isAuthenticated) {

            setEvidenceItems([]);
            setControls([]);
            setError("");
            setLoading(false);

            return;
        }

        const fetchData = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    evidenceResponse,
                    controlsResponse,
                ] = await Promise.all([
                    fetch("/api/evidence"),
                    fetch("/api/controls"),
                ]);

                if (!evidenceResponse.ok) {
                    throw new Error(
                        "Failed to fetch evidence"
                    );
                }

                if (!controlsResponse.ok) {
                    throw new Error(
                        "Failed to fetch controls"
                    );
                }

                const evidenceData =
                    await evidenceResponse.json();

                const controlsData =
                    await controlsResponse.json();

                setEvidenceItems(
                    Array.isArray(evidenceData)
                        ? evidenceData
                        : []
                );

                setControls(
                    Array.isArray(controlsData)
                        ? controlsData
                        : []
                );

            } catch (error) {

                console.error(
                    "Evidence loading error:",
                    error
                );

                setError(
                    "Unable to load evidence"
                );

            } finally {

                setLoading(false);

            }
        };

        fetchData();

    }, [isAuthenticated]);

    const requireLogin = () => {

        if (!isAuthenticated) {
            setShowLogin(true);
            return false;
        }

        return true;
    };
    const handleViewEvidence = async (evidenceId) => {
        try {
            const response = await fetch(
                `/api/evidence/${evidenceId}/file`
            );

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({}));

                throw new Error(
                    errorData.detail ||
                    "Unable to open evidence file."
                );
            }

            const data = await response.json();

            if (!data.url) {
                throw new Error(
                    "Evidence URL was not returned."
                );
            }

            window.open(data.url, "_blank");

        } catch (error) {
            console.error(
                "Evidence view error:",
                error
            );

            alert(
                error.message ||
                "Unable to open evidence."
            );
        }
    };
    const handleAIReview = async (evidenceId, provider = "gemini") => {
        setAiLoading(true);
        setAiReview(null);

        try {
            const response = await fetch(
                `/api/evidence/${evidenceId}/analyze?provider=${encodeURIComponent(provider)}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(
                    errorData.detail || "AI analysis failed"
                );
            }

            const data = await response.json();

            const evidence = evidenceItems.find(
                (item) => item.id === evidenceId
            );

            setAiReview({
                ...data,
                framework: evidence?.framework || "SOC 2",
            });

        } catch (error) {
            console.error(error);
            alert(error.message || "Unable to analyze evidence.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleGenerateRFI = async () => {
        if (!aiReview) return;

        const analysis = aiReview.ai_analysis;

        setRfiLoading(true);

        try {
            const missingRequirement =
                analysis.missing_requirements?.[0] ||
                "Additional compliance evidence required";

            const response = await fetch(
                "/api/rfi",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        control_id: aiReview.control_id,
                        framework: aiReview.framework || "SOC 2",
                        title: `Evidence Request - ${aiReview.control_id}`,
                        description:
                            analysis.evidence_summary ||
                            "Submitted evidence does not sufficiently demonstrate the control requirement.",
                        evidence_requested: missingRequirement,
                        priority: analysis.risk || "Medium",
                        evidence_id: aiReview.evidence_id,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create RFI");
            }

            const rfi = await response.json();

            alert(`RFI ${rfi.rfi_number} created successfully.`);

            setAiReview(null);
        } catch (error) {
            console.error(error);
            alert("Unable to generate RFI.");
        } finally {
            setRfiLoading(false);
        }
    };

    const handleManualReview = async () => {
        if (!manualReviewEvidence) return;

        setManualReviewLoading(true);

        try {
            const params = new URLSearchParams({
                manual_status: manualStatus,
                manual_risk: manualRisk,
                manual_comments: manualComments,
            });

            const response = await fetch(
                `/api/evidence/${manualReviewEvidence.id}/manual-review?${params.toString()}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(
                    errorData.detail || "Manual review failed"
                );
            }

            const result = await response.json();

            // Update evidence in table immediately
            setEvidenceItems((previous) =>
                previous.map((item) =>
                    item.id === manualReviewEvidence.id
                        ? {
                            ...item,
                            status: result.manual_review.status,
                            manual_status: result.manual_review.status,
                            manual_risk: result.manual_review.risk,
                            manual_comments:
                                result.manual_review.comments,
                            reviewed_at:
                                result.manual_review.reviewed_at,
                        }
                        : item
                )
            );

            alert("Manual review completed successfully.");

            setShowManualReview(false);
            setManualReviewEvidence(null);
            setManualStatus("Compliant");
            setManualRisk("Medium");
            setManualComments("");
        } catch (error) {
            console.error(error);
            alert(error.message || "Unable to complete manual review.");
        } finally {
            setManualReviewLoading(false);
        }
    };

    const filteredEvidence = evidenceItems.filter((item) => {
        const matchesSearch =
            item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.control_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.framework?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFramework =
            frameworkFilter === "All Frameworks" ||
            item.framework === frameworkFilter;

        const matchesStatus =
            statusFilter === "All Status" ||
            item.status === statusFilter;

        const matchesControl =
            !controlFilter || item.control_id === controlFilter;

        return (
            matchesSearch &&
            matchesFramework &&
            matchesStatus &&
            matchesControl
        );
    });
    return (
        <div className="evidence-page">

            {/* Header */}
            <div className="evidence-header">
                <div>
                    <h2>Evidence</h2>
                    <p>
                        Collect, validate and manage evidence for compliance controls.
                    </p>
                </div>

                <button
                    className="upload-button"
                    onClick={() => {

                        if (!requireLogin()) {
                            return;
                        }

                        setShowUploadForm(true);

                    }}
                >
                    <Upload size={16} />
                    Upload Evidence
                </button>
            </div>

            {/* Summary */}
            <div className="evidence-summary">

                <div className="evidence-summary-card">
                    <span>Total Evidence</span>
                    <strong>
                        {isAuthenticated
                            ? evidenceItems.length
                            : "—"}
                    </strong>
                </div>

                <div className="evidence-summary-card">
                    <span>Validated</span>
                    <strong className="green-number">
                        {isAuthenticated
                            ? evidenceItems.filter(
                                (item) =>
                                    item.status === "Validated" ||
                                    item.status === "Compliant"
                            ).length
                            : "—"}
                    </strong>
                </div>

                <div className="evidence-summary-card">
                    <span>Pending Review</span>
                    <strong className="orange-number">
                        {isAuthenticated
                            ? evidenceItems.filter(
                                (item) =>
                                    item.status === "Pending Review"
                            ).length
                            : "—"}
                    </strong>
                </div>

                <div className="evidence-summary-card">
                    <span>Missing</span>
                    <strong className="red-number">
                        {isAuthenticated
                            ? evidenceItems.filter(
                                (item) =>
                                    item.status === "Insufficient" ||
                                    item.status === "Partial"
                            ).length
                            : "—"}
                    </strong>
                </div>

            </div>
            {showUploadForm && (
                <div className="upload-form">

                    <div className="upload-form-header">
                        <div>
                            <h3>Upload Evidence</h3>
                            <p>Upload evidence and map it to a compliance control.</p>
                        </div>

                        <button
                            className="close-upload"
                            onClick={() => setShowUploadForm(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="upload-form-grid">

                        <div className="upload-field">
                            <label>Evidence File</label>

                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                    setUploadFile(e.target.files[0]);
                                }}
                            />
                        </div>

                        <div className="upload-field">
                            <label>Control</label>

                            <select
                                value={uploadData.control_id}
                                onChange={(e) =>
                                    setUploadData({
                                        ...uploadData,
                                        control_id: e.target.value,
                                    })
                                }
                            >
                                <option value="">Select Control</option>

                                {controls.map((control) => (
                                    <option
                                        key={control.id}
                                        value={control.control_id}
                                    >
                                        {control.control_id} — {control.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {uploadData.control_id && (
                            <div className="selected-control-info">
                                Framework:{" "}
                                <strong>
                                    {
                                        controls.find(
                                            (control) =>
                                                control.control_id === uploadData.control_id
                                        )?.framework || "—"
                                    }
                                </strong>
                            </div>
                        )}
                    </div>

                    <div className="upload-form-actions">

                        <button
                            className="cancel-upload"
                            onClick={() => setShowUploadForm(false)}
                        >
                            Cancel
                        </button>

                        <button
                            className="submit-upload"
                            onClick={async () => {
                                if (!uploadFile || !uploadData.control_id) {
                                    alert("Please select a file and select a Control.");
                                    return;
                                }

                                const formData = new FormData();

                                formData.append("file", uploadFile);
                                formData.append("control_id", uploadData.control_id);

                                setUploadLoading(true);

                                try {
                                    const response = await fetch(
                                        "/api/evidence/upload",
                                        {
                                            method: "POST",
                                            body: formData,
                                        }
                                    );

                                    if (!response.ok) {
                                        const errorData = await response.json().catch(() => ({}));

                                        throw new Error(
                                            errorData.detail || "Upload failed"
                                        );
                                    }

                                    const result = await response.json();

                                    setEvidenceItems((previous) => [
                                        ...previous,
                                        result.evidence,
                                    ]);

                                    setUploadFile(null);

                                    setUploadData({
                                        control_id: "",
                                    });

                                    setShowUploadForm(false);
                                } catch (error) {
                                    console.error(error);
                                    alert(error.message || "Unable to upload evidence.");
                                } finally {
                                    setUploadLoading(false);
                                }
                            }}
                            disabled={uploadLoading}
                        >
                            <Upload size={15} />

                            {uploadLoading ? "Uploading..." : "Upload"}
                        </button>

                    </div>

                </div>
            )}
            {/* Evidence Panel */}
            <div className="evidence-panel">

                <div className="evidence-toolbar">

                    <div className="evidence-search">
                        <Search size={17} />
                        <input
                            placeholder="Search evidence, control or filename..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="evidence-filter"
                        value={frameworkFilter}
                        onChange={(e) => setFrameworkFilter(e.target.value)}
                    >
                        <option>All Frameworks</option>

                        {[...new Set(evidenceItems.map((item) => item.framework))]
                            .filter(Boolean)
                            .map((framework) => (
                                <option key={framework} value={framework}>
                                    {framework}
                                </option>
                            ))}
                    </select>

                    <select
                        className="evidence-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All Status</option>
                        <option>Pending Review</option>
                        <option>Compliant</option>
                        <option>Partial</option>
                        <option>Insufficient</option>
                    </select>

                </div>

                {controlFilter && (
                    <div className="control-filter-banner">
                        <div>
                            <strong>Showing evidence for:</strong> {controlFilter}
                        </div>

                        <button
                            type="button"
                            onClick={() => setSearchParams({})}
                        >
                            Clear Filter
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="evidence-table-wrapper">

                    <table>

                        <thead>
                            <tr>
                                <th>EVIDENCE</th>
                                <th>CONTROL</th>
                                <th>FRAMEWORK</th>
                                <th>STATUS</th>
                                <th>UPLOADED</th>
                                <th>SIZE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading && (
                                <tr>
                                    <td colSpan="7" className="loading-text">
                                        Loading evidence...
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                !isAuthenticated && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="login-required-cell"
                                        >
                                            <div className="login-required-content">

                                                <div className="login-required-icon">
                                                    🔐
                                                </div>

                                                <h3>
                                                    Sign in to view evidence
                                                </h3>

                                                <p>
                                                    Evidence files and validation
                                                    details are available to
                                                    authenticated users.
                                                </p>

                                                <button
                                                    className="login-required-button"
                                                    onClick={() =>
                                                        setShowLogin(true)
                                                    }
                                                >
                                                    Sign In
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                )}

                            {error && (
                                <tr>
                                    <td colSpan="7" className="error-text">
                                        {error}
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                !error &&
                                filteredEvidence.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="loading-text">
                                            No evidence found.
                                        </td>
                                    </tr>
                                )}

                            {!loading &&
                                !error &&
                                filteredEvidence.map((item) => (
                                    <tr key={item.id}>

                                        <td>
                                            <div className="evidence-name">

                                                <div className="file-icon">
                                                    <FileText size={17} />
                                                </div>

                                                <div>
                                                    <strong>{item.file_name}</strong>
                                                    <span>{item.file_type}</span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <span className="control-tag">
                                                {item.control_id}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="framework-tag">
                                                {item.framework}
                                            </span>
                                        </td>

                                        <td>
                                            <StatusBadge status={item.status} />
                                        </td>

                                        <td className="date-text">
                                            {new Date(item.uploaded_at).toLocaleDateString()}
                                        </td>

                                        <td className="size-text">
                                            —
                                        </td>

                                        <td>
                                            <div className="evidence-actions">
                                                <button
                                                    className="view-evidence-button"
                                                    onClick={() => handleViewEvidence(item.id)}
                                                >
                                                    View
                                                </button>

                                                {(
                                                    item.file_name?.toLowerCase().endsWith(".pdf") ||
                                                    item.file_name?.toLowerCase().endsWith(".png") ||
                                                    item.file_name?.toLowerCase().endsWith(".jpg") ||
                                                    item.file_name?.toLowerCase().endsWith(".jpeg")
                                                ) && (
                                                        <button
                                                            className="ai-review-button"
                                                            onClick={() => {
                                                                setSelectedEvidence(item);
                                                                setValidationProvider("gemini");
                                                                setShowProviderModal(true);
                                                            }}
                                                        >
                                                            AI Review
                                                        </button>

                                                    )}
                                                <button
                                                    className="manual-review-button"
                                                    onClick={() => {
                                                        setManualReviewEvidence(item);
                                                        setManualStatus(
                                                            item.manual_status || "Compliant"
                                                        );
                                                        setManualRisk(
                                                            item.manual_risk || "Medium"
                                                        );
                                                        setManualComments(
                                                            item.manual_comments || ""
                                                        );
                                                        setShowManualReview(true);
                                                    }}
                                                >
                                                    Manual Review
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}

                        </tbody>

                    </table>

                </div>

            </div>
            {/* AI REVIEW LOADING */}
            {/* AI PROVIDER SELECTION */}

            {showProviderModal && selectedEvidence && (
                <div className="ai-modal-overlay">
                    <div className="ai-modal provider-selection-modal">

                        <div className="ai-modal-header">
                            <div>
                                <span className="ai-modal-label">
                                    AI VALIDATION
                                </span>

                                <h3>Choose AI Validator</h3>

                                <p>
                                    Select how you want to validate this evidence.
                                </p>
                            </div>

                            <button
                                className="ai-close-button"
                                onClick={() => {
                                    setShowProviderModal(false);
                                    setSelectedEvidence(null);
                                }}
                            >
                                ×
                            </button>
                        </div>


                        <div className="provider-options">

                            {/* GEMINI */}

                            <button
                                type="button"
                                className={`provider-option ${validationProvider === "gemini"
                                    ? "selected"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setValidationProvider("gemini")
                                }
                            >
                                <div className="provider-icon gemini-icon">
                                    ✦
                                </div>

                                <div className="provider-content">
                                    <div className="provider-title-row">
                                        <strong>
                                            Gemini 3 Flash Preview
                                        </strong>

                                        {validationProvider === "gemini" && (
                                            <span className="provider-selected">
                                                Selected
                                            </span>
                                        )}
                                    </div>

                                    <p>
                                        Cloud-based AI validation using Google Gemini.
                                    </p>

                                    <span className="provider-tag">
                                        Recommended
                                    </span>
                                </div>
                            </button>


                            {/* LLAMA */}

                            <button
                                type="button"
                                className={`provider-option ${validationProvider === "llama"
                                    ? "selected"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setValidationProvider("llama")
                                }
                            >
                                <div className="provider-icon llama-icon">
                                    🦙
                                </div>

                                <div className="provider-content">
                                    <div className="provider-title-row">
                                        <strong>
                                            Llama 3.2
                                        </strong>

                                        {validationProvider === "llama" && (
                                            <span className="provider-selected">
                                                Selected
                                            </span>
                                        )}
                                    </div>

                                    <p>
                                        Local AI validation using Ollama.
                                    </p>

                                    <span className="provider-tag local">
                                        Local
                                    </span>
                                </div>
                            </button>

                        </div>


                        <div className="provider-evidence-info">
                            <span>Evidence</span>
                            <strong>
                                {selectedEvidence.file_name}
                            </strong>
                        </div>


                        <div className="ai-modal-actions">

                            <button
                                className="close-review-button"
                                onClick={() => {
                                    setShowProviderModal(false);
                                    setSelectedEvidence(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="generate-rfi-button"
                                onClick={() => {
                                    setShowProviderModal(false);

                                    handleAIReview(
                                        selectedEvidence.id,
                                        validationProvider
                                    );
                                }}
                            >
                                Start Validation
                            </button>

                        </div>

                    </div>
                </div>
            )}
            {aiLoading && (
                <div className="ai-modal-overlay">
                    <div className="ai-modal loading-modal">

                        <div className="ai-loading-icon">
                            ✨
                        </div>

                        <h3>AI is reviewing the evidence</h3>

                        <p>
                            Comparing the submitted evidence against
                            the control requirements...
                        </p>

                        <div className="ai-loading-text">
                            {validationProvider === "gemini"
                                ? "Analyzing with Gemini 3 Flash Preview"
                                : "Analyzing with Llama 3.2"}
                        </div>

                    </div>
                </div>
            )}
            {/* MANUAL REVIEW MODAL */}

            {showManualReview && manualReviewEvidence && (
                <div className="ai-modal-overlay">

                    <div className="ai-modal manual-review-modal">

                        <div className="ai-modal-header">

                            <div>
                                <span className="ai-modal-label">
                                    MANUAL VALIDATION
                                </span>

                                <h3>
                                    Auditor Review
                                </h3>

                                <p>
                                    {manualReviewEvidence.control_id}
                                    {" — "}
                                    {manualReviewEvidence.file_name}
                                </p>
                            </div>

                            <button
                                className="ai-close-button"
                                onClick={() => {
                                    setShowManualReview(false);
                                    setManualReviewEvidence(null);
                                }}
                            >
                                ×
                            </button>

                        </div>


                        {/* AI INFORMATION */}

                        <div className="manual-review-info">

                            <div>
                                <span>AI Status</span>

                                <strong>
                                    {manualReviewEvidence.ai_status || "Not Reviewed"}
                                </strong>
                            </div>

                            <div>
                                <span>AI Risk</span>

                                <strong>
                                    {manualReviewEvidence.ai_risk || "—"}
                                </strong>
                            </div>

                            <div>
                                <span>AI Coverage</span>

                                <strong>
                                    {manualReviewEvidence.ai_coverage != null
                                        ? `${manualReviewEvidence.ai_coverage}%`
                                        : "—"}
                                </strong>
                            </div>

                        </div>


                        {/* FINAL STATUS */}

                        <div className="manual-review-field">

                            <label>
                                Final Validation Status
                            </label>

                            <select
                                value={manualStatus}
                                onChange={(e) =>
                                    setManualStatus(e.target.value)
                                }
                            >
                                <option value="Compliant">
                                    Compliant
                                </option>

                                <option value="Partial">
                                    Partial
                                </option>

                                <option value="Insufficient">
                                    Insufficient
                                </option>
                            </select>

                        </div>


                        {/* RISK */}

                        <div className="manual-review-field">

                            <label>
                                Risk
                            </label>

                            <select
                                value={manualRisk}
                                onChange={(e) =>
                                    setManualRisk(e.target.value)
                                }
                            >
                                <option value="Low">
                                    Low
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="High">
                                    High
                                </option>
                            </select>

                        </div>


                        {/* COMMENTS */}

                        <div className="manual-review-field">

                            <label>
                                Auditor Comments
                            </label>

                            <textarea
                                value={manualComments}
                                onChange={(e) =>
                                    setManualComments(e.target.value)
                                }
                                placeholder="Enter your validation comments..."
                                rows={5}
                            />

                        </div>


                        {/* ACTIONS */}

                        <div className="ai-modal-actions">

                            <button
                                className="close-review-button"
                                onClick={() => {
                                    setShowManualReview(false);
                                    setManualReviewEvidence(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="generate-rfi-button"
                                onClick={handleManualReview}
                                disabled={manualReviewLoading}
                            >
                                {manualReviewLoading
                                    ? "Saving Review..."
                                    : "Submit Review"}
                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* AI REVIEW RESULT */}

            {aiReview && !aiLoading && (
                <div className="ai-modal-overlay">

                    <div className="ai-modal">

                        <div className="ai-modal-header">

                            <div>
                                <span className="ai-modal-label">
                                    AI COMPLIANCE REVIEW
                                </span>

                                <span className="ai-provider-result">
                                    {aiReview.provider === "gemini"
                                        ? "Gemini 3 Flash Preview"
                                        : "Llama 3.2"}
                                </span>

                                <h3>{aiReview.control_id}</h3>
                                <p>{aiReview.file_name}</p>
                            </div>

                            <button
                                className="ai-close-button"
                                onClick={() => setAiReview(null)}
                            >
                                ×
                            </button>

                        </div>


                        <div className="ai-result-grid">

                            <div className="ai-result-card">
                                <span>Evidence Coverage</span>

                                <strong>
                                    {aiReview.ai_analysis.coverage}%
                                </strong>
                            </div>


                            <div className="ai-result-card">
                                <span>Status</span>

                                <strong>
                                    {aiReview.ai_analysis.status}
                                </strong>
                            </div>


                            <div className="ai-result-card">
                                <span>Risk</span>

                                <strong className="risk-high">
                                    {aiReview.ai_analysis.risk}
                                </strong>
                            </div>

                        </div>


                        <div className="ai-review-section">

                            <h4>Missing Requirements</h4>

                            {aiReview.ai_analysis.missing_requirements.map(
                                (requirement, index) => (
                                    <div
                                        className="missing-requirement"
                                        key={index}
                                    >
                                        <AlertCircle size={15} />

                                        <span>
                                            {requirement}
                                        </span>

                                    </div>
                                )
                            )}

                        </div>


                        <div className="ai-review-section">

                            <h4>AI Summary</h4>

                            <p>
                                {aiReview.ai_analysis.evidence_summary}
                            </p>

                        </div>


                        <div className="ai-review-section">

                            <h4>Recommendation</h4>

                            <p>
                                {aiReview.ai_analysis.recommendation}
                            </p>

                        </div>


                        <div className="ai-modal-actions">

                            <button
                                className="close-review-button"
                                onClick={() => setAiReview(null)}
                            >
                                Close
                            </button>

                            <button
                                className="generate-rfi-button"
                                onClick={handleGenerateRFI}
                                disabled={rfiLoading}
                            >
                                {rfiLoading ? "Creating RFI..." : "Generate RFI"}
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

export default Evidence;