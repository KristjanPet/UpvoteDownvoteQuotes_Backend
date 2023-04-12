import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'
import { QuoteService } from './quote.service'
import { Quote } from 'entities/quote.entity'
import { CreateQuoteDto } from './dto/create-quote.dto'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'
import { Public } from 'decorators/public.decorator'
import { Request, Response } from 'express'

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Quote[]> {
    return this.quoteService.findAll()
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createQuoteDto: CreateQuoteDto, @Req() req: Request): Promise<Quote> {
    // console.log(req.cookies['access_token']);

    const cookie = req.cookies['access_token']
    return this.quoteService.create(createQuoteDto, cookie)
  }
}
