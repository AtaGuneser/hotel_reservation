import { ApiUser } from '../models/User'
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto'

export interface IUserService {
  connect(): Promise<void>
  findAll(): Promise<ApiUser[]>
  findById(id: string): Promise<ApiUser | null>
  findByEmail(email: string): Promise<ApiUser | null>
  create(userData: CreateUserDto): Promise<ApiUser>
  update(id: string, userData: UpdateUserDto): Promise<ApiUser>
  delete(id: string): Promise<boolean>
  authenticate(email: string, password: string): Promise<{ user: ApiUser; token: string }>
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>
  validateToken(token: string): Promise<{ valid: boolean; user?: ApiUser }>
}
