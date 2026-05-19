import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
import {
  IStorageProvider,
  ListOptions,
  ListResult,
  UploadResult,
} from '../storage.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private uploadDir = './uploads';

  constructor(private configService: ConfigService) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = '',
  ): Promise<UploadResult> {
    const fileExt = file.originalname.split('.').pop()?.toLowerCase();
    const baseName = file.originalname.split('.')[0];
    const filename = `${baseName}-${Date.now()}.${fileExt}`;
    const folderPath = folder
      ? path.join(this.uploadDir, folder)
      : this.uploadDir;

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);

    // Optimize and compress image using sharp
    let optimizedBuffer: Buffer;
    let finalSize: number;

    // Skip optimization for small files (< 100KB) or already optimized formats
    const skipOptimization =
      file.size < 100 * 1024 || // Files smaller than 100KB
      fileExt === 'gif'; // GIF animations should not be re-compressed

    if (skipOptimization) {
      // Save original file without processing
      fs.writeFileSync(filePath, file.buffer);
      finalSize = file.size;
      console.log(
        `📸 Image saved (no optimization): ${file.originalname} | Size: ${(finalSize / 1024).toFixed(1)}KB`,
      );
    } else {
      try {
        const image = sharp(file.buffer);

        // Resize if image is too large (max width: 1920px, maintains aspect ratio)
        let processedImage = image.resize(1920, null, {
          withoutEnlargement: true, // Don't enlarge smaller images
          fit: 'inside',
        });

        // Compress based on format
        if (fileExt === 'jpg' || fileExt === 'jpeg') {
          processedImage = processedImage.jpeg({
            quality: 85,
            progressive: true,
          });
        } else if (fileExt === 'png') {
          processedImage = processedImage.png({
            quality: 85,
            compressionLevel: 9,
          });
        } else if (fileExt === 'webp') {
          processedImage = processedImage.webp({ quality: 85 });
        }

        optimizedBuffer = await processedImage.toBuffer();
        finalSize = optimizedBuffer.length;

        // Only save optimized version if it's actually smaller
        if (finalSize < file.size) {
          fs.writeFileSync(filePath, optimizedBuffer);
          const compressionRatio = ((1 - finalSize / file.size) * 100).toFixed(
            1,
          );
          console.log(
            `📸 Image optimized: ${file.originalname} | Original: ${(file.size / 1024).toFixed(1)}KB → Optimized: ${(finalSize / 1024).toFixed(1)}KB | Saved: ${compressionRatio}%`,
          );
        } else {
          // Optimized version is larger, use original
          fs.writeFileSync(filePath, file.buffer);
          finalSize = file.size;
          console.log(
            `📸 Image saved (original smaller): ${file.originalname} | Size: ${(finalSize / 1024).toFixed(1)}KB`,
          );
        }
      } catch (error) {
        // If sharp fails (non-image file), save original
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.warn(
          'Sharp processing failed, saving original file:',
          errorMessage,
        );
        fs.writeFileSync(filePath, file.buffer);
        finalSize = file.size;
      }
    }

    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3001',
    );
    const relativePath = folder ? `${folder}/${filename}` : filename;

    return {
      url: `${appUrl}/uploads/${relativePath}`,
      publicId: relativePath,
      filename: file.originalname,
      size: finalSize,
      format: fileExt || 'unknown',
    };
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting local file:', error);
      return false;
    }
  }

  getFileUrl(publicId: string): string {
    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3001',
    );
    return `${appUrl}/uploads/${publicId}`;
  }

  async listFiles(opts: ListOptions = {}): Promise<ListResult> {
    const limit = Math.min(100, Math.max(1, opts.limit ?? 30));
    const offset = opts.cursor ? parseInt(opts.cursor, 10) || 0 : 0;
    const baseDir = opts.folder
      ? path.join(this.uploadDir, opts.folder)
      : this.uploadDir;

    if (!fs.existsSync(baseDir)) {
      return { items: [] };
    }

    // Walk the directory tree to collect all image files (recursive for the
    // base uploads dir; flat for a specific folder).
    const collected: Array<{
      publicId: string;
      filePath: string;
      mtime: number;
      size: number;
    }> = [];

    const walk = (dir: string, prefix: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, entry.name);
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          walk(abs, rel);
        } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(entry.name)) {
          const stat = fs.statSync(abs);
          collected.push({
            publicId: opts.folder ? `${opts.folder}/${rel}` : rel,
            filePath: abs,
            mtime: stat.mtimeMs,
            size: stat.size,
          });
        }
      }
    };
    walk(baseDir, '');

    collected.sort((a, b) => b.mtime - a.mtime);
    const page = collected.slice(offset, offset + limit);
    const nextCursor =
      offset + limit < collected.length ? String(offset + limit) : undefined;

    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3001',
    );

    return {
      items: page.map((f) => ({
        publicId: f.publicId,
        url: `${appUrl}/uploads/${f.publicId}`,
        filename: path.basename(f.publicId),
        size: f.size,
        format: path.extname(f.publicId).slice(1).toLowerCase(),
        folder: path.dirname(f.publicId) === '.' ? undefined : path.dirname(f.publicId),
        createdAt: new Date(f.mtime).toISOString(),
      })),
      nextCursor,
    };
  }
}
