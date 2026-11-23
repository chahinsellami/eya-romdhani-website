import { z } from "zod";

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

/**
 * Lookbook metadata - for seasonal editorial spreads and digital features.
 */
export const LookbookSchema = z.object({
  id: z.string().uuid("Lookbook ID must be a valid UUID"),
  title: z.string().min(1, "Title is required"),
  brand: z.string().min(1, "Brand name is required"),
  collection: z.string().min(1, "Collection name is required"),
  editorial: z.string().min(1, "Editorial publication is required"),
  date: z.string().datetime().optional(),
  type: z.enum(["digital", "print", "video"]).default("digital"),
  // Optional video link for behind-the-scenes or runway footage
  videoUrl: z.string().url("Must be a valid URL").optional(),
  // Social proof: publications that featured this lookbook
  featuredIn: z.array(z.string()).optional(),
});

/**
 * Portfolio item with rich metadata for gallery/grid views.
 */
/**
 * The subject's portrait.
 *
 * The About section had no photograph at all, which on a model portfolio page
 * leaves the profile claim unsupported. Kept separate from the work grid so the
 * two never duplicate, and optional so the section still renders without it.
 */
export const PortraitSchema = z.object({
  path: z.string().min(1, "Portrait path is required"),
  /**
   * Wide variant for full-bleed use — the hero covers the viewport, so a 3:4
   * portrait crops the sides away on a desktop and pushes the face off-centre.
   * Narrow screens fall back to `path`.
   */
  widePath: z.string().optional(),
  alt: z.string().min(1, "Portrait alt text is required"),
  credit: z.string().optional(),
  /** Focal point for crops, e.g. "50% 30%" to keep a face in frame. */
  position: z.string().optional(),
  /**
   * True while this is stock photography standing in for the real shot.
   * Everything with this flag is labelled in the UI, so a staging build can
   * never be mistaken for a finished portfolio. Set to false — or delete the
   * key — once the actual photographs are in place.
   */
  placeholder: z.boolean().optional(),
});

export const PortfolioItemSchema = z.object({
  id: z.string().uuid("Portfolio item ID must be a valid UUID"),
  title: z.string().min(1, "Title is required"),
  path: z.string().min(1, "Image path is required"),
  widePath: z.string().optional(),
  category: z.enum(["Runway", "Editorial", "Campaign", "Commercial"]),
  brand: z.string().min(1, "Brand is required"),
  collection: z.string().optional(),
  // Social proof: publications/platforms that carried the piece
  featuredIn: z.array(z.string()).optional(),
  // Lookbook parent relationship (nullable, not required)
  lookbookId: z.string().uuid().optional(),
  // Video URL for runway clips or campaign footage
  videoUrl: z.string().url("Must be a valid URL").optional(),
  // Alt text for accessibility
  alt: z.string().max(200, "Alt text must be 200 characters or fewer").optional(),
  // Focal point for the cropped grid tile, e.g. "50% 25%". Without it a 3:4
  // tile crops a portrait shot through the face.
  position: z.string().optional(),
  // See PortraitSchema.placeholder — stock stand-in, labelled in the UI.
  placeholder: z.boolean().optional(),
});

/**
 * Social media profiles with presence/absence tracking.
 */
export const SocialSchema = z.object({
  instagram: z.string().url("Instagram URL must be valid").or(z.literal("")),
  website: z.string().url("Website URL must be valid").or(z.literal("")),
  tiktok: z.string().url("TikTok URL must be valid").or(z.literal("")),
  youtube: z.string().url("YouTube URL must be valid").or(z.literal("")),
});

/**
 * Contact information with structured agency representation.
 */
