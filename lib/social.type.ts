import { Clothes } from "./database.type";

// ============================================================================
// USER PROFILE (Extended)
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;

  // Social fields (new)
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  pinterest_handle?: string;
  style_tags: string[];
  cover_image?: string;

  // Status flags
  profilePublic: boolean;
  is_verified: boolean;
  is_featured: boolean;

  // Privacy settings
  show_closet_value: boolean;
  show_item_prices: boolean;
  allow_messages: boolean;

  // Stats
  profile_views: number;
  follower_count: number;
  following_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  last_active_at?: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  name?: string;
  bio?: string;
  image?: string;
  cover_image?: string;
  location?: string;
  website?: string;
  instagram_handle?: string;
  style_tags: string[];
  is_verified: boolean;
  is_featured: boolean;
  follower_count: number;
  following_count: number;
  public_outfit_count: number;
  public_wardrobe_count: number;
  created_at: string;

  // Computed client-side
  is_following?: boolean;
  is_blocked?: boolean;
}

// ============================================================================
// FOLLOW SYSTEM
// ============================================================================

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowWithUser extends Follow {
  follower?: PublicProfile;
  following?: PublicProfile;
}

// ============================================================================
// WARDROBE/COLLECTION (Extended)
// ============================================================================

export interface Wardrobe {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;

  // Social fields (new)
  slug?: string;
  view_count: number;
  like_count: number;
  save_count: number;
  share_count: number;
  is_featured: boolean;
  featured_at?: string;
  style_tags: string[];
  season?: string;
  occasion?: string;
  allow_comments: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations (populated on fetch)
  user?: PublicProfile;
  clothes?: Clothes[];
  outfits?: Outfit[];
  item_count?: number;

  // Computed client-side
  is_liked?: boolean;
  is_saved?: boolean;
}

// ============================================================================
// OUTFIT (Extended)
// ============================================================================

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  season?: string;
  occasion?: string;
  imageUrl?: string;
  isFavorite: boolean;
  timesWorn: number;
  lastWornAt?: string;

  // Social fields (new)
  is_public: boolean;
  slug?: string;
  view_count: number;
  like_count: number;
  save_count: number;
  share_count: number;
  is_featured: boolean;
  featured_at?: string;
  style_tags: string[];
  allow_comments: boolean;

  // Additional metadata
  weatherWorn?: string;
  temperatureWorn?: number;
  locationWorn?: string;
  rating?: number;
  colorPalette?: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations (populated on fetch)
  user?: PublicProfile;
  clothes?: Clothes[];

  // Computed client-side
  is_liked?: boolean;
  is_saved?: boolean;
}

// ============================================================================
// LIKES & SAVES
// ============================================================================

export type LikeTargetType = "wardrobe" | "outfit" | "clothes";
export type SaveTargetType = "wardrobe" | "outfit" | "clothes" | "user";

export interface Like {
  id: string;
  user_id: string;
  target_type: LikeTargetType;
  target_id: string;
  created_at: string;
}

export interface Save {
  id: string;
  user_id: string;
  target_type: SaveTargetType;
  target_id: string;
  collection_name: string;
  notes?: string;
  created_at: string;

  // Populated on fetch
  target?: Outfit | Wardrobe | PublicProfile;
}

// ============================================================================
// COMMENTS
// ============================================================================

export type CommentTargetType = "wardrobe" | "outfit";

export interface Comment {
  id: string;
  user_id: string;
  target_type: CommentTargetType;
  target_id: string;
  parent_id?: string;
  content: string;
  like_count: number;
  is_edited: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  user?: PublicProfile;
  replies?: Comment[];

  // Computed
  is_liked?: boolean;
  is_own?: boolean;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type NotificationType =
  | "follow"
  | "like_outfit"
  | "like_wardrobe"
  | "comment"
  | "comment_reply"
  | "mention"
  | "feature"
  | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id?: string;
  target_type?: string;
  target_id?: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  actor?: PublicProfile;
}

// ============================================================================
// BLOCKS & REPORTS
// ============================================================================

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate_content"
  | "copyright"
  | "impersonation"
  | "other";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface Report {
  id: string;
  reporter_id: string;
  target_type: "user" | "wardrobe" | "outfit" | "comment";
  target_id: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

// ============================================================================
// ACTIVITY FEED
// ============================================================================

export type ActivityType =
  | "created_outfit"
  | "created_wardrobe"
  | "liked_outfit"
  | "liked_wardrobe"
  | "followed_user"
  | "added_item"
  | "wore_outfit";

export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  target_type?: string;
  target_id?: string;
  metadata: Record<string, any>;
  is_public: boolean;
  created_at: string;

  // Relations
  user?: PublicProfile;
  target?: Outfit | Wardrobe | PublicProfile;
}

// ============================================================================
// STYLE TAGS
// ============================================================================

export type StyleTagCategory =
  | "style"
  | "occasion"
  | "season"
  | "aesthetic"
  | "trend";

export interface StyleTag {
  id: string;
  name: string;
  slug: string;
  category?: StyleTagCategory;
  usage_count: number;
  is_featured: boolean;
  created_at: string;
}

// ============================================================================
// FEATURED CONTENT
// ============================================================================

export type FeaturedSection =
  | "hero"
  | "trending"
  | "staff_picks"
  | "new_arrivals";

export interface FeaturedContent {
  id: string;
  content_type: "user" | "wardrobe" | "outfit";
  content_id: string;
  section: FeaturedSection;
  position: number;
  starts_at?: string;
  ends_at?: string;
  is_active: boolean;
  created_at: string;

  // Populated
  content?: PublicProfile | Wardrobe | Outfit;
}

// ============================================================================
// EXPLORE PAGE DATA
// ============================================================================

export interface ExplorePageData {
  hero?: FeaturedContent[];
  trending_outfits: Outfit[];
  trending_wardrobes: Wardrobe[];
  staff_picks: (Outfit | Wardrobe)[];
  featured_users: PublicProfile[];
  popular_tags: StyleTag[];
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface FollowRequest {
  user_id: string;
}

export interface LikeRequest {
  target_type: LikeTargetType;
  target_id: string;
}

export interface SaveRequest {
  target_type: SaveTargetType;
  target_id: string;
  collection_name?: string;
  notes?: string;
}

export interface CommentRequest {
  target_type: CommentTargetType;
  target_id: string;
  content: string;
  parent_id?: string;
}

export interface ReportRequest {
  target_type: "user" | "wardrobe" | "outfit" | "comment";
  target_id: string;
  reason: ReportReason;
  description?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  pinterest_handle?: string;
  style_tags?: string[];
  cover_image?: string;
  profilePublic?: boolean;
  show_closet_value?: boolean;
  show_item_prices?: boolean;
  allow_messages?: boolean;
}

export interface ShareCollectionRequest {
  wardrobe_id: string;
  is_public: boolean;
  slug?: string;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface FeedFilters {
  style_tags?: string[];
  season?: string;
  occasion?: string;
  sort_by?: "recent" | "popular" | "trending";
}
