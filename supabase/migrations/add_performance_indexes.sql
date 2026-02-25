-- Performance indexes for most-queried columns
-- Run these in the Supabase SQL editor or include in your migration pipeline.

-- User queries by every authenticated page
CREATE INDEX IF NOT EXISTS idx_clothes_userid    ON "Clothes"("userId");
CREATE INDEX IF NOT EXISTS idx_outfit_userid     ON "Outfit"("userId");
CREATE INDEX IF NOT EXISTS idx_wardrobe_userid   ON "Wardrobe"("userId");
CREATE INDEX IF NOT EXISTS idx_wearlog_userid    ON "WearLog"("userId");

-- Username lookup on login + public profile pages
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_username ON "User"("username");

-- Clothes status filter (owned vs wishlist) — used on every closet load
CREATE INDEX IF NOT EXISTS idx_clothes_userid_status ON "Clothes"("userId", "status");

-- Wear log date-range queries (calendar view)
CREATE INDEX IF NOT EXISTS idx_wearlog_userid_wornat ON "WearLog"("userId", "wornAt");

-- Like / Save polymorphic lookups
CREATE INDEX IF NOT EXISTS idx_like_target  ON "Like"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS idx_save_target  ON "Save"("targetType", "targetId");

-- Public wardrobe / outfit discovery
CREATE INDEX IF NOT EXISTS idx_wardrobe_public ON "Wardrobe"("userId", "isPublic");
CREATE INDEX IF NOT EXISTS idx_outfit_public   ON "Outfit"("userId", "isPublic");
