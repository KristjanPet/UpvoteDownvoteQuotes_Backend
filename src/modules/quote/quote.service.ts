import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Quote } from 'entities/quote.entity'
import { AbstractService } from 'modules/common/abstract.service'
import { Repository } from 'typeorm'
import { CreateQuoteDto } from './dto/create-quote.dto'
import Logging from 'library/Logging'
import { AuthService } from 'modules/auth/auth.service'

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
      const newquote = this.quoteRepository.create({ ...createQuoteDto })
      // console.log(cookie);

      const user = await this.authService.user(cookie)
      // console.log(user);

      newquote.author = user
      return this.quoteRepository.save(newquote)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('something went wrong while creating a new quote')
    }
  }
}
