import React, { useState } from "react";
import { renderInputErrors, getInputClassName } from "./helpers/AppHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import { 
  login,
  createSession
} from "./services/AuthService";

export default Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);

    login({ email, password}).then((payload) => {
      createSession({
        token: payload.data.token,
        user: payload.data.user
      });

      window.location.href = "/#/admin";
    }).catch((payload) => {
      console.log("Something went wrong");
      console.log(payload.response);
      setErrors(payload.response.data);
      setIsLoading(false);
    });
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="auth-hero">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="auth-brand-mark">
              <FontAwesomeIcon icon={faStar} />
            </div>
            <div>
              <div className="public-brand-name">TalaRAG</div>
              <div className="auth-overline">Dokumentong Pinoy</div>
            </div>
          </div>
          <div className="auth-overline mb-3">Admin Console</div>
          <h1 className="hero-title mb-3">
            Curate sources,
            <br />
            <span className="accent">manage the research layer.</span>
          </h1>
          <p className="auth-copy mb-0">
            Access the editorial workspace for documents, users, and archive
            operations. This interface follows the same luminous surface system as
            the public assistant so governance feels like part of the same product.
          </p>
        </section>

        <section className="auth-panel">
          <div className="login-form">
            <div className="auth-overline mb-2">Secure Access</div>
            <h2 className="font-headline fw-bold mb-4">Sign in to continue</h2>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faUser} className="me-2 auth-input-icon"/>
                Email
              </label>
              <input
                value={email}
                disabled={isLoading}
                className={getInputClassName(errors, 'email')}
                onKeyDown={(event) => {
                  if (event.key == 'Enter') {
                    handleLogin()
                  }
                }}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
              />
              {renderInputErrors(errors, 'email')}
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faLock} className="me-2 auth-input-icon"/>
                Password
              </label>
              <input
                value={password}
                disabled={isLoading}
                className={getInputClassName(errors, 'password')}
                onKeyDown={(event) => {
                  if (event.key == 'Enter') {
                    handleLogin()
                  }
                }}
                type="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
              {renderInputErrors(errors, 'password')}
            </div>

            <button
              className="btn btn-primary w-100 mt-3"
              disabled={isLoading}
              onClick={handleLogin}
              onKeyDown={(event) => {
                if (event.key == 'Enter') {
                  handleLogin()
                }
              }}
            >
              {isLoading ? "Signing In..." : "Login"}
            </button>

            <div className="auth-api-hint mt-4">
              API Endpoint: {API_BASE_URL}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
