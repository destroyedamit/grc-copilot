import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./LoginModal.css";

function LoginModal({ onClose }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password");
      }

      login(data.access_token, data.user);

      onClose();
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div
        className="login-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="login-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="login-icon">
          <ShieldCheck size={26} />
        </div>

        <h2>Sign in to GRC Copilot</h2>

        <p className="login-description">
          Sign in to access compliance data, controls, evidence and
          other GRC features.
        </p>

        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;