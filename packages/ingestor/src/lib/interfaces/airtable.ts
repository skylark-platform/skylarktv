import { FieldSet, Record } from "airtable";

export interface DimensionAirtables {
  affiliates: Record<FieldSet>[];
  customerTypes: Record<FieldSet>[];
  deviceTypes: Record<FieldSet>[];
  languages: Record<FieldSet>[];
  locales: Record<FieldSet>[];
  operatingSystems: Record<FieldSet>[];
  regions: Record<FieldSet>[];
  viewingContext: Record<FieldSet>[];
}

export interface TranslationAirtables {
  mediaObjects: Record<FieldSet>[];
}

export interface Airtables {
  dimensions: DimensionAirtables;
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
  availibility: Record<FieldSet>[];
  setsMetadata: Record<FieldSet>[];
  assetTypes: Record<FieldSet>[];
  imageTypes: Record<FieldSet>[];
  tagTypes: Record<FieldSet>[];
}