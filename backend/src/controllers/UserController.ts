import { JsonController, Get, Post, Body } from 'routing-controllers'

@JsonController('/users')
export class UserController {
  @Get()
  getAll () {
    return { message: 'Get all users' }
  }

  @Post()
  create (@Body() user: any) {
    return { message: 'Create user', user }
  }
}