export const ContactSchema = z.object({
  email: z.string().email("Invalid email format"),
  management: z.string().min(1, "Management email is required"),
  // Optional: a model without representation has no agency block to show, and
  // the contact section drops the whole row rather than printing an empty label.
  agencyName: z.string().optional(),
  agencyAddress: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * Measurements with standardized units and validation.
 */
export const MeasurementsSchema = z.object({
  bust: z
    .string()
    .regex(/^(\d+)(\s?(cm|'|"))?$/i, "Bust must be a number with optional cm or inch unit"),
  waist: z
    .string()
    .regex(/^(\d+)(\s?(cm|'|"))?$/i, "Waist must be a number with optional cm or inch unit"),
  hips: z
    .string()
    .regex(/^(\d+)(\s?(cm|'|"))?$/i, "Hips must be a number with optional cm or inch unit"),
});

/**
 * Physical statistics for model profiles.
 */
export const StatsSchema = z.object({
  height: z.number().min(140).max(220, "Height must be between 140-220 cm"),
  shoeSize: z.string().regex(/^(\d+)( US| EU| UK)?$/, "Shoe size must be a number with optional region"),
  hair: z.string().min(1, "Hair color is required"),
  eyes: z.string().min(1, "Eye color is required"),
  bloodType: z.string().regex(/^([ABO][+-]?|O\+)$/, "Valid blood type").optional(),
});

/**
 * Professional history with optional links for verification.
 */
export const ShowSchema = z.object({
  brand: z.string().min(1, "Brand name is required"),
  collection: z.string().min(1, "Collection name is required"),
  city: z.string().optional(),
  // Accept both ISO datetime and date-only format (YYYY-MM-DD)
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  url: z.string().url("Show URL must be valid").optional(),
});

export const CampaignSchema = z.object({
  brand: z.string().min(1, "Brand name is required"),
  collection: z.string().optional(),
  type: z.enum(["campaign", "commercial", "lookbook", "video"]).default("campaign"),
  url: z.string().url("Campaign URL must be valid").optional(),
});

/**
 * Complete portfolio schema - single source of truth.
 */
export const PortfolioSchema = z.object({
  // Core identity
  name: z.string().min(1, "Name is required"),
  tagline: z.string().max(100, "Tagline should be 100 characters or fewer"),
  title: z.string().max(100).optional(), // e.g., "Runway & Editorial Model"

  // Physical profile
  height: z.number().min(140).max(220),
  measurements: MeasurementsSchema,
  stats: StatsSchema,

  // Professional metadata
  //
  // Optional by design. A represented model fills this in; an independent one
  // leaves it out and every place that would print "Represented by X" is
  // omitted instead of showing a blank line or the word "undefined".
  agency: z.string().min(1, "Agency name is required").optional(),
  bio: z.string().max(1000, "Bio should be 1000 characters or fewer"),
  nationality: z.string().optional(),
  origin: z.string().optional(), // e.g., "Paris, France"

  // Professional history
  runwayShows: z.array(ShowSchema).max(50, "Maximum 50 runway shows"),
  campaigns: z.array(CampaignSchema).max(50, "Maximum 50 campaigns"),
  notableShows: z.array(z.string()).optional(), // Legacy short-form list
  featuredCampaigns: z.array(CampaignSchema).max(10, "Maximum 10 featured campaigns"),

  // Portfolio gallery
  portfolio: z.array(PortfolioItemSchema).max(100, "Maximum 100 portfolio items"),
  lookbooks: z.array(LookbookSchema).max(20, "Maximum 20 lookbooks"),

  // The two editorial photographs the page is built around: the hero frame and
  // the About portrait. Both optional so the page degrades to a type-only layout.
  hero: PortraitSchema.optional(),
  portrait: PortraitSchema.optional(),

  // Social & contact
  social: SocialSchema,
  contact: ContactSchema,

  // SEO & metadata
  keywords: z.array(z.string().max(50)).max(30, "Maximum 30 keywords").optional(),
  seoTitle: z.string().max(70, "SEO title should be 70 characters or fewer").optional(),
  seoDescription: z.string().max(160, "SEO description should be 160 characters or fewer").optional(),
  lastUpdated: z.string().datetime().optional(),
});

export type Lookbook = z.infer<typeof LookbookSchema>;
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;
export type Social = z.infer<typeof SocialSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Measurements = z.infer<typeof MeasurementsSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type Show = z.infer<typeof ShowSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type Portfolio = z.infer<typeof PortfolioSchema>;

// =============================================================================
// CONFIGURATION INSTANCE
// =============================================================================

export const portfolio: Portfolio = PortfolioSchema.parse({
  // Core Identity
  name: "Aya Romdhani",
  title: "Runway & Editorial Model",
  tagline: "Runway. Editorial. Campaign.",

  // Physical Profile
  height: 177, // cm
  measurements: {
    bust: "84 cm",
    waist: "66 cm",
    hips: "99 cm",
  },
  stats: {
    height: 177,
    shoeSize: "40 EU",
    hair: "Brunette",
    eyes: "Hazel",
    bloodType: "A+",
  },

  // Professional Metadata
  //
  // No agency: she is independent, and this site is her representation. Every
  // component that renders "Represented by …" checks for this field first.
  bio:
    "Runway and editorial model based in Sousse, Tunisia. Drawn to the camera and the catwalk alike, with a presence built on stillness, strong lines and a plain, unforced kind of elegance.",
  nationality: "Tunisian",
  origin: "Sousse, Tunisia",

  // Runway Shows
  // FABRICATED CREDITS REMOVED.
  //
  // This site was built from a template that shipped with invented runway and
  // campaign history — Chanel, Dior, Gucci, Vogue. Attaching those to a real,
  // named person is a false claim about her career (and, if the brands noticed,
  // a legal one). Empty is honest: the stats block prints "No runway shows
  // listed" until real credits are added.
  runwayShows: [],


  // Campaigns
  campaigns: [],


  // Featured Campaigns (social proof highlights)
  featuredCampaigns: [],


  // Lookbooks (new extensible section)
  lookbooks: [],


  // Portfolio Gallery
  //
  // Real photographs. The gallery is built from the seven images supplied for
  // this site; each is pre-cropped to the 3:4 tile shape at build-prep time
  // (see public/images/portfolio/), so the grid never has to crop a face away.
  //
  // To add more work: drop a 3:4 crop into public/images/portfolio/ and add an
  // entry below. `alt` must describe what is actually in the photograph.
  portfolio: [
    {
      id: "ebcd7890-1234-5678-90ab-cdef01234569",
      title: "Turtleneck Study I",
      path: "/images/portfolio/tile-turtleneck-front.webp",
      category: "Editorial",
      brand: "Studio",
      collection: "Black & white series",
      featuredIn: ["Editorial"],
      alt: "Black and white portrait of the model in a black turtleneck, arms crossed, light and shadow falling across a white wall",
      position: "50% 30%",
      lookbookId: "ebcd7890-1234-5678-90ab-cdef01234567",
    },
    {
      id: "ebcd7890-1234-5678-90ab-cdef0123456a",
      title: "Turtleneck Study II",
      path: "/images/portfolio/tile-turtleneck-back.webp",
      category: "Editorial",
      brand: "Studio",
      collection: "Black & white series",
      featuredIn: ["Editorial"],
      alt: "Black and white portrait of the model in a black turtleneck, turned three-quarters away and looking back over her shoulder",
      position: "50% 28%",
      lookbookId: "ebcd7890-1234-5678-90ab-cdef01234567",
    },
    {
      id: "ebcd7890-1234-5678-90ab-cdef0123456c",
      title: "Close Study",
      path: "/images/portfolio/tile-closeup.webp",
      widePath: "/images/portfolio/closeup-hands.webp",
      category: "Editorial",
      brand: "Studio",
      collection: "Portrait series",
      featuredIn: ["Editorial"],
      alt: "Close portrait of the model with both hands in her hair, soft indoor light",
      position: "50% 30%",
    },
    {
      id: "ebcd7890-1234-5678-90ab-cdef0123456d",
      title: "Hand Study",
      path: "/images/portfolio/tile-hands.webp",
      widePath: "/images/portfolio/hand-over-face.webp",
      category: "Commercial",
      brand: "Beauty",
      collection: "Beauty test",
      featuredIn: ["Beauty"],
      alt: "Portrait of the model with one hand raised beside her face, direct gaze",
      position: "50% 32%",
    },
    {
      id: "ebcd7890-1234-5678-90ab-cdef0123456f",
      title: "Shearling",
      path: "/images/portfolio/flash-shearling.webp",
      category: "Editorial",
      brand: "Independent",
      collection: "Flash series",
      alt: "Flash portrait of the model in a cream shearling jacket over a black halter and choker, looking straight at the camera",
      position: "52% 40%",
    },
    {
      id: "ebcd7890-1234-5678-90ab-cdef01234570",
      title: "Choker",
      path: "/images/portfolio/flash-choker.webp",
      category: "Editorial",
      brand: "Independent",
      collection: "Flash series",
      alt: "Low-angle flash portrait of the model in a black choker and shearling jacket, chin raised, hair falling across her cheek",
      position: "50% 38%",
    },
    {
      id: "ebcd7890-1234-5678-90ab-cdef01234571",
      title: "Over the shoulder",
      path: "/images/portfolio/flash-shoulder.webp",
      category: "Editorial",
      brand: "Independent",
      collection: "Flash series",
      alt: "Flash portrait of the model looking back over a bare shoulder, a gold satin jacket slipping off it",
      position: "45% 40%",
    },
  ],

  // Editorial photography the page is built around.
  //
  // These are the two images a visitor actually judges the page by, so they get
  // first-class slots rather than being borrowed from the work grid. Replace the
  // URLs with the model's own shots; both are optional, and the layout falls
  // back to type only if they are removed.
  hero: {
    path: "/images/portfolio/flash-shearling.webp",
    alt: "Flash portrait of Aya Romdhani in a cream shearling jacket and black choker, looking at the camera",
    position: "55% 35%",
    credit: "Flash series",
  },
  portrait: {
    path: "/images/portfolio/portrait-turtleneck-full.webp",
    alt: "Black and white studio portrait of Aya Romdhani in a black turtleneck, arms crossed, window shadows across the wall",
    position: "50% 20%",
    credit: "Window light",
  },


  // Social & Contact
  social: {
    instagram: "https://www.instagram.com/aya__romdhani21/",
    website: "",
    tiktok: "",
    youtube: "",
  },
  contact: {
    email: "eyaromdhani16@gmail.com",
    management: "eyaromdhani16@gmail.com",
    // Independent — no agency name or address to print.
    phone: "",
  },

  // SEO & Metadata
  keywords: [
    "runway model",
    "editorial model",
    "campaign model",
    "fashion model",
    "Aya Romdhani",
    "Tunisian model",
    "model Sousse",
    "model Tunisia",
    "high fashion",
  ],
  seoTitle: "Aya Romdhani | Runway & Editorial Model",
  seoDescription:
    "Runway and editorial model Aya Romdhani, based in Sousse, Tunisia. Available for runway, editorial, campaign and commercial work.",
  lastUpdated: new Date().toISOString(),
});

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate portfolio data and return detailed errors.
 * @throws ValidationError if schema validation fails
 */
export const validatePortfolio = (data: unknown): Portfolio => {
  const result = PortfolioSchema.safeParse(data);
  if (!result.success) {
    const errorMessages = result.error.errors.map((err) => {
      // Zod path segments are strings or numbers; stringifying each one keeps
      // nested (`portfolio.0.title`) errors readable instead of collapsing to
      // the first character of the key.
      const path = err.path.map((segment) => String(segment)).join(".");
      return `${path || "Root"}: ${err.message}`;
    });
    throw new Error(`Portfolio validation failed:\n${errorMessages.join("\n")}`);
  }
  return result.data;
};

/**
 * Safe parse - returns null on validation failure instead of throwing.
 */
export const safeParsePortfolio = (
  data: unknown
): Portfolio | null => {
  return PortfolioSchema.safeParse(data)?.data ?? null;
};

// =============================================================================
// MIGRATION GUIDE
// =============================================================================

/**
 * MIGRATION GUIDE: Swapping content from legacy data structures
 *
 * This file documents how to migrate from the old portfolio.ts format to the new
 * schema-based approach while maintaining zero runtime type errors.
 *
 * -----------------------------------------------------------------------------
 * BREAKING CHANGES
 * -----------------------------------------------------------------------------
 *
 * 1. ID FORMAT:
 *    - Old: String identifiers like "look-01"
 *    - New: UUID format (ebcd7890-1234-5678-90ab-cdef01234567)
 *    - Migration: Generate UUIDs via crypto.randomUUID()
 *
 * 2. SEPARATED SECTIONS:
 *    - Old: Single portfolio[] array
 *    - New: portfolio[] + lookbooks[] arrays
 *    - Migration: Extract lookbook-related items from portfolio into lookbooks
 *
 * 3. ENUMERATED CATEGORIES:
 *    - Old: Free-form string for category
 *    - New: z.enum(["Runway", "Editorial", "Campaign", "Commercial"])
 *    - Migration: Normalize category values, reject invalid ones
 *
 * 4. OPTIONAL FIELDS:
 *    - Old: No optional fields (all required)
 *    - New: Many optional fields with .optional()
 *    - Migration: Add optional fields with z.literal("") for social URLs
 *
 * -----------------------------------------------------------------------------
 * FIELD MAPPING
 * -----------------------------------------------------------------------------
 *
 * Legacy Field              | New Schema              | Action
 * ------------------------- | ----------------------- | ----------------------------------------
 * name                      | name                    | No change
 * tagline                   | tagline                 | No change
 * height (cm)               | height                  | No change
 * measurements.*            | measurements.*          | No change
 * stats.*                   | stats.*                 | No change
 * agency                    | agency                  | No change
 * bio                       | bio                     | No change
 * stats.shoeSize            | stats.shoeSize          | No change
 * stats.hair                | stats.hair              | No change
 * stats.eyes                | stats.eyes              | No change
 * notableShows              | runwayShows             | Convert to ShowSchema objects
 * campaigns                 | campaigns               | Convert to CampaignSchema objects
 * portfolio.*.id            | portfolio.*.id          | Convert to UUID
 * portfolio.*.category      | portfolio.*.category    | Normalize to enum values
 * portfolio.*.lookbookId    | portfolio.*.lookbookId  | NEW: Link to lookbook
 * social.instagram          | social.instagram        | Add .or(z.literal(""))
 * social.website            | social.website          | Add .or(z.literal(""))
 * contact.email             | contact.email           | No change
 * contact.agency            | contact.agencyName      | Rename, no change
 *
 * -----------------------------------------------------------------------------
 * MIGRATION SCRIPT PSEUDOCODE
 * -----------------------------------------------------------------------------
 *
 * const migrate = (oldData: any): Portfolio => {
 *   // 1. Generate UUIDs for all items
 *   const mappedPortfolio = oldData.portfolio.map(item => ({
 *     id: crypto.randomUUID(),
 *     ...item,
 *     category: normalizeCategory(item.category),
 *   }));
 *
 *   // 2. Convert notableShows to runwayShows
 *   const runwayShows = oldData.notableShows.map(show => ({
 *     brand: show,
 *     collection: "Archive",
 *   }));
 *
 *   // 3. Convert campaigns to CampaignSchema
 *   const campaigns = oldData.campaigns.map(camp => ({
 *     brand: camp,
 *     type: "campaign",
 *   }));
 *
 *   // 4. Build lookbooks from related portfolio items
 *   const lookbooks: Lookbook[] = [];
 *
 *   // 5. Return validated result
 *   return PortfolioSchema.parse({
 *     ...oldData,
 *     portfolio: mappedPortfolio,
 *     runwayShows,
 *     campaigns,
 *   });
 * };
 *
 * -----------------------------------------------------------------------------
 * ERROR HANDLING
 * -----------------------------------------------------------------------------
 *
 * Validation errors are thrown with detailed messages:
 *
 * - z.string().min(1, "Title is required") -> "Title is required"
 * - z.string().url("Must be a valid URL") -> "Must be a valid URL"
 * - z.number().min(140).max(220) -> "Height must be between 140-220 cm"
 * - z.enum(["Runway", ...]).default("Runway") -> Auto-sets default
 *
 * Use safeParsePortfolio() in components to handle invalid data gracefully:
 *
 * export default function PortfolioSection() {
 *   const data = safeParsePortfolio(props.data);
 *   if (!data) return <ErrorBoundary message="Portfolio data unavailable" />;
 *   return <div>{render(data)}</div>;
 * }
 *
 * -----------------------------------------------------------------------------
 * ENVIRONMENT VARIABLES
 * -----------------------------------------------------------------------------
 *
 * For server-side hydration, load portfolio data from an env file:
 *
 * // src/data/portfolio.ts
 * if (process.env.NODE_ENV === "development") {
 *   // Use embedded default for fast dev server restarts
 *   export const portfolio = PORTFOLIO;
 * } else {
 *   // Load from external file or database
 *   const data = readPortfolioFromEnv();
 *   export const portfolio = validatePortfolio(data);
 * }
 *
 * -----------------------------------------------------------------------------
 */
