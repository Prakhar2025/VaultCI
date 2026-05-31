export type GateType = "TRUSTED" | "REVIEW" | "CAUTION" | "BLOCK";

export interface FileRisk {
  file: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface Contradiction {
  decision: string;
  pr_number: number;
  author: string;
  relevance_score: number;
  decision_type: string;
}

export interface PRReport {
  pr_number: number;
  repo_id: string;
  is_ai_generated: boolean;
  trust_score: number;
  gate_decision: GateType;
  security_score: number;
  arch_score: number;
  blast_score: number;
  rejected_score: number;
  created_at: string;
  report_json: {
    weights: Record<string, number>;
    file_map: FileRisk[];
    contradictions: Contradiction[];
    explanation: string;
    override_applied?: string;
  };
}

export interface AnalyticsData {
  repo_id: string;
  total_prs_analyzed: number;
  ai_generated_prs: number;
  average_trust_score: number | null;
  blocked_prs: number;
  gate_breakdown: Record<GateType, number>;
  top_risk_files: string[];
  trust_score_trend: Array<{ created_at: string; trust_score: number }>;
}

export interface MemoryResult {
  decision: string;
  pr_number: number;
  author: string;
  relevance_score: number;
  decision_type: string;
}
