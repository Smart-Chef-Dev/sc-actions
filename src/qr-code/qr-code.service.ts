import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode-svg';
import * as svgToImg from 'svg-to-img';
// import QRCode = require('easyqrcodejs-nodejs');

@Injectable()
export class QrCodeService {
  generateSvg(content: string) {
    const code = QrCodeService.create(content);

    return code.svg();
  }

  async generatePng(content: string) {
    const svg = this.generateSvg(content);
    const png = await svgToImg.from(svg).toPng();

    return png;
  }

  private static create(content: string) {
    return new QRCode(content);
  }
}
