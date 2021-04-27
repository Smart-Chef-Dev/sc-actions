import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtModule } from '@nestjs/jwt';
import { Users, UsersSchema } from './schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as mongoose from 'mongoose';

let mongod: MongoMemoryServer;

describe('UsersService', () => {
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
        MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
        JwtModule.register({ secret: 'Test' }),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  const email = 'test email';
  const password = 'test password';

  const preCreateUsers = async (email, password) => {
    const dto = new CreateUserDto({
      email: email,
      password: password,
    });

    return service.signUp(dto);
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an account', async () => {
    const addUser = await preCreateUsers(email, password);

    expect(addUser).toBeDefined();
    expect(addUser.email).toBe(email);
  });

  it('should return the user with the specified email', async () => {
    await preCreateUsers(email, password);

    const user = await service.findByEmail(email);
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
  });

  it('should return jwt if data is correct', async () => {
    await preCreateUsers(email, password);

    const dto = new CreateUserDto({
      email: email,
      password: password,
    });
    const jwt = await service.singIn(dto);

    expect(jwt).toBeDefined();
  });
});
