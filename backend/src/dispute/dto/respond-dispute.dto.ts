import { IsString, MaxLength, MinLength } from 'class-validator';

export class RespondDisputeDto {
    @IsString()
    @MinLength(10, { message: 'Response must be at least 10 characters' })
    @MaxLength(2000, { message: 'Response cannot exceed 2000 characters' })
    message: string;
}
