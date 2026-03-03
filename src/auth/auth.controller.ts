import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('login-by-code')
  async loginByCode(@Body() body: any) {
    return this.authService.loginByCode(body.phone, body.code);
  }

  @Post('send-code')
  async sendCode(@Body() body: any) {
    return this.authService.sendCode(body.phone);
  }

  @Post('logout')
  async logout() {
    return { success: true, message: '退出登录成功' };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Req() req: any) {
    return this.authService.refreshToken(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.empId);
  }
}
