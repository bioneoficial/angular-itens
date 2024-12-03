import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { UpdateItemDto } from './dto/update-item.dto';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  const mockItemsService = {
    create: jest.fn(dto => ({
      _id: 'someId',
      ...dto,
    })),
    findAll: jest.fn(() => ({
      items: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1,
      },
    })),
    findOne: jest.fn(id => {
      if (id === 'existingId') {
        return {
          _id: id,
          title: 'Test Item',
          description: 'This is a test item',
        };
      } else {
        throw new NotFoundException(`Item com ID '${id}' não encontrado`);
      }
    }),
    update: jest.fn((id, dto) => {
      if (id === 'existingId') {
        return {
          _id: id,
          ...dto,
        };
      } else {
        throw new NotFoundException(`Item com ID '${id}' não encontrado`);
      }
    }),
    remove: jest.fn(id => {
      if (id === 'existingId') {
        return {
          _id: id,
          title: 'Deleted Item',
          description: 'This item was deleted',
        };
      } else {
        throw new NotFoundException(`Item com ID '${id}' não encontrado`);
      }
    }),
  };


  const mockConfigService = {
    get: jest.fn().mockImplementation((_key: string) => {
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [ItemsService, ConfigService],
    })
      .overrideProvider(ItemsService)
      .useValue(mockItemsService)
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an item', async () => {
      const createItemDto: CreateItemDto = {
        title: 'New Item',
        description: 'Item description',
      };

      const result = await controller.create(null, createItemDto);

      expect(result).toBeDefined();
      expect(result.title).toEqual(createItemDto.title);
      expect(result.description).toEqual(createItemDto.description);
      expect(service.create).toHaveBeenCalledWith(createItemDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of items with metadata', async () => {
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'asc' as 'asc' | 'desc',
      };

      const result = await controller.findAll(
        query.page,
        query.limit,
        query.sortBy,
        query.order,
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.meta).toBeDefined();
      expect(service.findAll).toHaveBeenCalledWith(
        query.page,
        query.limit,
        query.sortBy,
        query.order,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single item', async () => {
      const id = 'existingId';

      const result = await controller.findOne(id);

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if item not found', async () => {
      const id = 'nonExistingId';

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update an item', async () => {
      const id = 'existingId';
      const updateItemDto: UpdateItemDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const result = await controller.update(id, null, updateItemDto);

      expect(result).toBeDefined();
      expect(result.title).toEqual(updateItemDto.title);
      expect(result.description).toEqual(updateItemDto.description);
      expect(service.update).toHaveBeenCalledWith(id, updateItemDto);
    });

    it('should throw NotFoundException if item not found', async () => {
      const id = 'nonExistingId';
      const updateItemDto: UpdateItemDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      await expect(controller.update(id, null, updateItemDto)).rejects.toThrow(NotFoundException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an item', async () => {
      const id = 'existingId';

      const result = await controller.remove(id);

      expect(result).toBeDefined();
      expect(service.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if item not found', async () => {
      const id = 'nonExistingId';

      await expect(controller.remove(id)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
