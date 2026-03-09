# Beat Saber Dashboard — Full-Stack Data Integration

## Phase 1: Upgrade
- [x] Upgrade project to web-db-user (backend + database)

## Phase 2: Backend API
- [x] Create database schema for all 5 dashboard data types
- [x] Build POST /api/data/upload endpoint for bulk data ingestion
- [x] Build GET /api/data/:dashboard endpoints for each page
- [x] Add API key authentication for upload endpoint

## Phase 3: Frontend Integration
- [x] Create data service layer with API fetch functions
- [x] Update all 5 pages to fetch from API with fallback to synthetic data
- [x] Add loading states and error handling
- [x] Add DataSourceBadge component showing "Synthetic Data" vs "Live Data"

## Phase 4: Export Script
- [x] Create Python DaiqueryClient export script for Bento environment
- [x] Include all query IDs from the UniDash dashboards
- [x] Script pushes JSON to dashboard API endpoint
- [x] Create README with usage instructions

## Phase 5: Test & Deploy
- [x] Write vitest tests (19 tests passing)
- [x] TypeScript check passes (zero errors)
- [x] Production build passes
- [x] Push to GitHub
