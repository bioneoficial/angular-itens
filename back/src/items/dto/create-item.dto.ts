import { IsNotEmpty, IsString, IsOptional, IsUrl, Length } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateItemDto {
    @ApiProperty({
        description: 'Título do item',
        example: 'Meu Item',
    })
    @IsString({ message: 'O título deve ser uma string' })
    @Length(3, 50, { message: 'O título deve ter entre 3 e 50 caracteres' })
    @IsNotEmpty({ message: 'O título não pode estar vazio' })
    title: string;

    @ApiProperty({
        description: 'Descrição detalhada do item',
        example: 'Este é um item muito interessante.',
    })
    @IsNotEmpty({ message: 'A descrição não pode estar vazia' })
    @IsString({ message: 'A descrição deve ser uma string' })
    @Length(10, 200, { message: 'A descrição deve ter entre 10 e 200 caracteres' })
    description: string;

    @ApiProperty({
        description: 'URL da foto do item',
        example: 'http://bione.com/lindo.jpg',
        required: false,
    })
    @IsUrl({}, { message: 'A URL da foto deve ser válida' })
    @IsOptional()
    photoUrl?: string;

    @ApiProperty({
        description: 'Nome do arquivo da foto',
        example: 'resized-uuidv4().jpg',
        required: false,
    })
    @IsString()
    @IsOptional()
    photo?: string;
}
