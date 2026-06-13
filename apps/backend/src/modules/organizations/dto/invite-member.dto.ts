import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email!: string;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  permissions?: string[];
}