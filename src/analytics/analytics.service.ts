import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Analytic } from './schemas/analytic.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analytic.name)
    private readonly analyticModel: Model<Analytic>,
  ) {}

  async create({
    type,
    restaurantId = '',
    tableId = '',
    actionId = '',
  }): Promise<Analytic> {
    const analytic = await new this.analyticModel({
      restaurantId,
      actionId,
      tableId,
      type,
    });

    return analytic.save();
  }
}
