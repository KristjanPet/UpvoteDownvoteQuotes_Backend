import { IsNotEmpty } from 'class-validator'
import { Match } from 'decorators/match.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateQuoteDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  text: string
}
