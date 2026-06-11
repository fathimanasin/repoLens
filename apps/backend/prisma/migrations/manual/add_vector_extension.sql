CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX ON "KnowledgeChunk" USING ivfflat (embedding vector_cosine_ops);
