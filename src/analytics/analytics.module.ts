import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AnalyticsService } from './analytics.service';
import { Analytic, AnalyticSchema } from './schemas/analytic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Analytic.name, schema: AnalyticSchema },
    ]),
  ],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
