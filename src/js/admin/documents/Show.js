import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../Layout";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import ConfirmationModal from "../../commons/ConfirmationModal";
import { deleteDocument, getDocument } from "../../services/DocumentsService";

const formatSize = (sizeBytes) => {
  if (sizeBytes === null || sizeBytes === undefined) {
    return "-";
  }
  const kb = 1024;
  const mb = kb * 1024;
  if (sizeBytes >= mb) {
    return `${(sizeBytes / mb).toFixed(1)} MB`;
  }
  if (sizeBytes >= kb) {
    return `${(sizeBytes / kb).toFixed(1)} KB`;
  }
  return `${sizeBytes} B`;
}

export default DocumentsShow = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchDocument = () => {
    setIsLoading(true);
    setNotFound(false);

    getDocument(documentId).then((payload) => {
      setDocument(payload.data);
    }).catch((payload) => {
      console.log("Failed to load document");
      console.log(payload.response);
      setNotFound(true);
    }).finally(() => {
      setIsLoading(false);
    });
  }

  const handleDelete = () => {
    setIsDeleting(true);

    deleteDocument(documentId).then(() => {
      navigate("/admin/documents");
    }).catch((payload) => {
      console.log("Failed to delete document");
      console.log(payload.response);
      setIsDeleting(false);
    });
  }

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  return (
    <Layout>
      <AdminContent
        title="Document Details"
        headerActions={[
          (
            <button
              key="edit-document"
              className="btn btn-sm btn-outline-primary"
              disabled={isLoading || notFound}
              onClick={() => navigate(`/admin/documents/${documentId}/edit`)}
            >
              Edit
            </button>
          ),
          (
            <button
              key="delete-document"
              className="btn btn-sm btn-outline-danger"
              disabled={isLoading || notFound}
              onClick={() => setShowConfirm(true)}
            >
              Delete
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

        {!isLoading && document &&
          <div className="table-responsive">
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <th scope="row">Name</th>
                  <td>{document.name}</td>
                </tr>
                <tr>
                  <th scope="row">Description</th>
                  <td>{document.description || "-"}</td>
                </tr>
                <tr>
                  <th scope="row">Document Type</th>
                  <td>{document.document_type || "-"}</td>
                </tr>
                <tr>
                  <th scope="row">Original Filename</th>
                  <td>{document.original_filename}</td>
                </tr>
                <tr>
                  <th scope="row">Content Type</th>
                  <td>{document.content_type || "-"}</td>
                </tr>
                <tr>
                  <th scope="row">Size</th>
                  <td>{formatSize(document.size_bytes)}</td>
                </tr>
                <tr>
                  <th scope="row">Storage Provider</th>
                  <td>{document.storage_provider || "-"}</td>
                </tr>
                <tr>
                  <th scope="row">Storage Key</th>
                  <td className="text-muted">{document.storage_key}</td>
                </tr>
                <tr>
                  <th scope="row">ID</th>
                  <td className="text-muted">{document.id}</td>
                </tr>
              </tbody>
            </table>
          </div>
        }
      </AdminContent>

      <ConfirmationModal
        show={showConfirm}
        header="Delete document"
        content="Are you sure you want to delete this document?"
        isLoading={isDeleting}
        onPrimaryClicked={handleDelete}
        onSecondaryClicked={() => {
          if (!isDeleting) {
            setShowConfirm(false);
          }
        }}
      />
    </Layout>
  );
}
