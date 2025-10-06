import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminJwtClaims { role: 'admin'; email: string }
export interface UserJwtClaims { uid: string; phone: string }

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'NO_TOKEN' });
  const token = auth.slice('Bearer '.length);
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'JWT_NOT_CONFIGURED' });
  try {
    const payload = jwt.verify(token, secret) as AdminJwtClaims;
    if (payload.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    (req as any).admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'NO_TOKEN' });
  const token = auth.slice('Bearer '.length);
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'JWT_NOT_CONFIGURED' });
  try {
    const payload = jwt.verify(token, secret) as UserJwtClaims;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}


