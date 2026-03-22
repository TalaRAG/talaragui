import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/AuthService";
import BaseLogin from "../Login";

export default Login = () => {
  if (isLoggedIn()) {
    return (
      <Navigate to="/admin/dashboard" replace/>
    );
  }

  return (
    <BaseLogin/>
  );
}
