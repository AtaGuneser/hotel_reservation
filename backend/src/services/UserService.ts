import { Service } from 'typedi'
import { IUserService } from '../interfaces/IUserService'
import { IUser, UserRole } from '../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/config'

@Service()
export class UserService implements IUserService {
  private users: IUser[] = []

  async findAll (): Promise<IUser[]> {
    return this.users
  }

  async findById (id: string): Promise<IUser | null> {
    return this.users.find(user => user.id === id) || null
  }

  async create (data: Partial<IUser>): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(data.password!, 10)

    const user: IUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email!,
      password: hashedPassword,
      firstName: data.firstName!,
      lastName: data.lastName!,
      role: data.role as UserRole || UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.users.push(user)
    return user
  }

  async update (id: string, data: Partial<IUser>): Promise<IUser | null> {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) return null

    const user = this.users[index]
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date()
    }

    this.users[index] = updatedUser
    return updatedUser
  }

  async delete (id: string): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) return false

    this.users.splice(index, 1)
    return true
  }

  async findByEmail (email: string): Promise<IUser | null> {
    return this.users.find(user => user.email === email) || null
  }

  async authenticate (
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    const user = await this.findByEmail(email)
    if (!user) {
      throw new Error('User not found')
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid password')
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    )

    return { user, token }
  }

  async changePassword (
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await this.findById(userId)
    if (!user) return false

    const isValidPassword = await bcrypt.compare(oldPassword, user.password)
    if (!isValidPassword) return false

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await this.update(userId, { password: hashedNewPassword })

    return true
  }
}
