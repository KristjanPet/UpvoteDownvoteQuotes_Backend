import { BadRequestException, Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'
import { AbstractService } from 'modules/common/abstract.service'
import { Repository } from 'typeorm'
import { CreateUserDto } from './Dto/create-user.dto'
import Logging from 'library/Logging'
import { UpdateUserDto } from './Dto/update-user.dto'
import { PostgresErrorCode } from 'helpers/postgresErrorCode.enum'
import { compareHash, hash } from 'utils/bcrypt'
import { AuthService } from 'modules/auth/auth.service'

@Injectable()
export class MeService extends AbstractService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    // @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    super(userRepository)
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findBy({ email: createUserDto.email })
    if (user) {
      throw new BadRequestException('User already exist')
    }
    try {
      const newUser = this.userRepository.create({ ...createUserDto })
      return this.userRepository.save(newUser)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('something went wrong while creating a new user')
    }
  }

  async update(cookie: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = (await this.authService.user(cookie)) as User
    const { password, confirm_password, ...data } = updateUserDto

    if (password && confirm_password) {
      if (password !== confirm_password) {
        throw new BadRequestException('Passwords do not match')
      }
      if (await compareHash(password, user.password)) {
        throw new BadRequestException('Passwords is same as old')
      }
      user.password = await hash(password)
    }

    try {
      Object.entries(data).map((entry) => {
        user[entry[0]] = entry[1]
      })

      return this.userRepository.save(user)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('something went wrong updating user')
    }
  }

  async updateUserImageId(id: string, avatar: string): Promise<User> {
    const user = await this.findById(id)
    return this.update(user.id, { avatar })
  }
}
