/**
 * Custom error types for better error handling
 */

// Base class for all application errors
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// API related errors
export class ApiError extends AppError {
  statusCode: number;
  
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Specific error types
export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`, 404);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ExternalApiError extends ApiError {
  service: string;
  
  constructor(service: string, message: string) {
    super(`${service} API error: ${message}`, 502);
    this.service = service;
  }
}

export class DatabaseError extends AppError {
  operation: string;
  
  constructor(operation: string, message: string) {
    super(`Database ${operation} failed: ${message}`);
    this.operation = operation;
  }
}

const consoleLogger = globalThis.console;

/**
 * Logger utility for consistent logging
 */
export const logger = {
  info: (message: string, ...meta: unknown[]) => {
    consoleLogger.log(`[INFO] ${message}`, ...meta);
  },

  warn: (message: string, ...meta: unknown[]) => {
    consoleLogger.warn(`[WARN] ${message}`, ...meta);
  },

  error: (message: string, error?: Error, ...meta: unknown[]) => {
    consoleLogger.error(`[ERROR] ${message}`, error || '', ...meta);
  },

  debug: (message: string, ...meta: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      consoleLogger.debug(`[DEBUG] ${message}`, ...meta);
    }
  },
};
