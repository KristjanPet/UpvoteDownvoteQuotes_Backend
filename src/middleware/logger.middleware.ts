import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import Logging from 'library/Logging'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    //geting the response log
    Logging.info(
      `Incoming -> Method [${req.method}] - url: ${req.originalUrl} - Host: ${req.hostname} - Ip: ${req.socket.remoteAddress}`,
    )

    if (next) {
      next()
    }
  }
}
