import { InternalServerErrorException } from '@nestjs/common'
import Logging from 'library/Logging'
import * as bcrypt from 'bcrypt'

export const hash = async (data: string, salt = 10): Promise<string> => {
  try {
    const generateSalt = await bcrypt.genSalt(salt)
    return bcrypt.hash(data, generateSalt)
  } catch (error) {
    Logging.error(error)
    throw new InternalServerErrorException('something went wrong while hashing')
  }
}

export const compareHash = async (data: string | Buffer, encryptedData: string): Promise<boolean> => {
  try {
    return bcrypt.compare(data, encryptedData)
  } catch (error) {
    Logging.error(error)
    throw new InternalServerErrorException('something went wrong comparing hash')
  }
}
