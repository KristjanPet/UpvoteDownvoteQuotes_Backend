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
      // console.log(quote);
      // console.log(user);
      // console.log("---------------------------------");
      // console.log(quote.author);

      const newVote = this.voteRepository.create({ upDown, user, quote })
      // console.log(allVotes);
      if (quote.author.id === user.id) {
        throw new BadRequestException('Cant vote for your quote')
      }

      const existingVote = allVotes.find((val) => val.user.id === user.id && val.quote.id === quoteId)

      if (existingVote) {
        //cheks if user already voted
        if (existingVote.upDown === upDown) {
          throw new BadRequestException('User already voted for this quote')
        } else {
          //if ge changed the vote
          this.voteRepository.update(existingVote.id, newVote)
          Logging.warn(`Vote changed to: ${upDown}`)
          return quote
        }
      }

      // console.log(cookie);
      // console.log(user);
      // console.log(newVote);
      // console.log("SPET USTVAR NOUGA");
      this.voteRepository.save(newVote)
      return quote
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('something went wrong while voting')
    }
  }

  async countVotes(quoteId: string): Promise<number> {
    try {
      const allVotes = (await this.findAll(['user', 'quote'])) as Vote[]
      var number: number = 0
      // console.log(allVotes);

      allVotes.map((val) => {
        if (val.quote.id === quoteId) {
          //all votes for quote
          if (val.upDown) {
            number++
          } else {
            number--
          }
        }
      })

      return number
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('something went wrong while counting votes')
    }
  }
}
