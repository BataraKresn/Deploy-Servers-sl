# Copilot Instructions for dev-deploy-server

## Big Picture Architecture
- This project is a full-stack deployment trigger and monitor system.
- **Frontend**: Next.js (in `app/`) communicates with the backend via API proxy routes (`app/api/[...slug]/route.ts`).
- **Backend**: Flask app (in `backend/`) exposed via Gunicorn, handles deployment logic and API endpoints.
- **Orchestration**: Docker Compose (`docker-compose.yml`) runs both services on a shared network (`app-network`).
- **Data Flow**: Frontend API requests are proxied to backend using environment variable `BACKEND_API_URL` or Docker service name (`http://backend:5000`).
- **Deployment**: Backend executes `deploy.sh` and logs to `trigger-logs/`.

## Developer Workflows
- **Build & Run**: Use `docker-compose up --build` from the project root.
- **Environment**: Set `DEPLOY_TOKEN` in `backend/.env` for secure operations.
- **Frontend Dependencies**: Use `pnpm install` for Next.js dependencies.
- **Backend Dependencies**: Use `pip install -r requirements.txt` inside the backend container if needed.
- **Logs**: Deployment logs are written to `trigger-logs/` and mounted in backend container as `/app/logs`.

## Project-Specific Patterns
- **API Proxy**: All frontend API calls to `/api/*` are routed through `app/api/[...slug]/route.ts`, which tries multiple backend URLs for robustness.
- **Volumes**: Key files (`deploy.sh`, `servers.json`, `trigger-logs/`) are mounted into the backend container for direct access.
- **Network**: Both services use `app-network` for internal communication; avoid hardcoding IPs.
- **Environment Variables**: Always use `process.env.BACKEND_API_URL` in frontend for backend address.

## Integration Points
- **Frontend <-> Backend**: Communicate via API proxy, using Docker service name for reliability.
- **External Dependencies**: Docker, Docker Compose, pnpm, Python, Gunicorn, Flask, Next.js.
- **Config Files**: `servers.json` for deployment targets, `.env` for secrets, `deploy.sh` for deployment logic.

## Key Files & Directories
- `app/` - Next.js frontend
- `backend/` - Flask backend
- `docker-compose.yml` - Service orchestration
- `deploy.sh` - Deployment script
- `servers.json` - Server list
- `trigger-logs/` - Deployment logs
- `app/api/[...slug]/route.ts` - API proxy logic

## Example: API Proxy Pattern
```ts
// app/api/[...slug]/route.ts
const CANDIDATE_BACKENDS = [
  process.env.BACKEND_API_URL,
  "http://localhost:5001",
  "http://backend:5000",
].filter(Boolean)
```

---
For unclear workflows or missing conventions, ask the user for clarification before making assumptions.
