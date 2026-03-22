import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Loader from "../../commons/Loader";
import { getInputClassName, renderInputErrors } from "../../helpers/AppHelper";
import { updateUser } from "../../services/UsersService";

export default UpdatePasswordModal = ({ show, userId, onClose, onUpdated }) => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setPassword("");
      setPasswordConfirmation("");
      setErrors({});
      setIsSaving(false);
    }
  }, [show]);

  const handleSave = () => {
    if (!userId) {
      return;
    }

    setIsSaving(true);
    setErrors({});

    updateUser(userId, {
      password: password,
      password_confirmation: passwordConfirmation,
    }).then(() => {
      setIsSaving(false);
      if (onUpdated) {
        onUpdated();
      }
      onClose();
    }).catch((payload) => {
      console.log("Failed to update password");
      console.log(payload.response);
      setErrors(payload.response?.data || {});
      setIsSaving(false);
    });
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        Update Password
      </Modal.Header>
      <Modal.Body>
        {isSaving && <Loader/>}
        {!isSaving &&
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className={getInputClassName(errors, "password")}
                value={password}
                disabled={isSaving}
                onChange={(event) => setPassword(event.target.value)}
              />
              {renderInputErrors(errors, "password")}
            </div>
            <div className="col-12">
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
          </div>
        }
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          disabled={isSaving}
          onClick={handleSave}
        >
          Update
        </Button>
        <Button
          variant="secondary"
          disabled={isSaving}
          onClick={onClose}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
