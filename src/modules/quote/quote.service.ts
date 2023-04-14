import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Quote } from 'entities/quote.entity'
import { AbstractService } from 'modules/common/abstract.service'
import { Repository } from 'typeorm'
import { CreateQuoteDto } from './dto/create-quote.dto'
import Logging from 'library/Logging'
import { AuthService } from 'modules/auth/auth.service'
import { User } from 'entities/user.entity'
import { UpdateQuoteDto } from './dto/update-quote.dto'

@Injectable()
export class QuoteService extends AbstractService {
  constructor(
    @InjectRepository(Quote) private readonly quoteRepository: Repository<Quote>,
    private readonly authService: AuthService,
  ) {
    super(quoteRepository)
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
    console.log(updateQuoteDto)

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
}
