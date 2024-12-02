import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema()
export class Item {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop()
    photoUrl: string;

    @Prop()
    photo: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
