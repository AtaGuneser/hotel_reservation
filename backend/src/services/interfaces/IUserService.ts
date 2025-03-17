import { IUser } from '../../models/User'
import { IBaseService } from './IBaseService'

export interface IUserService extends IBaseService<Omit<IUser, 'password'>> {
  findByEmail(email: string): Promise<Omit<IUser, 'password'> | null>
  authenticate(
    email: string,
    password: string
  ): Promise<{ user: Omit<IUser, 'password'>; token: string }>
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean>
}
