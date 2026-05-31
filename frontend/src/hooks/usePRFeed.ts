import { useEffect, useState } from "react";
import { PRReport } from "../types";
import { fetchAnalytics, fetchReport } from "../api";

// Fallback demo data if backend isn't reachable
const MOCK_PRS: PRReport[] = [
  {
    pr_number: 142,
    repo_id: "Prakhar2025/vaultci",
    is_ai_generated: true,
    trust_score: 0.35,
    gate_decision: "BLOCK",
    security_score: 0.4,
    arch_score: 0.5,
    blast_score: 0.6,
    rejected_score: 0.8,
    created_at: new Date().toISOString(),
    report_json: {
      weights: { security: 0.14, arch: 0.15, blast: 0.12, rejected: 0.08, ai_origin: 0.04 },
      file_map: [
        { file: "src/auth/login.ts", risk: "CRITICAL" },
        { file: "src/api/user.ts", risk: "MEDIUM" }
      ],
      contradictions: [
        { decision: "All auth goes through AuthService", pr_number: 88, author: "prakhar", relevance_score: 0.92, decision_type: "RULE" }
      ],
      explanation: "This AI-generated PR introduces direct JWT validation bypassing the central AuthService. Critical security risk detected.",
      override_applied: "CRITICAL_SECURITY_FLAG",
    }
  },
  {
    pr_number: 141,
    repo_id: "Prakhar2025/vaultci",
    is_ai_generated: false,
    trust_score: 0.92,
    gate_decision: "TRUSTED",
    security_score: 1.0,
    arch_score: 1.0,
    blast_score: 0.9,
    rejected_score: 1.0,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    report_json: {
      weights: { security: 0.35, arch: 0.30, blast: 0.18, rejected: 0.10, ai_origin: 0.05 },
      file_map: [
        { file: "src/components/Button.tsx", risk: "LOW" }
      ],
      contradictions: [],
      explanation: "Safe UI component update. No architectural or security issues found."
    }
  },
  {
    pr_number: 140,
    repo_id: "Prakhar2025/vaultci",
    is_ai_generated: true,
    trust_score: 0.75,
    gate_decision: "REVIEW",
    security_score: 0.9,
    arch_score: 0.8,
    blast_score: 0.5,
    rejected_score: 1.0,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    report_json: {
      weights: { security: 0.31, arch: 0.24, blast: 0.10, rejected: 0.10, ai_origin: 0.04 },
      file_map: [
        { file: "src/lib/utils.ts", risk: "LOW" },
        { file: "src/lib/constants.ts", risk: "LOW" }
      ],
      contradictions: [],
      explanation: "High blast radius change affecting multiple core utility files. Manual review recommended before merging."
    }
  }
];

export function usePRFeed(owner: string, repo: string) {
  const [prs, setPrs] = useState<PRReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // In a real scenario we might poll a dedicated /feed endpoint.
      // Here we just use the mock data immediately if we can't fetch.
      setPrs(MOCK_PRS);
      setLoading(false);
    }

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [owner, repo]);

  return { prs, loading };
}
