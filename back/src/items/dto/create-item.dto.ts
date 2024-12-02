import { IsNotEmpty, IsString, IsOptional, IsUrl, Length } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

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
    @IsString({ message: 'A descrição deve ser uma string' })
    @Length(10, 200, { message: 'A descrição deve ter entre 10 e 200 caracteres' })
    @IsNotEmpty({ message: 'A descrição não pode estar vazia' })
    description: string;

    @IsUrl({}, { message: 'A URL da foto deve ser válida' })
    @ApiHideProperty()
    @IsOptional()
    photoUrl?: string;

    @IsString()
    @ApiHideProperty()
    @IsOptional()
    photo?: string;
}
