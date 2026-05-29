import { Module } from "@nestjs/common";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ZodValidationPipe } from "nestjs-zod";
import { BearerAuthGuard } from "./auth/auth.guard";
import { BeepModule } from "./beep/beep.module";
import { CommandModule } from "./command/command.module";
import { FaceModule } from "./face/face.module";
import { HapticModule } from "./haptic/haptic.module";
import { HealthModule } from "./health/health.module";
import { ConfigModule } from "@nestjs/config";
import { SensorModule } from "./sensor/sensor.module";
import { validateEnv } from "./config/env.schema";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 1000, limit: 60 }]),
    HealthModule,
    SensorModule,
    CommandModule,
    HapticModule,
    FaceModule,
    BeepModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      ignoreEnvFile: process.env.NODE_ENV === "test",
    }),
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_GUARD, useClass: BearerAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
