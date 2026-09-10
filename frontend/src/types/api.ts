export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  success: true;
  message: string;
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  success: true;
  message: string;
  user: AuthUser;
}

export interface Skill {
  id: string;
  name: string;
  confidence?: number;
  importance?: number;
  category?: string | null;
  description?: string | null;
}

export interface Interest {
  id: string;
  name: string;
}

export interface SkillsResponse {
  success: true;
  count: number;
  data: Skill[];
}

export interface UserProfile {
  success: true;
  id: string;
  name: string;
  email: string;
  skills: Skill[];
  interests: Interest[];
}

export interface UpdatedSkillsResponse {
  success: true;
  skills: Skill[];
}

export interface UpdatedInterestsResponse {
  success: true;
  interests: Interest[];
}

export interface Recommendation {
  career: string;
  category: string | null;
  skillMatchPercentage: number;
  interestMatchPercentage: number;
  finalScore: number;
  matchedSkills: Array<{ name: string; importance: number }>;
  missingSkills: Array<{ name: string; importance: number }>;
  matchedInterests: Array<{ name: string; importance: number }>;
}

export interface RecommendationsResponse {
  success: true;
  recommendations: Recommendation[];
}

export interface CareerSummary {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}

export interface CareersResponse {
  success: true;
  count: number;
  data: CareerSummary[];
}

export interface CareerSkill extends Skill {
  importance: number;
}

export interface CareerInterest extends Interest {
  importance: number;
}

export interface CareerDetailsResponse {
  success: true;
  career: {
    id: string;
    name: string;
    description: string | null;
  };
  analysis: {
    requiredSkills: CareerSkill[];
    userSkills: Skill[];
    matchingSkills: CareerSkill[];
    missingSkills: CareerSkill[];
    skillMatchPercentage: number;
    requiredInterests: CareerInterest[];
    userInterests: Interest[];
    matchingInterests: CareerInterest[];
    missingInterests: CareerInterest[];
    interestMatchPercentage: number;
    overallMatchPercentage: number;
    learningPriority: "Low" | "Medium" | "High";
  };
}

export interface RoadmapStep {
  step: number;
  skillId: string;
  skillName: string;
  learningObjective: string;
}

export interface CareerRoadmapResponse {
  success: true;
  careerId: string;
  careerName: string;
  missingSkills: CareerSkill[];
  roadmap: RoadmapStep[];
  message: string;
}

export interface CareerProject {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  learningOutcome: string;
  careerId: string;
  createdAt: string;
}

export interface CareerProjectsResponse {
  success: true;
  count: number;
  data: CareerProject[];
}

export interface ChatResponse {
  success: true;
  reply: string;
}
