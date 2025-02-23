import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import customParseFormat from "dayjs/plugin/customParseFormat";

import "dayjs/locale/pt";
import { Maybe } from "graphql/jsutils/Maybe";
import { graphQLClient, skylarkRequest } from "../skylark";
import {
  DimensionKey,
  Dimensions,
  DimensionTypes,
  EntertainmentType,
  GraphQLObjectTypes,
  ImageTypes,
  ImageUrls,
  MetadataType,
  SetTypes,
  SynopsisTypes,
  TitleTypes,
  UnexpandedObjects,
} from "../interfaces";
import {
  ThemeListing,
  GenreListing,
  SkylarkTagListing,
  RatingListing,
  SkylarkImageListing,
  ImageType,
  SkylarkTVSupportedImageType,
  Entertainment,
  Availability,
  Credit,
  Metadata,
} from "../../types";
import { getImageSrc } from "./classic";
import { LOCAL_STORAGE } from "../../constants/app";
import { CLOUDINARY_ENVIRONMENT } from "../../constants/env";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export const hasProperty = <T, K extends PropertyKey, V = unknown>(
  object: T,
  property: K,
): object is T & Record<K, V> =>
  object && Object.prototype.hasOwnProperty.call(object, property);

/**
 * getImageSrcAndSizeByWindow - returns the image src with the size set to the window height or width, whichever is more
 * Skylark keeps aspect ratio itself, so send the largest value for both width and height
 * @param images {ImageUrls} - All images returned by Skylark
 * @param type {ImageTypes} - The image type to find and return
 * @returns {string} the image URL or an empty string, without size if window is undefined
 */
export const getImageSrcAndSizeByWindow = (
  images: UnexpandedObjects | ImageUrls | undefined,
  type: ImageTypes,
): string => {
  const imageSize =
    typeof window !== "undefined" &&
    (window.innerHeight > window.innerWidth
      ? `${window.innerHeight}x${window.innerHeight}`
      : `${window.innerWidth}x${window.innerWidth}`);

  return getImageSrc(images, type, imageSize || "");
};

export const skylarkRequestWithLocalStorage = <T>(
  query: string,
  headers: Record<string, string>,
  variables?: Record<string, unknown>,
) => {
  if (typeof window !== "undefined") {
    // Allow users to give their own Skylark to connect to
    const localStorageUri = window.localStorage.getItem(LOCAL_STORAGE.uri);
    const localStorageApiKey = window.localStorage.getItem(
      LOCAL_STORAGE.apikey,
    );
    if (localStorageUri && localStorageApiKey) {
      return skylarkRequest<T>(
        localStorageUri,
        localStorageApiKey,
        query,
        variables || {},
        headers,
      );
    }
  }

  return graphQLClient.request<T>(query, variables || {}, headers);
};

// Make request to Skylark using values from LocalStorage if found
export const skylarkRequestWithDimensions = <T>(
  query: string,
  dimensions: Dimensions,
  optVariables?: Record<string, unknown>,
) => {
  const headers: Record<string, string> = {
    "x-sl-dimension-customer-types": dimensions[DimensionKey.CustomerType],
    // "x-sl-dimension-device-types": dimensions[DimensionKey.DeviceType],
    // "x-sl-dimension-regions": dimensions[DimensionKey.Region],
    "x-language": dimensions[DimensionKey.Language],
  };

  if (dimensions[DimensionKey.TimeTravel]) {
    headers["x-time-travel"] = dimensions[DimensionKey.TimeTravel];
  }

  const variables = {
    ...optVariables,
  };

  return skylarkRequestWithLocalStorage<T>(query, headers, variables);
};

const persistQueryValue = (query: NextParsedUrlQuery, key: string) =>
  query[key] ? { [key]: query[key] } : {};

export const persistQueryValues = (query: NextParsedUrlQuery, keys: string[]) =>
  keys.reduce(
    (prev, key) => ({ ...prev, ...persistQueryValue(query, key) }),
    {} as NextParsedUrlQuery,
  );

