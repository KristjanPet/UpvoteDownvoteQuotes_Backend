import { Module } from '@nestjs/common'
import { QuoteController } from './quote.controller'
import { QuoteService } from './quote.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Quote } from 'entities/quote.entity'
import { MeModule } from 'modules/me/me.module'
import { AuthService } from 'modules/auth/auth.service'
import { JwtService } from '@nestjs/jwt'

@Module({
  imports: [TypeOrmModule.forFeature([Quote]), MeModule],
  controllers: [QuoteController],
  providers: [QuoteService, AuthService, JwtService],
  exports: [QuoteService],
})
export class QuoteModule {}
