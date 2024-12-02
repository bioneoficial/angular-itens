import { CreateItemDto } from './create-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemWithFileDto extends CreateItemDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo de imagem para upload',
    required: false,
  })
  file?: any;
}
