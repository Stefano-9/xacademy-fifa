import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  
  private readonly USER = { username: 'admin', password: '1234' };

  async login(username: string, password: string) {
    if (username !== this.USER.username || password !== this.USER.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = { sub: 1, username };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }
}
