import { HttpError as BaseHttpError } from 'routing-controllers'

export interface ValidationError {
  field: string
  message: string
}

export interface ErrorResponse {
  message: string
  errors?: ValidationError[]
  field?: string
  id?: string
  error?: string
}

export class HttpError extends BaseHttpError {
  constructor(statusCode: number, response: ErrorResponse) {
    super(statusCode, JSON.stringify(response))
  }

  getResponse(): ErrorResponse {
    return JSON.parse(this.message)
  }
} 