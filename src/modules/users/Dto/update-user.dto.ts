import { IsNotEmpty, IsOptional, IsEmail, Matches, ValidateIf } from 'class-validator'
import { Match } from 'decorators/match.decorator'

export class UpdateUserDto {
  @IsOptional()
  first_name?: string

  @IsOptional()
  last_name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  refresh_token?: string

  @IsOptional()
  avatar?: string

  @ValidateIf((o) => typeof o.password === 'string' && o.password.lenght > 0)
  @IsOptional()
  @Matches(/^(?=.*\d)[A-Za-z.\s_-]+[\w~@#$%^&*+=`|{}:;!.?"()[\]-]{6,}/, {
    message: 'password must have at least one number and stuff',
  })
  password?: string

  @ValidateIf((o) => typeof o.confirm_password === 'string' && o.confirm_password.lenght > 0)
  @IsOptional()
  @Match(UpdateUserDto, (field) => field.password, { message: 'Passwords must match' })
  confirm_password?: string
}
