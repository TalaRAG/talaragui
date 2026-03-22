import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import Pagination from "../../Pagination";
import { listUsers } from "../../services/UsersService";

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

export default UsersIndex = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = () => {
    setIsLoading(true);

    listUsers({
      page: currentPage,
      perPage: 20,
      query: query,
      status: status,
    }).then((payload) => {
      setUsers(payload.data.records || []);
      setCurrentPage(payload.data.current_page || currentPage);
      setTotalPages(payload.data.total_pages || 1);
    }).catch((payload) => {
      console.log("Failed to load users");
      console.log(payload.response);
      setUsers([]);
      setTotalPages(1);
    }).finally(() => {
      setIsLoading(false);
    });
  }

  useEffect(() => {
    fetchUsers();
  }, [currentPage, query, status]);

  return (
    <Layout>
      <AdminContent
        title="Users"
        headerActions={[
          (
            <button
              key="create-user"
              className="btn btn-sm btn-primary"
              onClick={() => navigate("/admin/users/new")}
            >
              New User
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
              placeholder="Search by name or email"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>

        {isLoading && <Loader/>}

        {!isLoading &&
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 &&
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No users found.
                    </td>
                  </tr>
                }
                {users.map((user) => (
                  <tr key={`user-${user.id}`}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{renderStatusBadge(user.status)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
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
