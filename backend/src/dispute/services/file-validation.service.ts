import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationService {
    private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private readonly ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];

    /**
     * Validate file before upload
     * - Check file size
     * - Check MIME type
     * - Basic security checks
     */
    validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            throw new BadRequestException(
                `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
            );
        }

        // Check MIME type
        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new BadRequestException(
                `File type ${file.mimetype} is not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
            );
        }

        // Check file extension matches MIME type
        const extension = file.originalname.split('.').pop()?.toLowerCase();
        const mimeTypeExtensions = {
            'image/jpeg': ['jpg', 'jpeg'],
            'image/jpg': ['jpg', 'jpeg'],
            'image/png': ['png'],
            'image/webp': ['webp'],
            'application/pdf': ['pdf'],
        };

        const allowedExtensions = mimeTypeExtensions[file.mimetype] || [];
        if (!extension || !allowedExtensions.includes(extension)) {
            throw new BadRequestException(
                'File extension does not match MIME type',
            );
        }
    }

    /**
     * Sanitize filename
     * - Remove special characters
     * - Limit length
     */
    sanitizeFilename(filename: string): string {
        return filename
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .substring(0, 100);
    }
}
