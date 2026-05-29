import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ZodValidationPipe } from "nestjs-zod";
import { BearerAuthGuard } from "./auth/auth.guard";
import { BeepModule } from "./beep/beep.module";
import { CommandModule } from "./command/command.module";
import { validateEnv } from "./config/env.schema";
import { DatabaseModule } from "./database/database.module";
import { FaceModule } from "./face/face.module";
import { HapticModule } from "./haptic/haptic.module";
import { HealthModule } from "./health/health.module";
import { SensorModule } from "./sensor/sensor.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 1000, limit: 60 }]),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      ignoreEnvFile: process.env.NODE_ENV === "test",
    }),
    DatabaseModule,
    HealthModule,
    SensorModule,
    CommandModule,
    HapticModule,
    FaceModule,
    BeepModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_GUARD, useClass: BearerAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
