import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, ArrowRight, ShieldCheck, LockKeyhole } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@stockly.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("token", "mock-jwt-token");
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Boxes size={25} />
          </div>
          <span>stockly</span>
        </div>

        <div className="login-hero-text">
          <span className="login-eyebrow">SUPPLY CHAIN MANAGEMENT</span>
          <h1>Take control of your inventory operations.</h1>
          <p>
            Manage materials, monitor stock movements, and streamline
            procurement activities in one centralized workspace.
          </p>
        </div>

        <div className="login-features">
          <div className="login-feature">
            <ShieldCheck size={19} />
            <span>Secure workspace access</span>
          </div>
          <div className="login-feature">
            <LockKeyhole size={19} />
            <span>Centralized inventory management</span>
          </div>
        </div>

        <div className="login-left-footer">
          STOCKLY SUPPLY CHAIN © 2026
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-mobile-brand">
            <Boxes size={25} />
            <span>stockly</span>
          </div>

          <span className="login-form-eyebrow">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="login-description">
            Enter your credentials to access your workspace.
          </p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              <span>
                {loading ? "Authenticating..." : "Sign in to workspace"}
              </span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="login-security-note">
            <ShieldCheck size={16} />
            <span>Your workspace is protected.</span>
          </div>

          <p className="login-hint">
            Demo credentials are pre-filled. Just click Sign in.
          </p>
        </div>
      </div>
    </div>
  );
}