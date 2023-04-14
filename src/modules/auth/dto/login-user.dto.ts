// import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginUserDto {
  // @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true })
  email: string

  // @ApiProperty({ required: true })
  @IsNotEmpty()
  @ApiProperty({ required: true })
  password: string
}
