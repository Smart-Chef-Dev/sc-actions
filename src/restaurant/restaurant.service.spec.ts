import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';

import { RestaurantSchema, Restaurant } from './schemas/restaurant.schema';
import { TableSchema, Table } from './schemas/table.schema';
import { ActionSchema, Action } from './schemas/action.schema';
import { RestaurantService } from './restaurant.service';
import { Users, UsersSchema } from '../users/schemas/users.schema';

import { RestaurantDto } from './dto/restaurant.dto';
import { ActionDto } from './dto/action.dto';
import { TableDto } from './dto/table.dto';
import { Addon, AddonSchema } from './schemas/addon.shema';
import { AddonDto } from './dto/addon.dto';

let mongod: MongoMemoryServer;

describe('RestaurantService', () => {
  let module: TestingModule;
  let service: RestaurantService;
  let userModel: Model<Users>;

  afterEach(async () => {
    await module.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    mongod = new MongoMemoryServer();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: await mongod.getUri(),
            useFindAndModify: false,
          }),
        }),
        MongooseModule.forFeature([
          { name: Restaurant.name, schema: RestaurantSchema },
          { name: Action.name, schema: ActionSchema },
          { name: Table.name, schema: TableSchema },
          { name: Users.name, schema: UsersSchema },
          { name: Addon.name, schema: AddonSchema },
        ]),
      ],
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    userModel = module.get<Model<Users>>('UsersModel');
  });

  const preCreateRestaurant = async () => {
    const dto = new RestaurantDto({
      name: 'Restaurant Name',
      actions: [
        new ActionDto({ name: 'Action_1', message: 'Action_1_message' }),
      ],
      tables: [
        new TableDto({ name: 'Table №1', userIds: [] }),
        new TableDto({ name: 'Table №2', userIds: [] }),
      ],
      addons: [
        new AddonDto({
          name: 'Tartar sauce',
          price: 3,
        }),
        new AddonDto({
          name: 'Teriyaki sauce',
          price: 5,
        }),
      ],
      currencyCode: 'USD',
    });

    return service.create(dto);
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create restaurant without actions and tables', async () => {
    const dto = new RestaurantDto({
      name: 'Restaurant Name',
    });

    const restaurant = await service.create(dto);

    expect(restaurant.name).toBe(dto.name);
    expect(restaurant.actions.length).toBe(0);
    expect(restaurant.tables.length).toBe(0);
    expect(restaurant.products.length).toBe(0);
  });

  it('should create restaurant with actions and tables', async () => {
    const dto = new RestaurantDto({
      name: 'Restaurant Name',
      actions: [
        new ActionDto({ name: 'Action_1', message: 'Action_1_message' }),
      ],
      tables: [new TableDto({ name: 'Table №1' })],
    });

    const restaurant = await service.create(dto);

    expect(restaurant.name).toBe(dto.name);
    expect(restaurant.actions[0].name).toBe(dto.actions[0].name);
    expect(restaurant.actions[0].message).toBe(dto.actions[0].message);
    expect(restaurant.tables[0].name).toBe(dto.tables[0].name);
  });

  it('should update by id', async () => {
    const restaurant = await preCreateRestaurant();

    const newRestaurantName = ' new name';
    const updatedRestaurant = await service.updateById(restaurant._id, {
      name: newRestaurantName,
    });

    expect(updatedRestaurant.name).toBe(newRestaurantName);
  });

  it('should add action into restaurant', async () => {
    const restaurant = await preCreateRestaurant();

    expect(restaurant).toBeDefined();
    expect(restaurant.actions.length).toBe(1);

    const dto = new ActionDto({
      name: 'New_ Action_',
      link: 'new link',
      message: 'new Action message',
    });
    const updatedRestaurant = await service.addActionIntoRestaurant(
      restaurant._id,
      dto,
    );

    expect(restaurant.actions.length).not.toBe(
      updatedRestaurant.actions.length,
    );
    expect(updatedRestaurant.actions.length).toBe(2);
    expect(updatedRestaurant.actions[1].name).toBe(dto.name);
    expect(updatedRestaurant.actions[1].link).toBe(dto.link);
    expect(updatedRestaurant.actions[1].message).toBe(dto.message);
  });

  it('should add table into restaurant', async () => {
    const restaurant = await preCreateRestaurant();

    expect(restaurant).toBeDefined();
    expect(restaurant.tables.length).toBe(2);

    const dto = new TableDto({ name: 'New table name' });
    const updatedRestaurant = await service.addTableIntoRestaurant(
      restaurant._id,
      dto,
    );

    expect(restaurant.tables.length).not.toBe(updatedRestaurant.tables.length);
    expect(updatedRestaurant.tables.length).toBe(3);
    expect(updatedRestaurant.tables[2].name).toBe(dto.name);
  });

  it('should find restaurant by id', async () => {
    const restaurant = await preCreateRestaurant();

    const restaurantById = await service.findById(restaurant._id);

    expect(restaurantById).toBeDefined();
    expect(restaurantById._id).toStrictEqual(restaurant._id);
    expect(restaurantById.name).toBe(restaurant.name);
  });

  it('should find restaurant actions', async () => {
    const restaurant = await preCreateRestaurant();

    const actions = await service.findAllActions(restaurant._id);

    expect(actions).toBeDefined();
    expect(actions[0]._id).toStrictEqual(restaurant.actions[0]._id);
    expect(actions[0].name).toStrictEqual(restaurant.actions[0].name);
    expect(actions[0].message).toStrictEqual(restaurant.actions[0].message);
  });

  it('should find restaurant tables', async () => {
    const restaurant = await preCreateRestaurant();

    const tables = await service.findAllTables(restaurant._id);

    expect(tables).toBeDefined();
    expect(tables[0]._id).toStrictEqual(restaurant.tables[0]._id);
    expect(tables[0].name).toStrictEqual(restaurant.tables[0].name);
  });

  it('should find all restaurants', async () => {
    const restaurant1 = await preCreateRestaurant();
    const restaurant2 = await preCreateRestaurant();

    const restaurants = await service.findAll();

    expect(restaurants).toBeDefined();
    expect(restaurants.length).toBe(2);
    expect(restaurants[0]._id).toStrictEqual(restaurant1._id);
    expect(restaurants[0].name).toStrictEqual(restaurant1.name);
    expect(restaurants[1]._id).toStrictEqual(restaurant2._id);
    expect(restaurants[1].name).toStrictEqual(restaurant2.name);
    expect(restaurants[0]._id).not.toBe(restaurants[1]._id);
  });

  it('should check restaurant exist status', async () => {
    const restaurant = await preCreateRestaurant();

    expect(
      await service.checkTableExistingInRestaurant(
        restaurant._id,
        restaurant.tables[0]._id,
      ),
    ).toBe(true);
    expect(
      await service.checkTableExistingInRestaurant(
        restaurant.tables[0]._id,
        restaurant.tables[0]._id,
      ),
    ).toBe(false);
    expect(
      await service.checkTableExistingInRestaurant(
        restaurant._id,
        restaurant._id,
      ),
    ).toBe(false);
  });

  it('must add a new waiter to the table', async () => {
    const restaurant = await preCreateRestaurant();

    const userId = Types.ObjectId('569ed8269353e9f4c51617aa');
    const user = new userModel({
      _id: userId,
      telegramId: '18547896586',
      restaurantId: restaurant._id,
      role: 'WAITER',
    });
    const updatedRestaurant1 = await service.assignWaitersToTable(
      restaurant,
      restaurant.tables[0],
      user,
    );

    expect(updatedRestaurant1).toBeDefined();
    expect(updatedRestaurant1._id).toStrictEqual(restaurant._id);
    expect(updatedRestaurant1.tables[0].userIds.length).toBe(1);
    expect(
      Types.ObjectId(updatedRestaurant1.tables[0].userIds[0]),
    ).toStrictEqual(userId);
  });

  it('must find all addons', async () => {
    const restaurant = await preCreateRestaurant();

    const addons = await service.findAllAddons(restaurant._id);

    expect(addons).toBeDefined();
    expect(addons.length).toBe(2);
    expect(addons[0].name).toBe(restaurant.addons[0].name);
    expect(addons[0].price).toBe(restaurant.addons[0].price);
    expect(addons[1].name).toBe(restaurant.addons[1].name);
    expect(addons[1].price).toBe(restaurant.addons[1].price);
  });

  it('should add addon to restaurant', async () => {
    const restaurant = await preCreateRestaurant();

    const addon = await service.addAddonIntoRestaurant(
      restaurant._id,
      new AddonDto({ name: 'Salt', price: 1 }),
    );
    const addons = await service.findAllAddons(restaurant._id);

    expect(addon).toBeDefined();
    expect(addons.length).toBe(3);
    expect(addons[2].name).toBe(addon.name);
    expect(addons[2].price).toBe(addon.price);
  });

  it('should find addon by name', async () => {
    const restaurant = await preCreateRestaurant();

    const addon = await service.addAddonIntoRestaurant(
      restaurant._id,
      new AddonDto({ name: 'Salt', price: 1 }),
    );
    const foundAddon = await service.findAddonById(addon._id);

    expect(foundAddon).toBeDefined();
    expect(foundAddon.name).toBe(addon.name);
    expect(foundAddon.price).toBe(addon.price);
  });

  it('should check Addon Existing In Restaurant By Name', async () => {
    const restaurant = await preCreateRestaurant();

    const addon = await service.addAddonIntoRestaurant(
      restaurant._id,
      new AddonDto({ name: 'Salt', price: 1 }),
    );
    const foundAddon1 = await service.checkAddonExistingInRestaurantByName(
      restaurant._id,
      addon.name,
    );

    expect(foundAddon1).toBeDefined();
    expect(foundAddon1).toBe(true);

    const foundAddon2 = await service.checkAddonExistingInRestaurantByName(
      restaurant._id,
      'Sugar',
    );

    expect(foundAddon2).toBe(false);
  });
});
