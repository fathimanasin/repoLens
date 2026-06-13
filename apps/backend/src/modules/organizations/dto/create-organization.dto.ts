import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name !: string;

  @ApiProperty()
  @IsString()
  @Matches(
    /^[a-z0-9-]+$/,
    {
      message:
        'Slug may only contain lowercase letters, numbers, and hyphens',
    },
  )
  @MinLength(2)
  @MaxLength(50)
  slug !: string;
}