import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    HttpCode,
    HttpStatus, UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import sharp from 'sharp';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'node:fs';
import { ConfigService } from '@nestjs/config';
import { CreateItemWithFileDto } from './dto/create-item-with-file.dto';
import { FileUploadDto } from './dto/file-upload.dto';

const configService = new ConfigService();
const uploadDir = configService.get<string>('UPLOADS_FOLDER') || './uploads';

const  storage = diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const fileExtName = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtName}`;
        cb(null, fileName);
    },
});

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
    constructor(private readonly itemsService: ItemsService) {}

    @Post()
    @UseInterceptors(
      FileInterceptor('file', {
          storage: storage,
          fileFilter: imageFileFilter,
          limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
              .resize(500, 500) // 500x500 pixels
              .toFile(resizedImagePath);

            fs.unlinkSync(imagePath);

            createItemDto.photo = `resized-${file.filename}`;
            createItemDto.photoUrl = `${process.env.HOST_URL}/uploads/resized-${file.filename}`;
        }

        return this.itemsService.create(createItemDto);
    }


    @Post('upload')
    @UseInterceptors(
      FileInterceptor('file', {
          storage: storage,
          fileFilter: imageFileFilter,
          limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Arquivo de imagem para upload',
        type: FileUploadDto,
    })
    @ApiOperation({ summary: 'Fazer upload de uma imagem' })
    @ApiResponse({ status: 201, description: 'Imagem enviada com sucesso.' })
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const imagePath = path.join(__dirname, '..', '..', file.path);
        const resizedImagePath = path.join(
          __dirname,
          '..',
          '..',
          'uploads',
          `resized-${file.filename}`,
        );

        await sharp(imagePath)
          .resize(500, 500) // 500x500 pixels
          .toFile(resizedImagePath);

        fs.unlinkSync(imagePath);

        return {
            message: 'Imagem enviada e processada com sucesso',
            fileName: `resized-${file.filename}`,
        };
    }


    @Get()
    @ApiOperation({ summary: 'Listar todos os itens' })
    @ApiResponse({ status: 200, description: 'Lista de itens retornada com sucesso.' })
    findAll() {
        return this.itemsService.findAll();
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
    @ApiOperation({ summary: 'Atualizar um item pelo ID' })
    @ApiParam({ name: 'id', description: 'ID do item' })
    @ApiResponse({ status: 200, description: 'Item atualizado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Item não encontrado.' })
    update(
        @Param('id') id: string,
        @Body() updateItemDto: UpdateItemDto,
    ) {
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
