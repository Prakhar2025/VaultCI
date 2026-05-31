import { PRReport, AnalyticsData, MemoryResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Health ─────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export async function fetchReport(
  owner: string,
  repo: string,
  pr: number
): Promise<PRReport | null> {
  try {
    const res = await fetch(`${API_BASE}/report/${owner}/${repo}/${pr}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchAllReports(
  owner: string,
  repo: string,
  limit = 20
): Promise<PRReport[]> {
  try {
    const res = await fetch(
      `${API_BASE}/report/${owner}/${repo}?limit=${limit}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    // Backend returns array or { reports: [] }
    return Array.isArray(data) ? data : data.reports ?? [];
  } catch {
    return [];
  }
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export async function fetchAnalytics(
  owner: string,
  repo: string
): Promise<AnalyticsData | null> {
  try {
    const res = await fetch(`${API_BASE}/analytics/${owner}/${repo}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Memory ──────────────────────────────────────────────────────────────────
export async function searchMemory(
  repoId: string,
  query: string,
  limit = 5
): Promise<MemoryResult[]> {
  try {
    const res = await fetch(`${API_BASE}/memory/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo_id: repoId, query, limit }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function postDecision(payload: {
  repo_id: string;
  decision_text: string;
  decision_type: string;
  code_context?: string;
  tags?: string[];
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/memory/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: false, message: "API error" };
    return { success: true };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

// ─── Repository Registration ──────────────────────────────────────────────────
export async function registerRepo(payload: {
  repo_id: string;
  github_token?: string;
  webhook_secret: string;
  security_threshold: number;
  arch_threshold: number;
  blast_threshold: number;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/repos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.detail ?? "Registration failed" };
    return { success: true, message: data.message };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}
