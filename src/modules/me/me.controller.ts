import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common'
import { MeService } from './me.service'
import { User } from 'entities/user.entity'
import { CreateUserDto } from './Dto/create-user.dto'
import { UpdateUserDto } from './Dto/update-user.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { isFileExtensionSafe, removeFile, saveImageToStorage } from 'helpers/ikmageStorage'
import { join } from 'path'
import { CreateQuoteDto } from 'modules/quote/dto/create-quote.dto'
import { Quote } from 'entities/quote.entity'
import { QuoteService } from 'modules/quote/quote.service'
import { Request, Response } from 'express'
import { AuthService } from 'modules/auth/auth.service'
import { UpdateQuoteDto } from 'modules/quote/dto/update-quote.dto'
// import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger/dist/index'

// @ApiTags('Me')
@Controller('me')
@UseInterceptors(ClassSerializerInterceptor)
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly quoteService: QuoteService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.meService.findById(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.meService.create(createUserDto)
  }

  @Post('/myquote')
  @HttpCode(HttpStatus.OK)
  async createQuote(@Body() createQuoteDto: CreateQuoteDto, @Req() req: Request): Promise<Quote> {
    // console.log(req.cookies['access_token']);

    const cookie = req.cookies['access_token']
    return this.quoteService.create(createQuoteDto, cookie)
  }

  @Post('/myquote')
  @HttpCode(HttpStatus.OK)
  async createQuote(@Body() createQuoteDto: CreateQuoteDto, @Req() req: Request): Promise<Quote> {
    // console.log(req.cookies['access_token']);

    const cookie = req.cookies['access_token']
    return this.quoteService.create(createQuoteDto, cookie)
  }

  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
  @HttpCode(HttpStatus.CREATED)
  async upload(@UploadedFile() file: Express.Multer.File, @Param('id') id: string): Promise<User> {
    const filename = file.filename

    if (!filename) throw new BadRequestException('file must be png jpg or jpeg')

    const imageFolderPath = join(process.cwd(), 'files')
    const fullImagePath = join(imageFolderPath + '/' + file.filename)
    if (await isFileExtensionSafe(fullImagePath)) {
      return this.meService.updateUserImageId(id, filename)
    }
    removeFile(fullImagePath)
    throw new BadRequestException('File content does not match')
  }

  @Patch('/update-password')
  @HttpCode(HttpStatus.OK)
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request): Promise<User> {
    const cookie = req.cookies['access_token']
    return this.meService.update(cookie, updateUserDto)
  }

  @Patch('/quotes/:id')
  @HttpCode(HttpStatus.OK)
  async updateQuote(
    @Param('id') quoteId: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
    @Req() req: Request,
  ): Promise<Quote> {
    const cookie = req.cookies['access_token']
    return this.quoteService.update(quoteId, cookie, updateQuoteDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<User> {
    return this.meService.remove(id)
  }

  @Delete('/quotes/:id')
  @HttpCode(HttpStatus.OK)
  async removeQuote(@Param('id') id: string, @Req() req: Request): Promise<Quote> {
    const cookie = req.cookies['access_token']
    return this.quoteService.removeQuote(id, cookie)
  }

  @Delete('/quotes/:id')
  @HttpCode(HttpStatus.OK)
  async removeQuote(@Param('id') id: string, @Req() req: Request): Promise<Quote> {
    const cookie = req.cookies['access_token']
    return this.quoteService.removeQuote(id, cookie)
  }
}
