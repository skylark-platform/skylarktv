import { DimensionKey } from "../lib/interfaces";

export const ALL_DIMENSION_QUERY_KEYS: DimensionKey[] =
  Object.values(DimensionKey);

export const LOCAL_STORAGE = {
  uri: "skylarktv:uri",
  apikey: "skylarktv:apikey",
};

const defaultAppConfig: {
  name: string;
  description?: string;
  colours: {
    primary: string;
    accent: string;
    header?: string;
  };
  favicon?: string;
  showBySkylark: boolean;
  dimensions: Record<
    DimensionKey.Region | DimensionKey.Property,
    { values: { text: string; value: string }[] }
  >;
  withIntercom: boolean;
  withSegment: boolean;
  hideDimensionsSettings: boolean;
  defaultLanguage?: string;
  header?: {
    logo: {
      src: string;
      alt: string;
    };
    hideAppName: boolean;
  };
  loadingScreen?: {
    logo: {
      src: string;
      alt: string;
    };
    hideAppName: boolean;
  };
  placeholderVideo: string;
} = {
  name: "SkylarkTV",
  colours: {
    primary: "#5b45ce",
    accent: "#ff385c",
  },
  showBySkylark: true,
  withIntercom: true,
  withSegment: true,
  hideDimensionsSettings: false,
  dimensions: {
    [DimensionKey.Property]: {
      values: [{ text: "Fremantle", value: "fremantle" }],
    },
    [DimensionKey.Region]: {
      values: [
        { text: "Europe", value: "europe" },
        { text: "Canada", value: "canada" },
      ],
    },
  },
  placeholderVideo: "/mux-video-intro.mp4",
};

export const CLIENT_APP_CONFIG: typeof defaultAppConfig = {
  ...defaultAppConfig,
  name: "Fremantle",
  description: "",
  colours: {
    primary: "rgb(18, 16, 37)",
    accent: "#FFFFFF",
    header: "rgb(27 26 32 / 0.7)",
  },
  showBySkylark: true,
  hideDimensionsSettings: false,
  withIntercom: false,
  dimensions: {
    [DimensionKey.Property]: {
      values: [{ text: "Fremantle", value: "fremantle" }],
    },
    [DimensionKey.Region]: {
      values: [
        { text: "Europe", value: "europe" },
        { text: "Canada", value: "canada" },
      ],
    },
  },
};
