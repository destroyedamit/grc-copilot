import {
  LayoutDashboard,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  ClipboardList,
  Bot,
  FileText,
  ChevronDown,
  LogIn,
  LogOut,
} from "lucide-react";

import "./App.css";

import { Routes, Route, NavLink } from "react-router-dom";

import Controls from "./pages/Controls";
import Dashboard from "./pages/Dashboard";
import Evidence from "./pages/Evidence";
import RiskAssessments from "./pages/RiskAssessments";
import RFIManagement from "./pages/RFIManagement";
import AIAssistant from "./pages/AIAssistant";
import Reports from "./pages/Reports";
import AIReview from "./pages/AIReview";
import Settings from "./pages/Settings";

import { useAuth } from "./context/AuthContext";
import LoginModal from "./components/LoginModal";

import { useEffect, useState } from "react";
// ============================================
// GLOBAL API FETCH INTERCEPTOR
// ============================================

if (!window.__GRC_FETCH_PATCHED__) {
  const originalFetch = window.fetch;

  window.fetch = async (input, init = {}) => {
    const url =
      typeof input === "string"
        ? input
        : input?.url || "";

    /*
     * Only attach authentication to our backend APIs.
     */
    if (!url.startsWith("/api")) {
      return originalFetch(input, init);
    }

    const headers = new Headers(
      init.headers || {}
    );

    /*
     * Read the latest token directly from localStorage.
     *
     * This is important because this interceptor
     * is installed before React page effects run.
     */
    const currentToken =
      localStorage.getItem("grc_token");

    if (currentToken) {
      headers.set(
        "Authorization",
        `Bearer ${currentToken}`
      );
    }

    const response = await originalFetch(input, {
      ...init,
      headers,
    });

    /*
     * Tell React that authentication has expired.
     *
     * We don't directly call logout() here because
     * this code is outside the React component.
     */
    if (
      response.status === 401 &&
      currentToken
    ) {
      window.dispatchEvent(
        new Event("grc-auth-expired")
      );
    }

    return response;
  };

  window.__GRC_FETCH_PATCHED__ = true;
}

function App() {
  const {
    token,
    user,
    isAuthenticated,
    logout,
  } = useAuth();
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem("grc_sidebar_width");
    return savedWidth ? Number(savedWidth) : 240;
  });

  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem("grc_token");
      localStorage.removeItem("grc_user");

      logout();
      setShowLogin(true);
    };

    window.addEventListener(
      "grc-auth-expired",
      handleAuthExpired
    );

    return () => {
      window.removeEventListener(
        "grc-auth-expired",
        handleAuthExpired
      );
    };
  }, [logout]);

  useEffect(() => {
  if (!isResizingSidebar) {
    return;
  }

  const handleMouseMove = (event) => {
    const minWidth = 220;
    const maxWidth = 360;

    const newWidth = Math.min(
      maxWidth,
      Math.max(minWidth, event.clientX)
    );

    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsResizingSidebar(false);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";

  return () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };
}, [isResizingSidebar]);

