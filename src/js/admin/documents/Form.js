import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../Layout";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import { getInputClassName, renderInputErrors } from "../../helpers/AppHelper";
import { createDocument, getDocument, updateDocument } from "../../services/DocumentsService";
import { getEnvironment } from "../../services/SystemService";

const DEFAULT_DOCUMENT_TYPES = [
  "national_budget",
  "agency_budget",
  "project_program",
  "procurement_notice",
  "audit_report",
  "development_plan",
  "local_budget",
  "legislation_budget_related",
  "circular_guideline",
  "performance_report"
];

export default DocumentsForm = () => {
  const REQUEST_TIMEOUT_MS = 10 * 60 * 1000;
  const { documentId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!documentId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("idle");
  const [maxUploadMb, setMaxUploadMb] = useState(null);

  const fetchDocument = () => {
    if (!isEdit) {
      return;
    }

    setIsLoading(true);
    setNotFound(false);

    getDocument(documentId).then((payload) => {
      setName(payload.data.name || "");
      setDescription(payload.data.description || "");
      setDocumentType(payload.data.document_type || "");
    }).catch((payload) => {
      console.log("Failed to load document");
      console.log(payload.response);
      setNotFound(true);
    }).finally(() => {
      setIsLoading(false);
    });
  }

  const handleSubmit = () => {
    const limitError = buildFileSizeError(file, maxUploadMb);
    if (limitError) {
      setErrors({ file: [limitError] });
      setSaveErrorMessage(limitError);
      return;
    }

    setIsSaving(true);
    setErrors({});
    setSaveErrorMessage("");
    setUploadProgress(file ? 0 : 100);
    setUploadStage(file ? "uploading" : "saving");

    const requestOptions = {
      timeout: REQUEST_TIMEOUT_MS,
      onUploadProgress: (event) => {
        const total = event.total || file?.size || 0;
        const progress = total > 0 ? Math.min(Math.round((event.loaded / total) * 100), 100) : 0;
        setUploadProgress(progress);
        setUploadStage(progress >= 100 ? "processing" : "uploading");
      },
    };

    const action = isEdit
      ? updateDocument(documentId, {
          name: name,
          description: description,
          document_type: documentType,
          file: file,
        }, requestOptions)
      : createDocument({
          name: name,
          description: description,
          document_type: documentType,
          file: file,
        }, requestOptions);

    action.then((payload) => {
      const nextId = payload.data.id || documentId;
      navigate(`/admin/documents/${nextId}`);
    }).catch((payload) => {
      console.log("Failed to save document");
      console.log(payload.response);
      setErrors(normalizeErrors(payload));
      setSaveErrorMessage(buildSaveErrorMessage(payload, maxUploadMb));
      setUploadStage("failed");
      setUploadProgress(0);
      setIsSaving(false);
    });
  }

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/document_types.json");
        if (!response.ok) {
          throw new Error("Config not found");
        }
        const data = await response.json();
        const types = Array.isArray(data)
          ? data
          : Array.isArray(data?.document_types)
            ? data.document_types
            : DEFAULT_DOCUMENT_TYPES;
        setDocumentTypeOptions(types);
      } catch (err) {
        setDocumentTypeOptions(DEFAULT_DOCUMENT_TYPES);
      } finally {
        setIsConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    const loadEnvironment = async () => {
      try {
        const response = await getEnvironment();
        const rawLimit = response.data?.variables?.STORAGE_MAX_CONTENT_LENGTH_MB;
        const parsedLimit = Number.parseInt(rawLimit, 10);
        setMaxUploadMb(Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : null);
      } catch (err) {
        setMaxUploadMb(null);
      }
    };

    loadEnvironment();
  }, []);

  const fileSizeError = buildFileSizeError(file, maxUploadMb);
  const uploadStatusLabel = buildUploadStatusLabel(uploadStage, uploadProgress, file);
  const uploadStatusHint = buildUploadStatusHint(uploadStage, file, maxUploadMb);

  return (
    <Layout>
      <AdminContent
        title={isEdit ? "Edit Document" : "New Document"}
        headerActions={[
          (
            <button
              key="back"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => navigate(isEdit ? `/admin/documents/${documentId}` : "/admin/documents")}
            >
              Back
            </button>
          )
        ]}
      >
        {isLoading &&
          <Loader
            label="Loading document details"
            hint="Fetching the current document record so the form can be populated."
          />
        }

        {!isLoading && notFound &&
          <div className="text-muted">
            Document not found.
          </div>
        }

        {!isLoading && !notFound &&
          <div className="row g-3">
            {saveErrorMessage &&
              <div className="col-12">
                <div className="alert alert-danger mb-0">
                  {saveErrorMessage}
                </div>
              </div>
            }
            <div className="col-12">
              <label className="form-label">Name</label>
              <input
                className={getInputClassName(errors, "name")}
                value={name}
                disabled={isSaving}
                onChange={(event) => setName(event.target.value)}
              />
              {renderInputErrors(errors, "name")}
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className={getInputClassName(errors, "description")}
                rows="4"
                value={description}
                disabled={isSaving}
                onChange={(event) => setDescription(event.target.value)}
              />
              {renderInputErrors(errors, "description")}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Document Type</label>
              <select
                className={getInputClassName(errors, "document_type")}
                value={documentType}
                disabled={isSaving || isConfigLoading}
                onChange={(event) => setDocumentType(event.target.value)}
              >
                <option value="">Select document type</option>
                {documentTypeOptions.map((type) => (
                  <option key={`doc-type-${type}`} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {isConfigLoading &&
                <div className="form-text">Loading document type options...</div>
              }
              {renderInputErrors(errors, "document_type")}
            </div>

            <div className="col-12">
              <label className="form-label">
                {isEdit
                  ? "Replace File (optional, pdf, txt, xlsx, pptx)"
                  : "Upload File (pdf, txt, xlsx, pptx)"}
              </label>
              <input
                type="file"
                className={getInputClassName(
                  fileSizeError ? { ...errors, file: [fileSizeError] } : errors,
                  "file"
                )}
                accept=".pdf,.txt,.xlsx,.pptx"
                disabled={isSaving}
                onChange={(event) => {
                  setFile(event.target.files[0]);
                  setSaveErrorMessage("");
                  setErrors((currentErrors) => ({ ...currentErrors, file: [] }));
                }}
              />
              {file &&
                <div className={`form-text ${fileSizeError ? "text-danger" : ""}`}>
                  Selected file: <strong>{file.name}</strong> ({formatFileSize(file.size)})
                  {maxUploadMb &&
                    ` • Server limit: ${maxUploadMb} MB`
                  }
                </div>
              }
              {!file && maxUploadMb &&
                <div className="form-text">
                  Current upload limit: {maxUploadMb} MB.
                </div>
              }
              {isSaving &&
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-semibold">{uploadStatusLabel}</span>
                    <span className="small text-muted">{file ? `${uploadProgress}%` : "Working"}</span>
                  </div>
                  {file &&
                    <div className="progress" role="progressbar" aria-label="Upload progress" aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100">
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                      />
                    </div>
                  }
                  <div className="form-text mt-2">{uploadStatusHint}</div>
                </div>
              }
              {renderInputErrors(errors, "file")}
            </div>

            <div className="col-12 d-flex gap-2">
              <button
                className="btn btn-primary"
                disabled={isSaving}
                onClick={handleSubmit}
              >
                {isSaving
                  ? isEdit
                    ? "Updating Document..."
                    : "Creating Document..."
                  : isEdit
                    ? "Update Document"
                    : "Create Document"}
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={isSaving}
                onClick={() => navigate(isEdit ? `/admin/documents/${documentId}` : "/admin/documents")}
              >
                Cancel
              </button>
            </div>
          </div>
        }
      </AdminContent>
    </Layout>
  );
}

const buildFileSizeError = (file, maxUploadMb) => {
  if (!file || !maxUploadMb) {
    return "";
  }

  const fileSizeMb = file.size / (1024 * 1024);
  if (fileSizeMb <= maxUploadMb) {
    return "";
  }

  return `The selected file is ${formatFileSize(file.size)}, which exceeds the current upload limit of ${maxUploadMb} MB.`;
}

const buildSaveErrorMessage = (error, maxUploadMb) => {
  const status = error?.response?.status;
  const payload = error?.response?.data;

  if (status === 413) {
    return maxUploadMb
      ? `Upload rejected because the file exceeds the server limit of ${maxUploadMb} MB.`
      : "Upload rejected because the file exceeds the server size limit.";
  }

  if (status === 422) {
    if (typeof payload?.message === "string" && payload.message.trim()) {
      return payload.message;
    }
    return "The document could not be saved. Review the highlighted fields and try again.";
  }

  if (error?.code === "ECONNABORTED") {
    return "The upload took too long and timed out. Try a smaller file or increase the server upload limits.";
  }

  if (!error?.response) {
    return "The upload did not complete. Check your connection and try again.";
  }

  return "The upload failed on the server. Try again, and check the API logs if it keeps happening.";
}

const normalizeErrors = (error) => {
  const payload = error?.response?.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload;
  }

  return {};
}

const buildUploadStatusLabel = (stage, progress, file) => {
  if (stage === "processing") {
    return "Upload complete. Finalizing document...";
  }
  if (stage === "saving") {
    return "Saving document...";
  }
  if (stage === "uploading") {
    return file ? `Uploading file... ${progress}%` : "Saving document...";
  }
  if (stage === "failed") {
    return "Upload failed";
  }
  return "Preparing upload...";
}

const buildUploadStatusHint = (stage, file, maxUploadMb) => {
  if (stage === "processing") {
    return "The file has finished transferring. The server is extracting document text and saving metadata.";
  }
  if (stage === "saving") {
    return "Saving document metadata on the server.";
  }
  if (stage === "uploading") {
    if (file && maxUploadMb) {
      return `Uploading ${formatFileSize(file.size)}. Files above ${maxUploadMb} MB will be rejected by the server.`;
    }
    if (file) {
      return `Uploading ${formatFileSize(file.size)} to the server.`;
    }
  }
  return "Preparing the document for upload.";
}

const formatFileSize = (bytes = 0) => {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** exponent);
  const decimals = exponent === 0 ? 0 : value >= 100 ? 0 : value >= 10 ? 1 : 2;

  return `${value.toFixed(decimals)} ${units[exponent]}`;
}
