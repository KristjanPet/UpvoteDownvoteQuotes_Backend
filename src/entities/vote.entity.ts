import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'
import { Quote } from './quote.entity'

@Entity()
export class Vote extends Base {
  @Column()
  upDown: boolean

  @ManyToOne(() => User, (user) => user.vote)
  @JoinColumn({ name: 'userId' })
  user: User //mogoče array?

  @ManyToOne(() => Quote, (quote) => quote.vote)
  @JoinColumn({ name: 'quoteId' })
  quote: Quote //mogoče array?
}
