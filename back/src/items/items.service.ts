import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
    constructor(
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    ) {}

    async create(createItemDto: CreateItemDto): Promise<Item> {
        const createdItem = new this.itemModel(createItemDto);
        return createdItem.save();
    }

    async findAll(
      page: number = 1,
      limit: number = 10,
      sortBy: string = 'createdAt',
      order: 'asc' | 'desc' = 'asc',
      filter?: any,
    ): Promise<Item[]> {
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: order };
        return this.itemModel
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec();
    }

    async findOne(id: string): Promise<Item> {
        const item = await this.itemModel.findById(id).lean().exec();
        if (!item) {
            throw new NotFoundException(`Item com ID '${id}' não encontrado`);
        }
        return item;
    }

    async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
        const updatedItem = await this.itemModel
            .findByIdAndUpdate(id, updateItemDto, { new: true })
            .exec();
        if (!updatedItem) {
            throw new NotFoundException(`Item com ID '${id}' não encontrado`);
        }
        return updatedItem;
    }

    async remove(id: string): Promise<Item> {
        const deletedItem = await this.itemModel.findByIdAndDelete(id).exec();
        if (!deletedItem) {
            throw new NotFoundException(`Item com ID '${id}' não encontrado`);
        }
        return deletedItem;
    }
}
