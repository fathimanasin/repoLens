-- CreateEnum
CREATE TYPE "WorkspaceTemplate" AS ENUM ('STARTUP', 'MICROSERVICES', 'MONOREPO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('IDLE', 'QUEUED', 'CLONING', 'PARSING', 'GRAPHING', 'SCORING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "DriftStatus" AS ENUM ('NONE', 'DETECTED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DriftSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DocumentFileType" AS ENUM ('PDF', 'MARKDOWN', 'DOCX');

-- CreateEnum
CREATE TYPE "EmbeddingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SCORE_DROPPED', 'ANALYSIS_COMPLETE', 'ANALYSIS_FAILED', 'DOC_UPLOADED', 'DRIFT_DETECTED', 'MEMBER_INVITED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "github_id" TEXT,
    "github_username" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "template" "WorkspaceTemplate" NOT NULL DEFAULT 'CUSTOM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "github_repository_id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "default_branch" TEXT NOT NULL DEFAULT 'main',
    "clone_url" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "last_commit_sha" TEXT,
    "analysis_status" "AnalysisStatus" NOT NULL DEFAULT 'IDLE',
    "drift_status" "DriftStatus" NOT NULL DEFAULT 'NONE',
    "architecture_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "workspace_id" TEXT NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryAnalysis" (
    "id" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'QUEUED',
    "commit_sha" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "architecture_score" DOUBLE PRECISION,
    "metrics" JSONB,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repository_id" TEXT NOT NULL,

    CONSTRAINT "RepositoryAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriftEvent" (
    "id" TEXT NOT NULL,
    "severity" "DriftSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "file_path" TEXT,
    "metadata" JSONB,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repository_id" TEXT NOT NULL,
    "analysis_id" TEXT,

    CONSTRAINT "DriftEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "workspace_id" TEXT NOT NULL,

    CONSTRAINT "KnowledgeCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" "DocumentFileType" NOT NULL,
    "storage_path" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "embedding_status" "EmbeddingStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "collection_id" TEXT NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "token_count" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "document_id" TEXT NOT NULL,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "collection_id" TEXT,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedQuery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,

    CONSTRAINT "SavedQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_github_id_key" ON "User"("github_id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_hash_key" ON "RefreshToken"("token_hash");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_idx" ON "RefreshToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_owner_id_idx" ON "Organization"("owner_id");

-- CreateIndex
CREATE INDEX "OrganizationMember_user_id_idx" ON "OrganizationMember"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organization_id_user_id_key" ON "OrganizationMember"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "Workspace_organization_id_idx" ON "Workspace"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_organization_id_slug_key" ON "Workspace"("organization_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_github_repository_id_key" ON "Repository"("github_repository_id");

-- CreateIndex
CREATE INDEX "Repository_workspace_id_idx" ON "Repository"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_workspace_id_full_name_key" ON "Repository"("workspace_id", "full_name");

-- CreateIndex
CREATE INDEX "RepositoryAnalysis_repository_id_created_at_idx" ON "RepositoryAnalysis"("repository_id", "created_at");

-- CreateIndex
CREATE INDEX "DriftEvent_repository_id_created_at_idx" ON "DriftEvent"("repository_id", "created_at");

-- CreateIndex
CREATE INDEX "DriftEvent_analysis_id_idx" ON "DriftEvent"("analysis_id");

-- CreateIndex
CREATE INDEX "KnowledgeCollection_workspace_id_idx" ON "KnowledgeCollection"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeCollection_workspace_id_name_key" ON "KnowledgeCollection"("workspace_id", "name");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_collection_id_idx" ON "KnowledgeDocument"("collection_id");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_document_id_idx" ON "KnowledgeChunk"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeChunk_document_id_chunk_index_key" ON "KnowledgeChunk"("document_id", "chunk_index");

-- CreateIndex
CREATE INDEX "ChatSession_user_id_updated_at_idx" ON "ChatSession"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "ChatSession_workspace_id_idx" ON "ChatSession"("workspace_id");

-- CreateIndex
CREATE INDEX "ChatSession_collection_id_idx" ON "ChatSession"("collection_id");

-- CreateIndex
CREATE INDEX "ChatMessage_session_id_created_at_idx" ON "ChatMessage"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "Notification_user_id_read_at_created_at_idx" ON "Notification"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "Notification_organization_id_idx" ON "Notification"("organization_id");

-- CreateIndex
CREATE INDEX "ActivityEvent_organization_id_created_at_idx" ON "ActivityEvent"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "ActivityEvent_user_id_idx" ON "ActivityEvent"("user_id");

-- CreateIndex
CREATE INDEX "SavedQuery_workspace_id_idx" ON "SavedQuery"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "SavedQuery_user_id_workspace_id_name_key" ON "SavedQuery"("user_id", "workspace_id", "name");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryAnalysis" ADD CONSTRAINT "RepositoryAnalysis_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriftEvent" ADD CONSTRAINT "DriftEvent_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriftEvent" ADD CONSTRAINT "DriftEvent_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "RepositoryAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeCollection" ADD CONSTRAINT "KnowledgeCollection_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "KnowledgeCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "KnowledgeCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedQuery" ADD CONSTRAINT "SavedQuery_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedQuery" ADD CONSTRAINT "SavedQuery_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
