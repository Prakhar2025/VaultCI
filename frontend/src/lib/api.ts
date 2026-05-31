import { PRReport, AnalyticsData, MemoryResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchReport(owner: string, repo: string, pr: number): Promise<PRReport | null> {
  try {
    const res = await fetch(`${API_BASE}/report/${owner}/${repo}/${pr}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("API Error fetching report:", err);
    return null;
  }
}

export async function fetchAnalytics(owner: string, repo: string): Promise<AnalyticsData | null> {
  try {
    const res = await fetch(`${API_BASE}/analytics/${owner}/${repo}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("API Error fetching analytics:", err);
    return null;
  }
}

export async function searchMemory(repoId: string, query: string, limit = 5): Promise<MemoryResult[]> {
  try {
    const res = await fetch(`${API_BASE}/memory/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo_id: repoId, query, limit }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("API Error searching memory:", err);
    return [];
  }
}