export const formatGraphQLCredits = (
  credits: Credit[],
): { personUid: string; name: string; character?: string }[] => {
  const creditsWithName = credits.filter((credit) =>
    Boolean(credit?.people?.objects?.[0]?.name),
  );

  return creditsWithName
    .map((credit) => {
      const person = credit?.people?.objects?.[0];
      if (!person) {
        return null;
      }

      // const name =
      //   showCharacterName && credit?.character && person.name
      //     ? `${person.name} - ${credit?.character}`
      //     : person.name;

      return {
        personUid: person.uid,
        name: person.name || "",
        character: credit?.character,
      };
    })
    .filter(
      (
        credit,
      ): credit is { personUid: string; name: string; character: string } =>
        Boolean(credit),
    );
};

export const splitAndFormatGraphQLCreditsByInternalTitle = (
  gqlCredits: Maybe<Maybe<Credit>[]> | null | undefined,
): Record<
  string,
  {
    formattedCredits: { personUid: string; name: string }[];
    translatedRole: string;
  }
> => {
  if (!gqlCredits) {
    return {};
  }

  const splitCredits = gqlCredits.reduce(
    (prev, credit) => {
      // This filtering needs on the role internal_title field or it uses `_default`
      // It assumes there is only one role
      if (!credit) {
        return prev;
      }

      const role =
        (credit?.roles?.objects &&
          credit.roles.objects.length === 0 &&
          hasProperty(credit.roles.objects[0], "internal_title") &&
          credit.roles.objects[0].internal_title) ||
        "_default";

      if (hasProperty(prev, role) && prev[role]) {
        return {
          ...prev,
          [role]: [...prev[role], credit],
        };
      }

      return {
        ...prev,
        [role]: [credit],
      };
    },
    {} as Record<string, Credit[]>,
  );

  const formattedCredits = Object.fromEntries(
    Object.entries(splitCredits).map(([role, credits]) => [
      role,
      {
        formattedCredits: formatGraphQLCredits(credits),
        translatedRole: credits?.[0].roles?.objects?.[0]?.title || "-",
      },
    ]),
  );

  return formattedCredits;
};

export const convertObjectToName = (
  listing:
    | Maybe<ThemeListing>
    | Maybe<GenreListing>
    | Maybe<SkylarkTagListing>
    | undefined,
): string[] => {
  if (!listing || !listing.objects || listing.objects.length === 0) {
    return [];
  }
  return (
    listing?.objects?.map((obj) => (obj && obj.name ? obj.name : "")) || []
  );
};

export const getFirstRatingValue = (
  ratings: Maybe<RatingListing> | undefined,
): string => {
  if (!ratings || !ratings.objects || ratings.objects.length === 0) {
    return "";
  }
  return ratings?.objects?.[0]?.value || "";
};

export const getGraphQLImageSrc = (
  images: Maybe<SkylarkImageListing> | undefined,
  type: ImageType | SkylarkTVSupportedImageType,
): string => {
  if (!images || !images.objects || images.objects.length === 0) {
    return "";
  }

  // Filter any Images with an empty URL
  const urlImages = images.objects.filter((img) => !!img?.url);
  const externalUrlImages = images.objects.filter((img) => !!img?.external_url);

  if (urlImages.length === 0 && externalUrlImages.length === 0) {
    return "";
  }

  const urlImageWithMatchingType = urlImages.find((img) => img?.type === type);
  const externalUrlImageWithMatchingType = externalUrlImages.find(
    (img) => img?.type === type,
  );

  // Prioritise images with a URL over External URL
  if (urlImageWithMatchingType?.url) {
    return urlImageWithMatchingType.url;
  }

  if (externalUrlImageWithMatchingType?.external_url) {
    return externalUrlImageWithMatchingType.external_url;
  }

  // Default to first image if no matching type is found
  const url = urlImages?.[0]?.url || externalUrlImages?.[0]?.external_url || "";

  return url;
};

/**
 * Returns the title from the titles object using a given order of priority
 * Defaults to long, medium, short
 * @param titles the titles object
 * @param priority order of priority
 * @param objectTitle optional objectTitle
 * @returns {string}
 */
export const getTitleByOrder = (
  titles: { [k in TitleTypes]?: string | null } | undefined,
  priority?: TitleTypes[],
  objectTitle?: string,
): string => {
  if (!titles) return objectTitle || "";

  const defaultPriority: TitleTypes[] = ["title", "title_short"];
  const foundType = (priority || defaultPriority).find((type) =>
    titles[type] && typeof titles[type] === "string" ? titles[type] : null,
  );

  return foundType ? (titles[foundType] as string) : objectTitle || "";
};

