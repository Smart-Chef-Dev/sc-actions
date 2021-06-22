import { BadRequestException, Injectable } from '@nestjs/common';
import { Mongoose } from 'mongoose';

import { GeneralBusinessErrors } from '../shared/errors/general.business-errors';

@Injectable()
export class HelperFunctionsService {
  constructor(private readonly mongoose: Mongoose) {}

  async objectIdValidation(objectId: string) {
    const idValidation = await this.mongoose.isValidObjectId(objectId);
    if (!idValidation) {
      throw new BadRequestException(GeneralBusinessErrors);
    }

    return !!idValidation;
  }
}
