import {
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRepositoryDto {
  @IsString()
  @IsOptional()
  defaultBranch?: string;
}