import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faCircle,
  faMagnifyingGlass,
  faStar
} from "@fortawesome/free-solid-svg-icons";
import Loader from "../commons/Loader";
import Pagination from "../Pagination";
import { listPublicDocuments } from "../services/DocumentsService";

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

const formatDocumentTypeLabel = (type) => {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default PublicDocumentsIndex = () => {
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const fetchDocuments = () => {
    setIsLoading(true);

    listPublicDocuments({
      page: currentPage,
      perPage: 20,
      query: query,
      documentType: documentType,
    }).then((payload) => {
      setDocuments(payload.data.records || []);
      setCurrentPage(payload.data.current_page || currentPage);
      setTotalPages(payload.data.total_pages || 1);
    }).catch((payload) => {
      console.log("Failed to load public documents");
      console.log(payload.response);
      setDocuments([]);
      setTotalPages(1);
    }).finally(() => {
      setIsLoading(false);
    });
  }

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
    if (!isConfigLoading) {
      fetchDocuments();
    }
  }, [currentPage, query, documentType, isConfigLoading]);

  return (
    <div className="talarag-shell">
      <main className="public-main">
        <header className="public-topbar">
          <div className="public-topbar-links">
            <a className="topbar-link" href="/#/">
              Chat
            </a>
            <a className="topbar-link is-active" href="/#/documents">
              Public Archives
            </a>
          </div>
          <div className="public-topbar-actions">
            <a className="topbar-link" href="/#/admin/login">
              Login
            </a>
            <a className="topbar-pill" href="/#/">
              Open Assistant
            </a>
          </div>
        </header>

        <div className="public-content documents-page">
          <section className="hero-copy mb-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="public-brand-mark">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div>
                <div className="public-brand-name">Public Archives</div>
                <div className="public-brand-tagline">National And Local Source Library</div>
              </div>
            </div>
            <h1 className="hero-title">
              Browse verified records,
              <br />
              <span className="accent">download primary documents.</span>
            </h1>
            <p className="hero-description">
              Explore public materials uploaded into TalaRAG, filter by archive
              type, and jump directly into the underlying files.
            </p>
          </section>

          <section className="insight-card mb-4">
            <div className="surface-panel-body">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-lg-7">
                  <label className="form-label text-muted small">Search</label>
                  <div className="position-relative">
                    <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </span>
                    <input
                      className="form-control ps-5"
                      placeholder="Search by document name"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
                <div className="col-12 col-lg-5">
                  <label className="form-label text-muted small">Document Type</label>
                  <select
                    className="form-select"
                    value={documentType}
                    onChange={(event) => {
                      setDocumentType(event.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={isConfigLoading}
                  >
                    <option value="">All document types</option>
                    {documentTypeOptions.map((type) => (
                      <option key={`doc-type-${type}`} value={type}>
                        {formatDocumentTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="surface-panel">
            <div className="surface-panel-body">
              {isLoading && <Loader/>}

              {!isLoading &&
                <div className="table-responsive">
                  <table className="table align-middle document-table">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Type</th>
                        <th scope="col">Vectorized</th>
                        <th scope="col">Description</th>
                        <th scope="col">Size</th>
                        <th scope="col" className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.length === 0 &&
                        <tr>
                          <td colSpan="6" className="document-empty">
                            No documents found for the current filters.
                          </td>
                        </tr>
                      }
                      {documents.map((document) => (
                        <tr key={`public-document-${document.id}`}>
                          <td className="fw-semibold">{document.name}</td>
                          <td>{document.document_type ? formatDocumentTypeLabel(document.document_type) : "-"}</td>
                          <td>
                            {document.has_embeddings
                              ? (
                                <span className="public-meta-pill">
                                  <FontAwesomeIcon icon={faCircle} className="text-warning" size="2xs" />
                                  Indexed
                                </span>
                              )
                              : (
                                <span className="public-meta-pill">
                                  <FontAwesomeIcon icon={faCircle} className="text-secondary" size="2xs" />
                                  Pending
                                </span>
                              )
                            }
                          </td>
                          <td className="text-muted">{document.description || "-"}</td>
                          <td>{formatSize(document.size_bytes)}</td>
                          <td className="text-end">
                            {document.download_url
                              ? (
                                <a
                                  className="btn btn-sm btn-primary"
                                  href={document.download_url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="me-2" />
                                  Download
                                </a>
                              )
                              : (
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  disabled
                                >
                                  Unavailable
                                </button>
                              )
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
            <div className="surface-panel-body pt-0">
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
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
