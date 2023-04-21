import { Module, forwardRef } from '@nestjs/common'
import { VoteService } from './vote.service'
import { Vote } from 'entities/vote.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MeModule } from 'modules/me/me.module'
import { QuoteModule } from 'modules/quote/quote.module'
import { QuoteService } from 'modules/quote/quote.service'
import { AuthService } from 'modules/auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import { Quote } from 'entities/quote.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Quote]), forwardRef(() => MeModule), forwardRef(() => QuoteModule)],
  providers: [VoteService, QuoteService, AuthService, JwtService],
  exports: [VoteService],
})
export class VoteModule {}
