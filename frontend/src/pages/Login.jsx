import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Login failed. Please check your credentials."); return; }
      localStorage.setItem("token", data.data.token);
      onLogin();
    } catch { setError("Unable to connect to the server. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <main className="login-container">
      <section className="panel login-card">
        <div className="brand login-brand"><span className="brand-mark" aria-hidden="true">₹</span><span>Expense Tracker</span></div>
        <h1>Welcome back</h1>
        <p>Sign in to review your spending.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</button>
        </form>
      </section>
    </main>
  );
}

export default Login;
