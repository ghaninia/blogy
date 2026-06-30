import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import type { MediaQueryInput, UpdateMediaInput } from '../../../types/index.js';
import { env } from '../../../shared/config/env.js';
import { mediaRepository } from '../infrastructure/media.repository.js';
import { mediaNotFound } from '../domain/media.errors.js';

const THUMBNAIL_SIZES = [
  { name: 'thumb', width: 150, height: 150 },
  { name: 'small', width: 400, height: 400 },
  { name: 'medium', width: 800, height: 800 },
  { name: 'large', width: 1200, height: 1200 },
];

export class MediaService {
  async ensureUploadDir(folder = 'general') {
    const dir = path.join(env.uploadDir, folder);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  async upload(file: Express.Multer.File, folder = 'general', uploadedById?: string) {
    const dir = await this.ensureUploadDir(folder);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(dir, filename);
    const relativePath = path.join(folder, filename);

    await fs.writeFile(filePath, file.buffer);

    let width: number | undefined;
    let height: number | undefined;
    const variants: Record<string, string> = {};

    if (file.mimetype.startsWith('image/')) {
      const metadata = await sharp(file.buffer).metadata();
      width = metadata.width;
      height = metadata.height;

      for (const size of THUMBNAIL_SIZES) {
        const variantName = `${path.parse(filename).name}-${size.name}.webp`;
        const variantPath = path.join(dir, variantName);
        await sharp(file.buffer)
          .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(variantPath);
        variants[size.name] = path.join(folder, variantName);
      }
    }

    return mediaRepository.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: relativePath,
      folder,
      width,
      height,
      variants: Object.keys(variants).length ? variants : undefined,
      uploadedById,
    });
  }

  async list(query: MediaQueryInput) {
    const { page, limit, folder, mimeType, search } = query;
    const skip = (page - 1) * limit;
    const where = {
      ...(folder && { folder }),
      ...(mimeType && { mimeType: { startsWith: mimeType } }),
      ...(search && {
        OR: [
          { originalName: { contains: search, mode: 'insensitive' as const } },
          { altFa: { contains: search, mode: 'insensitive' as const } },
          { altEn: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      mediaRepository.findMany(where, skip, limit),
      mediaRepository.count(where),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const media = await mediaRepository.findById(id);
    if (!media) throw mediaNotFound();
    return media;
  }

  async delete(id: string) {
    const media = await this.getById(id);
    const baseDir = env.uploadDir;

    try {
      await fs.unlink(path.join(baseDir, media.path));
      const variants = media.variants as Record<string, string> | null;
      if (variants) {
        for (const variantPath of Object.values(variants)) {
          await fs.unlink(path.join(baseDir, variantPath)).catch(() => undefined);
        }
      }
    } catch {
      // file may already be deleted
    }

    await mediaRepository.delete(id);
    return { deleted: true };
  }

  async update(id: string, input: UpdateMediaInput) {
    await this.getById(id);
    return mediaRepository.update(id, input);
  }

  getPublicUrl(mediaPath: string): string {
    return `/uploads/${mediaPath.replace(/\\/g, '/')}`;
  }
}

export const mediaService = new MediaService();
