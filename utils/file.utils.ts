import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export function ensureUploadsDirectory() {
  // For development mode
  const devPath = join(__dirname, '../../uploads');
  // For production mode (after build)
  const prodPath = join(process.cwd(), 'uploads');

  const uploadPath = process.env.NODE_ENV === 'production' ? prodPath : devPath;

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  return uploadPath;
}
