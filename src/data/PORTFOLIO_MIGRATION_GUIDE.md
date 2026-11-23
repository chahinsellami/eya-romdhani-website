# Portfolio Content Migration Guide

This guide documents how to migrate from legacy data structures to the new schema-based portfolio system while maintaining zero runtime type errors.

## Quick Start

```typescript
// src/data/portfolio.ts
import { validatePortfolio, safeParsePortfolio } from "./portfolio";

const legacyData = {
  name: "Aya Romdhani",
  // ... your legacy data
};

// Option 1: Strict validation (throws on error)
export const portfolio = validatePortfolio(legacyData);

// Option 2: Safe parsing (returns null on error)
export const portfolio = safeParsePortfolio(legacyData) ?? DEFAULT_PORTFOLIO;
```

## Breaking Changes Summary

| Change | Old Format | New Format | Migration Action |
|--------|------------|------------|------------------|
| **ID Format** | `"look-01"` | UUID v4 | Generate via `crypto.randomUUID()` |
| **Sections** | Single `portfolio[]` | `portfolio[]` + `lookbooks[]` | Extract lookbook items |
| **Categories** | Free-form string | `z.enum(["Runway", "Editorial", "Campaign", "Commercial"])` | Normalize values |
| **Optional Fields** | None | Many `.optional()` | Add `.or(z.literal(""))` for social URLs |
| **Social URLs** | `.url()` only | `.url().or(z.literal(""))` | Handle empty strings explicitly |

## Detailed Field Mapping

### Core Identity

| Legacy Field | New Schema | Action |
|--------------|------------|--------|
| `name` | `name` | No change |
| `tagline` | `tagline` | No change |
| *New* | `title` | Optional: `"Runway & Editorial Model"` |

### Physical Profile

| Legacy Field | New Schema | Action |
|--------------|------------|--------|
| `height` (cm) | `height` | No change |
| `measurements.*` | `measurements.*` | No change |
| `stats.*` | `stats.*` | No change |
| *New* | `stats.bloodType` | Optional: `"A+"` |

### Professional Metadata

| Legacy Field | New Schema | Action |
|--------------|------------|--------|
| `agency` | `agency` | No change |
| `bio` | `bio` | No change |
| *New* | `nationality` | Optional: `"American"` |
| *New* | `origin` | Optional: `"New York, USA"` |

### Runway Shows

| Legacy Field | New Schema | Action |
|--------------|------------|--------|
| `notableShows` (array) | `runwayShows` | Convert to `ShowSchema` objects |

```typescript
const runwayShows = legacyData.notableShows.map(show => ({
  brand: show,
  collection: "Archive",
  city: "Paris", // or actual city
  date: new Date().toISOString(),
}));
```

### Campaigns

| Legacy Field | New Schema | Action |
|--------------|------------|--------|
| `campaigns` (array) | `campaigns` | Convert to `CampaignSchema` objects |

```typescript
const campaigns = legacyData.campaigns.map(camp => ({
  brand: camp,
  collection: "FW 2024",
  type: "campaign",
  url: "https://brand.com/campaign",
}));
```

### Featured Campaigns

| Legacy Field | New Schema | Action |
|--------------|------------|--------|
| *New* | `featuredCampaigns` | Select top 10 social proof campaigns |

```typescript
const featuredCampaigns = campaigns.slice(0, 10);
```

### Portfolio Gallery

| Legacy Field | New Schema | Action |
|--------------|------------|--------|
| `portfolio[].id` | `portfolio[].id` | Convert to UUID |
| `portfolio[].category` | `portfolio[].category` | Normalize to enum values |
| `portfolio[].title` | `portfolio[].title` | No change |
| `portfolio[].path` | `portfolio[].path` | No change |
| *New* | `portfolio[].brand` | Required: `"Gucci"`, `"Chanel"`, etc. |
| *New* | `portfolio[].collection` | Optional: `"Spring/Summer 2024"` |
| *New* | `portfolio[].lookbookId` | Optional: Link to lookbook UUID |

