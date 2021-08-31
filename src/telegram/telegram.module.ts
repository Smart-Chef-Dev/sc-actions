import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { TelegramService } from './telegram.service';
import { UsersService } from '../users/users.service';
import { Users, UsersSchema } from '../users/schemas/users.schema';

@Module({
  providers: [TelegramService, Logger, UsersService],
  exports: [TelegramService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class TelegramModule {}
