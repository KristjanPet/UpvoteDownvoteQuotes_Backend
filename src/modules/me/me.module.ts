import { Module } from '@nestjs/common'
import { MeController } from './me.controller'
import { MeService } from './me.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [MeController],
  providers: [MeService],
  exports: [MeService],
})
export class MeModule {}
