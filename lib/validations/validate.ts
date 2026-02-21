import { NextResponse } from 'next/server';
import type { ZodSchema } from 'zod';

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  response: NextResponse;
};

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export function validateBody<T>(
  schema: ZodSchema<T>,
  body: unknown,
  headers?: Headers
): ValidationResult<T> {
  const result = schema.safeParse(body);

  if (!result.success) {
    const fieldErrors = result.error.issues.map((issue) => ({
      field: issue.path.map(String).join('.'),
      message: issue.message,
    }));

    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Validation failed',
          details: fieldErrors,
        },
        { status: 400, headers: headers ?? undefined }
      ),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
