import {
  Brand,
  Episode,
  LiveStream,
  Movie,
  Season,
  SkylarkSet,
  TimecodeEvent,
  TimecodeEventType,
} from "./gql";

export type Entertainment =
  | Episode
  | Movie
  | Brand
  | Season
  | SkylarkSet
  | LiveStream;

export type GQLError = {
  response: {
    errors?: { errorType: string; message: string }[];
    status?: number;
  };
};

export enum SkylarkTVSupportedSetType {
  // Built in
  Collection = "COLLECTION",
  Page = "PAGE",
  HomePage = "HOMEPAGE",
  Rail = "RAIL",
  Slider = "SLIDER",
  // Additional, added by ingestor
  RailInset = "RAIL_INSET",
  RailMovie = "RAIL_MOVIE",
  RailPortrait = "RAIL_PORTRAIT",
  RailWithSynopsis = "RAIL_WITH_SYNOPSIS",
  Grid = "GRID",
  GridPortrait = "GRID_PORTRAIT",
}

export enum SkylarkTVSupportCallToActionType {
  // Built in
  SignUp = "SIGN_UP",
  ComingSoon = "COMING_SOON",
  LinkToRelatedObject = "LINK_TO_RELATED_OBJECT",
  LinkToUrl = "LINK_TO_URL",
}

export enum SkylarkTVSupportedImageType {
  // Built in
  Background = "BACKGROUND",
  Feature = "FEATURE",
  Footer = "FOOTER",
  Header = "HEADER",
  Landscape = "LANDSCAPE",
  Main = "MAIN",
  Poster = "POSTER",
  PostLive = "POST_LIVE",
  Preview = "PREVIEW",
  PreLive = "PRE_LIVE",
  Thumbnail = "THUMBNAIL",
  // Additional, added by ingestor
  Character = "CHARACTER",
}

// Additional fields added by ingestor
export enum SkylarkTVAdditionalFields {
  PreferredImageType = "preferred_image_type",
  AudienceRating = "audience_rating",
  Budget = "budget",
}

export type TimecodeEventWithType = TimecodeEvent & { type: TimecodeEventType };
