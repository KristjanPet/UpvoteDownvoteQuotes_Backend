import { BadRequestException, Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Quote } from 'entities/quote.entity'
import { AbstractService } from 'modules/common/abstract.service'
import { Repository } from 'typeorm'
import { CreateQuoteDto } from './dto/create-quote.dto'
import Logging from 'library/Logging'
import { AuthService } from 'modules/auth/auth.service'
import { User } from 'entities/user.entity'
import { UpdateQuoteDto } from './dto/update-quote.dto'
import { VoteService } from 'modules/vote/vote.service'

@Injectable()
export class QuoteService extends AbstractService {
  constructor(
    @InjectRepository(Quote) private readonly quoteRepository: Repository<Quote>,
    private readonly authService: AuthService,
    @Inject(forwardRef(() => VoteService))
    private readonly voteService: VoteService,
  ) {
    super(quoteRepository)
  }

  async findAllPaginated(page: number): Promise<{ quote: Quote; votes: number }[]> {
    try {
      const allQuotes = await this.findAll(['author'])
      const allQuotesWithVotes = await this.sortByVotes(allQuotes)
      return allQuotesWithVotes.slice(0, page * 9)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('something went wrong while searching for all')
    }
  }

  async create(createQuoteDto: CreateQuoteDto, cookie: string): Promise<Quote> {
    try {
      // console.log(cookie);
      const user = await this.authService.user(cookie)
      // console.log(user);

      const newquote = this.quoteRepository.create({ ...createQuoteDto, author: user })
      return this.quoteRepository.save(newquote)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('something went wrong while creating a new quote')
    }
  }

  async update(quoteId: string, cookie: string, updateQuoteDto: UpdateQuoteDto): Promise<Quote> {
    const user = (await this.authService.user(cookie)) as User
    const quote = await this.findById(quoteId, ['author'])
    // console.log(updateQuoteDto)

    if (quote.author.id !== user.id) {
      throw new BadRequestException('No premission to update this quote')
    }
    quote.text = updateQuoteDto.text

    try {
      this.quoteRepository.update(quoteId, quote)
      return quote
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('something went wrong while updating quote')
    }
  }

  async removeQuote(id: string, cookie: string): Promise<Quote> {
    const quote = await this.findById(id, ['author'])
    const user = (await this.authService.user(cookie)) as User

    if (quote.author.id !== user.id) {
      throw new BadRequestException('No premission to delete this quote')
    }

    try {
      return this.repository.remove(quote)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException(`Something went wrong while deleting quote`)
    }
  }

  async sortByVotes(quotes: Quote[]): Promise<{ quote: Quote; votes: number }[]> {
    const quoteWithVotes = await Promise.all(
      quotes.map(async (quote) => {
        const votes = await this.voteService.countVotes(quote.id)
        return { quote, votes }
      }),
    )
    quoteWithVotes.sort((a, b) => b.votes - a.votes)

    return quoteWithVotes
  }

  async getRandomQuote(): Promise<{ quote: Quote; votes: number }> {
    try {
      const allQuotes = await this.quoteRepository.find({
        relations: ['author'],
      })

      // Get a random quote
      const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)]

      // Sort the quote by votes
      const sortedQuote = await this.sortByVotes([randomQuote])

      return sortedQuote[0]
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while getting a random quote sorted by votes')
    }
  }

  async findRecentQuotesByAuthor(userId: string, page: number): Promise<{ quote: Quote; votes: number }[]> {
    try {
      const quotes = await this.quoteRepository.find({
        where: { author: { id: userId } },
        relations: ['author'],
        order: { created_at: 'DESC' },
        take: page * 4,
      })
      const voteNumPromises = await quotes.map((quote) => this.voteService.countVotes(quote.id))
      const votes = await Promise.all(voteNumPromises)

      return quotes.map((quote, index) => ({ quote, votes: votes[index] }))
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for quotes by author')
    }
  }

  async findAllRecentQuotes(page: number): Promise<{ quote: Quote; votes: number }[]> {
    try {
      const quotes = await this.quoteRepository.find({
        relations: ['author'],
        order: { created_at: 'DESC' },
        take: page * 9,
      })
      const voteNumPromises = await quotes.map((quote) => this.voteService.countVotes(quote.id))
      const voteNum = await Promise.all(voteNumPromises)
      const quotesWithVoteNum = quotes.map((quote, index) => {
        return {
          quote,
          votes: voteNum[index],
        }
      })

      return quotesWithVoteNum
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for quotes sorted recent')
    }
  }

  async findMostLikedQuotesByAuthor(userId: string, page: number): Promise<{ quote: Quote; votes: number }[]> {
    try {
      const quotes = await this.quoteRepository.find({
        where: { author: { id: userId } },
        relations: ['author'],
      })
      const allQuotesWithVotes = await this.sortByVotes(quotes)

      return allQuotesWithVotes.slice(0, page * 4)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for quotes by author')
    }
  }

  async findLikedQuotesByUserId(userId: string, page: number): Promise<{ quote: Quote; votes: number }[]> {
    try {
      const quotes = await this.voteService.getLikedQuotes(userId)
      const sortedQuotes = await this.sortByVotes(quotes)

      return sortedQuotes.slice(0, page * 4)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for quotes by author')
    }
  }
}
