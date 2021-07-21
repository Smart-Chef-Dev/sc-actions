import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateConfig } from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
      isGlobal: true,
    }),
  ],
})
export class AppConfigModule {}
