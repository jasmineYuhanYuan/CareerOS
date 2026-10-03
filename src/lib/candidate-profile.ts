import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface AuthCandidateProfile {
  id: string;
  ownerUserId: string;
  legacyProfileKey: string | null;
  displayName: string;
}

function toCandidateProfile(row: Record<string, unknown>): AuthCandidateProfile {
  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id),
    legacyProfileKey: typeof row.legacy_profile_key === "string" ? row.legacy_profile_key : null,
    displayName: typeof row.display_name === "string" ? row.display_name : "",
  };
}

export function explicitSignupDisplayName(user: User): string {
  const value = user.user_metadata?.display_name;
  return typeof value === "string" ? value.trim().slice(0, 160) : "";
}

export async function ensureCandidateProfile(client: SupabaseClient, user: User): Promise<AuthCandidateProfile> {
  const { data: existing, error: selectError } = await client
    .from("candidate_profiles")
    .select("id,owner_user_id,legacy_profile_key,display_name")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (selectError) throw new Error("Candidate profile could not be loaded.");
  if (existing) return toCandidateProfile(existing as Record<string, unknown>);

  const { data, error } = await client
    .from("candidate_profiles")
    .insert({
      owner_user_id: user.id,
      legacy_profile_key: null,
      display_name: explicitSignupDisplayName(user),
    })
    .select("id,owner_user_id,legacy_profile_key,display_name")
    .single();
  if (error || !data) throw new Error("Candidate profile could not be created.");
  return toCandidateProfile(data as Record<string, unknown>);
}

export function mappedWorkspaceProfileId(candidate: AuthCandidateProfile | null, availableProfileIds: string[]): string | null {
  const key = candidate?.legacyProfileKey;
  return key && availableProfileIds.includes(key) ? key : null;
}
