import { useEffect, useState } from "react";
import { getUserProfile } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { UserProfile } from "../types/api";

export default function ProfilePage() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    getUserProfile(token)
      .then(setProfile)
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load your profile."
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="page-state">Loading your profile...</div>;
  if (error) return <div className="page-state error-message">{error}</div>;
  if (!profile) return <div className="page-state">Profile unavailable.</div>;

  return (
    <main className="content-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR FOUNDATION</p>
          <h1>{profile.name || user?.name}</h1>
          <p className="muted">{profile.email}</p>
        </div>
        <span className="stat-chip">{profile.skills.length} skills saved</span>
      </div>
      <div className="profile-grid">
        <section className="surface">
          <div className="section-title">
            <p className="eyebrow">SKILLS</p>
            <span>{profile.skills.length}</span>
          </div>
          <div className="tag-list">
            {profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <span className="tag" key={skill.id}>
                  {skill.name}
                  {skill.confidence !== undefined && (
                    <small>{skill.confidence}/1</small>
                  )}
                </span>
              ))
            ) : (
              <p className="muted">No skills saved yet.</p>
            )}
          </div>
        </section>
        <section className="surface">
          <div className="section-title">
            <p className="eyebrow">INTERESTS</p>
            <span>{profile.interests.length}</span>
          </div>
          <div className="tag-list">
            {profile.interests.length > 0 ? (
              profile.interests.map((interest) => (
                <span className="tag tag-interest" key={interest.id}>
                  {interest.name}
                </span>
              ))
            ) : (
              <p className="muted">No interests saved yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
