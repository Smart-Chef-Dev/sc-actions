import { Module } from '@nestjs/common';
import { Mongoose } from 'mongoose';

import { HelperFunctionsService } from './helper-functions.service';

@Module({
  providers: [HelperFunctionsService, Mongoose],
  exports: [HelperFunctionsService],
})
export class HelperFunctionsModule {}
