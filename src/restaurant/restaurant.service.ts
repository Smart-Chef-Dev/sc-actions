import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';

import { Restaurant } from './schemas/restaurant.schema';
import { Action } from './schemas/action.schema';
import { Table } from './schemas/table.schema';
import { RestaurantDto } from './dto/restaurant.dto';
import { ActionDto } from './dto/action.dto';
import { TableDto } from './dto/table.dto';
import { Users } from '../users/schemas/users.schema';
import { Addon } from './schemas/addon.shema';
import { AddonDto } from './dto/addon.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(Action.name)
    private readonly actionModel: Model<Action>,
    @InjectModel(Table.name)
    private readonly tableModel: Model<Table>,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    @InjectModel(Addon.name) private addonModel: Model<Addon>,
  ) {}

  public async findAll(): Promise<Restaurant[]> {
    return this.restaurantModel.find({});
  }

  public async findById(id: string): Promise<Restaurant> {
    return this.restaurantModel.findById({ _id: id });
  }

  public async findAllActions(id: string): Promise<Action[]> {
    const restaurant = await this.findById(id);

    return restaurant?.actions;
  }

  public async findAllTables(id: string): Promise<Table[]> {
    const restaurant = await this.findById(id);

    return restaurant?.tables;
  }

  public async findAllAddons(id: string): Promise<Addon[]> {
    const restaurant = await this.findById(id);

    return restaurant?.addons;
  }

  public async create(dto: RestaurantDto): Promise<Restaurant> {
    const addons = await Promise.all(
      dto.addons?.map(
        (m) =>
          new this.addonModel({
            name: m.name,
            price: m.price,
            weight: m.weight,
          }),
      ) ?? [],
    );

    const tables = await Promise.all(
      dto.tables?.map(
        (t) =>
          new this.tableModel({
            name: t.name,
            userIds: [],
          }),
      ) ?? [],
    );

    const actions = await Promise.all(
      dto.actions?.map(
        (a) =>
          new this.actionModel({
            name: a.name,
            link: a.link,
            message: a.message,
          }),
      ) ?? [],
    );

    const restaurant = await new this.restaurantModel({
      name: dto.name,
      currencyCode: dto.currencyCode,
      tables: tables,
      actions: actions,
      addons: addons,
    });

    return restaurant.save();
  }

  public async updateById(
    id: string,
    changes: UpdateQuery<Restaurant>,
  ): Promise<Restaurant> {
    return this.restaurantModel.findOneAndUpdate({ _id: id }, changes, {
      new: true,
    });
  }

  public async addActionIntoRestaurant(
    restaurantId: string,
    dto: ActionDto,
  ): Promise<Restaurant> {
    const action = await new this.actionModel({
      name: dto.name,
      link: dto.link,
      message: dto.message,
    });

    return this.updateById(restaurantId, {
      $push: {
        actions: action,
      },
    });
  }

  public async addTableIntoRestaurant(
    restaurantId: string,
    dto: TableDto,
  ): Promise<Restaurant> {
    const table = await new this.tableModel({
      name: dto.name,
    });

    return this.updateById(restaurantId, {
      $push: {
        tables: table,
      },
    });
  }

  public async addAddonIntoRestaurant(
    restaurantId: string,
    dto: AddonDto,
  ): Promise<Addon> {
    const addon = await new this.addonModel({
      ...dto,
    });

    await this.updateById(restaurantId, {
      $push: {
        addons: addon,
      },
    });

    return addon;
  }

  public async findAddonById(addonId: string): Promise<Addon> {
    const restaurant = await this.restaurantModel.findOne({
      'addons._id': Types.ObjectId(addonId),
    });

    return restaurant?.addons.find((a) => a._id.equals(addonId));
  }

  public async checkAddonExistingInRestaurantByName(
    restaurantId: string,
    name: string,
  ): Promise<boolean> {
    const addons = await this.findAllAddons(restaurantId);

    return !!addons?.find((a) => a.name === name) ?? false;
  }

  public async checkTableExistingInRestaurant(
    restaurantId: string,
    tableId: string,
  ): Promise<boolean> {
    const tables = await this.findAllTables(restaurantId);

    return !!tables?.find((t) => t._id.equals(tableId)) ?? false;
  }

  async assignUserToTable(
    restaurant: Restaurant,
    table: Table,
    user: Users,
  ): Promise<Restaurant> {
    const changedRestaurant = restaurant.tables.map((currentTable) => {
      if (currentTable._id.equals(table._id)) {
        currentTable.userIds = [...currentTable.userIds, String(user._id)];
        return currentTable;
      } else {
        return currentTable;
      }
    });

    return this.updateById(restaurant._id, {
      $set: { tables: changedRestaurant },
    });
  }
}
