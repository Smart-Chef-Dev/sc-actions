import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Mongoose } from 'mongoose';

import { HelperFunctionsService } from './helper-functions.service';
import { GeneralBusinessErrors } from '../shared/errors/general.business-errors';

describe('HelperFunctionsService', () => {
  let service: HelperFunctionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelperFunctionsService, Mongoose],
    }).compile();

    service = module.get<HelperFunctionsService>(HelperFunctionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true if the id is correct', async () => {
    expect(service).toBeDefined();
    expect(await service.objectIdValidation('60ca9434728fea71f83b5f3f')).toBe(
      true,
    );

    try {
      await service.objectIdValidation('60ca9434728fea71f83b5f3f');
    } catch (err) {
      expect(err).toBe(new BadRequestException(GeneralBusinessErrors));
    }
  });
});
