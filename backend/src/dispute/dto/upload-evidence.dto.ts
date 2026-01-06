import { IsOptional, IsString, MaxLength } from "class-validator";

export class UploadEvidenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
