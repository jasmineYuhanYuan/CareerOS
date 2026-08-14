create index if not exists career_documents_user_profile_idx
on public.career_documents (user_id, profile_id, updated_at desc);
