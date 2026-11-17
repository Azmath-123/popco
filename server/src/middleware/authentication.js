import 'dotenv/config';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

const sessionCookie = process.env.SESSION_COOKIE_NAME || 'mukeja_session';
const sessionTtl = process.env.SESSION_TTL || '8h';

export function hashToken(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function safeEqual(left, right) {
  const a = Buffer.from(left || '');
  const b = Buffer.from(right || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createAccessToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: sessionTtl });
}

export function setSessionCookie(res, token) {
  res.cookie(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(sessionCookie, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
}

export function requireAuth(roles = []) {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.[sessionCookie] || (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
      if (!token || !process.env.JWT_SECRET) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Please sign in to continue.' } });
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query(
        'SELECT id, full_name, email, phone, role, m_coins, created_at FROM customers WHERE id = $1 AND status = $2',
        [payload.sub, 'active'],
      );
      const user = result.rows[0];
      if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Your session is no longer valid.' } });
      if (roles.length && !roles.includes(user.role)) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' } });
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Your session has expired. Please sign in again.' } });
      }
      next(error);
    }
  };
}

export function optionalAuth() {
  return async (req, _res, next) => {
    try {
      const token = req.cookies?.[sessionCookie] || (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
      if (!token || !process.env.JWT_SECRET) return next();
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query(
        'SELECT id, full_name, email, phone, role, m_coins, created_at FROM customers WHERE id = $1 AND status = $2',
        [payload.sub, 'active'],
      );
      req.user = result.rows[0] || null;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return next();
      next(error);
    }
  };
}

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
export const customerSessionCookieName = sessionCookie;
