import { UseGuards } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import { User } from './user.entiity'

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
