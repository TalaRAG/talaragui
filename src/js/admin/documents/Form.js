import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../Layout";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import { getInputClassName, renderInputErrors } from "../../helpers/AppHelper";
import { createDocument, getDocument, updateDocument } from "../../services/DocumentsService";

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
  const { documentId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!documentId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

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
    setIsSaving(true);
    setErrors({});

    const action = isEdit
      ? updateDocument(documentId, {
          name: name,
          description: description,
          document_type: documentType,
          file: file,
        })
      : createDocument({
          name: name,
          description: description,
          document_type: documentType,
          file: file,
        });

    action.then((payload) => {
      const nextId = payload.data.id || documentId;
      navigate(`/admin/documents/${nextId}`);
    }).catch((payload) => {
      console.log("Failed to save document");
      console.log(payload.response);
      setErrors(payload.response?.data || {});
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
        {isLoading && <Loader/>}

        {!isLoading && notFound &&
          <div className="text-muted">
            Document not found.
          </div>
        }

        {!isLoading && !notFound &&
          <div className="row g-3">
            {errors.message &&
              <div className="col-12">
                {renderInputErrors(errors, "message")}
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
                className={getInputClassName(errors, "file")}
                accept=".pdf,.txt,.xlsx,.pptx"
                disabled={isSaving}
                onChange={(event) => setFile(event.target.files[0])}
              />
              {renderInputErrors(errors, "file")}
            </div>

            <div className="col-12 d-flex gap-2">
              <button
                className="btn btn-primary"
                disabled={isSaving}
                onClick={handleSubmit}
              >
                {isEdit ? "Update Document" : "Create Document"}
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
