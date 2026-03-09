CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyHash` varchar(128) NOT NULL,
	`label` varchar(128) NOT NULL,
	`createdByUserId` int,
	`isActive` int NOT NULL DEFAULT 1,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `data_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dashboardKey` varchar(64) NOT NULL,
	`payload` json NOT NULL,
	`dataDate` varchar(32),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_dashboard_key` UNIQUE(`dashboardKey`)
);
--> statement-breakpoint
CREATE TABLE `upload_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dashboardKey` varchar(64) NOT NULL,
	`apiKeyId` int,
	`payloadSize` bigint,
	`status` varchar(32) NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `upload_logs_id` PRIMARY KEY(`id`)
);
