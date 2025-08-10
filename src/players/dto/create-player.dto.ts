import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePlayerDto {
  @IsString() @IsNotEmpty()
  name!: string;

  @IsString() @IsNotEmpty()
  club!: string;

  @IsString() @IsNotEmpty()
  position!: string;

  @IsInt() @Min(0) @Max(99)
  rating!: number;

  @IsString() @IsOptional()
  nationality?: string;

 
  @IsOptional()
  skills?: Record<string, number>;

  @IsInt() @IsOptional()
  year?: number;
}
