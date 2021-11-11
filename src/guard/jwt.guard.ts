import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const [, jwt] = req.headers.authorization.split(' ');
      const { email } = await this.jwtService.verify(jwt);
      req.user = await this.usersService.findByEmail(email);

      return true;
    } catch {
      return false;
    }
  }
}
