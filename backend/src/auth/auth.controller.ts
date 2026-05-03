import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto){
    return this.authService.signup(dto);
  }

  @Post('signin')
  async signin(@Body() dto: SigninDto){
    return this.authService.signin(dto);
  }

}