export const getTitleByOrderForGraphQLObject = (
  obj?: Entertainment | Maybe<Entertainment>,
  priority?: TitleTypes[],
) => {
  if (!obj) {
    return "";
  }
  return getTitleByOrder(
    {
      title: obj.title || "",
      title_short: obj.title_short || "",
    },
    priority,
  );
};

/**
 * Returns the synopsis from the synopsis object using a given order of priority
 * Defaults to long, medium, short
 * @param synopsis the synopsis object
 * @param priority optional order of priority
 * @returns {string}
 */
export const getSynopsisByOrder = (
  synopsis: { [s in SynopsisTypes]: string } | undefined,
  priority?: SynopsisTypes[],
): string => {
  if (!synopsis) return "";

  const defaultPriority: SynopsisTypes[] = ["synopsis", "synopsis_short"];
  const foundType = (priority || defaultPriority).find(
    (type) => synopsis[type] || null,
  );

  return foundType ? synopsis[foundType] : "";
};

export const getSynopsisByOrderForGraphQLObject = (
  obj?: Entertainment,
  priority?: SynopsisTypes[],
) => {
  if (!obj) {
    return "";
  }
  return getSynopsisByOrder(
    {
      synopsis: obj.synopsis || "",
      synopsis_short: obj?.synopsis_short || "",
    },
    priority,
  );
};

export const createGraphQLQueryDimensions = (
  activeDimensions: Omit<Dimensions, "language"> & { language?: string | null },
) => {
  const dimensions: { dimension: DimensionTypes; value: string }[] = [
    {
      dimension: "device-types",
      value: activeDimensions[DimensionKey.DeviceType],
    },
    {
      dimension: "customer-types",
      value: activeDimensions[DimensionKey.CustomerType],
    },
    { dimension: "regions", value: activeDimensions[DimensionKey.Region] },
  ];

  return {
    ...(activeDimensions.language
      ? { language: activeDimensions.language }
      : {}),
    dimensions,
  };
};

export const convertTypenameToObjectType = (
  typename: GraphQLObjectTypes | undefined,
): EntertainmentType | MetadataType => {
  switch (typename) {
    case "Episode":
      return "episode";
    case "Movie":
      return "movie";
    case "Season":
      return "season";
    case "Person":
      return "person";
    case "LiveStream":
      return "live-stream";
    case "Brand":
      return "brand";
    default:
      // Best guess
      return (typename?.toLowerCase() || "unknown") as MetadataType;
  }
};

export const convertGraphQLSetType = (setType?: string): SetTypes => {
  switch (setType) {
    case "COLLECTION":
      return "collection";
    case "SLIDER":
      return "slider";
    case "RAIL":
      return "rail";
    case "GRID":
      return "grid";
    default:
      return "page";
  }
};

export const getFurthestAvailabilityEndDate = (
  objects?: Availability[] | null,
): Dayjs | null => {
  if (!objects || objects.length === 0) {
    return null;
  }

  const orderedDates = objects
    ?.filter(({ end }) => !!end)
    .sort(({ end: endA }, { end: endB }) =>
      dayjs(endA as string).isBefore(endB as string) ? 1 : -1,
    );
  return orderedDates[0] ? dayjs(orderedDates[0].end as string) : null;
};

export const is2038Problem = (date: Dayjs) =>
  date.isSame("2038-01-19T03:14:07.000Z");

export const getTimeFromNow = (
  d: Dayjs,
): { unit: "day" | "month" | "year" | "never"; number: number } => {
  if (is2038Problem(d)) {
    return {
      unit: "never",
      number: -1,
    };
  }

  const now = dayjs();
  const yearsFromNow = d.diff(now, "years");
  if (yearsFromNow > 0) {
    return {
      unit: "year",
      number: yearsFromNow,
    };
  }

  const monthsFromNow = d.diff(now, "months");
  if (monthsFromNow > 0) {
    return {
      unit: "month",
      number: monthsFromNow,
    };
  }

  const daysFromNow = d.diff(now, "days");
  return {
    unit: "day",
    number: daysFromNow,
  };
};

export const isSkylarkUid = (uid: string) => {
  // Regex for a ULID
  // eslint-disable-next-line prefer-regex-literals
  const regex = new RegExp("[0-7][0-9A-HJKMNP-TV-Z]{25}");
  return regex.test(uid);
};

