// src/middleware/logger.ts
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');
const logFile = path.join(logDir, 'requests.log');

// Ensure the logs directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Create a write stream (in append mode)
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

export const logger = (req: Request, res: Response, next: NextFunction) => {
    const log = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
    logStream.write(log);
    next();
};
