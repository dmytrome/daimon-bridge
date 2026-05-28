import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { timingSafeEqual } from "node:crypto";
import { IS_PUBLIC_KEY } from "./public.decorator";

interface IncomingRequest {
  headers: Record<string, string | string[] | undefined>;
}

@Injectable()
export class BearerAuthGuard implements CanActivate {
  private readonly tokenBuffer: Buffer;

  constructor(private readonly reflector: Reflector) {
    const token = process.env.BRIDGE_TOKEN;
    if (token === undefined || token.length === 0) {
      throw new InternalServerErrorException(
        "BRIDGE_TOKEN env variable must be set",
      );
    }
    this.tokenBuffer = Buffer.from(token);
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IncomingRequest>();
    const header = request.headers["authorization"];
    const value = Array.isArray(header) ? header[0] : header;
    if (value === undefined || !value.startsWith("Bearer ")) {
      throw new UnauthorizedException();
    }

    const candidate = Buffer.from(value.slice("Bearer ".length));
    if (candidate.length !== this.tokenBuffer.length) {
      throw new UnauthorizedException();
    }
    if (!timingSafeEqual(candidate, this.tokenBuffer)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
