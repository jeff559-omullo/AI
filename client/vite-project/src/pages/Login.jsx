import { useState } from "react";
import axios from "axios";
import "./login.css";

function Login() {
  const [form, setForm] = useState({ admission: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ Use environment variable for API URL (Vite)
      // For Vite: create .env file with VITE_API_URL=https://ai-system-kms3.onrender.com/api
      // For Create React App: use REACT_APP_API_URL and process.env.REACT_APP_API_URL
      const API_URL = import.meta.env.VITE_API_URL || "https://ai-system-kms3.onrender.com/api";
      
      const res = await axios.post(`${API_URL}/auth/login`, {
        admission: form.admission,
        password: form.password,
      });

      localStorage.setItem("studentToken", res.data.token);
      window.location.href = "/dashboard";

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="login-container">
        <div className="login-card">
          <img src="/logo.png" alt="logo" className="logo" />

          <div className="form-group">
            <label>Reg.Number</label>
            <input
              type="text"
              name="admission"
              value={form.admission}
              onChange={handleChange}
              placeholder="CS123"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-box">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
              <span className="eye">👁️</span>
            </div>
          </div>

          <div className="remember">
            <input type="checkbox" />
            <span>Remember me</span>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button className="login-btn" onClick={handleLogin}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="forgot">Forgot your password?</p>
        </div>

        <div className="footer">2026 © Designed by DSL Systems</div>
      </div>
    </div>
  );
}

export default Login;