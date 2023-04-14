import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
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
  async findAll(): Promise<{ quote: Quote; votes: number }[]> {
    const allQuotes = await this.quoteService.findAll(['author'])

    const quoteWithVotes = await Promise.all(
      allQuotes.map(async (quote) => {
        const votes = await this.voteService.countVotes(quote.id)
        return { quote, votes }
      }),
    )
    quoteWithVotes.sort((a, b) => b.votes - a.votes)

    return quoteWithVotes
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

  @ApiCreatedResponse({ description: 'Up vote quote by id.' })
  @ApiBadRequestResponse({ description: 'Error up voting quote' })
  @Post(':id/upvote')
  @HttpCode(HttpStatus.OK)
  async upVote(@Param('id') id: string, @Req() req: Request): Promise<Quote> {
    // console.log(req.cookies['access_token']);

    const cookie = req.cookies['access_token']
    return this.voteService.vote(id, cookie, true)
  }

  @ApiCreatedResponse({ description: 'Down vote quote by id.' })
  @ApiBadRequestResponse({ description: 'Error down voting quote' })
  @Post(':id/downvote')
  @HttpCode(HttpStatus.OK)
  async downVote(@Param('id') id: string, @Req() req: Request): Promise<Quote> {
    // console.log(req.cookies['access_token']);

    const cookie = req.cookies['access_token']
    return this.voteService.vote(id, cookie, false)
  }
}
