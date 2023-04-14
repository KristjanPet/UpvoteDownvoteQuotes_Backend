import { Module } from '@nestjs/common'
import { MeController } from './me.controller'
import { MeService } from './me.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'
import { Quote } from 'entities/quote.entity'
import { QuoteService } from 'modules/quote/quote.service'
import { AuthService } from 'modules/auth/auth.service'
import { JwtService } from '@nestjs/jwt'

@Module({
  imports: [TypeOrmModule.forFeature([User, Quote])],
  controllers: [MeController],
  providers: [MeService, QuoteService, AuthService, JwtService],
  exports: [MeService],
})
export class MeModule {}
