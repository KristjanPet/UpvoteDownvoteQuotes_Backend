import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Quote } from 'entities/quote.entity'
import { Vote } from 'entities/vote.entity'
import Logging from 'library/Logging'
import { AuthService } from 'modules/auth/auth.service'
import { AbstractService } from 'modules/common/abstract.service'
import { QuoteService } from 'modules/quote/quote.service'
import { Repository } from 'typeorm'

@Injectable()
export class VoteService extends AbstractService {
  constructor(
    @InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
    private readonly authService: AuthService,
    @Inject(forwardRef(() => QuoteService))
    private readonly quoteService: QuoteService,
  ) {
    super(voteRepository)
  }

  async vote(quoteId: string, cookie: string, upDown: boolean): Promise<Quote> {
    try {
      const allVotes = (await this.findAll(['user', 'quote'])) as Vote[]
      const user = await this.authService.user(cookie)
      const quote = await this.quoteService.findById(quoteId, ['author'])
      const newVote = this.voteRepository.create({ upDown, user, quote })
      // console.log(allVotes);

      allVotes.map((val) => {
        if (val.user.id === user.id && val.quote.id === quoteId) {
          //cheks if user already voted
          if (val.upDown === upDown) {
            throw new BadRequestException('User already voted for this quote')
          } else {
            //if ge changed the vote
            this.voteRepository.update(val.id, newVote)
            Logging.warn(`Vote changed to: ${upDown}`)
            // return quote
          }
        } else {
          this.voteRepository.save(newVote)
        }
      })

      // console.log(cookie);
      // console.log(user);
      // console.log(newVote);

      return quote
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('something went wrong while voting up')
    }
  }
}
