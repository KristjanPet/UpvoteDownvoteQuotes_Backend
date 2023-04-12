import { Module } from '@nestjs/common'
import { QuoteController } from './quote.controller'
import { QuoteService } from './quote.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Quote } from 'entities/quote.entity'
import { UsersModule } from 'modules/users/users.module'
import { AuthService } from 'modules/auth/auth.service'
import { JwtService } from '@nestjs/jwt'

@Module({
  imports: [TypeOrmModule.forFeature([Quote]), UsersModule],
  controllers: [QuoteController],
  providers: [QuoteService, AuthService, JwtService],
})
export class QuoteModule {}
