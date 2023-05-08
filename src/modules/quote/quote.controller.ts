import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  forwardRef,
} from '@nestjs/common'
import { QuoteService } from './quote.service'
import { Quote } from 'entities/quote.entity'
import { CreateQuoteDto } from './dto/create-quote.dto'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'
import { Public } from 'decorators/public.decorator'
import { Request, Response } from 'express'
import { VoteService } from 'modules/vote/vote.service'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger/dist/index'
import { Vote } from 'entities/vote.entity'
import { PaginatedResult } from 'interfaces/paginated-result.interface'

@ApiTags('Quotes')
@Controller('quotes')
export class QuoteController {
  constructor(
    private readonly quoteService: QuoteService,
    @Inject(forwardRef(() => VoteService))
    private readonly voteService: VoteService,
  ) {}

  @ApiCreatedResponse({ description: 'List all quotes with votes.' })
  @ApiBadRequestResponse({ description: 'Error for list of quotes' })
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('page') page: number): Promise<{ quote: Quote; votes: number }[]> {
    return await this.quoteService.findAllPaginated(page)
  }

  @ApiCreatedResponse({ description: 'All Quotes by sorted recent.' })
  @ApiBadRequestResponse({ description: 'Error for quote sorted recent' })
  @Public()
  @Get('/recent/get')
  @HttpCode(HttpStatus.OK)
  async findAllRecent(@Query('page') page: number): Promise<{ quote: Quote; votes: number }[]> {
    // console.log(await this.voteService.countVotes(id));
    return await this.quoteService.findAllRecentQuotes(page)
  }

  @ApiCreatedResponse({ description: 'Quote by id.' })
  @ApiBadRequestResponse({ description: 'Error for quote by id' })
  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<{ quote: Quote; voteNum: number }> {
    // console.log(await this.voteService.countVotes(id));
    const quote = await this.quoteService.findById(id, ['author'])
    const voteNum = await this.voteService.countVotes(id)

    return { quote, voteNum }
  }

  @ApiCreatedResponse({ description: 'Get random quote.' })
  @ApiBadRequestResponse({ description: 'Error getting random quote' })
  @Public()
  @Get('/random/get')
  @HttpCode(HttpStatus.OK)
  async findRandomQuote(): Promise<{ quote: Quote; votes: number }> {
    // console.log(await this.voteService.countVotes(id));
    return await this.quoteService.getRandomQuote()
  }

  @ApiCreatedResponse({ description: 'Quotes by UserId sorted recent.' })
  @ApiBadRequestResponse({ description: 'Error for quote by UserId sorted recent' })
  @Public()
  @Get(':id/recent')
  @HttpCode(HttpStatus.OK)
  async findRecentByUserId(
    @Param('id') userId: string,
    @Query('page') page: number,
  ): Promise<{ quote: Quote; votes: number }[]> {
    // console.log(await this.voteService.countVotes(id));
    return await this.quoteService.findRecentQuotesByAuthor(userId, page)
  }

  @ApiCreatedResponse({ description: 'Quotes by UserId sorted most liked.' })
  @ApiBadRequestResponse({ description: 'Error for quote by UserId sorted most liked' })
  @Public()
  @Get(':id/mostliked')
  @HttpCode(HttpStatus.OK)
  async findMostLikedByUserId(
    @Param('id') userId: string,
    @Query('page') page: number,
  ): Promise<{ quote: Quote; votes: number }[]> {
    // console.log(await this.voteService.countVotes(id));
    return await this.quoteService.findMostLikedQuotesByAuthor(userId, page)
  }

  @ApiCreatedResponse({ description: 'Quotes by UserId sorted recent.' })
  @ApiBadRequestResponse({ description: 'Error for quote by UserId sorted recent' })
  @Public()
  @Get(':id/liked')
  @HttpCode(HttpStatus.OK)
  async findLikedQuotesByUserId(
    @Param('id') userId: string,
    @Query('page') page: number,
  ): Promise<{ quote: Quote; votes: number }[]> {
    // console.log(await this.voteService.countVotes(id));
    return await this.quoteService.findLikedQuotesByUserId(userId, page)
  }

  @ApiCreatedResponse({ description: 'Up vote quote by id.' })
  @ApiBadRequestResponse({ description: 'Error up voting quote' })
  @Post(':id/upvote')
  @HttpCode(HttpStatus.OK)
  async upVote(@Param('id') id: string, @Req() req: Request): Promise<{ quote: Quote }> {
    // console.log(req.cookies['access_token']);

    const cookie = req.cookies['access_token']
    return this.voteService.vote(id, cookie, true)
  }

  @ApiCreatedResponse({ description: 'Down vote quote by id.' })
  @ApiBadRequestResponse({ description: 'Error down voting quote' })
  @Post(':id/downvote')
  @HttpCode(HttpStatus.OK)
  async downVote(@Param('id') id: string, @Req() req: Request): Promise<{ quote: Quote }> {
    // console.log(req.cookies['access_token']);

    const cookie = req.cookies['access_token']
    return this.voteService.vote(id, cookie, false)
  }

  @ApiCreatedResponse({ description: 'check for vote.' })
  @ApiBadRequestResponse({ description: 'Error checking for vote' })
  @Get(':id/check')
  @HttpCode(HttpStatus.OK)
  async checkVote(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ isAuthor: boolean; didVote?: boolean; upDown?: boolean; vote?: Vote }> {
    // console.log(req.cookies['access_token']);

    const cookie = req.cookies['access_token']
    return this.voteService.checkVote(id, cookie)
  }
}
