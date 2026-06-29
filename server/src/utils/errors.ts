// ─── Custom Error Classes ───────────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, 'NOT_FOUND', `${resource}${id ? ` with id '${id}'` : ''} not found.`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string) {
    super(400, 'FILE_UPLOAD_ERROR', message);
  }
}
