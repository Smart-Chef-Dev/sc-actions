import { BadRequestException } from '@nestjs/common';
import * as mongoose from 'mongoose';

export async function checkIsObjectIdValid(objectId: string): Promise<boolean> {
  const isValid = await mongoose.isValidObjectId(objectId);
  if (!isValid) {
    throw new BadRequestException(`Id(${objectId}) is not valid`);
  }

  return !!isValid;
}