```typescript
const portfolioItems = legacyData.portfolio.map(item => ({
  id: crypto.randomUUID(),
  title: item.title,
  path: item.path,
  category: normalizeCategory(item.category),
  brand: item.brand || "Unknown",
  collection: item.collection,
  lookbookId: item.lookbookId || undefined,
}));

function normalizeCategory(value: string): PortfolioItem["category"] {
  const lower = value.toLowerCase().trim();
  switch (lower) {
    case "runway":
    case "fw":
    case "ss":
      return "Runway";
    case "editorial":
    case "mag":
      return "Editorial";
    case "campaign":
    case "commercial":
      return "Campaign";
    default:
      return "Campaign"; // Default fallback
  }
}
```

### Lookbooks (New Section)

```typescript
const lookbooks: Lookbook[] = [
  {
    id: crypto.randomUUID(),
    title: "Gucci Oasis 2024",
    brand: "Gucci",
    collection: "Oasis Collection",
    editorial: "Vogue Italia",
    date: "2024-01-15T00:00:00Z",
    type: "digital",
    videoUrl: "https://youtube.com/watch?v=example",
    featuredIn: ["Vogue Italia", "Elle International"],
  },
];
```

### Social & Contact

| Legacy Field | New Schema | Action |
|--------------|------------|--------|
| `social.instagram` | `social.instagram` | Add `.or(z.literal(""))` |
| `social.website` | `social.website` | Add `.or(z.literal(""))` |
| *New* | `social.tiktok` | Optional: `""` |
| `contact.email` | `contact.email` | No change |
| `contact.agency` | `contact.agencyName` | Rename, no change |
| *New* | `contact.management` | Required: Management email |
| *New* | `contact.agencyAddress` | Optional |
| *New* | `contact.phone` | Optional |

### SEO & Metadata

| Legacy Field | New Schema | Action |
|--------------|------------|--------|
| *New* | `keywords` | Array of strings, max 30 |
| *New* | `seoTitle` | Max 70 chars |
| *New* | `seoDescription` | Max 160 chars |
| *New* | `lastUpdated` | ISO datetime string |

## Complete Migration Script

```typescript
// src/data/migrate-portfolio.ts
import { PortfolioSchema, type Lookbook, type PortfolioItem } from "./portfolio";
import crypto from "crypto";

const DEFAULT_PORTFOLIO: any = {
  name: "Aya Romdhani",
  // ... default values
};

export function migrateLegacyData(legacyData: any): Portfolio {
  // 1. Generate UUIDs for all items
  const mappedPortfolio = legacyData.portfolio.map((item: any) => ({
    id: crypto.randomUUID(),
    title: item.title,
    path: item.path,
    category: normalizeCategory(item.category),
    brand: item.brand || "Unknown",
    collection: item.collection,
    lookbookId: item.lookbookId || undefined,
  }));

  // 2. Convert notableShows to runwayShows
  const runwayShows = legacyData.notableShows?.map((show: string) => ({
    brand: show,
    collection: "Archive",
  })) || [];

  // 3. Convert campaigns to CampaignSchema
  const campaigns = legacyData.campaigns?.map((camp: string) => ({
    brand: camp,
    collection: "FW 2024",
    type: "campaign",
  })) || [];

  // 4. Build lookbooks (if needed)
  const lookbooks: Lookbook[] = [];

  // 5. Build social object with .or(z.literal("")) pattern
  const social = {
    instagram: legacyData.social?.instagram || "",
    website: legacyData.social?.website || "",
    tiktok: "",
    youtube: "",
  };

  // 6. Return validated result
  return PortfolioSchema.parse({
    ...DEFAULT_PORTFOLIO,
    ...legacyData,
    name: legacyData.name || DEFAULT_PORTFOLIO.name,
    portfolio: mappedPortfolio,
    runwayShows,
    campaigns,
    social,
  });
}

function normalizeCategory(value: string): PortfolioItem["category"] {
  const lower = value?.toLowerCase()?.trim();
  if (!lower) return "Campaign";
  if (["runway", "fw", "ss"].includes(lower)) return "Runway";
  if (["editorial", "mag"].includes(lower)) return "Editorial";
  if (["campaign", "commercial"].includes(lower)) return "Campaign";
  return "Campaign";
}
```

## Validation Error Handling

### Strict Mode (Throws)

```typescript
// Throws ValidationError if data is invalid
export const portfolio = validatePortfolio(legacyData);

function validatePortfolio(data: unknown): Portfolio {
  const result = PortfolioSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Portfolio validation failed:\n${result.error.errors.map(e => 
      `${e.path.join(".")}: ${e.message}`
    ).join("\n")}`);
  }
  return result.data;
}
```

### Safe Mode (Returns Null)

```typescript
// Returns Portfolio | null on validation failure
export const portfolio = safeParsePortfolio(legacyData) ?? DEFAULT_PORTFOLIO;

