import { MongoClient, Db } from 'mongodb'
import dotenv from 'dotenv'
import path from 'path'
import { logger } from '../utils/logger'

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

export class DatabaseManager {
  private static instance: DatabaseManager
  private client: MongoClient
  private db: Db | null = null
  private connected = false

  private constructor() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_reservation'
    this.client = new MongoClient(mongoUri)
  }

  /**
   * Get the singleton instance of DatabaseManager
   * @returns DatabaseManager instance
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  /**
   * Connect to MongoDB
   * @throws Error if connection fails
   */
  public async connect(): Promise<void> {
    if (this.connected) {
      return
    }

    try {
      await this.client.connect()
      this.db = this.client.db()
      this.connected = true
      logger.info('Connected to MongoDB successfully')
    } catch (error) {
      logger.error('MongoDB connection error:', error)
      throw error
    }
  }

  /**
   * Disconnect from MongoDB
   * @throws Error if disconnection fails
   */
  public async disconnect(): Promise<void> {
    if (!this.connected) {
      return
    }

    try {
      await this.client.close()
      this.db = null
      this.connected = false
      logger.info('Disconnected from MongoDB')
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error)
      throw error
    }
  }

  /**
   * Get the MongoDB database instance
   * @returns Db instance
   * @throws Error if not connected to database
   */
  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.db
  }

  /**
   * Check if connected to the database
   * @returns true if connected, false otherwise
   */
  public isConnected(): boolean {
    return this.connected
  }

  /**
   * Get the MongoDB client instance
   * @returns MongoClient instance
   */
  public getClient(): MongoClient {
    return this.client
  }
}
