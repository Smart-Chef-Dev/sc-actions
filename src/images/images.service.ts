import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ImagesService {
  async saveFile(path: string, buffer: Uint8Array) {
    await fs.promises.writeFile(path, buffer);
  }

  async createDirectory(path: string) {
    await fs.promises.mkdir(path, { recursive: true });
  }
}
