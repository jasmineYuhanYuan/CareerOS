# CareerOS Database Schema

## profiles

- id
- owner_user_id
- display_name
- university
- degree
- discipline
- study_level
- graduation_date
- location
- work_authorisation
- bio
- created_at
- updated_at

## career_goals

- id
- profile_id
- goal_type
- target_title
- target_country
- target_city
- priority
- status

Goal types:
- internship
- graduate_job
- full_time_job
- postgraduate_study
- professional_registration
- skill_development

## skills

- id
- name
- category

## profile_skills

- profile_id
- skill_id
- proficiency
- evidence
- last_used_at

## experiences

- id
- profile_id
- organisation
- title
- experience_type
- start_date
- end_date
- description

## projects

- id
- profile_id
- name
- role
- description
- repository_url
- live_url
- start_date
- end_date

## organisations

Supports companies, clinics, universities and other institutions.

- id
- name
- organisation_type
- sector
- country
- city
- website_url
- careers_url

## jobs

- id
- organisation_id
- title
- role_family
- employment_type
- country
- city
- remote_type
- description
- requirements
- source_url
- posted_at
- deadline_at
- status

## saved_jobs

- profile_id
- job_id
- saved_at
- notes

## job_applications

- id
- profile_id
- job_id
- status
- applied_at
- next_action
- next_action_at
- cv_version
- notes

## universities

- id
- organisation_id
- ranking_notes

## postgraduate_programs

- id
- university_id
- name
- degree_level
- discipline
- country
- duration
- tuition_text
- requirements
- application_url

## postgraduate_applications

- id
- profile_id
- program_id
- intake
- deadline_at
- status
- notes

## application_documents

- id
- postgraduate_application_id
- document_type
- status
- file_url
- notes

## roadmap_items

- id
- profile_id
- title
- category
- target_date
- status
- priority
- linked_job_id
- linked_program_id
- notes

## match_scores

- id
- profile_id
- entity_type
- entity_id
- overall_score
- strengths_json
- gaps_json
- explanation
- calculated_at

## opportunities

- id, category, organisation_id, title, description
- discipline_tags, role_family_tags, skill_tags, suitable_profile_ids
- country, city, remote_type, employment_type
- deadline, source_url, source_name, source_type
- verification_status, last_verified_at, sample_data, archived

## verified source metadata

Reusable local datasets use a shared provenance contract so they can later be
replaced by API-backed records without changing the UI model.

- source
- official_url
- source_type: Official, Government, University, Community
- verified
- last_updated
- next_review_date
- confidence: High, Medium, Low
- country
- region
- language

Unknown salary, deadline, sponsorship, tuition, test requirement, duration or
application-stage values remain null or explicitly "Not published". They are
never inferred.

## contacts

- id, profile_id, name, organisation, role, email, linkedin_url
- relationship_type, last_contact_date, next_follow_up_date, notes
- created_at, updated_at

## career_documents

- id, profile_id, document_type, name, version, status
- updated_at, notes, external_url
