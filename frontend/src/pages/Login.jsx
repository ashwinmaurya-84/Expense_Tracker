import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setSuccess(""); setIsSubmitting(true);
    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const body = mode === "register" ? { name, email, password } : { email, password };
      const response = await fetch(`${API_URL}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) { setError(data.message || (mode === "register" ? "Unable to create your account." : "Login failed. Please check your credentials.")); return; }
      if (mode === "register") { setMode("login"); setPassword(""); setSuccess("Account created. Sign in with your new credentials."); return; }
      localStorage.setItem("token", data.data.token); onLogin();
    } catch { setError("Unable to connect to the server. Please try again."); }
    finally { setIsSubmitting(false); }
  };
  const switchMode = () => { setMode((current) => current === "login" ? "register" : "login"); setError(""); setSuccess(""); };
  return <main className="login-container"><section className="panel login-card"><div className="brand login-brand"><span className="brand-mark" aria-hidden="true">₹</span><span>Expense Tracker</span></div><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p>{mode === "login" ? "Sign in to review your spending." : "Start tracking your spending in one place."}</p><form className="login-form" onSubmit={handleSubmit}>{error && <p className="error-message">{error}</p>}{success && <p className="success-message">{success}</p>}{mode === "register" && <div className="field"><label htmlFor="name">Name</label><input id="name" type="text" autoComplete="name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required /></div>}<div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "login" ? "Enter your password" : "At least 8 characters, with a number and uppercase letter"} value={password} onChange={(event) => setPassword(event.target.value)} required /></div><button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? (mode === "login" ? "Signing in…" : "Creating account…") : (mode === "login" ? "Sign in" : "Create account")}</button></form><button className="auth-switch" type="button" onClick={switchMode}>{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button></section></main>;
}

export default Login;
