import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register.user')
  registerUser(@Payload() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @MessagePattern('auth.login.user')
  loginUser(@Payload() dto: LoginUserDto) {
    return this.authService.loginUser(dto);
  }

  @MessagePattern('auth.verify.user')
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }
}
