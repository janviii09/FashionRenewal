import { IsEnum, IsOptional, IsString, IsDecimal, MaxLength } from 'class-validator';
import { DisputeResolution } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ResolveDisputeDto {
    @IsEnum(DisputeResolution)
    resolution: DisputeResolution;

    @IsOptional()
    @IsDecimal()
    refundAmount?: Decimal;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;
}
