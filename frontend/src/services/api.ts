import axios from "axios";
import type {
  Candidate,
  CandidateCreate,
  Duo,
  DuoCreate,
  SystemSettings,
  BallotCreate,
  VoteCodeIssue,
  VoteResults,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for Admin JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Public Endpoints ---

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await api.get<SystemSettings>("/public/settings");
  return response.data;
};

export const getPublicCandidates = async (): Promise<Candidate[]> => {
  const response = await api.get<Candidate[]>("/public/candidates");
  return response.data;
};

export const getPublicDuos = async (): Promise<Duo[]> => {
  const response = await api.get<Duo[]>("/public/duos");
  return response.data;
};

export const registerCandidate = async (
  formData: FormData
): Promise<Candidate> => {
  const response = await api.post<Candidate>("/public/candidates", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const registerDuo = async (formData: FormData): Promise<Duo> => {
  const response = await api.post<Duo>("/public/duos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const verifyVoteCode = async (code: string): Promise<void> => {
  await api.post("/public/votes/verify-code", { code });
};

export const submitBallot = async (ballot: BallotCreate): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>("/public/votes/", ballot);
  return response.data;
};

export const getVoteResults = async (): Promise<VoteResults> => {
  const response = await api.get<VoteResults>("/public/votes/results");
  return response.data;
};

// --- Admin Endpoints ---
export const adminLogin = async (username: string, password: string): Promise<{ access_token: string }> => {
  const data = new URLSearchParams();
  data.append('username', username);
  data.append('password', password);
  const response = await axios.post(`${API_URL}/auth/login/access-token`, data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const getSettings = async () => {
  const response = await api.get('/admin/settings/');
  return response.data;
};

export const updateSettings = async (patch: Record<string, any>) => {
  const response = await api.patch('/admin/settings/', patch);
  return response.data;
};

export const getAdminCandidates = async () => {
  const response = await api.get('/admin/candidates/');
  return response.data;
};

export const createAdminCandidate = async (data: any) => {
  const response = await api.post('/admin/candidates/', data);
  return response.data;
};

export const deleteAdminCandidate = async (id: string) => {
  await api.delete(`/admin/candidates/${id}`);
};

export const getAdminDuos = async () => {
  const response = await api.get('/admin/duos/');
  return response.data;
};

export const createAdminDuo = async (data: any) => {
  const response = await api.post('/admin/duos/', data);
  return response.data;
};

export const deleteAdminDuo = async (id: string) => {
  await api.delete(`/admin/duos/${id}`);
};

export const getAdminVoteResults = async () => {
  const response = await api.get('/admin/votes/results');
  return response.data;
};

export const issueVoteCode = async (): Promise<VoteCodeIssue> => {
  const response = await api.post<VoteCodeIssue>('/agent/vote-codes/');
  return response.data;
};

export const uploadAdminCandidatePhoto = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/admin/candidates/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadAdminDuoCavalierPhoto = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/admin/duos/${id}/photo/cavalier`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadAdminDuoCavalierePhoto = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/admin/duos/${id}/photo/cavaliere`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export default api;
