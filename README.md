# Trigger Deploy

A full-stack application to trigger and monitor deployments.

## Structure

- **`frontend/`**: A Next.js application (Pages Router) for the user interface.
- **`backend/`**: A Flask (Python) application serving as the API backend.
- **`docker-compose.yml`**: Orchestrates the frontend and backend services.
- **`deploy.sh`**: The deployment script that is executed by the backend.
- **`servers.json`**: A list of servers that can be deployed to.
- **`trigger-logs/`**: Contains the output logs from deployments.

## How to Run

1.  **Prerequisites**: Docker and Docker Compose must be installed.
2.  **Set Environment Variable**: Create a `.env` file inside the `backend` directory and set your `DEPLOY_TOKEN`.
    \`\`\`
    DEPLOY_TOKEN=your_super_secret_token_here
    \`\`\`
3.  **Make script executable**: Run `chmod +x deploy.sh` in your terminal.
4.  **Start Services**: Run `docker-compose up --build` from the root directory.
5.  **Access**:
    -   Frontend: `http://localhost:3000`
    -   Backend API: `http://localhost:5001`
