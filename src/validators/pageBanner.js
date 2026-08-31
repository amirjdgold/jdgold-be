import { z } from 'zod';
import { PAGE_TYPES, SECTION_TYPES } from '../models/schemas/contentBlocks.js';

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Slug is required')
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase kebab-case (letters, numbers, hyphens)'
  );

const imageRefSchema = z.object({
  url: z.string().trim().min(1, 'Image URL/path is required'),
  alt: z.string().trim().optional().default(''),
  caption: z.string().trim().optional().default(''),
  order: z.number().optional().default(0),
});

const statisticSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
  suffix: z.string().trim().optional().default(''),
  icon: z.string().trim().optional().default(''),
});

const featureSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional().default(''),
  icon: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
});

const cardSchema = z.object({
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
  imageAlt: z.string().trim().optional().default(''),
  icon: z.string().trim().optional().default(''),
  link: z.string().trim().optional().default(''),
  points: z.array(z.string().trim()).optional().default([]),
});

const labelValueSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

const licenseSchema = z.object({
  country: z.string().trim().optional().default(''),
  licenseType: z.string().trim().optional().default(''),
  certificateName: z.string().trim().optional().default(''),
  registrationNumber: z.string().trim().optional().default(''),
  issueDate: z.string().trim().optional().default(''),
  expiryDate: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
  imageAlt: z.string().trim().optional().default(''),
  details: z.array(labelValueSchema).optional().default([]),
});

const officeSchema = z.object({
  number: z.number().min(1).optional(),
  country: z.string().trim().min(1),
  flagSrc: z.string().trim().optional().default(''),
  details: z.array(labelValueSchema).optional().default([]),
  officeLocation: z.string().trim().optional().default(''),
  licenseImage: z.string().trim().optional().default(''),
  licenseImageAlt: z.string().trim().optional().default(''),
  officeImage: z.string().trim().optional().default(''),
  officeImageAlt: z.string().trim().optional().default(''),
});

const leadershipSchema = z.object({
  title: z.string().trim().min(1),
  name: z.string().trim().min(1),
  experience: z.string().trim().optional().default(''),
  bio: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
  imageAlt: z.string().trim().optional().default(''),
});

const achievementSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional().default(''),
  points: z.array(z.string().trim()).optional().default([]),
  image: z.string().trim().optional().default(''),
  imageAlt: z.string().trim().optional().default(''),
});

const marketAdvantageSchema = z.object({
  number: z.string().trim().optional().default(''),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
  imageAlt: z.string().trim().optional().default(''),
  imageFirst: z.boolean().optional().default(false),
  points: z.array(z.string().trim()).optional().default([]),
  sideItems: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().optional().default(''),
      })
    )
    .optional()
    .default([]),
});

const sectionSchema = z.object({
  key: z.string().trim().min(1, 'Section key is required'),
  type: z.enum(SECTION_TYPES),
  heading: z.string().trim().optional().default(''),
  subheading: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
  images: z.array(imageRefSchema).optional().default([]),
  icon: z.string().trim().optional().default(''),
  sortOrder: z.number().optional().default(0),
  statistics: z.array(statisticSchema).optional().default([]),
  features: z.array(featureSchema).optional().default([]),
  cards: z.array(cardSchema).optional().default([]),
  gallery: z.array(imageRefSchema).optional().default([]),
  licenses: z.array(licenseSchema).optional().default([]),
  offices: z.array(officeSchema).optional().default([]),
  leadership: z.array(leadershipSchema).optional().default([]),
  achievements: z.array(achievementSchema).optional().default([]),
  marketAdvantages: z.array(marketAdvantageSchema).optional().default([]),
});

const heroSchema = z.object({
  heading: z.string().trim().optional().default(''),
  subheading: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
  imageAlt: z.string().trim().optional().default(''),
  backgroundImage: z.string().trim().optional().default(''),
  logoSrc: z.string().trim().optional().default(''),
  brandTagline: z.string().trim().optional().default(''),
});

export const pageSlugParamsSchema = z.object({
  slug: slugSchema,
});

export const mongoIdParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
});

export const createPageSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  slug: slugSchema,
  pageType: z.enum(PAGE_TYPES),
  metaTitle: z.string().trim().max(70).optional().default(''),
  metaDescription: z.string().trim().max(320).optional().default(''),
  hero: heroSchema.optional().default({}),
  sections: z.array(sectionSchema).optional().default([]),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().min(0).optional().default(0),
});

export const updatePageSchema = createPageSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field is required' }
);

export const createBannerSchema = z.object({
  title: z.string().trim().min(1, 'Banner title is required').max(200),
  images: z
    .array(imageRefSchema)
    .min(1, 'Banner must include at least one image'),
  imageAlt: z.string().trim().max(200).optional().default(''),
  link: z.string().trim().max(500).optional().default(''),
  order: z.number().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
});

export const updateBannerSchema = createBannerSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field is required' }
);
