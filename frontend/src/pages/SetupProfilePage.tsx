import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSkills,
  getUserProfile,
  updateUserInterests,
  updateUserSkills,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { Skill } from "../types/api";

const interestOptions = [
  "Web Development",
  "Backend Development",
  "Frontend Development",
  "Artificial Intelligence",
  "Data Science",
  "Problem Solving",
];

export default function SetupProfilePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    Promise.all([getSkills(), getUserProfile(token)])
      .then(([skillsResponse, profile]) => {
        setSkills(skillsResponse.data);
        setSelectedSkills(profile.skills.map((skill) => skill.name));
        setSelectedInterests(profile.interests.map((interest) => interest.name));
      })
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load profile setup."
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void
  ) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const handleSave = async () => {
    if (!token) return;

    setError("");
    setSaving(true);
    try {
      await updateUserSkills(token, selectedSkills);
      await updateUserInterests(token, selectedInterests);
      navigate("/recommendations", { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-state">Loading profile setup...</div>;

  return (
    <main className="content-page setup-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FIRST SIGNALS</p>
          <h1>Shape your starting point.</h1>
          <p className="muted">
            Choose the skills and interests that describe where you are today.
          </p>
        </div>
        <span className="stat-chip">{selectedSkills.length + selectedInterests.length} selected</span>
      </div>

      {error && <p className="error-message setup-error">{error}</p>}

      <section className="surface setup-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">SKILLS</p>
            <h2>What can you do?</h2>
          </div>
          <span>{selectedSkills.length} selected</span>
        </div>
        <div className="selection-grid">
          {skills.map((skill) => {
            const checked = selectedSkills.includes(skill.name);
            return (
              <label className={`selection-card ${checked ? "selected" : ""}`} key={skill.id}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelection(skill.name, selectedSkills, setSelectedSkills)}
                />
                <span>
                  <strong>{skill.name}</strong>
                  {skill.category && <small>{skill.category}</small>}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="surface setup-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">INTERESTS</p>
            <h2>What pulls you forward?</h2>
          </div>
          <span>{selectedInterests.length} selected</span>
        </div>
        <div className="selection-grid">
          {interestOptions.map((interest) => {
            const checked = selectedInterests.includes(interest);
            return (
              <label className={`selection-card ${checked ? "selected" : ""}`} key={interest}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
                />
                <span><strong>{interest}</strong></span>
              </label>
            );
          })}
        </div>
      </section>

      <div className="setup-actions">
        <p className="muted">You can update these choices from your profile later.</p>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving profile..." : "Save profile"}
        </button>
      </div>
    </main>
  );
}
