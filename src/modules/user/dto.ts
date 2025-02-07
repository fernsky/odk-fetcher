import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

// Zod Schema for validation
export const UserProfileSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Response DTOs
export class UserProfileResponse {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user',
  })
  id: number;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  name: string;

  @ApiProperty({
    example: '2024-01-30T12:00:00Z',
    description: 'The timestamp when the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-30T12:00:00Z',
    description: 'The timestamp when the user was last updated',
  })
  updatedAt: Date;
}

// Error Response DTOs
export class UserErrorResponse {
  @ApiProperty({
    example: 'User not found',
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    example: 404,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Not Found',
    description: 'Error type',
  })
  error: string;
}

export type UserProfile = z.infer<typeof UserProfileSchema>;
