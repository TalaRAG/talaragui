import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft,
  faBars,
  faFileLines,
  faGears,
  faStar,
  faTableColumns,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import profile from "../styles/images/profile.png";
import { destroySession } from "./services/AuthService";
import { useNavigate, useLocation } from "react-router-dom";

export default Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={`sidebar ${isOpen ? 'active' : 'close'}`}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <FontAwesomeIcon icon={faStar}/>
          </div>
          <div className="sidebar-brand-copy">
            <div className="sidebar-brand-name">
              TalaRAG
            </div>
            <div className="sidebar-brand-tagline">
              Admin Console
            </div>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <FontAwesomeIcon icon={faBars}/>
        </button>
      </div>

      <ul className="nav-links">
        <li className={location.pathname == "/admin/dashboard" ? "active" : ""}>
          <button
            type="button"
            onClick={() => {
              navigate('/admin/dashboard')
            }}
          >
            <i>
              <FontAwesomeIcon icon={faTableColumns}/>
            </i>
            <span className="link-name">
              Dashboard
            </span>
          </button>
        </li>
        <li className={location.pathname == "/admin/settings" ? "active" : ""}>
          <button
            type="button"
            onClick={() => {
              navigate('/admin/settings')
            }}
          >
            <i>
              <FontAwesomeIcon icon={faGears}/>
            </i>
            <span className="link-name">
              Settings
            </span>
          </button>
        </li>
        <li className={location.pathname.startsWith("/admin/users") ? "active" : ""}>
          <button
            type="button"
            onClick={() => {
              navigate('/admin/users')
            }}
          >
            <i>
              <FontAwesomeIcon icon={faUsers}/>
            </i>
            <span className="link-name">
              Users
            </span>
          </button>
        </li>
        <li className={location.pathname.startsWith("/admin/documents") ? "active" : ""}>
          <button
            type="button"
            onClick={() => {
              navigate('/admin/documents')
            }}
          >
            <i>
              <FontAwesomeIcon icon={faFileLines}/>
            </i>
            <span className="link-name">
              Documents
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              destroySession();
              window.location.href="/";
            }}
          >
            <i>
              <FontAwesomeIcon icon={faArrowLeft}/>
            </i>
            <span className="link-name">
              Logout
            </span>
          </button>
        </li>
      </ul>

      <div className="sidebar-footer">
        <img alt="profileImg" className="sidebar-footer-avatar" src={profile}/>
        <div className="sidebar-footer-copy">
          <div className="sidebar-footer-name">
            Workspace User
          </div>
          <div className="sidebar-footer-role">
            Archive Operations
          </div>
        </div>
      </div>
    </div>
  );
}
