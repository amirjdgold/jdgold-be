import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Image as URL/path string — never binary. */
export const imageRefSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL/path is required'],
      trim: true,
    },
    alt: { type: String, trim: true, default: '' },
    caption: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

export const statisticSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    suffix: { type: String, trim: true, default: '' },
    icon: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

export const featureSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

export const cardSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    imageAlt: { type: String, trim: true, default: '' },
    icon: { type: String, trim: true, default: '' },
    link: { type: String, trim: true, default: '' },
    points: [{ type: String, trim: true }],
  },
  { _id: false }
);

export const labelValueSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

export const licenseSchema = new Schema(
  {
    country: { type: String, trim: true, default: '' },
    licenseType: { type: String, trim: true, default: '' },
    certificateName: { type: String, trim: true, default: '' },
    registrationNumber: { type: String, trim: true, default: '' },
    issueDate: { type: String, trim: true, default: '' },
    expiryDate: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    imageAlt: { type: String, trim: true, default: '' },
    details: [labelValueSchema],
  },
  { _id: false }
);

export const officeSchema = new Schema(
  {
    number: { type: Number, min: 1 },
    country: { type: String, required: true, trim: true },
    flagSrc: { type: String, trim: true, default: '' },
    details: [labelValueSchema],
    officeLocation: { type: String, trim: true, default: '' },
    licenseImage: { type: String, trim: true, default: '' },
    licenseImageAlt: { type: String, trim: true, default: '' },
    officeImage: { type: String, trim: true, default: '' },
    officeImageAlt: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

export const leadershipSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    experience: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    imageAlt: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

export const achievementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    points: [{ type: String, trim: true }],
    image: { type: String, trim: true, default: '' },
    imageAlt: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

export const marketAdvantageSchema = new Schema(
  {
    number: { type: String, trim: true, default: '' },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    imageAlt: { type: String, trim: true, default: '' },
    imageFirst: { type: Boolean, default: false },
    points: [{ type: String, trim: true }],
    sideItems: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
      },
    ],
  },
  { _id: false }
);

export const SECTION_TYPES = [
  'text',
  'features',
  'statistics',
  'cards',
  'gallery',
  'licenses',
  'offices',
  'leadership',
  'achievements',
  'market-advantages',
  'custom',
];

/**
 * Flexible page section. Only populate the arrays that the section type needs.
 * Keeps the CMS simple while covering all current JD Gold layouts.
 */
export const sectionSchema = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Section key is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Section type is required'],
      enum: {
        values: SECTION_TYPES,
        message: 'Invalid section type: `{VALUE}`',
      },
    },
    heading: { type: String, trim: true, default: '' },
    subheading: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    images: [imageRefSchema],
    icon: { type: String, trim: true, default: '' },
    sortOrder: { type: Number, default: 0 },
    statistics: [statisticSchema],
    features: [featureSchema],
    cards: [cardSchema],
    gallery: [imageRefSchema],
    licenses: [licenseSchema],
    offices: [officeSchema],
    leadership: [leadershipSchema],
    achievements: [achievementSchema],
    marketAdvantages: [marketAdvantageSchema],
  },
  { _id: false }
);

export const heroSchema = new Schema(
  {
    heading: { type: String, trim: true, default: '' },
    subheading: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    imageAlt: { type: String, trim: true, default: '' },
    backgroundImage: { type: String, trim: true, default: '' },
    logoSrc: { type: String, trim: true, default: '' },
    brandTagline: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

export const PAGE_TYPES = [
  'home',
  'about',
  'license-offices',
  'market-advantages',
  'custom',
];
