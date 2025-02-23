import { DeviceTypes, DimensionKey } from "../lib/interfaces";

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
    DimensionKey.Region | DimensionKey.CustomerType | DimensionKey.DeviceType,
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
    [DimensionKey.CustomerType]: {
      values: [
        { text: "Premium", value: "premium" },
        { text: "Standard", value: "standard" },
        { text: "Kids", value: "kids" },
      ],
    },
    [DimensionKey.DeviceType]: {
      values: [
        { text: "Desktop", value: DeviceTypes.PC },
        { text: "Mobile", value: DeviceTypes.Smartphone },
      ],
    },
    [DimensionKey.Region]: {
      values: [
        { text: "Europe", value: "europe" },
        { text: "North America", value: "north-america" },
        {
          text: "Middle East",
          value: "mena",
        },
      ],
    },
  },
  placeholderVideo: "/mux-video-intro.mp4",
};

const logoWithText =
  "http://res.cloudinary.com/dtcq102tb/image/upload/v1733746261/cropped-CountryLine-Site-Logo_oilxdk.png";
const logoOnly =
  "data:image/png;base64,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";

export const CLIENT_APP_CONFIG: typeof defaultAppConfig = {
  ...defaultAppConfig,
  name: "Countryline",
  description:
    "Welcome to the home of Country Music Online! View the latest videos, shows, and interviews of all your favourite Country Music artists in one place",
  colours: {
    accent: "#ea223c",
    primary: "#011832",
    header: "#ffffff",
  },
  showBySkylark: false,
  hideDimensionsSettings: true,
  header: {
    logo: {
      src: logoWithText,
      alt: "logo",
    },
    hideAppName: true,
  },
  loadingScreen: {
    logo: {
      src: logoOnly,
      alt: "Countryline Logo",
    },
    hideAppName: true,
  },
  favicon: logoOnly,
  withIntercom: false,
  dimensions: {
    ...defaultAppConfig.dimensions,
    [DimensionKey.CustomerType]: {
      values: [{ text: "Public", value: "public" }],
    },
  },
  placeholderVideo: "",
};
