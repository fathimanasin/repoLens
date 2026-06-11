# RepoLens

RepoLens is a multi-tenant SaaS platform that analyzes GitHub repositories for architecture health, detects architectural drift, and supports GraphRAG-powered conversations over source code and technical knowledge.

## Getting Started

1. Copy `.env.example` to `.env` and replace the placeholder secrets.
2. Start all services with `docker-compose up --build`.
3. Generate the Prisma client with `docker-compose exec backend npx prisma generate`.
4. Create the initial database migration with `docker-compose exec backend npx prisma migrate dev --name init`.
5. Add pgvector support with `docker-compose exec -T postgres psql -U repolens -d repolens < apps/backend/prisma/migrations/manual/add_vector_extension.sql`.
