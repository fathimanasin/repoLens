import {
  IsBoolean,
  IsString,
} from 'class-validator';

export class ConnectRepositoryDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  githubRepositoryId!: string;

  @IsString()
  owner!: string;

  @IsString()
  name!: string;

  @IsString()
  fullName!: string;

  @IsString()
  defaultBranch!: string;

  @IsString()
  cloneUrl!: string;

  @IsBoolean()
  isPrivate!: boolean;
}