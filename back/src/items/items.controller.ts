import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    HttpCode,
    HttpStatus, UploadedFile, UseInterceptors, BadRequestException, Query, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import sharp from 'sharp';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'node:fs';
import { CreateItemWithFileDto } from './dto/create-item-with-file.dto';
import { ConfigService } from '@nestjs/config';

const imageFileFilter = (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(
          new BadRequestException('Apenas arquivos de imagem são permitidos.'),
          false,
        );
    }
    callback(null, true);
};

@ApiTags('items')
@Controller('items')
export class ItemsController {

    constructor(
      private readonly itemsService: ItemsService,
      private readonly configService: ConfigService
    ) {
    }

    @Post()
    @UseInterceptors(
      FileInterceptor('file', {
          fileFilter: imageFileFilter,
          limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Dados do item e imagem para upload',
        type: CreateItemWithFileDto,
    })
    @ApiOperation({ summary: 'Criar um novo item com imagem' })
    @ApiResponse({ status: 201, description: 'Item criado com sucesso.' })
    async create(
      @UploadedFile() file: Express.Multer.File,
      @Body() createItemDto: CreateItemDto,
    ) {
        if (file) {
            const imagePath = path.join(__dirname, '..', '..', file.path);
            const resizedImagePath = path.join(
              __dirname,
              '..',
              '..',
              'uploads',
              `resized-${file.filename}`,
            );

            await sharp(imagePath)
              .resize(500, 500)
              .toFile(resizedImagePath);

            fs.unlinkSync(imagePath);

            createItemDto.photo = `resized-${file.filename}`;
            const hostUrl = this.configService.get<string>('HOST_URL') || 'http://localhost:3000';
            createItemDto.photoUrl = `${hostUrl}/uploads/resized-${file.filename}`;
        }

        return this.itemsService.create(createItemDto);
    }


    @Get()
    @ApiOperation({ summary: 'Listar todos os itens com paginação, ordenação e filtros' })
    @ApiResponse({ status: 200, description: 'Lista de itens retornada com sucesso.' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'title' })
    @ApiQuery({ name: 'order', required: false, type: String, enum: ['asc', 'desc'], example: 'asc' })
    async findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
      @Query('order', new DefaultValuePipe('asc')) order: 'asc' | 'desc',
    ) {
        return this.itemsService.findAll(page, limit, sortBy, order);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obter um item pelo ID' })
    @ApiParam({ name: 'id', description: 'ID do item' })
    @ApiResponse({ status: 200, description: 'Item retornado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Item não encontrado.' })
    findOne(@Param('id') id: string) {
        return this.itemsService.findOne(id);
    }

    @Put(':id')
    @UseInterceptors(
      FileInterceptor('file', {
          fileFilter: imageFileFilter,
          limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Dados do item e imagem para upload',
        type: UpdateItemDto,
    })
    @ApiOperation({ summary: 'Atualizar um item pelo ID' })
    @ApiParam({ name: 'id', description: 'ID do item' })
    @ApiResponse({ status: 200, description: 'Item atualizado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Item não encontrado.' })
    async update(
      @Param('id') id: string,
      @UploadedFile() file: Express.Multer.File,
      @Body() updateItemDto: UpdateItemDto,
    ) {
        const existingItem = await this.itemsService.findOne(id);

        if (file) {
            const imagePath = path.join(__dirname, '..', '..', file.path);
            const resizedImagePath = path.join(
              __dirname,
              '..',
              '..',
              'uploads',
              `resized-${file.filename}`,
            );

            await sharp(imagePath)
              .resize(500, 500)
              .toFile(resizedImagePath);

            fs.unlinkSync(imagePath);

            if (existingItem.photo) {
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

            updateItemDto.photo = `resized-${file.filename}`;
            const hostUrl = this.configService.get<string>('HOST_URL') || 'http://localhost:3000';
            updateItemDto.photoUrl = `${hostUrl}/uploads/resized-${file.filename}`;

        }
        if (updateItemDto.removeImage) {
            if (existingItem.photo) {
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
            updateItemDto.photo = '';
            updateItemDto.photoUrl = '';
        }

        return this.itemsService.update(id, updateItemDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remover um item pelo ID' })
    @ApiParam({ name: 'id', description: 'ID do item' })
    @ApiResponse({ status: 204, description: 'Item removido com sucesso.' })
    @ApiResponse({ status: 404, description: 'Item não encontrado.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.itemsService.remove(id);
    }
}
