import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './schemas/item.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';


describe('ItemsService', () => {
  let service: ItemsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let itemModel: Model<Item>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
      ],
      providers: [ItemsService],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    itemModel = module.get<Model<Item>>(getModelToken(Item.name));
    mongoConnection = module.get(getConnectionToken());
  });


  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    await itemModel.deleteMany({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const createItemDto = {
        title: 'Test Item',
        description: 'This is a test item',
      };

      const createdItem = await service.create(createItemDto);

      expect(createdItem).toBeDefined();
      expect(createdItem.title).toEqual(createItemDto.title);
      expect(createdItem.description).toEqual(createItemDto.description);
    });
  });

  describe('findAll', () => {
    it('should return an array of items', async () => {
      const createItemDto1 = {
        title: 'Item 1',
        description: 'First item',
      };
      const createItemDto2 = {
        title: 'Item 2',
        description: 'Second item',
      };

      await new itemModel(createItemDto1).save();
      await new itemModel(createItemDto2).save();

      const result = await service.findAll(1, 10, 'createdAt', 'asc');

      expect(result).toBeDefined();
      expect(result.items.length).toBe(2);
      expect(result.meta.totalItems).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a single item by id', async () => {
      const createItemDto = {
        title: 'Test Item',
        description: 'This is a test item',
      };

      const createdItem = await service.create(createItemDto);

      const foundItem = await service.findOne(createdItem._id.toString());

      expect(foundItem).toBeDefined();
      expect(foundItem._id.toString()).toEqual(createdItem._id.toString());
      expect(foundItem.title).toEqual(createdItem.title);
      expect(foundItem.description).toEqual(createdItem.description);
    });

    it('should throw NotFoundException if item not found', async () => {
      const invalidId = '60b64415e1d0f5a7d8c1b2c3';

      await expect(service.findOne(invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      const createItemDto = {
        title: 'Original Title',
        description: 'Original Description',
      };

      const createdItem = await service.create(createItemDto);

      const updateItemDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const updatedItem = await service.update(
        createdItem._id.toString(),
        updateItemDto,
      );

      expect(updatedItem).toBeDefined();
      expect(updatedItem._id.toString()).toEqual(
        createdItem._id.toString(),
      );
      expect(updatedItem.title).toEqual(updateItemDto.title);
      expect(updatedItem.description).toEqual(updateItemDto.description);
    });

    it('should throw NotFoundException if item not found', async () => {
      const invalidId = '60b64415e1d0f5a7d8c1b2c3';
      const updateItemDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      await expect(
        service.update(invalidId, updateItemDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing item', async () => {
      const createItemDto = {
        title: 'Item to be deleted',
        description: 'This item will be deleted',
      };

      const createdItem = await service.create(createItemDto);

      const deletedItem = await service.remove(createdItem._id.toString());

      expect(deletedItem).toBeDefined();
      expect(deletedItem._id.toString()).toEqual(
        createdItem._id.toString(),
      );

      await expect(
        service.findOne(createdItem._id.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if item not found', async () => {
      const invalidId = '60b64415e1d0f5a7d8c1b2c3';

      await expect(service.remove(invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
