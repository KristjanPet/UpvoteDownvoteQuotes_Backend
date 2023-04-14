import { Module, forwardRef } from '@nestjs/common'
import { QuoteController } from './quote.controller'
import { QuoteService } from './quote.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Quote } from 'entities/quote.entity'
import { MeModule } from 'modules/me/me.module'
import { AuthService } from 'modules/auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import { VoteService } from 'modules/vote/vote.service'
import { VoteModule } from 'modules/vote/vote.module'
import { Vote } from 'entities/vote.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Quote, Vote]), MeModule, forwardRef(() => VoteModule)],
  controllers: [QuoteController],
  providers: [QuoteService, AuthService, JwtService, VoteService],
  exports: [QuoteService],
})
export class QuoteModule {}
