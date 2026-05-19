import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Express } from 'express';
import {
  IStorageProvider,
  ListOptions,
  ListResult,
  UploadResult,
} from '../storage.interface';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryProvider implements IStorageProvider {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'blog',
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto', // Automatically detect file type
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              filename: result.original_filename,
              size: result.bytes,
              format: result.format,
            });
          }
        },
      );

      // Convert buffer to stream and pipe to Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      return false;
    }
  }

  getFileUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto', // Automatically deliver best format (WebP, AVIF)
    });
  }

  async listFiles(opts: ListOptions = {}): Promise<ListResult> {
    const max = Math.min(100, Math.max(1, opts.limit ?? 30));
    const params: Record<string, unknown> = {
      type: 'upload',
      resource_type: 'image',
      max_results: max,
    };
    if (opts.folder) params.prefix = opts.folder;
    if (opts.cursor) params.next_cursor = opts.cursor;

    const result = await cloudinary.api.resources(params);

    const items = (result.resources ?? []).map((r: any) => ({
      publicId: r.public_id,
      url: r.secure_url,
      filename: r.public_id.split('/').pop(),
      size: r.bytes,
      format: r.format,
      folder: r.folder ?? r.asset_folder,
      createdAt: r.created_at,
    }));

    return { items, nextCursor: result.next_cursor };
  }
}
