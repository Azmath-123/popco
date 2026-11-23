import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { app, api, v1, frontendIndex, asyncRoute, optionalAuth, pool } from './http/api-context.js';
import { registerApiRoutes } from './routes/index.js';

registerApiRoutes();

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Token', 'X-Request-Id', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(`${v1}/webhooks/razorpay`, express.raw({ type: 'application/json', limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use((req, res, next) => {
  req.requestId = req.get('x-request-id') || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});

app.get('/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', service: 'mukeja-api', time: new Date().toISOString() });
}));

app.use(v1, optionalAuth(), api);
app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith(v1) && fs.existsSync(frontendIndex)) return res.sendFile(frontendIndex);
  return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'The requested endpoint was not found.', request_id: req.requestId } });
});
app.use((error, req, res, _next) => {
  const status = error.status || (error.code === '23505' ? 409 : 500);
  const code = error.code && typeof error.code === 'string' && error.code.length < 40 ? error.code : (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');
  if (status >= 500) console.error(JSON.stringify({ requestId: req.requestId, code, message: error.message, stack: error.stack }));
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(status).json({ 
    error: { 
      code, 
      message: (status === 500 && !isDev) ? 'The server could not complete this request.' : error.message, 
      request_id: req.requestId, 
      ...(error.details ? { details: error.details } : {}) 
    } 
  });
});

export default app;
