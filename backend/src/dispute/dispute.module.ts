import { Module } from '@nestjs/common';
import { DisputeController } from './dispute.controller';
import { DisputeService } from './dispute.service';
import { DisputeEvidenceService } from './services/dispute-evidence.service';
import { FileValidationService } from './services/file-validation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { DisputeOwnershipGuard } from './guards/dispute-ownership.guard';

@Module({
    imports: [PrismaModule, CloudinaryModule],
    controllers: [DisputeController],
    providers: [
        DisputeService,
        DisputeEvidenceService,
        FileValidationService,
        DisputeOwnershipGuard,
    ],
    exports: [DisputeService, DisputeEvidenceService],
})
export class DisputeModule { }
