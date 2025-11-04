// File: utils/logger.ts
import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = format;

// Define log directory
const logDir = 'logs';

// Define custom format
const logFormat = printf(({ level, message, timestamp: ts }) => `${ts} [${level}]: ${message}`);

// Create logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    // Console transport with colors
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // Rotating file transport for all logs
    new DailyRotateFile({
      filename: path.join(`${logDir}/application_logs`, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Separate rotating file transport for error logs
    new DailyRotateFile({
      filename: path.join(`${logDir}/error_logs`, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
    }),
  ],
});

export default logger;
