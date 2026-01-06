import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CloudinaryService } from "../../cloudinary/cloudinary.service";
import { FileValidationService } from "./file-validation.service";

@Injectable()
export class DisputeEvidenceService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private fileValidationService: FileValidationService,
  ) {}

  /**
   * Upload evidence file for a dispute
   * - Validates file (size, type)
   * - Uploads to Cloudinary
   * - Creates evidence record
   * - Max 5 files per dispute
   */
  async uploadEvidence(
    userId: number,
    disputeId: number,
    file: Express.Multer.File,
    description?: string,
  ) {
    // 1. Validate file
    this.fileValidationService.validateFile(file);

    // 2. Check dispute exists and user has access
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        evidence: true,
      },
    });

    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    // 3. Check user is participant
    if (dispute.raisedById !== userId && dispute.againstId !== userId) {
      throw new ForbiddenException("You do not have access to this dispute");
    }

    // 4. Check evidence limit (max 5 per dispute)
    if (dispute.evidence.length >= 5) {
      throw new BadRequestException(
        "Maximum 5 evidence files allowed per dispute",
      );
    }

    // 5. Upload to Cloudinary
    const { url, publicId } = await this.cloudinaryService.uploadFile(
      file,
      `dispute-evidence/${disputeId}`,
    );

    // 6. Create evidence record
    const evidence = await this.prisma.disputeEvidence.create({
      data: {
        disputeId,
        uploadedById: userId,
        fileUrl: url,
        fileType: file.mimetype,
        fileSize: file.size,
        description,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
    });

    // 7. Create timeline event
    await this.prisma.disputeTimeline.create({
      data: {
        disputeId,
        actorId: userId,
        event: "EVIDENCE_UPLOADED",
        description: `Evidence file uploaded: ${file.originalname}`,
        metadata: {
          evidenceId: evidence.id,
          fileType: file.mimetype,
          fileSize: file.size,
        },
      },
    });

    return evidence;
  }

  /**
   * Get evidence by ID with access control
   */
  async getEvidence(userId: number, evidenceId: number) {
    const evidence = await this.prisma.disputeEvidence.findUnique({
      where: { id: evidenceId },
      include: {
        dispute: {
          select: {
            raisedById: true,
            againstId: true,
          },
        },
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!evidence) {
      throw new NotFoundException("Evidence not found");
    }

    // Check access
    const hasAccess =
      evidence.dispute.raisedById === userId ||
      evidence.dispute.againstId === userId;

    if (!hasAccess) {
      throw new ForbiddenException("You do not have access to this evidence");
    }

    return evidence;
  }

  /**
   * Delete evidence (only uploader can delete, and only before dispute is resolved)
   */
  async deleteEvidence(userId: number, evidenceId: number) {
    const evidence = await this.prisma.disputeEvidence.findUnique({
      where: { id: evidenceId },
      include: {
        dispute: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!evidence) {
      throw new NotFoundException("Evidence not found");
    }

    // Only uploader can delete
    if (evidence.uploadedById !== userId) {
      throw new ForbiddenException(
        "Only the uploader can delete this evidence",
      );
    }

    // Cannot delete after dispute is resolved
    if (
      evidence.dispute.status === "RESOLVED" ||
      evidence.dispute.status === "CLOSED"
    ) {
      throw new BadRequestException(
        "Cannot delete evidence from resolved disputes",
      );
    }

    // Delete from Cloudinary (extract public ID from URL)
    const publicId = this.extractPublicId(evidence.fileUrl);
    if (publicId) {
      await this.cloudinaryService.deleteFile(publicId);
    }

    // Delete from database
    await this.prisma.disputeEvidence.delete({
      where: { id: evidenceId },
    });

    return { message: "Evidence deleted successfully" };
  }

  /**
   * Extract Cloudinary public ID from URL
   */
  private extractPublicId(url: string): string | null {
    const match = url.match(/\/dispute-evidence\/\d+\/([^.]+)/);
    return match ? `dispute-evidence/${match[1]}` : null;
  }
}
