import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';

@Injectable()
export class ImagesService {
  saveFile(path: string, buffer: Uint8Array) {
    return fs.writeFile(path, buffer);
  }

  createDirectory(path: string) {
    return fs.mkdir(path, { recursive: true });
  }

  async checkPhotoForExistence(path: string) {
    try {
      await fs.access(path.substring(1));
      return true;
    } catch {
      return false;
    }
  }
}
