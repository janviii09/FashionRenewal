import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err, user, info) {
    // If error or no user, just return null (allow guest access)
    if (err || !user) {
      return null;
    }
    return user;
  }
}
