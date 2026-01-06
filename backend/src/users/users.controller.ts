import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "@prisma/client";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id")
  async getUser(@Param("id") id: string): Promise<User | null> {
    return this.usersService.user({ id: Number(id) });
  }

  @Post()
  async signupUser(
    @Body() userData: { email: string; password: string; name?: string },
  ): Promise<User> {
    return this.usersService.createUser(userData);
  }
}
