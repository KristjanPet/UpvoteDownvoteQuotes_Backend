import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Public } from 'decorators/public.decorator'
import { User } from 'entities/user.entity'
import { RegisterUserDto } from './dto/register-user.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from 'interfaces/auth.interface'
import { Request, Response } from 'express'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger/dist/index'

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor) //so that the password is excluded
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse({ description: 'Signup user.' })
  @ApiBadRequestResponse({ description: 'Error signigup user' })
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserDto): Promise<User> {
    return this.authService.register(body)
  }

  @ApiCreatedResponse({ description: 'Login user.' })
  @ApiBadRequestResponse({ description: 'Error logging in' })
  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response): Promise<User> {
    const access_token = await this.authService.generateJwt(req.user)
    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' ? true : false,
      expires: new Date(Date.now() + 3600 * 1000 * 24 * 30 * 1),
    })
    return req.user
  }

  @ApiCreatedResponse({ description: 'Get logged in user.' })
  @ApiBadRequestResponse({ description: 'Error getting logedin user' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async user(@Req() req: Request): Promise<User> {
    const cookie = req.cookies['access_token']
    return this.authService.user(cookie)
  }

  @ApiCreatedResponse({ description: 'Signout user.' })
  @ApiBadRequestResponse({ description: 'Error signing out' })
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Res({ passthrough: true }) res: Response): Promise<{ msg: string }> {
    res.clearCookie('access_token')
    return { msg: 'Signout...' }
  }
}
