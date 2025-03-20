import { ObjectId } from 'mongodb'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

/** Base properties for user tracking */
type BaseUser = {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

/** Database representation of a user */
export type DbUser = BaseUser & {
  _id: ObjectId
}

/** API representation of a user */
export type ApiUser = Omit<BaseUser, 'password'> & {
  id: string
}

/** User with password for authentication */
export type UserWithPassword = BaseUser & {
  id: string
}

/** MongoDB collection name */
export const USERS_COLLECTION = 'users'
