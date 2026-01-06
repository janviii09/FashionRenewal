import {
  IsEnum,
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  MinLength,
} from "class-validator";
import { DisputeReason } from "@prisma/client";

export class CreateDisputeDto {
  @IsInt()
  orderId: number;

  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @IsString()
  @MinLength(20, { message: "Description must be at least 20 characters" })
  @MaxLength(2000, { message: "Description cannot exceed 2000 characters" })
  description: string;
}
