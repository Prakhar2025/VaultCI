"""
osv_client.py — Query Google's OSV API for CVEs in new dependencies.
Free, no API key required. https://osv.dev/docs/
"""
import httpx

OSV_URL = "https://api.osv.dev/v1/query"


async def check_package_cves(package: str, version: str, ecosystem: str = "PyPI") -> list[dict]:
    """
    Returns list of CVEs for a specific package@version.
    ecosystem: "PyPI" | "npm" | "Go" | "Maven"
    """
    body = {
        "version": version,
        "package": {"name": package, "ecosystem": ecosystem},
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(OSV_URL, json=body)
            if resp.status_code == 200:
                data = resp.json()
                return [
                    {
                        "id": v.get("id"),
                        "summary": v.get("summary", ""),
                        "severity": v.get("database_specific", {}).get("severity", "UNKNOWN"),
                    }
                    for v in data.get("vulns", [])
                ]
    except Exception:
        pass
    return []


async def scan_requirements(requirements_diff: str) -> list[dict]:
    """
    Parse added lines from a requirements.txt diff and check each for CVEs.
    Returns flat list of CVE findings.
    """
    findings = []
    for line in requirements_diff.splitlines():
        line = line.strip().lstrip("+").strip()
        if not line or line.startswith("#") or line.startswith("-"):
            continue
        # Parse "package==version" or "package>=version"
        for sep in ("==", ">=", "<=", "~="):
            if sep in line:
                parts = line.split(sep, 1)
                pkg = parts[0].strip()
                ver = parts[1].strip()
                cves = await check_package_cves(pkg, ver)
                for cve in cves:
                    findings.append({"package": pkg, "version": ver, **cve})
                break
    return findings
