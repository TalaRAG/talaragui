import React from "react";

export default Loader = ({
  label = "Loading",
  hint = "",
  compact = false,
}) => {
  const containerClassName = compact
    ? "loader-container loader-container--compact d-flex align-items-center gap-3"
    : "loader-container d-flex flex-column align-items-center justify-content-center gap-3 text-center";
  const spinnerClassName = compact
    ? "loader loader--compact flex-shrink-0"
    : "loader";

  return (
    <div className={containerClassName} role="status" aria-live="polite">
      <div className={spinnerClassName} aria-hidden="true" />
      {(label || hint) &&
        <div className="loader-copy">
          {label &&
            <div className="loader-label">
              {label}
            </div>
          }
          {hint &&
            <div className="loader-hint">
              {hint}
            </div>
          }
        </div>
      }
    </div>
  )
}
