import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'
import { AbstractService } from 'modules/common/abstract.service'
import { Repository } from 'typeorm'
import { CreateUserDto } from './Dto/create-user.dto'
import Logging from 'library/Logging'
import { UpdateUserDto } from './Dto/update-user.dto'
import { PostgresErrorCode } from 'helpers/postgresErrorCode.enum'
import { compareHash, hash } from 'utils/bcrypt'

@Injectable()
export class UsersService extends AbstractService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = (await this.findById(id)) as User
    const { email, password, confirm_password, ...data } = updateUserDto
    if (user.email !== email && email) {
      user.email = email
    }
    if (password && confirm_password) {
      if (password !== confirm_password) {
        throw new BadRequestException('Passwords do not match')
      }
      if (await compareHash(password, user.password)) {
        throw new BadRequestException('Passwords is same as old')
      }
      user.password = await hash(password)
    }

    // if (role_id) {
    //   user.role = { ...user.role, id: role_id }
    // }

    try {
      Object.entries(data).map((entry) => {
        user[entry[0]] = entry[1]
      })

      return this.userRepository.save(user)
    } catch (error) {
      Logging.error(error)
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('email already used')
      }
      throw new InternalServerErrorException('something went wrong updating user')
    }
  }

  async updateUserImageId(id: string, avatar: string): Promise<User> {
    const user = await this.findById(id)
    return this.update(user.id, { avatar })
  }
}
