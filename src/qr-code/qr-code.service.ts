import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode-svg';
import * as QRCodePng from 'qrcode';
import { PassThrough } from 'stream';
import * as archiver from 'archiver';

import { TableUrlsDto } from '../restaurant/dto/table-urls.dto';

@Injectable()
export class QrCodeService {
  generateSvg(content: string) {
    const code = QrCodeService.create(content);

    return code.svg();
  }

  async generatePng(content: string): Promise<PassThrough> {
    const qrStream = new PassThrough();
    await QRCodePng.toFileStream(qrStream, content, {
      type: 'png',
      width: 256,
      errorCorrectionLevel: 'H',
    });

    return qrStream;
  }

  getSvgArchive(contents: TableUrlsDto[]): archiver.Archiver {
    const archive = archiver('zip');

    for (const { url, name } of contents) {
      const code = this.generateSvg(url);

      archive.append(code, { name: `${name}.svg` });
    }

    return archive;
  }

  async getPngArchive(contents: TableUrlsDto[]): Promise<archiver.Archiver> {
    const archive = archiver('zip');

    for (const { name, url } of contents) {
      const code = await this.generatePng(url);

      archive.append(code, { name: `${name}.png` });
    }

    return archive;
  }

  private static create(content: string) {
    return new QRCode(content);
  }
}
