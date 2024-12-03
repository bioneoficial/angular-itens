import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ItemDocument = HydratedDocument<Item>;
@Schema()
export class Item {
    _id?: Types.ObjectId;

    @ApiProperty({ description: 'Título do item' })
    @Prop({ required: true })
    title: string;

    @ApiProperty({ description: 'Descrição do item' })
    @Prop({ required: true })
    description: string;

    @ApiProperty({ description: 'URL da foto do item', required: false })
    @Prop()
    photoUrl: string;

    @ApiProperty({ description: 'Nome do arquivo da foto', required: false })
    @Prop()
    photo: string;

}

export const ItemSchema = SchemaFactory.createForClass(Item);
