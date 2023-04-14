import { IsNotEmpty, IsOptional, IsEmail, Matches, ValidateIf } from 'class-validator'
import { Match } from 'decorators/match.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty({ required: false })
  avatar?: string

  @ValidateIf((o) => typeof o.password === 'string' && o.password.lenght > 0)
  @IsOptional()
  @ApiProperty({ required: false })
  @Matches(/^(?=.*\d)[A-Za-z.\s_-]+[\w~@#$%^&*+=`|{}:;!.?"()[\]-]{6,}/, {
    message: 'password must have at least one number and stuff',
  })
  password?: string

  @ValidateIf((o) => typeof o.confirm_password === 'string' && o.confirm_password.lenght > 0)
  @IsOptional()
  @ApiProperty({ required: false })
  @Match(UpdateUserDto, (field) => field.password, { message: 'Passwords must match' })
  confirm_password?: string
}
