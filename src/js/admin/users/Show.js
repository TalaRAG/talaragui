import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../Layout";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import ConfirmationModal from "../../commons/ConfirmationModal";
import UpdatePasswordModal from "./UpdatePasswordModal";
import { deleteUser, getUser } from "../../services/UsersService";

const renderStatusBadge = (status) => {
  const badgeClass = {
    active: "success",
    inactive: "warning",
    pending: "secondary",
    deleted: "dark",
  }[status] || "secondary";

  return (
    <span className={`badge text-bg-${badgeClass}`}>
      {(status || "unknown").toUpperCase()}
    </span>
  );
}

export default UsersShow = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchUser = () => {
    setIsLoading(true);
    setNotFound(false);

    getUser(userId).then((payload) => {
      setUser(payload.data);
    }).catch((payload) => {
      console.log("Failed to load user");
      console.log(payload.response);
      setNotFound(true);
    }).finally(() => {
      setIsLoading(false);
    });
  }

  const handleDelete = () => {
    setIsDeleting(true);

    deleteUser(userId).then(() => {
      navigate("/admin/users");
    }).catch((payload) => {
      console.log("Failed to delete user");
      console.log(payload.response);
      setIsDeleting(false);
    });
  }

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return (
    <Layout>
      <AdminContent
        title="User Details"
        headerActions={[
          (
            <button
              key="update-password"
              className="btn btn-sm btn-outline-secondary"
              disabled={isLoading || notFound}
              onClick={() => setShowPasswordModal(true)}
            >
              Update Password
            </button>
          ),
          (
            <button
              key="edit-user"
              className="btn btn-sm btn-outline-primary"
              disabled={isLoading || notFound}
              onClick={() => navigate(`/admin/users/${userId}/edit`)}
            >
              Edit
            </button>
          ),
          (
            <button
              key="delete-user"
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
            User not found.
          </div>
        }

        {!isLoading && user &&
          <div className="table-responsive">
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <th scope="row">Name</th>
                  <td>{user.full_name}</td>
                </tr>
                <tr>
                  <th scope="row">Email</th>
                  <td>{user.email}</td>
                </tr>
                <tr>
                  <th scope="row">Status</th>
                  <td>{renderStatusBadge(user.status)}</td>
                </tr>
                <tr>
                  <th scope="row">ID</th>
                  <td className="text-muted">{user.id}</td>
                </tr>
              </tbody>
            </table>
          </div>
        }
      </AdminContent>

      <ConfirmationModal
        show={showConfirm}
        header="Delete user"
        content="Are you sure you want to delete this user?"
        isLoading={isDeleting}
        onPrimaryClicked={handleDelete}
        onSecondaryClicked={() => {
          if (!isDeleting) {
            setShowConfirm(false);
          }
        }}
      />
      <UpdatePasswordModal
        show={showPasswordModal}
        userId={userId}
        onClose={() => setShowPasswordModal(false)}
      />
    </Layout>
  );
}
