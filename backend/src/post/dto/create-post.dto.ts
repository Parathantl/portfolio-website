import {
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
} from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title is mandatory' })
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  categoryIds: number[];

  @IsOptional()
  @IsString()
  mainImageUrl: string;

  @IsOptional()
  @IsString()
  excerpt: string;

  // Omitted on legacy/public callers -> entity default 'published'.
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';
}
