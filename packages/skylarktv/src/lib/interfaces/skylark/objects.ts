import {
  CreditTypes,
  ObjectTypes,
  SetTypes,
  SynopsisTypes,
  TitleTypes,
} from "./types";

export interface UnexpandedObject {
  self: string;
}

export interface UnexpandedObjects {
  isExpanded: false;
  items: UnexpandedObject[];
}

export interface ExpandedObjects {
  isExpanded: true;
}

export interface UnexpandedSkylarkObject extends UnexpandedObject {
  type: ObjectTypes;
}

export interface UnexpandedParentObject extends UnexpandedSkylarkObject {
  isExpanded: false;
}

export interface UnexpandedSkylarkObjects {
  isExpanded: false;
  objects: UnexpandedSkylarkObject[];
}

export interface ExpandedSkylarkObjects {
  isExpanded: true;
  objects: AllEntertainment[];
}

export interface ImageUrl {
  self: string;
  url: string;
  urlPath?: string;
  type: string;
}

export interface ImageUrls extends ExpandedObjects {
  items: ImageUrl[];
}

export interface Credit {
  character: string;
  peopleUrl: {
    name?: string;
  };
  roleUrl: {
    title?: CreditTypes;
  };
}

export interface Credits extends ExpandedObjects {
  items: Credit[];
}

export interface ThemeGenre {
  name: string;
}
export interface ThemesAndGenres extends ExpandedObjects {
  items: ThemeGenre[];
}

export interface Rating {
  title: string;
  value: string;
}
export interface Ratings extends ExpandedObjects {
  items: Rating[];
}

export interface Tag {
  name: string;
}

export interface Tags extends ExpandedObjects {
  items: Tag[];
}

export interface SkylarkObject {
  self: string;
  type: ObjectTypes;
  isExpanded: true;
  uid: string;
  slug: string;
  title: {
    [key in TitleTypes]: string;
  };
  synopsis: {
    [key in SynopsisTypes]: string;
  };
  releaseDate: string;
  tags?: Tags | UnexpandedObjects;
  titleSort?: string;
  credits?: Credits | UnexpandedObjects;
  ratings?: Ratings | UnexpandedObjects;
  themes?: ThemesAndGenres | UnexpandedObjects;
  genres?: ThemesAndGenres | UnexpandedObjects;
  images?: ImageUrls | UnexpandedObjects;
  items?: ExpandedSkylarkObjects | UnexpandedSkylarkObjects;
  parent?: AllEntertainment | UnexpandedParentObject;
}

export interface Asset extends SkylarkObject {
  type: "asset";
}

export interface Movie extends SkylarkObject {
  type: "movie";
}

export interface Episode extends SkylarkObject {
  type: "episode";
  number?: number;
}

export interface Season extends SkylarkObject {
  type: "season";
  numberOfEpisodes?: number;
  number?: number;
}

export interface Brand extends SkylarkObject {
  type: "brand";
}

export interface Set extends SkylarkObject {
  type: SetTypes;
}

export type AllEntertainment =
  | SkylarkObject
  | Asset
  | Episode
  | Season
  | Movie
  | Brand
  | Set;

export enum DimensionKey {
  Property = "property",
  Region = "region",
  Language = "language",
  TimeTravel = "time-travel",
}

export type Dimensions = { [key in DimensionKey]: string };
