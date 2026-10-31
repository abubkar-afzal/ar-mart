import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../env.ts';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      ownerKey: string;
    }
  }
}

const COOKIE = 'arm_guest';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  let guestId = req.cookies?.[COOKIE] as string | undefined;
  if (!guestId || !/^[0-9a-f-]{36}$/i.test(guestId)) {
    guestId = randomUUID();
    res.cookie(COOKIE, guestId, {
      httpOnly: true,
      sameSite: env.isProd ? 'none' : 'lax',
      secure: env.cookieSecure,
      maxAge: MAX_AGE_MS,
      path: '/',
    });
  }
  // In Part 4 this reads the authenticated user; Part 1 is guests only.
  req.ownerKey = `guest:${guestId}`;
  next();
}