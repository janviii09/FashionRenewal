import { IsInt, IsString, IsOptional, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
    @IsInt()
    itemId: number;

    @IsString()
    type: 'rent' | 'buy';

    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number;

    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    dateTo?: string;
}

export class UpdateCartItemDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number;

    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    dateTo?: string;
}

export class SyncCartDto {
    @Type(() => AddCartItemDto)
    items: AddCartItemDto[];
}
