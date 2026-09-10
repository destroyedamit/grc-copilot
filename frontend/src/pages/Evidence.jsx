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

function StatusBadge({ status }) {
    if (status === "Validated") {
        return (
            <span className="evidence-status validated">
                <CheckCircle2 size={14} />
                Validated
            </span>
        );
    }

    if (status === "Pending Review") {
        return (
            <span className="evidence-status pending">
                <Clock3 size={14} />
                Pending Review
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
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [aiReview, setAiReview] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [rfiLoading, setRfiLoading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);

    const [uploadFile, setUploadFile] = useState(null);

    const [uploadData, setUploadData] = useState({
        control_id: "",
        framework: "SOC 2",
    });
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/evidence/")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch evidence");
                }

                return response.json();
            })
            .then((data) => {
                setEvidenceItems(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError("Unable to load evidence");
                setLoading(false);
            });
    }, []);
    const handleAIReview = async (evidenceId) => {
        setAiLoading(true);
        setAiReview(null);

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/evidence/${evidenceId}/analyze`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                throw new Error("AI analysis failed");
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
            alert("Unable to analyze evidence.");
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
                "http://127.0.0.1:8000/api/rfi/",
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
                    onClick={() => setShowUploadForm(true)}
                >
                    <Upload size={16} />
                    Upload Evidence
                </button>
            </div>

            {/* Summary */}
            <div className="evidence-summary">

                <div className="evidence-summary-card">
                    <span>Total Evidence</span>
                    <strong>34</strong>
                </div>

                <div className="evidence-summary-card">
                    <span>Validated</span>
                    <strong className="green-number">25</strong>
                </div>

                <div className="evidence-summary-card">
                    <span>Pending Review</span>
                    <strong className="orange-number">6</strong>
                </div>

                <div className="evidence-summary-card">
                    <span>Missing</span>
                    <strong className="red-number">3</strong>
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
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                onChange={(e) => {
                                    setUploadFile(e.target.files[0]);
                                }}
                            />
                        </div>

                        <div className="upload-field">
                            <label>Control ID</label>

                            <input
                                placeholder="e.g. SOC2-CC6.1"
                                value={uploadData.control_id}
                                onChange={(e) =>
                                    setUploadData({
                                        ...uploadData,
                                        control_id: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="upload-field">
                            <label>Framework</label>

                            <select
                                value={uploadData.framework}
                                onChange={(e) =>
                                    setUploadData({
                                        ...uploadData,
                                        framework: e.target.value,
                                    })
                                }
                            >
                                <option>SOC 2</option>
                                <option>ISO 27001</option>
                                <option>NIST CSF</option>
                                <option>CSA</option>
                                <option>CAIQ</option>
                            </select>
                        </div>

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
                                    alert("Please select a file and enter Control ID.");
                                    return;
                                }

                                const formData = new FormData();

                                formData.append("file", uploadFile);
                                formData.append(
                                    "control_id",
                                    uploadData.control_id
                                );
                                formData.append(
                                    "framework",
                                    uploadData.framework
                                );

                                try {

                                    const response = await fetch(
                                        "http://127.0.0.1:8000/api/evidence/upload",
                                        {
                                            method: "POST",
                                            body: formData,
                                        }
                                    );

                                    if (!response.ok) {
                                        throw new Error("Upload failed");
                                    }

                                    const result = await response.json();

                                    setEvidenceItems((previous) => [
                                        ...previous,
                                        result.evidence,
                                    ]);

                                    setUploadFile(null);

                                    setUploadData({
                                        control_id: "",
                                        framework: "SOC 2",
                                    });

                                    setShowUploadForm(false);

                                } catch (error) {

                                    console.error(error);

                                    alert("Unable to upload evidence.");

                                }

                            }}
                        >
                            <Upload size={15} />
                            Upload
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
                        />
                    </div>

                    <button className="evidence-filter">
                        All Frameworks
                    </button>

                    <button className="evidence-filter">
                        All Status
                    </button>

                </div>

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
                                <th></th>
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

                            {error && (
                                <tr>
                                    <td colSpan="7" className="error-text">
                                        {error}
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                !error &&
                                evidenceItems.map((item) => (
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
                                            <button
                                                className="ai-review-button"
                                                onClick={() => handleAIReview(item.id)}
                                            >
                                                AI Review
                                            </button>
                                        </td>

                                    </tr>
                                ))}

                        </tbody>

                    </table>

                </div>

            </div>
            {/* AI REVIEW LOADING */}

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
                            Analyzing with Llama 3.2
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
        </div>

    );
}

export default Evidence;