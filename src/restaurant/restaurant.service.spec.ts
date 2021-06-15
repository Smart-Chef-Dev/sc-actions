import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { RestaurantService } from './restaurant.service';
import { RestaurantSchema, Restaurant } from './schemas/restaurant.schema';
import { TableSchema, Table } from './schemas/table.schema';
import { ActionSchema, Action } from './schemas/action.schema';
import { RestaurantDto } from './dto/restaurant.dto';
import { ActionDto } from './dto/action.dto';
import { TableDto } from './dto/table.dto';

let mongod: MongoMemoryServer;

describe('RestaurantService', () => {
  let module: TestingModule;
  let service: RestaurantService;

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
        ]),
      ],
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  const preCreateRestaurant = async () => {
    const dto = new RestaurantDto({
      name: 'Restaurant Name',
      usernames: ['test'],
      actions: [
        new ActionDto({ name: 'Action_1', message: 'Action_1_message' }),
      ],
      tables: [new TableDto({ name: 'Table №1' })],
    });

    return service.create(dto);
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create restaurant without actions and tables', async () => {
    const dto = new RestaurantDto({
      name: 'Restaurant Name',
      usernames: ['test'],
    });

    const restaurant = await service.create(dto);

    expect(restaurant.name).toBe(dto.name);
    expect(restaurant.usernames[0]).toBe(dto.usernames[0]);
    expect(restaurant.actions.length).toBe(0);
    expect(restaurant.tables.length).toBe(0);
  });

  it('should create restaurant with actions and tables', async () => {
    const dto = new RestaurantDto({
      name: 'Restaurant Name',
      usernames: ['test'],
      actions: [
        new ActionDto({ name: 'Action_1', message: 'Action_1_message' }),
      ],
      tables: [new TableDto({ name: 'Table №1' })],
    });

    const restaurant = await service.create(dto);

    expect(restaurant.name).toBe(dto.name);
    expect(restaurant.usernames[0]).toBe(dto.usernames[0]);
    expect(restaurant.actions[0].name).toBe(dto.actions[0].name);
    expect(restaurant.actions[0].message).toBe(dto.actions[0].message);
    expect(restaurant.tables[0].name).toBe(dto.tables[0].name);
  });

  it('should update by id', async () => {
    const restaurant = await preCreateRestaurant();

    expect(restaurant).toBeDefined();
    expect(restaurant.usernames.length).toBe(1);

    const newUserName = 'newValue';

    const updatedRestaurant = await service.updateById(restaurant._id, {
      $push: { usernames: newUserName },
    });

    expect(updatedRestaurant.usernames.length).toBe(2);
    expect(updatedRestaurant.usernames[1]).toBe(newUserName);

    const newRestaurantName = ' new name';
    const updatedRestaurant2 = await service.updateById(restaurant._id, {
      name: newRestaurantName,
    });

    expect(updatedRestaurant.name).not.toBe(updatedRestaurant2.name);
    expect(updatedRestaurant2.name).toBe(newRestaurantName);
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
    expect(restaurant.tables.length).toBe(1);

    const dto = new TableDto({ name: 'New table name' });
    const updatedRestaurant = await service.addTableIntoRestaurant(
      restaurant._id,
      dto,
    );

    expect(restaurant.tables.length).not.toBe(updatedRestaurant.tables.length);
    expect(updatedRestaurant.tables.length).toBe(2);
    expect(updatedRestaurant.tables[1].name).toBe(dto.name);
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

  it('should check if the chat', async () => {
    const restaurant = await preCreateRestaurant();

    expect(
      await service.checkIfChatExists(restaurant._id, restaurant.usernames[0]),
    ).toBe(true);
    expect(await service.checkIfChatExists(restaurant._id, '256847488')).toBe(
      false,
    );
  });
});
