CREATE TABLE `app_user` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`created_at` text NOT NULL,
	`remote_user_id` text
);
--> statement-breakpoint
CREATE TABLE `decision_candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`restaurant_id` text NOT NULL,
	`score` integer,
	`rank` integer,
	`swipe_result` text,
	`tally` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `decision_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_candidates_session` ON `decision_candidates` (`session_id`);--> statement-breakpoint
CREATE TABLE `decision_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`mode` text NOT NULL,
	`status` text NOT NULL,
	`filters` text,
	`participant_count` integer,
	`decided_restaurant_id` text,
	`record_prompt_dismissed_at` text,
	`created_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`owner_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`decided_restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_owner_status` ON `decision_sessions` (`owner_id`,`status`);--> statement-breakpoint
CREATE TABLE `import_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`source_label` text,
	`file_name` text,
	`created_count` integer DEFAULT 0 NOT NULL,
	`skipped_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_import_batches_owner` ON `import_batches` (`owner_id`);--> statement-breakpoint
CREATE TABLE `restaurant_tags` (
	`restaurant_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`restaurant_id`, `tag_id`),
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_restaurant_tags_tag` ON `restaurant_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`source_url` text,
	`source_type` text NOT NULL,
	`normalized_url` text,
	`thumbnail_url` text,
	`genre` text,
	`area` text,
	`nearest_station` text,
	`address` text,
	`price_range` text,
	`desire_level` integer DEFAULT 3 NOT NULL,
	`visited` integer DEFAULT 0 NOT NULL,
	`visit_count` integer DEFAULT 0 NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`raw_metadata` text,
	`import_batch_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_suggested_at` text,
	`last_visited_at` text,
	FOREIGN KEY (`owner_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_restaurants_owner` ON `restaurants` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_restaurants_owner_archived_visited` ON `restaurants` (`owner_id`,`archived`,`visited`);--> statement-breakpoint
CREATE INDEX `idx_restaurants_normalized_url` ON `restaurants` (`owner_id`,`normalized_url`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`is_system` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_tags_owner_category_name` ON `tags` (`owner_id`,`category`,`name`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`notifications_enabled` integer DEFAULT 1 NOT NULL,
	`notify_times` text,
	`notify_max_per_day` integer DEFAULT 1 NOT NULL,
	`resurface_after_days` integer DEFAULT 90 NOT NULL,
	`notif_permission_status` text DEFAULT 'unasked' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`restaurant_id` text NOT NULL,
	`decision_session_id` text,
	`visited_at` text NOT NULL,
	`rating` integer,
	`memo` text,
	`companion` text,
	`revisit` text,
	`photo_uri` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`decision_session_id`) REFERENCES `decision_sessions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_visits_restaurant` ON `visits` (`restaurant_id`);--> statement-breakpoint
CREATE INDEX `idx_visits_session` ON `visits` (`decision_session_id`);