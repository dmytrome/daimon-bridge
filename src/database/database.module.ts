import { Global, Module, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ModuleRef } from "@nestjs/core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { AppConfig } from "../config/env.schema";
import { DRIZZLE } from "./drizzle";
import * as schema from "./schema";

const POSTGRES_CLIENT = Symbol("POSTGRES_CLIENT");

@Global()
@Module({
  providers: [
    {
      provide: POSTGRES_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) =>
        postgres(config.getOrThrow("databaseUrl", { infer: true })),
    },
    {
      provide: DRIZZLE,
      inject: [POSTGRES_CLIENT],
      useFactory: (client: postgres.Sql) => drizzle(client, { schema }),
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown(): Promise<void> {
    const client = this.moduleRef.get<postgres.Sql>(POSTGRES_CLIENT);
    await client.end();
  }
}
