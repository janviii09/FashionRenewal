import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";
import { ItemAvailability, ItemCondition } from "@prisma/client";

export class CreateItemDto {
  @IsString()
  @MinLength(3, { message: "Title must be at least 3 characters" })
  @MaxLength(100, { message: "Title must not exceed 100 characters" })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @MinLength(1, { message: "Category is required" })
  category: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  brand?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsEnum(ItemCondition, { message: "Invalid condition" })
  condition: ItemCondition;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsEnum(ItemAvailability, { message: "Invalid availability type" })
  @IsOptional()
  availability?: ItemAvailability;

  @IsNumber()
  @Min(1, { message: "Rent price must be at least $1" })
  @IsOptional()
  rentPricePerDay?: number;

  @IsNumber()
  @Min(1, { message: "Sell price must be at least $1" })
  @IsOptional()
  sellPrice?: number;
}
