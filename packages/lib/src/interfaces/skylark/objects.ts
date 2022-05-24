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
  urlPath: string;
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

export interface SkylarkObject {
  self: string;
  type: ObjectTypes;
  isExpanded: true;
  uid: string;
  objectTitle: string;
  slug: string;
  title: {
    [key in TitleTypes]: string;
  };
  synopsis: {
    [key in SynopsisTypes]: string;
  };
  tags: string[];
  titleSort: string;
  credits?: Credits | UnexpandedObjects;
  ratings?: Ratings | UnexpandedObjects;
  themes?: ThemesAndGenres | UnexpandedObjects;
  genres?: ThemesAndGenres | UnexpandedObjects;
  images?: ImageUrls | UnexpandedObjects;
  items?: ExpandedSkylarkObjects | UnexpandedSkylarkObjects;
  parent?: AllEntertainment | UnexpandedSkylarkObject;
}

export interface Asset extends SkylarkObject {
  type: "asset";
}

export interface Movie extends SkylarkObject {
  type: "movie";
  // items: {
  //   isExpanded: true
  //   objects: Asset[]
  // } | UnexpandedSkylarkObjects;
}

export interface Episode extends SkylarkObject {
  type: "episode";
  number: number;
  // items: {
  //   isExpanded: true
  //   objects: Asset[]
  // } | UnexpandedSkylarkObjects;
}

export interface Season extends SkylarkObject {
  type: "season";
  numberOfEpisodes: number;
  number: number;
  year: number;
  // items: {
  //   isExpanded: true
  //   objects: (Episode | Asset)[]
  // } | UnexpandedSkylarkObjects;
}

export interface Brand extends SkylarkObject {
  type: "brand";
  // items: {
  //   isExpanded: true
  //   objects: (Movie | Episode | Season | Asset)[]
  // } | UnexpandedSkylarkObjects;
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
