import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import Pagination from "../../Pagination";
import { listDocuments } from "../../services/DocumentsService";

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

const renderStatusBadge = (status) => {
  const badgeClass = {
    pending: "secondary",
    processing: "warning",
    done: "success",
    failed: "danger",
  }[status] || "secondary";

  return (
    <span className={`badge text-bg-${badgeClass}`}>
      {(status || "unknown").toUpperCase()}
    </span>
  );
}

export default DocumentsIndex = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = () => {
    setIsLoading(true);

    listDocuments({
      page: currentPage,
      perPage: 20,
      query: query,
      documentType: documentType,
    }).then((payload) => {
      setDocuments(payload.data.records || []);
      setCurrentPage(payload.data.current_page || currentPage);
      setTotalPages(payload.data.total_pages || 1);
    }).catch((payload) => {
      console.log("Failed to load documents");
      console.log(payload.response);
      setDocuments([]);
      setTotalPages(1);
    }).finally(() => {
      setIsLoading(false);
    });
  }

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, query, documentType]);

  return (
    <Layout>
      <AdminContent
        title="Documents"
        headerActions={[
          (
            <button
              key="create-document"
              className="btn btn-sm btn-primary"
              onClick={() => navigate("/admin/documents/new")}
            >
              New Document
            </button>
          )
        ]}
        footer={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePrevious={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
              }
            }}
            handlePageClick={(page) => {
              setCurrentPage(page);
            }}
            handleNext={() => {
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
              }
            }}
          />
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-8">
            <input
              className="form-control"
              placeholder="Search by document name"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="col-12 col-md-4">
            <input
              className="form-control"
              placeholder="Document type"
              value={documentType}
              onChange={(event) => {
                setDocumentType(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {isLoading && <Loader/>}

        {!isLoading &&
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Original File</th>
                  <th scope="col">Size</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 &&
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No documents found.
                    </td>
                  </tr>
                }
                {documents.map((document) => (
                  <tr key={`document-${document.id}`}>
                    <td>{document.name}</td>
                    <td>{document.document_type || "-"}</td>
                    <td>{renderStatusBadge(document.status)}</td>
                    <td>{document.original_filename}</td>
                    <td>{formatSize(document.size_bytes)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/admin/documents/${document.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </AdminContent>
    </Layout>
  );
}
