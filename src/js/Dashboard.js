import React from "react";

export default Dashboard = () => {
  return (
    <div className="p-4">
      <div className="auth-overline mb-2">Operations Overview</div>
      <h1 className="hero-title mb-3">
        Curate the knowledge base,
        <br />
        <span className="accent">monitor the archive lifecycle.</span>
      </h1>
      <p className="hero-description mb-4">
        Use this workspace to maintain document quality, manage access, and keep
        the retrieval layer aligned with your public research experience.
      </p>

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="surface-panel">
            <div className="surface-panel-body">
              <div className="auth-overline mb-2">Documents</div>
              <div className="font-headline fs-2 fw-bold">Archive Health</div>
              <div className="text-muted mt-2">
                Review uploads, vectorization status, and metadata consistency.
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="surface-panel">
            <div className="surface-panel-body">
              <div className="auth-overline mb-2">Users</div>
              <div className="font-headline fs-2 fw-bold">Access Control</div>
              <div className="text-muted mt-2">
                Manage editorial permissions and keep sensitive operations scoped.
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="surface-panel">
            <div className="surface-panel-body">
              <div className="auth-overline mb-2">System</div>
              <div className="font-headline fs-2 fw-bold">Retrieval Tuning</div>
              <div className="text-muted mt-2">
                Keep prompt, indexing, and content quality decisions visible.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