export const getLanguageFromObjectLanguageData = (object: object) =>
  (hasProperty(object, "_meta") &&
    hasProperty(object._meta, "language_data") &&
    hasProperty(object._meta.language_data, "language") &&
    typeof object._meta.language_data.language === "string" &&
    object._meta.language_data.language) ||
  undefined;

/**
 * formatReleaseDate - formats the release date
 * @param date date string
 * @param format optional format for the date
 * @returns string, empty if the date is empty
 */
export const formatReleaseDate = (
  date?: string,
  locale = "en-gb",
  format = "MMMM D, YYYY",
): string => {
  const formattedDate = date
    ? dayjs(date, ["YYYY-MM-DD", "YYYY-MM-DDZ", "X", "x"])
        .locale(locale)
        .format(format)
    : "";

  return formattedDate;
};

/**
 * formatYear - takes a date, returns the year
 * @param date date string
 * @returns string, empty if the date is empty
 */
export const formatYear = (date?: string, locale?: string) =>
  formatReleaseDate(date, locale, "YYYY");

/**
 * sortByNumber - to be passed into an array.sort
 * Using the number property, returns the array in ascending order
 */
export const sortObjectByNumberProperty = (
  a: { number?: number },
  b: { number?: number },
) => ((a.number || 0) > (b.number || 0) ? 1 : -1);

/**
 * sortArrayIntoAlphabeticalOrder - to be passed into an array.sort
 * Sorts strings into alphabetical order
 */
export const sortArrayIntoAlphabeticalOrder = (a: string, b: string) => {
  const aUpper = a.toUpperCase();
  const bUpper = b.toUpperCase();
  // eslint-disable-next-line no-nested-ternary
  return aUpper < bUpper ? -1 : aUpper > bUpper ? 1 : 0;
};

export const addCloudinaryOnTheFlyImageTransformation = (
  imageUrl: string,
  opts: { height?: number; width?: number },
) => {
  // If the Cloudinary Environment is falsy, return the original image URL
  if (!imageUrl || !CLOUDINARY_ENVIRONMENT) {
    return imageUrl;
  }

  const cloudinaryDomain = "://res.cloudinary.com";

  const isAlreadyCloudinary = imageUrl.includes(cloudinaryDomain);

  const urlOpts = [];
  if (opts.height) {
    urlOpts.push(`h_${opts.height}`);
  }
  if (opts.width) {
    urlOpts.push(`w_${opts.width}`);
  }

  if (opts.height && opts.width) {
    urlOpts.push("c_fill");
  }

  const urlOptsStr = urlOpts.length > 0 ? `${urlOpts.join(",")}` : "";

  if (isAlreadyCloudinary) {
    // Typical Cloudinary URL: https://res.cloudinary.com/da4t73d6g/image/upload/v1729255243/pe1hmqsf9fws91zkax6z.jpg
    // We can add transformations in the URL like: https://res.cloudinary.com/da4t73d6g/image/upload/c_pad,h_300,w_300/v1729255243/pe1hmqsf9fws91zkax6z.jpg

    const splitUrl = imageUrl.split(cloudinaryDomain);
    const imagePath = splitUrl[1];
    const splitPath = imagePath.split("/");

    const canInsertTransformations =
      splitPath.length === 6 &&
      splitPath[2] === "image" &&
      splitPath[3] === "upload" &&
      splitPath[4].startsWith("v");

    if (canInsertTransformations) {
      splitPath.splice(4, 0, urlOptsStr);
      const newPath = splitPath.join("/");

      const cloudinaryUrl = `${splitUrl[0]}${cloudinaryDomain}${newPath}`;
      return cloudinaryUrl;
    }

    return imageUrl;
  }

  const cloudinaryUrl = `https${cloudinaryDomain}/${CLOUDINARY_ENVIRONMENT}/image/fetch/${urlOptsStr}${urlOptsStr ? "/" : ""}${imageUrl}`;
  return cloudinaryUrl;
};

export const useNonSkylarkEntertainmentModelProperty = <T>(
  metadata: Metadata | null | undefined,
  property: string,
  defaultValue?: T,
) => {
  if (metadata && hasProperty(metadata, property)) {
    return metadata.property as T;
  }

  return defaultValue;
};
