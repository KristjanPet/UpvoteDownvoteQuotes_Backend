import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from 'entities/user.entity'
import Logging from 'library/Logging'
import { UsersService } from 'modules/users/users.service'
import { compareHash, hash } from 'utils/bcrypt'
import { RegisterUserDto } from './dto/register-user.dto'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<User> {
    Logging.info('Validating user...')
    const user = await this.usersService.findBy({ email: email })
    if (!user) {
      throw new BadRequestException('Invalida credentials')
    }
    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException('Invalida credentials')
    }

    Logging.info('User is valid.')
    return user
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword: string = await hash(registerUserDto.password)
    return await this.usersService.create({
      ...registerUserDto,
      password: hashedPassword,
    })
  }

  async generateJwt(user: User): Promise<string> {
    return this.jwtService.signAsync({ sub: user.id, name: user.email })
  }

  async user(cookie: string): Promise<User> {
    const data = await this.jwtService.verifyAsync(cookie)
    return this.usersService.findById(data['id'])
  }

  //   async getUserId(request: Request): Promise<string> {
  //     const user = request.user as User
  //     return user.id
  //   }
}
