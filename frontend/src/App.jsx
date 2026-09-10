import {
  LayoutDashboard,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  ClipboardList,
  Bot,
  FileText,
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  Clock3,
  CircleCheck,
  CircleAlert,
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
function App() {
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1>GRC Copilot</h1>
            <span>Compliance Assistant</span>
          </div>
        </div>

        <div className="menu-section">
          <p className="menu-title">WORKSPACE</p>

          <NavLink
            to="/"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={19} />
            Dashboard
          </NavLink>
          <NavLink
            to="/controls"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <ShieldCheck size={19} />
            Controls
          </NavLink>

          <NavLink
            to="/evidence"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <FileCheck2 size={19} />
            Evidence
          </NavLink>

          <NavLink
            to="/risk-assessments"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <AlertTriangle size={19} />
            Risk Assessments
          </NavLink>

          <NavLink
            to="/rfi-management"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <ClipboardList size={19} />
            RFI Management
          </NavLink>
          <p className="menu-title second">AI & REPORTING</p>

         <NavLink
  to="/ai-assistant"
  className={({ isActive }) =>
    `menu-item ${isActive ? "active" : ""}`
  }
>
  <Bot size={19} />
  AI Assistant
</NavLink>
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

        <div className="sidebar-bottom">
                <NavLink
  to="/settings"
  className={({ isActive }) =>
    `menu-item ${isActive ? "active" : ""}`
  }
>
  <FileText size={19} />
  Settings
</NavLink>

          <div className="user-card">
            <div className="avatar">AK</div>
            <div className="user-info">
              <strong>Amit Kumar</strong>
              <span>Security Compliance</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/controls" element={<Controls />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/risk-assessments" element={<RiskAssessments />} />
          <Route path="/rfi-management" element={<RFIManagement />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/reports" element={<Reports/>} />
          <Route path="/ai-review" element={<AIReview />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;