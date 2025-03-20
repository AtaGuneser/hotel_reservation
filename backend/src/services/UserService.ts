import { Service } from 'typedi'
import { Collection, ObjectId } from 'mongodb'
import { MongoClient } from 'mongodb'
import { IUserService } from '../interfaces/IUserService'
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto'
import { ApiUser, DbUser, UserRole } from '../models/User'
import { logger } from '../utils/logger'
import bcrypt from 'bcrypt'
import jwt, { SignOptions, Secret } from 'jsonwebtoken'
import { jwtConfig } from '../config/jwt.config'
import { BadRequestError, NotFoundError, UnauthorizedError } from 'routing-controllers'

@Service()
export class UserService implements IUserService {
  private client: MongoClient | null = null
  private collection: Collection<DbUser> | null = null
  private readonly MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  private readonly DB_NAME = process.env.DB_NAME || 'hotel_reservation'

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to MongoDB for UserService...')
      this.client = new MongoClient(this.MONGODB_URI)
      await this.client.connect()
      logger.info('Connected to MongoDB')
      
      const db = this.client.db(this.DB_NAME)
      this.collection = db.collection<DbUser>('users')
      
      // Create indexes for faster lookups
      await this.collection.createIndex({ email: 1 }, { unique: true })
      logger.info('UserService initialized successfully')
    } catch (error) {
      logger.error('Failed to connect to MongoDB', error)
      throw error
    }
  }

  private async getCollection(): Promise<Collection<DbUser>> {
    if (!this.collection) {
      await this.connect()
    }
    
    if (!this.collection) {
      throw new Error('Failed to get users collection')
    }
    
    return this.collection
  }

  private transformToApi = (dbUser: DbUser): ApiUser => {
    // Destructure to remove password and rename _id to id
    const { _id, password, ...rest } = dbUser
    return {
      ...rest,
      id: _id.toString()
    }
  }

  async findAll(): Promise<ApiUser[]> {
    try {
      logger.info('Finding all users')
      const collection = await this.getCollection()
      const users = await collection.find().toArray()
      return users.map(this.transformToApi)
    } catch (error) {
      logger.error('Error finding all users', error)
      throw error
    }
  }

  async findById(id: string): Promise<ApiUser | null> {
    try {
      logger.info(`Finding user by ID: ${id}`)
      const collection = await this.getCollection()
      
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError(`Invalid user ID: ${id}`)
      }
      
      const user = await collection.findOne({ _id: new ObjectId(id) })
      
      if (!user) {
        return null
      }
      
      return this.transformToApi(user)
    } catch (error) {
      logger.error(`Error finding user by ID: ${id}`, error)
      throw error
    }
  }

  async findByEmail(email: string): Promise<ApiUser | null> {
    try {
      logger.info(`Finding user by email: ${email}`)
      const collection = await this.getCollection()
      const user = await collection.findOne({ email: email.toLowerCase() })
      
      if (!user) {
        return null
      }
      
      return this.transformToApi(user)
    } catch (error) {
      logger.error(`Error finding user by email: ${email}`, error)
      throw error
    }
  }

  async create(userData: CreateUserDto): Promise<ApiUser> {
    try {
      logger.info(`Creating user with email: ${userData.email}`)
      const collection = await this.getCollection()
      
      // Check if user with this email already exists
      const existingUser = await collection.findOne({ email: userData.email.toLowerCase() })
      if (existingUser) {
        throw new BadRequestError(`User with email ${userData.email} already exists`)
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(userData.password, salt)
      
      const now = new Date()
      
      // Create new user
      const newUser: DbUser = {
        _id: new ObjectId(),
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || UserRole.USER,
        createdAt: now,
        updatedAt: now
      }
      
      const result = await collection.insertOne(newUser)
      
      if (!result.acknowledged) {
        throw new Error('Failed to create user')
      }
      
      return this.transformToApi(newUser)
    } catch (error) {
      logger.error('Error creating user', error)
      throw error
    }
  }

  async update(id: string, userData: UpdateUserDto): Promise<ApiUser> {
    try {
      logger.info(`Updating user with ID: ${id}`)
      const collection = await this.getCollection()
      
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError(`Invalid user ID: ${id}`)
      }
      
      // Check if user exists
      const existingUser = await collection.findOne({ _id: new ObjectId(id) })
      if (!existingUser) {
        throw new NotFoundError(`User with ID ${id} not found`)
      }
      
      // If trying to update email, make sure it's not already taken
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await collection.findOne({ 
          email: userData.email.toLowerCase(),
          _id: { $ne: new ObjectId(id) }
        })
        
        if (emailExists) {
          throw new BadRequestError(`Email ${userData.email} is already in use`)
        }
      }
      
      // If updating password, hash it
      let hashedPassword: string | undefined
      if (userData.password) {
        const salt = await bcrypt.genSalt(10)
        hashedPassword = await bcrypt.hash(userData.password, salt)
      }
      
      const updateData: Partial<DbUser> = {
        ...(userData.email && { email: userData.email.toLowerCase() }),
        ...(userData.firstName && { firstName: userData.firstName }),
        ...(userData.lastName && { lastName: userData.lastName }),
        ...(userData.role && { role: userData.role }),
        ...(hashedPassword && { password: hashedPassword }),
        updatedAt: new Date()
      }
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
      
      if (!result) {
        throw new Error('Failed to update user')
      }
      
      return this.transformToApi(result)
    } catch (error) {
      logger.error(`Error updating user with ID: ${id}`, error)
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting user with ID: ${id}`)
      const collection = await this.getCollection()
      
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError(`Invalid user ID: ${id}`)
      }
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      
      if (result.deletedCount === 0) {
        throw new NotFoundError(`User with ID ${id} not found`)
      }
      
      return true
    } catch (error) {
      logger.error(`Error deleting user with ID: ${id}`, error)
      throw error
    }
  }

  async authenticate(email: string, password: string): Promise<{ user: ApiUser; token: string }> {
    try {
      logger.info(`Authenticating user with email: ${email}`)
      const collection = await this.getCollection()
      
      // Find user by email
      const user = await collection.findOne({ email: email.toLowerCase() })
      
      // If user not found or password is incorrect
      if (!user) {
        throw new UnauthorizedError('Invalid email or password')
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password')
      }
      
      // Generate JWT token
      const token = this.generateToken(user)
      
      return {
        user: this.transformToApi(user),
        token
      }
    } catch (error) {
      logger.error(`Error authenticating user with email: ${email}`, error)
      throw error
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      logger.info(`Changing password for user with ID: ${userId}`)
      const collection = await this.getCollection()
      
      if (!ObjectId.isValid(userId)) {
        throw new BadRequestError(`Invalid user ID: ${userId}`)
      }
      
      // Find user
      const user = await collection.findOne({ _id: new ObjectId(userId) })
      
      if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`)
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      
      if (!isPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect')
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)
      
      // Update password
      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      )
      
      if (result.modifiedCount === 0) {
        throw new Error('Failed to update password')
      }
      
      return true
    } catch (error) {
      logger.error(`Error changing password for user with ID: ${userId}`, error)
      throw error
    }
  }

  private generateToken(user: DbUser): string {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    }
    
    const options: SignOptions = {
      expiresIn: parseInt(jwtConfig.expiresIn),
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
    
    return jwt.sign(payload, Buffer.from(jwtConfig.secret), options)
  }

  async validateToken(token: string): Promise<{ valid: boolean; user?: ApiUser }> {
    try {
      const decoded = jwt.verify(token, Buffer.from(jwtConfig.secret)) as { id: string }
      
      if (!decoded || !decoded.id) {
        return { valid: false }
      }
      
      const user = await this.findById(decoded.id)
      
      if (!user) {
        return { valid: false }
      }
      
      return { valid: true, user }
    } catch (error) {
      logger.error('Token validation failed', error)
      return { valid: false }
    }
  }
}
