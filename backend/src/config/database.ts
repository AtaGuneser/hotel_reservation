import { MongoClient, Db } from 'mongodb'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

export class DatabaseManager {
  private static instance: DatabaseManager
  private client: MongoClient
  private db: Db | null = null

  private constructor () {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }
    this.client = new MongoClient(mongoUri)
  }

  public static getInstance (): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  public async connect (): Promise<void> {
    try {
      await this.client.connect()
      this.db = this.client.db()
      console.log('Connected to MongoDB')
    } catch (error) {
      console.error('MongoDB connection error:', error)
      throw error
    }
  }

  public async disconnect (): Promise<void> {
    try {
      await this.client.close()
      this.db = null
      console.log('Disconnected from MongoDB')
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error)
      throw error
    }
  }

  public getDb (): Db {
    if (!this.db) {
      throw new Error('Database not connected')
    }
    return this.db
  }
}
