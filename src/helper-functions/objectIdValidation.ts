import { BadRequestException } from '@nestjs/common';
import * as mongoose from 'mongoose';

import { GeneralBusinessErrors } from '../shared/errors/general.business-errors';

export async function objectIdValidation(objectId: string): Promise<boolean> {
  const idValidation = await mongoose.isValidObjectId(objectId);
  if (!idValidation) {
    throw new BadRequestException(GeneralBusinessErrors);
  }

  return !!idValidation;
}
