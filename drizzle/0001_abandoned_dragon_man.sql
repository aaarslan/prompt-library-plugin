CREATE TABLE `library_usage` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`bucket` integer NOT NULL,
	`requests` integer NOT NULL,
	`writes` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `library_usage_bucket` ON `library_usage` (`bucket`);--> statement-breakpoint
CREATE INDEX `drafts_owner_id` ON `drafts` (`owner_id`,`id`);--> statement-breakpoint
CREATE INDEX `templates_owner_id` ON `templates` (`owner_id`,`id`);