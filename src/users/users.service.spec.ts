import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';

import { StripeModule } from 'nestjs-stripe';
import { UsersService } from './users.service';
import { Users, UsersSchema } from './schemas/users.schema';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';
import { RestaurantService } from '../restaurant/restaurant.service';
import { ConfigService } from '@nestjs/config';
import { Role } from './enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';

let mongod: MongoMemoryServer;

describe('UsersService', () => {
  let jwtService: JwtService;
  let service: UsersService;

  mongoose.set('useCreateIndex', true);

  beforeEach(async () => {
    mongod = new MongoMemoryServer();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: await mongod.getUri(),
            useFindAndModify: false,
          }),
        }),
        MongooseModule.forFeature([
          { name: Users.name, schema: UsersSchema },
          { name: Restaurant.name, schema: RestaurantSchema },
        ]),
        JwtModule.register({
          secret: 'Test',
          signOptions: { expiresIn: '60s' },
        }),
        StripeModule.forRoot({
          apiKey: 'sk_test_secret_key',
          apiVersion: '2020-08-27',
        }),
      ],
      providers: [
        UsersService,
        {
          provide: RestaurantService,
          useValue: {
            findById: jest.fn(),
          },
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  const email = 'test@gmail.com';
  const password = 'test123';
  const name = 'Name';
  const restaurantId = '60fc8883908d543aa77f5df7';
  const telegramId = '185249578';

  const preCreateUsers = async (dto: CreateUserDto) => {
    return service.creatAccount(
      {
        email: dto.email,
        password: dto.password,
        restaurantId: dto.restaurantId,
      },
      Role.RESTAURANT_ADMIN,
    );
  };

  const preCreateUsersWithRoleOfWaiter = async (
    name: string,
    restaurantId: string,
    telegramId: string,
  ) => {
    return service.creatAccount(
      {
        name: name,
        telegramId: telegramId,
        restaurantId: restaurantId,
      },
      Role.WAITER,
    );
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an account', async () => {
    const addedUser1 = await preCreateUsers({ email, password });

    expect(addedUser1).toBeDefined();
    expect(addedUser1.email).toBe(email);
    expect(addedUser1.password).not.toBe(password);
    expect(addedUser1._id).toBeDefined();

    const addedUser2 = await preCreateUsersWithRoleOfWaiter(
      name,
      restaurantId,
      telegramId,
    );

    expect(addedUser2).toBeDefined();
    expect(addedUser2.name).toBe(name);
    expect(addedUser2.telegramId).toBe(telegramId);
    expect(addedUser2.restaurantId).toBe(restaurantId);
    expect(addedUser2._id).toBeDefined();
  });

  it('must find a user by id', async () => {
    const addedUser = await preCreateUsers({ email, password });
    const foundUser1 = await service.findById(addedUser._id);

    expect(foundUser1).toBeDefined();
    expect(foundUser1.email).toBe(addedUser.email);
    expect(foundUser1.password).toBe(addedUser.password);
    expect(foundUser1._id).toStrictEqual(addedUser._id);

    const foundUser2 = await service.findById(
      Types.ObjectId('60c5165a27ab938e4f96e49f'),
    );
    expect(foundUser2).toBeDefined();
    expect(foundUser2).toBe(null);
  });

  it('should find user by username exists in restaurant', async () => {
    const user1 = await service.findUserByUsernameInRestaurant(
      name,
      restaurantId,
    );
    expect(user1).toBeDefined();
    expect(user1).toBe(null);

    await preCreateUsersWithRoleOfWaiter(name, restaurantId, telegramId);

    const user2 = await service.findUserByUsernameInRestaurant(
      name,
      restaurantId,
    );
    expect(user2).toBeDefined();
    expect(user2.restaurantId).toBe(restaurantId);
  });

  it('should update by id', async () => {
    const addedUser = await preCreateUsersWithRoleOfWaiter(
      name,
      restaurantId,
      telegramId,
    );

    const newUserName = 'newName';
    const updateUser = await service.updateById(addedUser.id, {
      name: newUserName,
    });

    expect(updateUser).toBeDefined();
    expect(updateUser.name).toBe(newUserName);
    expect(updateUser.name).not.toBe(name);
    expect(updateUser.telegramId).toBe(telegramId);
    expect(updateUser.restaurantId).toBe(restaurantId);
    expect(updateUser._id).toBeDefined();
  });

  it('must check if the restaurant is linked to the restaurant administrator', async () => {
    const isRestaurantIsTiedToRestaurantAdmin1 =
      await service.checkIfRestaurantIsTiedToRestaurantAdmin(restaurantId);

    expect(isRestaurantIsTiedToRestaurantAdmin1).toBeDefined();
    expect(isRestaurantIsTiedToRestaurantAdmin1).toBe(false);

    await preCreateUsers({ email, password, restaurantId });

    const isRestaurantIsTiedToRestaurantAdmin2 =
      await service.checkIfRestaurantIsTiedToRestaurantAdmin(restaurantId);

    expect(isRestaurantIsTiedToRestaurantAdmin2).toBeDefined();
    expect(isRestaurantIsTiedToRestaurantAdmin2).toBe(true);
  });

  it('should return the user with the specified email', async () => {
    const addedUser = await preCreateUsers({ email, password });

    const user = await service.findByEmail(email);
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(user._id).toStrictEqual(addedUser._id);

    const isMatch = await bcrypt.compare(password, user.password);
    expect(isMatch).toBe(true);
  });

  it('should return jwt if data is correct', async () => {
    await preCreateUsers({ email, password });

    const jwt = await service.singIn({
      email: email,
      password: password,
    });

    interface JWTData {
      email: string;
    }

    const decodeJwt = await jwtService.decode(jwt);

    expect(jwt).toBeDefined();
    expect((decodeJwt as JWTData).email).toBe(email);
  });

  it('try to enter numbers instead of email', async () => {
    const createUsers = await preCreateUsers({ email: '123', password });

    expect(createUsers).toBeDefined();
  });
});
