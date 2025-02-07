import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      console.log('ZodValidationPipe - Incoming value:', value);
      const result = this.schema.parse(value);
      console.log('ZodValidationPipe - Validated result:', result);
      return result;
    } catch (error) {
      //@ts-expect-error Zod related issue
      console.error('ZodValidationPipe - Validation error:', error.errors);
      throw new BadRequestException({
        message: 'Validation failed',
        //@ts-expect-error Zod related issue
        errors: error.errors,
        receivedValue: value,
      });
    }
  }
}
