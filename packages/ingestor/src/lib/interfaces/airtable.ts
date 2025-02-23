import { FieldSet, Record } from "airtable";

export interface DimensionAirtables {
  properties: Record<FieldSet>[];
  regions: Record<FieldSet>[];
}

export interface TranslationAirtables {
  mediaObjects: Record<FieldSet>[];
  callToActions: Record<FieldSet>[];
  roles: Record<FieldSet>[];
  people: Record<FieldSet>[];
  credits: Record<FieldSet>[];
  genres: Record<FieldSet>[];
  themes: Record<FieldSet>[];
  articles: Record<FieldSet>[];
}

export interface Airtables {
  dimensions: DimensionAirtables;
  languages: Record<FieldSet>[];
  translations: TranslationAirtables;
  mediaObjects: Record<FieldSet>[];
  roles: Record<FieldSet>[];
  people: Record<FieldSet>[];
  credits: Record<FieldSet>[];
  genres: Record<FieldSet>[];
  themes: Record<FieldSet>[];
  ratings: Record<FieldSet>[];
  tags: Record<FieldSet>[];
  images: Record<FieldSet>[];
  availability: Record<FieldSet>[];
  audienceSegments: Record<FieldSet>[];
  sets: Record<FieldSet>[];
  setsMetadata: Record<FieldSet>[];
  assetTypes: Record<FieldSet>[];
  imageTypes: Record<FieldSet>[];
  tagTypes: Record<FieldSet>[];
  callToActions: Record<FieldSet>[];
  articles: Record<FieldSet>[];
}

export interface AvailabilityTableFields extends FieldSet {
  title: string;
  slug: string;
  type: string;
  starts?: string;
  ends?: string;
  properties?: string[];
  regions?: string[];
  segments?: string[];
}
