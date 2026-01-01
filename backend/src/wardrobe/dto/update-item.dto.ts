import { IsString, IsOptional, IsEnum, IsArray, IsNumber, Min, MaxLength } from 'class-validator';
import { ItemAvailability, ItemCondition } from '@prisma/client';

export class UpdateItemDto {
    @IsString()
    @MaxLength(100)
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @MaxLength(50)
    @IsOptional()
    brand?: string;

    @IsString()
    @IsOptional()
    size?: string;

    @IsEnum(ItemCondition)
    @IsOptional()
    condition?: ItemCondition;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @IsEnum(ItemAvailability)
    @IsOptional()
    availability?: ItemAvailability;

    @IsNumber()
    @Min(1)
    @IsOptional()
    rentPricePerDay?: number;

    @IsNumber()
    @Min(1)
    @IsOptional()
    sellPrice?: number;
}
