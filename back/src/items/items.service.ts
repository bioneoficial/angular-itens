import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import * as path from 'node:path';
import * as fs from 'node:fs';

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
    ): Promise<any> {
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: order };

        const totalItems = await this.itemModel.countDocuments(filter).exec();

        const items = await this.itemModel
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec();

        const totalPages = Math.ceil(totalItems / limit);

        return {
            items,
            meta: {
                totalItems,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        };
    }

    async findOne(id: string): Promise<Item> {
        const item = await this.itemModel.findById(id).lean().exec();
        if (!item) {
            throw new NotFoundException(`Item com ID '${id}' não encontrado`);
        }
        return item;
    }

    async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
        const existingItem = await this.itemModel.findById(id).exec();
        if (!existingItem) {
            throw new NotFoundException(`Item com ID '${id}' não encontrado`);
        }

        if (updateItemDto.photo && existingItem.photo) {
            const oldImagePath = path.join(
              __dirname,
              '..',
              '..',
              'uploads',
              existingItem.photo,
            );
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        return await this.itemModel
          .findByIdAndUpdate(id, updateItemDto, { new: true })
          .lean()
          .exec();
    }

    async remove(id: string): Promise<Item> {
        const deletedItem = await this.itemModel.findByIdAndDelete(id).exec();
        if (!deletedItem) {
            throw new NotFoundException(`Item com ID '${id}' não encontrado`);
        }

        if (deletedItem.photo) {
            const imagePath = path.join(
              __dirname,
              '..',
              '..',
              'uploads',
              deletedItem.photo,
            );
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        return deletedItem;
    }
}
