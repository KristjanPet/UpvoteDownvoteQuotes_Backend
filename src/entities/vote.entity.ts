import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'
import { Quote } from './quote.entity'

@Entity()
export class Vote extends Base {
  @PrimaryColumn()
  userId: number

  @PrimaryColumn()
  quoteId: number

  @Column()
  upDown: boolean

  @ManyToOne(() => User, (user) => user.vote)
  @JoinColumn({ name: 'user_id' })
  user: User //mogoče array?

  @ManyToOne(() => Quote, (quote) => quote.vote)
  @JoinColumn({ name: 'quote_id' })
  quote: Quote //mogoče array?
}
