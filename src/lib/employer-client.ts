export interface LiveEmployerSnapshot {
  configured: boolean;
  employers: Array<{
    id: string;
    canonical_name: string;
    employer_type: string;
    industry: string | null;
    country: string | null;
    city: string | null;
    region: string | null;
    website_url: string | null;
    careers_url: string | null;
    verification_status: string;
    source_url: string | null;
    last_verified_at: string | null;
  }>;
  signals: Array<{ id: number; employer_id: string; signal_type: string; title: string; source_url: string; observed_at: string }>;
  activeJobs: Array<{ id: string; employer_id: string; title: string; organisation: string; location_text: string; apply_url: string; last_verified_at: string }>;
}

export async function fetchEmployerSnapshot(): Promise<LiveEmployerSnapshot> {
  const response = await fetch("/api/employers", { cache: "no-store" });
  if (!response.ok) throw new Error(`Employer intelligence request failed (${response.status}).`);
  const data = await response.json() as LiveEmployerSnapshot & { ok?: boolean };
  if (data.ok === false) throw new Error("Employer intelligence is unavailable.");
  return data;
}
