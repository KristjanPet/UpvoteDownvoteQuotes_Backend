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
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger/dist/index'

@ApiTags('Me')
@Controller('me')
@UseInterceptors(ClassSerializerInterceptor)
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly quoteService: QuoteService,
    private readonly authService: AuthService,
  ) {}

  @ApiCreatedResponse({ description: 'List all users.' })
  @ApiBadRequestResponse({ description: 'Error for list of users' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<User[]> {
    return this.meService.findAll()
  }

  @ApiCreatedResponse({ description: 'Get one user.' })
  @ApiBadRequestResponse({ description: 'Error getting one user' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.meService.findById(id)
  }

  @ApiCreatedResponse({ description: 'Create a user.' })
  @ApiBadRequestResponse({ description: 'Error for creating a user' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.meService.create(createUserDto)
  }

  @ApiCreatedResponse({ description: 'Create a quote.' })
  @ApiBadRequestResponse({ description: 'Error for creating a quote' })
  @Post('/myquote')
  @HttpCode(HttpStatus.OK)
  async createQuote(@Body() createQuoteDto: CreateQuoteDto, @Req() req: Request): Promise<Quote> {
    // console.log(req.cookies['access_token']);

    const cookie = req.cookies['access_token']
    return this.quoteService.create(createQuoteDto, cookie)
  }

  @ApiCreatedResponse({ description: 'Upload avatar for user.' })
  @ApiBadRequestResponse({ description: 'Error uploading avatar for user' })
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

  @ApiCreatedResponse({ description: 'Update users password.' })
  @ApiBadRequestResponse({ description: 'Error updating users password' })
  @Patch('/update-password')
  @HttpCode(HttpStatus.OK)
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request): Promise<User> {
    const cookie = req.cookies['access_token']
    return this.meService.update(cookie, updateUserDto)
  }

  @ApiCreatedResponse({ description: 'Update users quote.' })
  @ApiBadRequestResponse({ description: 'Error updating users quote' })
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

  @ApiCreatedResponse({ description: 'Delete user.' })
  @ApiBadRequestResponse({ description: 'Error deleting user' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<User> {
    return this.meService.remove(id)
  }

  @ApiCreatedResponse({ description: 'Delete users quote.' })
  @ApiBadRequestResponse({ description: 'Error deleting users quote' })
  @Delete('/quotes/:id')
  @HttpCode(HttpStatus.OK)
  async removeQuote(@Param('id') id: string, @Req() req: Request): Promise<Quote> {
    const cookie = req.cookies['access_token']
    return this.quoteService.removeQuote(id, cookie)
  }

  @ApiCreatedResponse({ description: 'Get number of quotes.' })
  @ApiBadRequestResponse({ description: 'Error getting number of quotes' })
  @Get(':id/quotes')
  @HttpCode(HttpStatus.OK)
  async countQuotes(@Param('id') id: string): Promise<number> {
    return this.meService.getQuotesNumber(id)
  }

  @ApiCreatedResponse({ description: 'Get number of up & down votes.' })
  @ApiBadRequestResponse({ description: 'Error getting number of up & down votes' })
  @Get(':id/votes')
  @HttpCode(HttpStatus.OK)
  async countVotes(@Param('id') id: string): Promise<number> {
    return this.meService.getVotesNumber(id)
  }
}