function safeParsePortfolio(data: unknown): Portfolio | null {
  return PortfolioSchema.safeParse(data)?.data ?? null;
}
```

## Component Integration Pattern

```typescript
// components/AboutSection.tsx
import { portfolio, type Portfolio } from "../../data/portfolio";

interface AboutSectionProps {
  data?: Portfolio | null;
}

export default function AboutSection({ data }: AboutSectionProps) {
  // TypeScript guarantees 'data' is Portfolio | null
  const currentData = data ?? portfolio;

  return (
    <div>
      <h2>{currentData.name}</h2>
      <p>{currentData.bio}</p>
    </div>
  );
}
```

## Environment-Based Data Loading

```typescript
// src/data/portfolio.ts
import { validatePortfolio } from "./portfolio";

const DEFAULT_PORTFOLIO = {
  name: "Aya Romdhani",
  // ... defaults
};

if (process.env.NODE_ENV === "development") {
  // Use embedded default for fast dev server restarts
  export const portfolio = DEFAULT_PORTFOLIO;
} else {
  // Load from external file or database
  const data = readPortfolioFromEnv();
  export const portfolio = validatePortfolio(data);
}

function readPortfolioFromEnv(): any {
  const fs = require("fs");
  const path = require("path");
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "data", "portfolio.json"),
      "utf8"
    )
  );
}
```

## Testing Your Migration

```typescript
// tests/portfolio-validation.test.ts
import { PortfolioSchema, validatePortfolio, safeParsePortfolio } from "../src/data/portfolio";

describe("Portfolio Schema", () => {
  it("validates complete data correctly", () => {
    const result = PortfolioSchema.safeParse({
      name: "Test Model",
      height: 175,
      measurements: { bust: "34\"", waist: "24\"", hips: "34\"" },
      stats: { height: 175, shoeSize: "8 US", hair: "Brunette", eyes: "Hazel" },
      agency: "Test Agency",
      bio: "Test bio",
      runwayShows: [{ brand: "Brand", collection: "Collection" }],
      campaigns: [{ brand: "Brand", collection: "Collection" }],
      portfolio: [{
        id: "ebcd7890-1234-5678-90ab-cdef01234567",
        title: "Test",
        path: "/test.jpg",
        category: "Runway",
        brand: "Brand",
      }],
      social: { instagram: "https://instagram.com/test", website: "" },
      contact: { email: "test@example.com", management: "test@example.com", agencyName: "Test" },
    });

    expect(result.success).toBe(true);
  });

  it("throws on invalid UUID format", () => {
    expect(() => {
      PortfolioSchema.safeParse({
        ...DEFAULT_PORTFOLIO,
        portfolio: [{
          id: "invalid-uuid", // Should fail
          title: "Test",
          path: "/test.jpg",
          category: "Runway",
          brand: "Brand",
        }],
      }).success;
    }).toBe(false);
  });

  it("accepts empty strings for optional social URLs", () => {
    const result = PortfolioSchema.safeParse({
      ...DEFAULT_PORTFOLIO,
      social: {
        instagram: "", // Should be valid
        website: "",
        tiktok: "",
        youtube: "",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid category values", () => {
    const result = PortfolioSchema.safeParse({
      ...DEFAULT_PORTFOLIO,
      portfolio: [{
        id: "ebcd7890-1234-5678-90ab-cdef01234567",
        title: "Test",
        path: "/test.jpg",
        category: "Invalid", // Should fail
        brand: "Brand",
      }],
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("Invalid");
  });
});
```

## Performance Considerations

1. **Memoize data access** in components to prevent re-rendering on parent updates
2. **Use TypeScript strict mode** to catch type errors at compile time
3. **Validate once at startup** - don't validate on every render
4. **Consider virtualization** for large portfolio lists (>100 items)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid UUID" error | Generate UUIDs with `crypto.randomUUID()` or a UUID library |
| "Invalid URL" error | Ensure URLs include `https://` or use `.or(z.literal(""))` for empty strings |
| "Invalid category" error | Normalize categories to exact enum values |
| "Height out of range" error | Ensure height is between 140-220 cm |
| "Measurements format" error | Use format: `"34\""` (number + optional inch quote) |
