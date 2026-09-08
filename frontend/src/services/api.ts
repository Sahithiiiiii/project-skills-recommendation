import type {
  CareerDetailsResponse,
  CareerRoadmapResponse,
  CareersResponse,
  LoginResponse,
  RecommendationsResponse,
  RegisterResponse,
  SkillsResponse,
  UpdatedInterestsResponse,
  UpdatedSkillsResponse,
  UserProfile,
} from "../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "" : "http://localhost:5000");

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const getErrorMessage = (payload: unknown) => {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return "Something went wrong. Please try again.";
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload), response.status);
  }

  return payload as T;
};

export const register = (name: string, email: string, password: string) =>
  request<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const login = (email: string, password: string) =>
  request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getUserProfile = (token: string) =>
  request<UserProfile>("/api/user/profile", {}, token);

export const getSkills = () => request<SkillsResponse>("/api/skills");

export const updateUserSkills = (token: string, skills: string[]) =>
  request<UpdatedSkillsResponse>(
    "/api/user/skills",
    { method: "PUT", body: JSON.stringify({ skills }) },
    token
  );

export const updateUserInterests = (token: string, interests: string[]) =>
  request<UpdatedInterestsResponse>(
    "/api/user/interests",
    { method: "PUT", body: JSON.stringify({ interests }) },
    token
  );

export const getRecommendations = (token: string) =>
  request<RecommendationsResponse>("/api/recommendations", {}, token);

export const getCareers = () =>
  request<CareersResponse>("/api/careers");

export const getCareerDetails = (token: string, careerId: string) =>
  request<CareerDetailsResponse>(`/api/careers/${careerId}`, {}, token);

export const getCareerRoadmap = (token: string, careerId: string) =>
  request<CareerRoadmapResponse>(
    `/api/careers/${careerId}/roadmap`,
    {},
    token
  );
