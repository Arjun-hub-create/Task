# Contributing to VOID Task Manager

Thank you for contributing! This document explains how to make improvements and send changes smoothly.

## Quick Start

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/Arjun-hub-create/Task.git
   cd void-task-manager
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-description
   ```
4. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

## Development Workflow

- Keep changes focused: one feature or fix per branch.
- Write clear commit messages.
- Run the app locally before creating a pull request.
- Make sure environment variables are not committed.

## Making Changes

- Backend code lives in the `server` folder.
- Frontend code lives in the `client` folder.
- For documentation updates, add or edit `.md` files in the repo root.

## Commit and Push

```bash
git add <files>
git commit -m "Add CONTRIBUTING guide"
git push origin feature/your-description
```

## Pull Request

- Open a PR against `main`.
- Include a short description of what changed.
- Mention if the change is documentation-only.

## Notes

- Do not commit `.env` files or other secrets.
- Use `npm run dev` to run both backend and frontend locally.
- Keep the process simple and clear.
