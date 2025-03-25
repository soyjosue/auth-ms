import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('MongoDB connected.');
  }

  private signJwt(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string) {
    try {
      const {
        sub: _,
        iat: __,
        exp: ___,
        ...user
      } = this.jwtService.verify<JwtPayload & Record<string, any>>(token, {
        secret: envs.jwt.secret,
      });

      return {
        user: user,
        token: this.signJwt(user),
      };
    } catch (error) {
      this.logger.error(error);
      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }

  async registerUser(dto: RegisterUserDto) {
    const { email, name, password } = dto;

    try {
      const user = await this.user.findUnique({
        where: {
          email,
        },
      });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists.',
        });
      }

      const newUser = await this.user.create({
        data: {
          email,
          password: bcrypt.hashSync(password, 10),
          name,
        },
      });

      const { password: _, ...rest } = newUser;

      return {
        user: rest,
        token: this.signJwt(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: (error as Error).message,
      });
    }
  }

  async loginUser(dto: LoginUserDto) {
    const { email, password } = dto;

    try {
      const user = await this.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid.',
        });
      }

      const isPasswordvalid = bcrypt.compareSync(password, user.password);

      if (!isPasswordvalid)
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid.',
        });

      const { password: _, ...rest } = user;

      return {
        user: rest,
        token: this.signJwt(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: (error as Error).message,
      });
    }
  }
}
