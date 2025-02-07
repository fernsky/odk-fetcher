import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const SignupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class SignupDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'Password123',
    description:
      'Password with at least 8 characters, one uppercase letter and one number',
  })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  name: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({ example: 'Password123', description: 'User password' })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({
    example: {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
    },
  })
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export class LogoutResponseDto {
  @ApiProperty({
    example: 'User logged out successfully',
    description: 'Logout success message',
  })
  message: string;
}
