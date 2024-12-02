import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateItemDto extends PartialType(CreateItemDto) {

  @ApiProperty({
    description: 'Título do item',
    example: 'Meu Item',
  })
  @IsString({ message: 'O título deve ser uma string' })
  @Length(3, 50, { message: 'O título deve ter entre 3 e 50 caracteres' })
  @IsOptional()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do item',
    example: 'Este é um item muito interessante.',
  })
  @IsString({ message: 'A descrição deve ser uma string' })
  @Length(10, 200, { message: 'A descrição deve ter entre 10 e 200 caracteres' })
  @IsOptional()
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo de imagem para upload',
    required: false,
  })
  file?: any;

  @ApiProperty({
    description: 'Indica se a imagem existente deve ser removida',
    required: false,
    default: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  removeImage?: boolean;
}
