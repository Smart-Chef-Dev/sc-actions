import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode-svg';
import * as svgToImg from 'svg-to-img';
import * as archiver from 'archiver';

@Injectable()
export class QrCodeService {
  generateSvg(content: string) {
    const code = QrCodeService.create(content);

    return code.svg();
  }

  async generatePng(content: string) {
    const svg = this.generateSvg(content);
    return await svgToImg.from(svg).toPng();
  }

  getSvgArchive(contents: string[]): archiver.Archiver {
    const archive = archiver('zip');

    for (const content of contents) {
      const code = this.generateSvg(content);

      archive.append(code, { name: `${content}.svg` });
    }

    return archive;
  }

  async getPngArchive(contents: string[]): Promise<archiver.Archiver> {
    const archive = archiver('zip');

    for (const content of contents) {
      const code = await this.generatePng(content);

      archive.append(code, { name: `${content}.png` });
    }

    return archive;
  }

  private static create(content: string) {
    return new QRCode(content);
  }
}
