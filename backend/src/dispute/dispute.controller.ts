import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DisputeService } from './dispute.service';
import { DisputeEvidenceService } from './services/dispute-evidence.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { RespondDisputeDto } from './dto/respond-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { UploadEvidenceDto } from './dto/upload-evidence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DisputeOwnershipGuard } from './guards/dispute-ownership.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputeController {
    constructor(
        private readonly disputeService: DisputeService,
        private readonly disputeEvidenceService: DisputeEvidenceService,
    ) { }

    /**
     * POST /disputes
     * Create a new dispute
     * Rate limit: 3 per day per user
     */
    @Post()
    @Throttle({ default: { limit: 3, ttl: 86400000 } }) // 3 per day
    @HttpCode(HttpStatus.CREATED)
    async createDispute(
        @Request() req,
        @Body() createDisputeDto: CreateDisputeDto,
    ) {
        const userId = req.user.userId;
        return this.disputeService.createDispute(userId, createDisputeDto);
    }

    /**
     * POST /disputes/:id/respond
     * Counterparty response to dispute
     */
    @Post(':id/respond')
    @UseGuards(DisputeOwnershipGuard)
    @HttpCode(HttpStatus.OK)
    async respondToDispute(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() respondDisputeDto: RespondDisputeDto,
    ) {
        const userId = req.user.userId;
        return this.disputeService.respondToDispute(userId, id, respondDisputeDto);
    }

    /**
     * PATCH /disputes/:id/resolve
     * Admin resolution (admin only)
     */
    @Patch(':id/resolve')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    async resolveDispute(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() resolveDisputeDto: ResolveDisputeDto,
    ) {
        const adminId = req.user.userId;
        return this.disputeService.resolveDispute(adminId, id, resolveDisputeDto);
    }

    /**
     * GET /disputes/my-disputes
     * Get user's disputes (raised + against)
     */
    @Get('my-disputes')
    async getMyDisputes(@Request() req) {
        const userId = req.user.userId;
        return this.disputeService.getMyDisputes(userId);
    }

    /**
     * GET /disputes/:id
     * Get dispute details
     */
    @Get(':id')
    @UseGuards(DisputeOwnershipGuard)
    async getDisputeById(@Param('id', ParseIntPipe) id: number) {
        return this.disputeService.getDisputeById(id);
    }

    /**
     * GET /disputes/:id/timeline
     * Get dispute timeline
     */
    @Get(':id/timeline')
    @UseGuards(DisputeOwnershipGuard)
    async getDisputeTimeline(@Param('id', ParseIntPipe) id: number) {
        return this.disputeService.getDisputeTimeline(id);
    }

    /**
     * POST /disputes/:id/evidence
     * Upload evidence file
     */
    @Post(':id/evidence')
    @UseGuards(DisputeOwnershipGuard)
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.CREATED)
    async uploadEvidence(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadEvidenceDto: UploadEvidenceDto,
    ) {
        const userId = req.user.userId;
        return this.disputeEvidenceService.uploadEvidence(
            userId,
            id,
            file,
            uploadEvidenceDto.description,
        );
    }

    /**
     * GET /disputes/evidence/:evidenceId
     * Get evidence by ID
     */
    @Get('evidence/:evidenceId')
    async getEvidence(
        @Request() req,
        @Param('evidenceId', ParseIntPipe) evidenceId: number,
    ) {
        const userId = req.user.userId;
        return this.disputeEvidenceService.getEvidence(userId, evidenceId);
    }

    /**
     * DELETE /disputes/evidence/:evidenceId
     * Delete evidence
     */
    @Delete('evidence/:evidenceId')
    @HttpCode(HttpStatus.OK)
    async deleteEvidence(
        @Request() req,
        @Param('evidenceId', ParseIntPipe) evidenceId: number,
    ) {
        const userId = req.user.userId;
        return this.disputeEvidenceService.deleteEvidence(userId, evidenceId);
    }
}
