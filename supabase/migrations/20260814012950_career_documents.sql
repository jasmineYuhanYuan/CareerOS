insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'career-documents',
  'career-documents',
  false,
  10485760,
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.career_documents (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null check (length(profile_id) between 1 and 120),
  document_type text not null,
  title text not null,
  language text not null default 'Other',
  version text not null default 'v1',
  status text not null check (status in ('Missing', 'Uploaded', 'Parsed', 'Needs update', 'Ready', 'Archived')),
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  extracted_text text,
  parsed_data jsonb,
  parse_status text not null check (parse_status in ('parsed', 'failed')),
  parse_error text,
  is_primary boolean not null default false,
  target_market text not null default '',
  notes text not null default '',
  check (storage_path = user_id::text || '/' || profile_id || '/' || id::text || '/' || file_name)
);

alter table public.career_documents enable row level security;
revoke all on public.career_documents from anon;
grant select, insert, update, delete on public.career_documents to authenticated;

create policy "Owners read career documents" on public.career_documents
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners insert career documents" on public.career_documents
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners update career documents" on public.career_documents
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Owners delete career documents" on public.career_documents
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Owners read career document files" on storage.objects
for select to authenticated using (
  bucket_id = 'career-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Owners upload career document files" on storage.objects
for insert to authenticated with check (
  bucket_id = 'career-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Owners update career document files" on storage.objects
for update to authenticated using (
  bucket_id = 'career-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
) with check (
  bucket_id = 'career-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Owners delete career document files" on storage.objects
for delete to authenticated using (
  bucket_id = 'career-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
);
