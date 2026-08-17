export type CandidateCategory = 'ROI' | 'REINE'
export type VoteCategory = CandidateCategory | 'DUO'
export type VotingStatus = 'OPEN' | 'CLOSED'

export interface Candidate {
  id: string;
  category: CandidateCategory;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  is_manual_entry: boolean;
  created_at: string;
}

export interface Duo {
  id: string;
  duo_name: string | null;
  cavalier_first_name: string;
  cavalier_last_name: string;
  cavalier_photo_url: string | null;
  cavaliere_first_name: string;
  cavaliere_last_name: string;
  cavaliere_photo_url: string | null;
  is_manual_entry: boolean;
  created_at: string;
}

export interface SystemSettings {
  id: number;
  roi_inscriptions_open: boolean;
  reine_inscriptions_open: boolean;
  duo_inscriptions_open: boolean;
  roi_limit: number;
  reine_limit: number;
  voting_status: VotingStatus;
  results_published: boolean;
}

export interface BallotCreate {
  code: string;
  roi_candidate_id: string;
  reine_candidate_id: string;
  duo_id: string;
}

export interface VoteCodeIssue {
  code: string;
  voter_number: number;
}

export interface CandidateCreate {
  category: CandidateCategory;
  first_name: string;
  last_name: string;
  photo_url?: string | null;
}

export interface DuoCreate {
  duo_name?: string | null;
  cavalier_first_name: string;
  cavalier_last_name: string;
  cavalier_photo_url?: string | null;
  cavaliere_first_name: string;
  cavaliere_last_name: string;
  cavaliere_photo_url?: string | null;
}

export interface ResultItem {
  candidate_id?: string;
  duo_id?: string;
  votes: number;
}

export interface VoteResults {
  roi: ResultItem[];
  reine: ResultItem[];
  duo: ResultItem[];
}
