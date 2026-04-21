import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export function verifyShopifyWebhook(secret: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256') || '';
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;

    if (!rawBody) {
      return res.status(400).send('Missing raw body');
    }

    const digest = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('base64');

    const valid =
      hmacHeader &&
      crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));

    if (!valid) {
      return res.status(401).send('Invalid webhook signature');
    }

    next();
  };
}
