import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Lock,
} from "lucide-react";

import { useState } from "react";
import "./Settings.css";


function Settings() {

  const [settings, setSettings] = useState({
    name: "Amit Kumar",
    email: "amit@example.com",
    role: "Compliance Analyst",

    defaultFramework: "SOC 2",
    fiscalYear: "FY 2026",

    emailNotifications: true,
    rfiNotifications: true,
    riskNotifications: true,
    evidenceNotifications: true,

    theme: "Light",
  });


  const [saved, setSaved] = useState(false);


  const updateSetting = (
    field,
    value
  ) => {

    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);

  };


  const saveSettings = () => {

    localStorage.setItem(
      "grc_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

  };


  return (

    <div className="settings-page">


      {/* HEADER */}

      <div className="settings-header">

        <div>

          <h2>
            Settings
          </h2>

          <p>
            Manage your profile, preferences and
            notification settings.
          </p>

        </div>


        <button
          className="save-settings-button"
          onClick={saveSettings}
        >

          <Save size={15} />

          Save Changes

        </button>

      </div>



      {/* PROFILE */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon blue">
            <User size={18} />
          </div>

          <div>

            <h3>
              Profile
            </h3>

            <p>
              Manage your account information.
            </p>

          </div>

        </div>


        <div className="settings-grid">

          <div className="settings-field">

            <label>
              Full Name
            </label>

            <input
              value={settings.name}
              onChange={(e) =>
                updateSetting(
                  "name",
                  e.target.value
                )
              }
            />

          </div>


          <div className="settings-field">

            <label>
              Email Address
            </label>

            <input
              type="email"
              value={settings.email}
              onChange={(e) =>
                updateSetting(
                  "email",
                  e.target.value
                )
              }
            />

          </div>


          <div className="settings-field">

            <label>
              Role
            </label>

            <input
              value={settings.role}
              onChange={(e) =>
                updateSetting(
                  "role",
                  e.target.value
                )
              }
            />

          </div>

        </div>

      </div>



      {/* COMPLIANCE */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon purple">
            <Shield size={18} />
          </div>

          <div>

            <h3>
              Compliance Preferences
            </h3>

            <p>
              Configure your default compliance settings.
            </p>

          </div>

        </div>


        <div className="settings-grid">

          <div className="settings-field">

            <label>
              Default Framework
            </label>

            <select
              value={
                settings.defaultFramework
              }
              onChange={(e) =>
                updateSetting(
                  "defaultFramework",
                  e.target.value
                )
              }
            >

              <option>
                SOC 2
              </option>

              <option>
                ISO 27001
              </option>

              <option>
                NIST CSF
              </option>

              <option>
                CSA
              </option>

              <option>
                CAIQ
              </option>

            </select>

          </div>


          <div className="settings-field">

            <label>
              Fiscal Year
            </label>

            <select
              value={
                settings.fiscalYear
              }
              onChange={(e) =>
                updateSetting(
                  "fiscalYear",
                  e.target.value
                )
              }
            >

              <option>
                FY 2026
              </option>

              <option>
                FY 2025
              </option>

              <option>
                FY 2024
              </option>

              <option>
                FY 2023
              </option>

            </select>

          </div>

        </div>

      </div>



      {/* NOTIFICATIONS */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon orange">
            <Bell size={18} />
          </div>

          <div>

            <h3>
              Notifications
            </h3>

            <p>
              Choose which compliance alerts you receive.
            </p>

          </div>

        </div>


        <div className="notification-settings">


          <div className="notification-setting">

            <div>

              <strong>
                Email Notifications
              </strong>

              <span>
                Receive important compliance updates.
              </span>

            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={
                  settings.emailNotifications
                }
                onChange={(e) =>
                  updateSetting(
                    "emailNotifications",
                    e.target.checked
                  )
                }
              />

              <span></span>

            </label>

          </div>



          <div className="notification-setting">

            <div>

              <strong>
                RFI Notifications
              </strong>

              <span>
                Get notified when an RFI requires attention.
              </span>

            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={
                  settings.rfiNotifications
                }
                onChange={(e) =>
                  updateSetting(
                    "rfiNotifications",
                    e.target.checked
                  )
                }
              />

              <span></span>

            </label>

          </div>



          <div className="notification-setting">

            <div>

              <strong>
                Risk Alerts
              </strong>

              <span>
                Receive alerts for high-risk findings.
              </span>

            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={
                  settings.riskNotifications
                }
                onChange={(e) =>
                  updateSetting(
                    "riskNotifications",
                    e.target.checked
                  )
                }
              />

              <span></span>

            </label>

          </div>



          <div className="notification-setting">

            <div>

              <strong>
                Evidence Alerts
              </strong>

              <span>
                Get notified when evidence is missing.
              </span>

            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={
                  settings.evidenceNotifications
                }
                onChange={(e) =>
                  updateSetting(
                    "evidenceNotifications",
                    e.target.checked
                  )
                }
              />

              <span></span>

            </label>

          </div>

        </div>

      </div>



      {/* APPEARANCE */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon green">
            <Palette size={18} />
          </div>

          <div>

            <h3>
              Appearance
            </h3>

            <p>
              Customize how the GRC application looks.
            </p>

          </div>

        </div>


        <div className="theme-options">

          {[
            "Light",
            "Dark",
            "System",
          ].map((theme) => (

            <button
              key={theme}
              className={
                settings.theme === theme
                  ? "theme-option active"
                  : "theme-option"
              }
              onClick={() =>
                updateSetting(
                  "theme",
                  theme
                )
              }
            >

              <div className="theme-preview">
                {theme === "Dark"
                  ? "◐"
                  : theme === "System"
                  ? "◑"
                  : "○"}
              </div>

              <span>
                {theme}
              </span>

            </button>

          ))}

        </div>

      </div>



      {/* SECURITY */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon red">
            <Lock size={18} />
          </div>

          <div>

            <h3>
              Security
            </h3>

            <p>
              Manage account security preferences.
            </p>

          </div>

        </div>


        <div className="security-row">

          <div>

            <strong>
              Password
            </strong>

            <span>
              Last updated recently
            </span>

          </div>


          <button className="secondary-button">

            Change Password

          </button>

        </div>


        <div className="security-row">

          <div>

            <strong>
              Active Sessions
            </strong>

            <span>
              Manage devices signed into your account.
            </span>

          </div>


          <button className="secondary-button">

            Manage Sessions

          </button>

        </div>

      </div>



      {saved && (

        <div className="settings-saved">

          <Save size={14} />

          Settings saved successfully.

        </div>

      )}

    </div>

  );

}


export default Settings;