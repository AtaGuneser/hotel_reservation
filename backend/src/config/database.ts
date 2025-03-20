import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_reservation'
    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoURI)
    console.log('MongoDB Connected Successfully')
  } catch (error) {
    console.error('MongoDB Connection Error:', error)
    process.exit(1)
  }
}

export class DatabaseManager {
  private static instance: DatabaseManager
  private client: mongoose.Connection
  private db: mongoose.Connection | null = null

  private constructor () {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }
    this.client = mongoose.createConnection(mongoUri)
  }

  public static getInstance (): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  public async connect (): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI
      if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined in environment variables')
      }
      await this.client.openUri(mongoUri)
      this.db = this.client
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

  public getDb (): mongoose.Connection {
    if (!this.db) {
      throw new Error('Database not connected')
    }
    return this.db
  }
}
