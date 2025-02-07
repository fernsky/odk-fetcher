import {
  Body,
  Controller,
  Post,
  UsePipes,
  Version,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LoginSchema,
  SignupDto,
  SignupSchema,
  AuthResponseDto,
  LogoutResponseDto,
} from './dto';
import { ZodValidationPipe } from '../../common/pipes/zod.pipe';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Version('1')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully created and logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @UsePipes(new ZodValidationPipe(SignupSchema))
  async signup(@Body() body: SignupDto) {
    console.log('Controller: Raw request body:', body);
    try {
      return await this.authService.signup(body);
    } catch (error) {
      console.error('Controller: Signup error:', error);
      throw error;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UsePipes(new ZodValidationPipe(LoginSchema))
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('logout')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
    type: LogoutResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout() {
    return this.authService.logout();
  }
}
