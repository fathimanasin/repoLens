export class RepositoryResponseDto {
  id!: string;

  githubRepositoryId!: string;

  owner!: string;

  name!: string;

  fullName!: string;

  defaultBranch!: string;

  cloneUrl!: string;

  isPrivate!: boolean;

  analysisStatus!: string;

  driftStatus!: string;

  architectureScore?: number | null;

  workspaceId!: string;

  createdAt!: Date;

  updatedAt!: Date;

  latestAnalysis?: {
    id: string;
    architectureScore?: number | null;
    metrics?: any;
    completedAt?: Date | null;
    branch: string;
  } | null;
}