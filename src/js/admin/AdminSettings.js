import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import AdminContent from "../commons/AdminContent";
import Loader from "../commons/Loader";
import { getEnvironment } from "../services/SystemService";

export default AdminSettings = () => {
  const [variables, setVariables] = useState([]);
  const [secretStatuses, setSecretStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchEnvironment = () => {
    setIsLoading(true);
    setErrorMessage("");

    getEnvironment().then((payload) => {
      const entries = Object.entries(payload.data.variables || {}).sort(([left], [right]) => {
        return left.localeCompare(right);
      });
      const secretEntries = Object.entries(payload.data.secret_statuses || {}).sort(([left], [right]) => {
        return left.localeCompare(right);
      });
      setVariables(entries);
      setSecretStatuses(secretEntries);
    }).catch((payload) => {
      console.log("Failed to load environment settings");
      console.log(payload.response);
      setVariables([]);
      setSecretStatuses([]);
      setErrorMessage("Unable to load backend environment settings.");
    }).finally(() => {
      setIsLoading(false);
    });
  }

  useEffect(() => {
    fetchEnvironment();
  }, []);

  return (
    <Layout>
      <AdminContent title="Settings">
        <p className="text-muted mb-3">
          Backend environment values shown here are limited to non-sensitive settings.
        </p>

        {isLoading && <Loader/>}

        {!isLoading && errorMessage &&
          <div className="alert alert-danger mb-0">
            {errorMessage}
          </div>
        }

        {!isLoading && !errorMessage &&
          <React.Fragment>
            <div className="table-responsive mb-4">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th scope="col">Secret</th>
                    <th scope="col">Configured</th>
                  </tr>
                </thead>
                <tbody>
                  {secretStatuses.length === 0 &&
                    <tr>
                      <td colSpan="2" className="text-center text-muted">
                        No secret status information available.
                      </td>
                    </tr>
                  }
                  {secretStatuses.map(([key, configured]) => (
                    <tr key={key}>
                      <td className="fw-semibold">
                        <code>{key}</code>
                      </td>
                      <td>
                        <span className={`badge text-bg-${configured ? "success" : "danger"}`}>
                          {configured ? "SET" : "MISSING"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Variable</th>
                  <th scope="col">Value</th>
                </tr>
              </thead>
              <tbody>
                {variables.length === 0 &&
                  <tr>
                    <td colSpan="2" className="text-center text-muted">
                      No environment settings available.
                    </td>
                  </tr>
                }
                {variables.map(([key, value]) => (
                  <tr key={key}>
                    <td className="fw-semibold">
                      <code>{key}</code>
                    </td>
                    <td>
                      <code>{value || "-"}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </React.Fragment>
        }
      </AdminContent>
    </Layout>
  );
}
