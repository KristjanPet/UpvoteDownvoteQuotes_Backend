import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Quote } from 'entities/quote.entity'
import { User } from 'entities/user.entity'
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

  async vote(quoteId: string, cookie: string, upDown: boolean): Promise<{ quote: Quote }> {
    try {
      const user = await this.authService.user(cookie)
      const quote = await this.quoteService.findById(quoteId, ['author'])
      const info = await this.checkVote(quoteId, cookie)
      // console.log(quote);
      // console.log(user);
      // console.log("---------------------------------");
      // console.log(quote.author);

      // const newVote = this.voteRepository.create({ upDown, user, quote })
      // console.log(allVotes);
      if (info.isAuthor) {
        throw new BadRequestException('Cant vote for your quote')
      }

      // const existingVote = allVotes.find((val) => val.user.id === user.id && val.quote.id === quoteId)

      if (info.didVote) {
        //cheks if user already voted
        if (info.upDown === upDown) {
          throw new BadRequestException('User already voted for this quote')
        } else {
          //if ge changed the vote
          this.voteRepository.update(info.vote.id, { upDown })
          Logging.warn(`Vote changed to: ${upDown}`)
          return quote
        }
      }

      // console.log(cookie);
      // console.log(user);
      // console.log(newVote);
      // console.log("SPET USTVAR NOUGA");
      const newVote = this.voteRepository.create({ upDown, user, quote })
      this.voteRepository.save(newVote)
      return { quote }
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('something went wrong while voting')
    }
  }

  async checkVote(
    quoteId: string,
    cookie: string,
  ): Promise<{ isAuthor: boolean; didVote?: boolean; upDown?: boolean; vote?: Vote }> {
    try {
      const allVotes = (await this.findAll(['user', 'quote'])) as Vote[]
      const user = await this.authService.user(cookie)
      const quote = await this.quoteService.findById(quoteId, ['author'])

      if (quote.author.id === user.id) {
        return { isAuthor: true }
      }

      const existingVote = allVotes.find((val) => val.user.id === user.id && val.quote.id === quote.id)

      if (existingVote) {
        //cheks if user already voted
        return { isAuthor: false, didVote: true, upDown: existingVote.upDown, vote: existingVote }
      } else {
        return { isAuthor: false, didVote: false }
      }
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('something went wrong while checking for vote')
    }
  }

  async getLikedQuotes(userId: string): Promise<Quote[]> {
    const votes = await this.repository.find({
      where: {
        user: { id: userId },
        upDown: true,
      },
      relations: ['quote', 'quote.author'], //MOGOČ POLEK ŠE AUTHOR
    })

    return votes.map((vote) => vote.quote)
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
