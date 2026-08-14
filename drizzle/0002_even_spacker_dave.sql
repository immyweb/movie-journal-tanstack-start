CREATE TABLE "list" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"share_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "list_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "list_item" (
	"list_id" text NOT NULL,
	"movie_id" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "list_item_list_id_movie_id_pk" PRIMARY KEY("list_id","movie_id")
);
--> statement-breakpoint
ALTER TABLE "list" ADD CONSTRAINT "list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_item" ADD CONSTRAINT "list_item_list_id_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_item" ADD CONSTRAINT "list_item_movie_id_movie_tmdb_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("tmdb_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "list_userId_idx" ON "list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "list_shareToken_idx" ON "list" USING btree ("share_token");