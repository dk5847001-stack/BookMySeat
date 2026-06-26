import { Readable } from 'node:stream';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

class MediaService {
  async uploadImage(file) {
    if (!file) return null;

    if (!isCloudinaryConfigured) {
      throw new AppError('Cloudinary is not configured. Add CLOUDINARY_* values to the server environment.', 503);
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: env.cloudinary.folder,
          resource_type: 'image',
          transformation: [
            { width: 1400, height: 900, crop: 'fill', quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) return reject(new AppError(error.message, 502));
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      Readable.from(file.buffer).pipe(stream);
    });
  }

  async deleteImage(publicId) {
    if (publicId && isCloudinaryConfigured) {
      await cloudinary.uploader.destroy(publicId);
    }
  }
}

export const mediaService = new MediaService();
