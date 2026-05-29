CREATE TABLE "sensor_snapshots" (
	"captured_at" timestamp with time zone NOT NULL,
	"temperature" double precision NOT NULL,
	"motion" boolean NOT NULL
);
--> statement-breakpoint
SELECT create_hypertable('sensor_snapshots', by_range('captured_at'));
