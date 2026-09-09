import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCareerDetails, getCareerProjects, getCareerRoadmap } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { CareerDetailsResponse, CareerProjectsResponse, CareerRoadmapResponse } from "../types/api";

export default function CareerDetailsPage() {
  const { careerId } = useParams<{ careerId: string }>();
  const { token } = useAuth();
  const [details, setDetails] = useState<CareerDetailsResponse | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmapResponse | null>(null);
  const [projects, setProjects] = useState<CareerProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !careerId) return;

    Promise.all([
      getCareerDetails(token, careerId),
      getCareerRoadmap(token, careerId),
      getCareerProjects(token, careerId),
    ])
      .then(([detailsResponse, roadmapResponse, projectsResponse]) => {
        setDetails(detailsResponse);
        setRoadmap(roadmapResponse);
        setProjects(projectsResponse);
      })
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load this career path."
        );
      })
      .finally(() => setLoading(false));
  }, [careerId, token]);

  if (loading) return <div className="page-state">Mapping your path...</div>;
  if (error) return <div className="page-state error-message">{error}</div>;
  if (!details || !roadmap || !projects) return <div className="page-state">Career unavailable.</div>;

  const { analysis } = details;

  return (
    <main className="content-page">
      <Link className="back-link" to="/recommendations">&larr; Back to recommendations</Link>
      <div className="career-hero">
        <div>
          <p className="eyebrow">CAREER PATH / ANALYSIS</p>
          <h1>{details.career.name}</h1>
          <p className="hero-description">{details.career.description ?? "A focused route for your next chapter."}</p>
        </div>
        <div className="score-block">
          <span>Overall match</span>
          <strong>{analysis.overallMatchPercentage}%</strong>
          <em className={`priority priority-${analysis.learningPriority.toLowerCase()}`}>
            {analysis.learningPriority} priority
          </em>
        </div>
      </div>

      <div className="analysis-grid">
        <section className="surface">
          <div className="section-title"><p className="eyebrow">REQUIRED SKILLS</p><span>{analysis.requiredSkills.length}</span></div>
          <div className="skill-list">
            {analysis.requiredSkills.map((skill) => (
              <div className="skill-line" key={skill.id}>
                <span>{skill.name}</span>
                <span className={analysis.missingSkills.some((missing) => missing.id === skill.id) ? "status-missing" : "status-match"}>
                  {analysis.missingSkills.some((missing) => missing.id === skill.id) ? "To learn" : "Ready"}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="surface score-panel">
          <p className="eyebrow">SKILL MATCH</p>
          <strong>{analysis.skillMatchPercentage}%</strong>
          <p className="muted">{analysis.matchingSkills.length} of {analysis.requiredSkills.length} required skills match your profile.</p>
          <p className="eyebrow interest-label">INTEREST MATCH</p>
          <strong>{analysis.interestMatchPercentage}%</strong>
          <p className="muted">{analysis.matchingInterests.length} of {analysis.requiredInterests.length} required interests match.</p>
        </section>
      </div>

      <section className="surface roadmap-section">
        <div className="section-title">
          <div><p className="eyebrow">LEARNING ROADMAP</p><h2>{roadmap.roadmap.length ? "Your next steps" : "Foundation complete"}</h2></div>
          <span>{roadmap.roadmap.length} steps</span>
        </div>
        {roadmap.roadmap.length === 0 ? (
          <p className="muted">{roadmap.message}</p>
        ) : (
          <div className="roadmap-list">
            {roadmap.roadmap.map((step) => (
              <div className="roadmap-step" key={step.skillId}>
                <span className="step-number">{String(step.step).padStart(2, "0")}</span>
                <div><h3>{step.skillName}</h3><p className="muted">{step.learningObjective}</p></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="projects-section">
        <div className="section-title">
          <div><p className="eyebrow">PRACTICE PROJECTS</p><h2>Build your way forward</h2></div>
          <span>{projects.count} projects</span>
        </div>
        {projects.data.length === 0 ? (
          <div className="surface empty-state"><p className="muted">Projects for this career are coming soon.</p></div>
        ) : (
          <div className="project-grid">
            {projects.data.map((project) => (
              <article className="surface project-card" key={project.id}>
                <div className="project-card-header">
                  <h3>{project.title}</h3>
                  <span className="project-difficulty">{project.difficulty}</span>
                </div>
                <p className="muted">{project.description}</p>
                <div className="project-outcome">
                  <p className="eyebrow">LEARNING OUTCOME</p>
                  <p>{project.learningOutcome}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
