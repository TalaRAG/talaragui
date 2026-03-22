import React from "react";
import Home from "./Home";
import { isLoggedIn } from "./services/AuthService";
import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./admin/Login";
import AdminDashboard from "./admin/AdminDashboard";
import AdminSettings from "./admin/AdminSettings";
import AdminUsersIndex from "./admin/users/Index";
import AdminUsersShow from "./admin/users/Show";
import AdminUsersForm from "./admin/users/Form";
import AdminDocumentsIndex from "./admin/documents/Index";
import AdminDocumentsShow from "./admin/documents/Show";
import AdminDocumentsForm from "./admin/documents/Form";
import PublicDocumentsIndex from "./documents/PublicIndex";

export default App = () => {
  const AdminIndexRedirect = () => {
    return isLoggedIn()
      ? (
        <Navigate to="/admin/dashboard" replace/>
      )
      : <Navigate to="/admin/login" replace/>;
  };

  const RequireAuth = ({ children }) => {
    return isLoggedIn()
      ? children
      : <Navigate to="/admin/login" replace/>;
  };

  return (
    <React.Fragment>
      <Routes>
        <Route
          path="/"
          element={<Home/>}
        />
        <Route
          path="/documents"
          element={<PublicDocumentsIndex/>}
        />
        <Route
          path="/admin"
          element={<AdminIndexRedirect/>}
        />
        <Route
          path="/admin/login"
          element={<Login/>}
        />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <AdminDashboard/>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RequireAuth>
              <AdminSettings/>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth>
              <AdminUsersIndex/>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users/new"
          element={
            <RequireAuth>
              <AdminUsersForm/>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users/:userId"
          element={
            <RequireAuth>
              <AdminUsersShow/>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users/:userId/edit"
          element={
            <RequireAuth>
              <AdminUsersForm/>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <RequireAuth>
              <AdminDocumentsIndex/>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/documents/new"
          element={
            <RequireAuth>
              <AdminDocumentsForm/>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/documents/:documentId"
          element={
            <RequireAuth>
              <AdminDocumentsShow/>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/documents/:documentId/edit"
          element={
            <RequireAuth>
              <AdminDocumentsForm/>
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={<Navigate to="/" replace/>}
        />
      </Routes>
    </React.Fragment>
  );
}
