export type SetTypes = "slider" | "rail" | "grid" | "collection" | "page";
export type EntertainmentType =
  | "movie"
  | "episode"
  | "season"
  | "brand"
  | "asset"
  | "live-stream";
export type MetadataType = "person";
export type ObjectTypes = EntertainmentType | SetTypes | MetadataType | null;

export type ImageTypes = "Thumbnail" | "Main" | "Poster";

export type CreditTypes =
  | "Actor"
  | "Director"
  | "Writer"
  | "Engineer"
  | "Presenter";

export enum DeviceTypes {
  Smartphone = "smartphone",
  PC = "pc",
}

export type TitleTypes = "title" | "title_short";

export type SynopsisTypes = "synopsis" | "synopsis_short";

export type DimensionTypes = "properties" | "regions";

export type GraphQLMediaObjectTypes =
  | "Brand"
  | "Season"
  | "Episode"
  | "Movie"
  | "SkylarkAsset"
  | "SkylarkLiveAsset"
  | "LiveStream";

// Usually customer instances
export type OptionalCustomGraphQLObjectTypes = "TagCategory";

export type GraphQLSetObjectTypes = "SkylarkSet";

export type GraphQLObjectTypes =
  | GraphQLMediaObjectTypes
  | OptionalCustomGraphQLObjectTypes
  | GraphQLSetObjectTypes
  | "Theme"
  | "Genre"
  | "Rating"
  | "Person"
  | "Role"
  | "SkylarkTag"
  | "Credit"
  | "Dimension"
  | "DimensionValue"
  | "Availability"
  | "AudienceSegment"
  | "SkylarkImage"
  | "CallToAction"
  | "SkylarkLiveStream"
  | "Game"
  | "Article";
