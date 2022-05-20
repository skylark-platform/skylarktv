export type SetTypes = "slider" | "rail" | "collection";
export type EntertainmentType =
  | "movie"
  | "episode"
  | "season"
  | "brand"
  | "asset";
export type ObjectTypes = EntertainmentType | SetTypes | null;

export interface UnexpandedObject {
  self: string;
  isExpanded: false;
}

export interface UnexpandedSkylarkObject extends UnexpandedObject {
  type: ObjectTypes;
}

export interface ImageUrl {
  self: string;
  isExpanded: true;
  url: string;
  urlPath: string;
  type: string;
}

export type ImageUrls = UnexpandedObject[] | ImageUrl[];

export interface Credit {
  isExpanded: true;
  character: string;
  peopleUrl: {
    name?: string;
  };
  roleUrl: {
    title?: string;
  };
}

export type Credits = UnexpandedObject[] | Credit[];

export interface SkylarkObject {
  self: string;
  type: ObjectTypes;
  isExpanded: true;
  uid: string;
  objectTitle: string;
  slug: string;
  releaseDate: string;
  title: {
    short: string;
    medium: string;
    long: string;
  };
  synopsis: {
    short: string;
    medium: string;
    long: string;
  };
  tags: string[];
  titleSort: string;
  credits: Credits;
  ratingUrls: string[];
  genreUrls: string[];
  themeUrls: string[];
  images: ImageUrls;
  items: AllEntertainment[];
}

export interface Asset extends SkylarkObject {
  type: "asset";
}

export interface Movie extends SkylarkObject {
  type: "movie";
  items: (Asset | UnexpandedSkylarkObject)[];
}

export interface Episode extends SkylarkObject {
  type: "episode";
  number: number;
  items: (Asset | UnexpandedSkylarkObject)[];
}

export interface Season extends SkylarkObject {
  type: "season";
  numberOfEpisodes: number;
  number: number;
  items: (Episode | Asset | UnexpandedSkylarkObject)[];
}

export interface Brand extends SkylarkObject {
  type: "brand";
  items: (Movie | Episode | Season | Asset | UnexpandedSkylarkObject)[];
}

export interface Set extends SkylarkObject {
  type: SetTypes;
}

export type AllEntertainment =
  | SkylarkObject
  | UnexpandedSkylarkObject
  | Asset
  | Episode
  | Season
  | Movie
  | Brand
  | Set;