useEffect(() => {
  localStorage.setItem(
    "grc_sidebar_width",
    String(sidebarWidth)
  );
}, [sidebarWidth]);


  /*
   * Automatically attach JWT token to every /api request.
   *
   * This means existing pages can continue using:
   *
   * fetch("/api/controls")
   * fetch("/api/evidence")
   * fetch("/api/rfi")
   *
   * and the JWT will automatically be added.
   */


  /*
   * Open login modal.
   */
  const openLogin = () => {
    setShowLogin(true);
    setShowUserMenu(false);
  };
  useEffect(() => {
    const handleOpenLogin = () => {
      openLogin();
    };

    window.addEventListener(
      "open-login",
      handleOpenLogin
    );

    return () => {
      window.removeEventListener(
        "open-login",
        handleOpenLogin
      );
    };
  }, []);
  /*
   * Logout current user.
   */
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  /*
   * Display role in sidebar.
   */
  const roleLabel = {
    ADMINISTRATOR: "Administrator",
    AUDITOR: "Auditor",
    CONTROL_OWNER: "Control Owner",
  };

  /*
   * User information.
   *
   * Before login:
   * Sign in
   * Login to access GRC
   *
   * After login:
   * Amit Kumar
   * Administrator
   */
  const displayName = user?.name || "Sign in";

  const displayRole = user
    ? roleLabel[user.role] || user.role
    : "Login to access GRC";

  /*
   * Generate user initials.
   */
  const initials = user?.name
    ? user.name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "👤";

  return (
<div
  className={`app ${isResizingSidebar ? "sidebar-resizing" : ""}`}
  style={{
    "--sidebar-width": `${sidebarWidth}px`,
  }}
>
      {/* =========================================
          SIDEBAR
          ========================================= */}

      <aside className="sidebar">

        {/* Brand */}
        <div className="brand">

          <div className="brand-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h1>GRC Copilot</h1>
            <span>Compliance Assistant</span>
          </div>

        </div>


        {/* Navigation */}
        <div className="menu-section">

          <p className="menu-title">
            WORKSPACE
          </p>


          {/* Dashboard */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={19} />
            Dashboard
          </NavLink>


          {/* Controls */}
          <NavLink
            to="/controls"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <ShieldCheck size={19} />
            Controls
          </NavLink>


          {/* Evidence */}
          <NavLink
            to="/evidence"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <FileCheck2 size={19} />
            Evidence
          </NavLink>


          {/* Risk Assessments */}
          <NavLink
            to="/risk-assessments"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <AlertTriangle size={19} />
            Risk Assessments
          </NavLink>


          {/* RFI Management */}
          <NavLink
            to="/rfi-management"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <ClipboardList size={19} />
            RFI Management
          </NavLink>


          {/* AI & Reporting */}
          <p className="menu-title second">
            AI & REPORTING
          </p>


          {/* AI Assistant */}
          <NavLink
            to="/ai-assistant"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <Bot size={19} />
            AI Assistant
          </NavLink>


          {/* Reports */}
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <FileText size={19} />
            Reports
          </NavLink>

        </div>


        {/* =========================================
            SIDEBAR BOTTOM
            ========================================= */}

        <div className="sidebar-bottom">

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <FileText size={19} />
            Settings
          </NavLink>


          {/* =====================================
              USER CARD
              ===================================== */}

          <div
            className="user-card"
            onClick={() => {

              /*
               * If user is NOT logged in:
               * open login modal.
               */
              if (!isAuthenticated) {
                openLogin();
                return;
              }

              /*
               * If logged in:
               * open/close user dropdown.
               */
              setShowUserMenu(
                (previous) => !previous
              );
            }}
          >

            {/* Avatar */}
            <div className="avatar">
              {initials}
            </div>


            {/* User information */}
            <div className="user-info">

              <strong>
                {displayName}
              </strong>

              <span>
                {displayRole}
              </span>

            </div>


            {/* Login / Dropdown icon */}
            {isAuthenticated ? (
              <ChevronDown size={16} />
            ) : (
              <LogIn size={16} />
            )}


            {/* =================================
                LOGGED-IN USER DROPDOWN
                ================================= */}

            {isAuthenticated &&
              showUserMenu && (

                <div
                  className="user-dropdown"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >

                  {/* User information */}
                  <div className="user-dropdown-info">

                    <strong>
                      {user?.name}
                    </strong>

                    <span>
                      {user?.email}
                    </span>

                    <small>
                      {roleLabel[user?.role] ||
                        user?.role}
                    </small>

                  </div>


                  {/* Logout */}
                  <button
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                </div>
              )}

          </div>

        </div>
<div
  className="sidebar-resize-handle"
  onMouseDown={() => setIsResizingSidebar(true)}
  title="Drag to resize sidebar"
/>
      </aside>


      {/* =========================================
          MAIN CONTENT
          ========================================= */}

      <main className="main">

        <Routes>

          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />


          {/* Controls */}
          <Route
            path="/controls"
            element={<Controls />}
          />


          {/* Evidence */}
          <Route
            path="/evidence"
            element={<Evidence />}
          />


          {/* Risk */}
          <Route
            path="/risk-assessments"
            element={<RiskAssessments />}
          />


          {/* RFI */}
          <Route
            path="/rfi-management"
            element={<RFIManagement />}
          />


          {/* AI Assistant */}
          <Route
            path="/ai-assistant"
            element={<AIAssistant />}
          />


          {/* Reports */}
          <Route
            path="/reports"
            element={<Reports />}
          />


          {/* AI Review */}
          <Route
            path="/ai-review"
            element={<AIReview />}
          />


          {/* Settings */}
          <Route
            path="/settings"
            element={<Settings />}
          />

        </Routes>

      </main>


      {/* =========================================
          LOGIN MODAL
          ========================================= */}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
        />
      )}

    </div>
  );
}

export default App;