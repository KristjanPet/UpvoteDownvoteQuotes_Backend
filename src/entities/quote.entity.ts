import { Exclude } from 'class-transformer'
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'
import { Vote } from './vote.entity'

@Entity()
export class Quote extends Base {
  @Column({ nullable: true })
  text: string

  @ManyToOne(() => User, (user) => user.quote)
  @JoinColumn({ name: 'user_id' })
  author: User

  @OneToMany(() => Vote, (vote) => vote.quote)
  vote: Vote[]

  // @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'role_id' })
  // role: Role | null
}
