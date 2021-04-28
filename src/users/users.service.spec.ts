import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Users, UsersSchema } from './schemas/users.schema';
import * as mongoose from 'mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
        MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: 'Test',
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  const email = 'test@gmail.com';
  const password = 'test123';

  const preCreateUsers = async (email, password) => {
    return service.signUp({
      email: email,
      password: password,
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an account', async () => {
    const addedUser = await preCreateUsers(email, password);

    expect(addedUser).toBeDefined();
    expect(addedUser.email).toBe(email);
    expect(addedUser.password).not.toBe(password);
    expect(addedUser._id).toBeDefined();
  });

  it('should return the user with the specified email', async () => {
    const addedUser = await preCreateUsers(email, password);

    const userFound = await service.findByEmail(email);
    expect(userFound).toBeDefined();
    expect(userFound.email).toBe(email);
    expect(userFound._id).toStrictEqual(addedUser._id);

    const isMatch = await bcrypt.compare(password, userFound.password);
    expect(isMatch).toBe(true);
  });

  it('should return jwt if data is correct', async () => {
    await preCreateUsers(email, password);

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
    const a = await preCreateUsers('123', password);

    expect(a).toBeDefined();
  });
});
