import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DRIZZLE_ORM } from '../../core/constants/db.constants';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { LoginDto, SignupDto } from './dto';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
} from '../../common/exceptions/auth.exception';
import * as nanoid from 'nanoid';

import type { NewUser } from '../drizzle/schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    console.log('Service: Starting signup process', dto);
    try {
      const existingUser = await this.db.query.users.findFirst({
        where: eq(schema.users.email, dto.email),
      });
      console.log('Service: Checked existing user:', existingUser);

      if (existingUser) {
        throw new UserAlreadyExistsException();
      }

      const newUser: NewUser = {
        id: nanoid.nanoid(),
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        name: dto.name,
      };

      const [user] = await this.db
        .insert(schema.users)
        .values(newUser)
        .returning();
      console.log('Service: User created:', user);

      const payload = { sub: user.id, email: user.email };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      console.error('Service: Error in signup:', error);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, dto.email),
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout() {
    // In a stateless JWT setup, the client is responsible for removing the token
    // Server-side we just return a success message
    return {
      message: 'User logged out successfully',
    };
  }
}
