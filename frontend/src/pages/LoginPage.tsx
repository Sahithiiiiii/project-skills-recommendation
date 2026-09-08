import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUserProfile } from "../services/api";

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const token = localStorage.getItem("pathforge_token");
      if (!token) return;

      getUserProfile(token)
        .then((profile) => {
          navigate(
            profile.skills.length === 0 && profile.interests.length === 0
              ? "/setup-profile"
              : "/recommendations",
            { replace: true }
          );
        })
        .catch(() => navigate("/recommendations", { replace: true }));
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return <div className="page-state">Loading...</div>;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      const token = localStorage.getItem("pathforge_token");
      if (!token) throw new Error("Login succeeded without a session token.");

      const profile = await getUserProfile(token);
      const destination =
        profile.skills.length === 0 && profile.interests.length === 0
          ? "/setup-profile"
          : (location.state as { from?: string } | null)?.from ??
            "/recommendations";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">PATHFORGE / ACCESS</p>
        <h1>Pick up where your learning path left off.</h1>
        <p className="muted">Sign in to see your career matches and next steps.</p>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="auth-switch">
          New to PathForge? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
