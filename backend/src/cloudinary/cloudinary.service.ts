import { Injectable, BadRequestException } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get("CLOUDINARY_API_SECRET"),
    });
  }

  /**
   * Upload file to Cloudinary
   * @param file - Multer file object
   * @param folder - Cloudinary folder (e.g., 'dispute-evidence')
   * @returns Cloudinary upload result with secure URL
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = "dispute-evidence",
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          allowed_formats: ["jpg", "jpeg", "png", "pdf", "webp"],
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException("File upload failed"));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete file from Cloudinary
   * @param publicId - Cloudinary public ID
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Failed to delete file from Cloudinary:", error);
    }
  }

  /**
   * Generate signed URL for secure access
   * @param publicId - Cloudinary public ID
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   */
  generateSignedUrl(publicId: string, expiresIn: number = 3600): string {
    const timestamp = Math.round(Date.now() / 1000) + expiresIn;

    return cloudinary.url(publicId, {
      sign_url: true,
      type: "authenticated",
      expires_at: timestamp,
    });
  }
}
