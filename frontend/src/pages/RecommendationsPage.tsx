import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCareers, getRecommendations } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { Recommendation } from "../types/api";

export default function RecommendationsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [careerIds, setCareerIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    Promise.all([getRecommendations(token), getCareers()])
      .then(([recommendationResponse, careerResponse]) => {
        setRecommendations(recommendationResponse.recommendations);
        setCareerIds(
          Object.fromEntries(
            careerResponse.data.map((career) => [career.name, career.id])
          )
        );
      })
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load recommendations."
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="page-state">Finding your best matches...</div>;
  if (error) return <div className="page-state error-message">{error}</div>;

  return (
    <main className="content-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CAREER SIGNALS</p>
          <h1>Where your current skills can take you.</h1>
          <p className="muted">A ranked view of the paths that fit your foundation today.</p>
        </div>
        <span className="stat-chip">{recommendations.length} paths</span>
      </div>
      <div className="recommendation-list">
        {recommendations.length === 0 ? (
          <section className="surface empty-state">
            <h2>No recommendations yet</h2>
            <p className="muted">Add skills and interests to your profile to create a match.</p>
          </section>
        ) : (
          recommendations.map((recommendation, index) => {
            const careerId = careerIds[recommendation.career];
            return (
              <article className="recommendation-card" key={recommendation.career}>
                <div className="rank">0{index + 1}</div>
                <div className="recommendation-main">
                  <p className="eyebrow">{recommendation.category ?? "CAREER PATH"}</p>
                  <h2>{recommendation.career}</h2>
                  <div className="metric-row">
                    <strong>{recommendation.finalScore}%</strong>
                    <span>overall match</span>
                  </div>
                  <div className="split-details">
                    <div>
                      <span className="detail-label">Matching skills</span>
                      <p>{recommendation.matchedSkills.map((skill) => skill.name).join(", ") || "None yet"}</p>
                    </div>
                    <div>
                      <span className="detail-label">Missing skills</span>
                      <p>{recommendation.missingSkills.map((skill) => skill.name).join(", ") || "None"}</p>
                    </div>
                  </div>
                </div>
                <button
                  className="button-secondary"
                  disabled={!careerId}
                  onClick={() => careerId && navigate(`/careers/${careerId}`)}
                >
                  View path
                </button>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
