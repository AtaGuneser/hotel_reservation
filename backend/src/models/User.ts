export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface IUser {
  id?: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date
}

export class User implements IUser {
  id?: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date

  constructor (data: Partial<IUser>) {
    this.email = data.email!
    this.password = data.password!
    this.firstName = data.firstName!
    this.lastName = data.lastName!
    this.role = data.role || UserRole.USER
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  toJSON (): Omit<IUser, 'password'> {
    const { password, ...userWithoutPassword } = this
    return userWithoutPassword
  }
}
