import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../Layout";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import { getInputClassName, renderInputErrors } from "../../helpers/AppHelper";
import { createUser, getUser, updateUser } from "../../services/UsersService";

export default UsersForm = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!userId;

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchUser = () => {
    if (!isEdit) {
      return;
    }

    setIsLoading(true);
    setNotFound(false);

    getUser(userId).then((payload) => {
      setEmail(payload.data.email || "");
      setFirstName(payload.data.first_name || "");
      setLastName(payload.data.last_name || "");
    }).catch((payload) => {
      console.log("Failed to load user");
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
      ? updateUser(userId, {
          email: email,
          first_name: firstName,
          last_name: lastName,
        })
      : createUser({
          email: email,
          first_name: firstName,
          last_name: lastName,
          password: password,
          password_confirmation: passwordConfirmation,
        });

    action.then((payload) => {
      const nextId = payload.data.id || userId;
      navigate(`/admin/users/${nextId}`);
    }).catch((payload) => {
      console.log("Failed to save user");
      console.log(payload.response);
      setErrors(payload.response?.data || {});
      setIsSaving(false);
    });
  }

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return (
    <Layout>
      <AdminContent
        title={isEdit ? "Edit User" : "New User"}
        headerActions={[
          (
            <button
              key="back"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => navigate(isEdit ? `/admin/users/${userId}` : "/admin/users")}
            >
              Back
            </button>
          )
        ]}
      >
        {isLoading && <Loader/>}

        {!isLoading && notFound &&
          <div className="text-muted">
            User not found.
          </div>
        }

        {!isLoading && !notFound &&
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Email</label>
              <input
                className={getInputClassName(errors, "email")}
                value={email}
                disabled={isSaving}
                onChange={(event) => setEmail(event.target.value)}
              />
              {renderInputErrors(errors, "email")}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">First Name</label>
              <input
                className={getInputClassName(errors, "first_name")}
                value={firstName}
                disabled={isSaving}
                onChange={(event) => setFirstName(event.target.value)}
              />
              {renderInputErrors(errors, "first_name")}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Last Name</label>
              <input
                className={getInputClassName(errors, "last_name")}
                value={lastName}
                disabled={isSaving}
                onChange={(event) => setLastName(event.target.value)}
              />
              {renderInputErrors(errors, "last_name")}
            </div>

            {!isEdit &&
              <React.Fragment>
                <div className="col-12 col-md-6">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className={getInputClassName(errors, "password")}
                    value={password}
                    disabled={isSaving}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  {renderInputErrors(errors, "password")}
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className={getInputClassName(errors, "password_confirmation")}
                    value={passwordConfirmation}
                    disabled={isSaving}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                  />
                  {renderInputErrors(errors, "password_confirmation")}
                </div>
              </React.Fragment>
            }

            <div className="col-12 d-flex gap-2">
              <button
                className="btn btn-primary"
                disabled={isSaving}
                onClick={handleSubmit}
              >
                {isEdit ? "Update User" : "Create User"}
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={isSaving}
                onClick={() => navigate(isEdit ? `/admin/users/${userId}` : "/admin/users")}
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
