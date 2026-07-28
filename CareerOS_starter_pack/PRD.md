# CareerOS Product Requirements Document

## 1. Product vision

CareerOS is a unified career-planning platform for university students and recent graduates. It supports both employment and postgraduate pathways.

## 2. Core problem

Users currently manage career decisions across disconnected tools:

- job boards
- university websites
- spreadsheets
- notes
- CV versions
- application portals
- postgraduate program pages
- interview resources

CareerOS centralises these workflows and uses profile data to provide relevant recommendations.

## 3. Target users

### Persona A: Computer science student

A university student applying for internships, graduate roles, product roles, technical roles, and postgraduate programs.

Primary needs:
- discover suitable jobs
- compare companies
- track applications
- understand skill gaps
- manage postgraduate options
- maintain a career roadmap

### Persona B: Chiropractic postgraduate

A chiropractic postgraduate seeking graduate or early-career clinical work.

Primary needs:
- discover suitable clinics and healthcare employers
- track job applications
- record registration or eligibility requirements
- tailor a clinically relevant CV
- prepare for interviews

## 4. Product principles

- Profile-first: recommendations should use the user's actual background.
- Multi-path: employment and postgraduate study are first-class pathways.
- Evidence-based: match explanations must identify relevant strengths and gaps.
- Action-oriented: every recommendation should lead to a concrete next step.
- Extensible: the data model must support multiple disciplines.

## 5. MVP scope

### 5.1 Dashboard

Show:
- active career goal
- recommended next actions
- new relevant jobs
- upcoming deadlines
- application status summary
- postgraduate application status summary

### 5.2 Career profiles

Each profile stores:
- name
- university
- degree
- discipline
- graduation date
- location
- work eligibility
- target roles
- target countries
- skills
- projects
- experience
- study goals

### 5.3 Jobs

Users can:
- browse jobs
- filter by discipline, location, role type, employment type and deadline
- save jobs
- open the source application page
- add a job to the application tracker

### 5.4 Companies

Each company or clinic stores:
- name
- sector
- locations
- organisation type
- careers URL
- target role families
- notes

### 5.5 Application tracker

Statuses:
- saved
- preparing
- applied
- assessment
- interview
- offer
- rejected
- withdrawn

### 5.6 Postgraduate planner

Users can:
- save universities and programs
- record deadlines
- record entry requirements
- track documents
- track application status

### 5.7 Career roadmap

Users can:
- define a target outcome
- create milestones
- record skills to build
- view monthly tasks
- mark progress

## 6. Out of scope for MVP

- automated scraping from every job board
- automatic application submission
- full AI CV rewriting
- interview voice simulation
- payments
- social networking

## 7. Success criteria

The MVP is successful when both initial users can:

1. create a complete profile
2. save relevant opportunities
3. track job or postgraduate applications
4. view a useful next-action dashboard
5. use the system for at least two weeks without relying on a separate spreadsheet
