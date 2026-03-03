import { Injectable, Logger } from '@nestjs/common';
import WxPay from 'wechatpay-node-v3';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WechatService {
  private pay: WxPay;
  private readonly logger = new Logger(WechatService.name);

  constructor() {
    try {
      this.pay = new WxPay({
        appid: process.env.WX_APPID || '',
        mchid: process.env.WX_MCHID || '',
        serial_no: process.env.WX_SERIAL_NO || '',
        privateKey: fs.readFileSync(path.resolve(process.env.WX_KEY_PEM_PATH || ''), 'utf8'),
        key: process.env.WX_API_KEY || '',
      } as any);
    } catch (error) {
      this.logger.warn('WechatPay client initialization failed. Check your cert paths.');
    }
  }

  async createJsapiOrder(data: { out_trade_no: string; description: string; amount: number; openid: string }) {
    return this.pay.transactions_jsapi({
      out_trade_no: data.out_trade_no,
      description: data.description,
      amount: {
        total: data.amount,
        currency: 'CNY',
      },
      payer: {
        openid: data.openid,
      },
      notify_url: process.env.WX_NOTIFY_URL || '',
    });
  }

  decryptNotify(ciphertext: string, associated_data: string, nonce: string) {
    return this.pay.decipher_gcm(ciphertext, associated_data, nonce);
  }
}
