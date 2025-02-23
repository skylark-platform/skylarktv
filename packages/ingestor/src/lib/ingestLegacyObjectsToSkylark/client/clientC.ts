/* eslint-disable no-console */
import dayjs from "dayjs";
import { FieldSet } from "airtable";
import {
  FetchedLegacyObjects,
  LegacyAsset,
  LegacyBrand,
  LegacyEpisode,
  LegacyGenre,
  LegacyImage,
  LegacyObjectType,
  LegacyObjects,
  LegacyPerson,
  LegacyRating,
  LegacyRole,
  LegacySchedule,
  LegacySeason,
  LegacySet,
  LegacyTag,
  LegacyTagCategory,
  ParsedSL8Credits,
} from "../types/legacySkylark";

import { createObjectsInSkylark } from "../skylark";
import { ConvertedLegacyObject } from "../types/skylark";

import { clearUnableToFindVersionNoneObjectsFile } from "../../skylark/saas/fs";
import {
  commonSkylarkConfigurationUpdates,
  createEmptySkylarkObjects,
  fetchAndWriteLegacyObjects,
} from "./common";
import { convertSL8CreditsToLegacyObjects } from "../legacy";

import { createSetContent } from "../skylarkRelationships";
import {
  createDimensions,
  createOrUpdateAvailability,
  createOrUpdateDimensionValues,
  getExistingDimensions,
} from "../../skylark/saas/availability";
import { GraphQLDimension } from "../../interfaces";
import { getValidPropertiesForObject } from "../../skylark/saas/get";

interface CustomerCLegacyObjects
  extends Record<string, FetchedLegacyObjects<LegacyObjects[0]>> {
  tagCategories: FetchedLegacyObjects<LegacyTagCategory>;
  tags: FetchedLegacyObjects<LegacyTag>;
  genres: FetchedLegacyObjects<LegacyGenre>;
  ratings: FetchedLegacyObjects<LegacyRating>;
  people: FetchedLegacyObjects<LegacyPerson>;
  roles: FetchedLegacyObjects<LegacyRole>;
  images: FetchedLegacyObjects<LegacyImage>;
  assets: FetchedLegacyObjects<LegacyAsset>;
  episodes: FetchedLegacyObjects<LegacyEpisode>;
  seasons: FetchedLegacyObjects<LegacySeason>;
  brands: FetchedLegacyObjects<LegacyBrand>;
  sets: FetchedLegacyObjects<LegacySet>;
  schedules: FetchedLegacyObjects<LegacySchedule>;
}

const languagesToCheck = ["en-gb"];

const convertLegacyObject = (
  legacyObject: LegacyObjects[0] | ParsedSL8Credits,
): ConvertedLegacyObject | null => {
  // eslint-disable-next-line no-underscore-dangle
  const legacyObjectType = legacyObject._type;
  const legacyUid = legacyObject.uid;
  if (!legacyObjectType) {
    throw new Error(
      `[convertLegacyObject] Unknown legacy object type: ${legacyUid}`,
    );
  }

  const commonFields = {
    ...legacyObject, // By adding the whole legacy object to each object, the introspection create will add any missing fields that are
    external_id: legacyObject.uid,
    title_sort: legacyObject.data_source_id, // Switch this to External ID when client happy
  };

  if (legacyObjectType === LegacyObjectType.Schedules) {
    return {
      ...commonFields,
    };
  }

  if (legacyObjectType === LegacyObjectType.Assets) {
    const assetType = legacyObject.asset_type_url?.name || null;

    const ovp = legacyObject.ovps?.[0] || null;
    const hasOvp = Boolean(ovp && ovp?.playback_id);

    return {
      ...commonFields,
      internal_title: legacyObject.title,
      title_short: legacyObject.title_short || null,
      title: legacyObject.title,
      synopsis: legacyObject.synopsis_long || null,
      synopsis_short: legacyObject.synopsis_medium || null,
      type: assetType,
      duration: legacyObject.duration_in_seconds,
      url: legacyObject.url !== "" ? legacyObject.url : null,
      release_date: legacyObject.release_date,
      // Mux specific
      // external_id: ovp.asset_id,
      provider: hasOvp ? "MUX" : null,
      hls_id: hasOvp ? ovp.playback_id : null,
      hls_url: hasOvp ? `https://stream.mux.com/${ovp.playback_id}.m3u8` : null,
      hls_dashboard: hasOvp ? "https://dashboard.mux.com" : null,
      status: hasOvp ? "created" : null,
      policy: "PRIVATE",
    };
  }

  if (legacyObjectType === LegacyObjectType.Episodes) {
    return {
      ...commonFields,
      internal_title: legacyObject.title,
      title_short: legacyObject.title_short || null,
      title_medium: legacyObject.title_medium || null,
      title_long: legacyObject.title_long || null,
      synopsis_short: legacyObject.synopsis_short || null,
      synopsis_medium: legacyObject.synopsis_medium || null,
      synopsis_long: legacyObject.synopsis_long || null,
      episode_number: legacyObject.episode_number,
      release_date: legacyObject.release_date || null,
    };
  }

  if (legacyObjectType === LegacyObjectType.Seasons) {
    return {
      ...commonFields,
      internal_title: legacyObject.title,
      title_short: legacyObject.title_short || null,
      title_medium: legacyObject.title_medium || null,
      title_long: legacyObject.title_long || null,
      synopsis_short: legacyObject.synopsis_short || null,
      synopsis_medium: legacyObject.synopsis_medium || null,
      synopsis_long: legacyObject.synopsis_long || null,
      season_number: legacyObject.season_number,
      number_of_episodes: legacyObject.number_of_episodes,
      release_date: legacyObject.release_date || null,
    };
  }

  if (legacyObjectType === LegacyObjectType.Brands) {
    return {
      ...commonFields,
      internal_title: legacyObject.title,
      title_short: legacyObject.title_short || null,
      title_medium: legacyObject.title_medium || null,
      title_long: legacyObject.title_long || null,
      synopsis_short: legacyObject.synopsis_short || null,
      synopsis_medium: legacyObject.synopsis_medium || null,
      synopsis_long: legacyObject.synopsis_long || null,
      release_date: legacyObject.release_date || null,
    };
  }

  if (legacyObjectType === LegacyObjectType.Sets) {
    const setType = legacyObject.set_type_slug || null;

    return {
      ...commonFields,
      type: setType,
      internal_title: legacyObject.title,
      title_short: legacyObject.title_short || null,
      title_medium: legacyObject.title_medium || null,
      title_long: legacyObject.title_long || null,
      synopsis_short: legacyObject.synopsis_short || null,
      synopsis_medium: legacyObject.synopsis_medium || null,
      synopsis_long: legacyObject.synopsis_long || null,
      release_date: legacyObject.release_date || null,
    };
  }

  if (legacyObjectType === LegacyObjectType.Ratings) {
    return {
      ...commonFields,
      internal_title: legacyObject.title,
      scheme: legacyObject.scheme,
    };
  }

  if (legacyObjectType === LegacyObjectType.Images) {
    const imageType = legacyObject.image_type || null;
    return {
      ...commonFields,
      internal_title: legacyObject.title,
      type: imageType,
      external_url: legacyObject.url, // TODO upload images to Cloudinary and use that external_url - not needed due to migration script
    };
  }

  if (legacyObjectType === LegacyObjectType.People) {
    return {
      ...commonFields,
      internal_title: legacyObject.name,
      date_of_birth:
        legacyObject.date_of_birth &&
        dayjs(legacyObject.date_of_birth).isValid()
          ? dayjs(legacyObject.date_of_birth).format("YYYY-MM-DD")
          : null,
      place_of_birth: null, // TODO fix this on an env where place_of_birth isn't a date
      // All fields should be handled by the introspection create
    };
  }

  if (legacyObjectType === LegacyObjectType.Genres) {
    return {
      ...commonFields,
      internal_title: legacyObject.name,
      // All fields should be handled by the introspection create
    };
  }

  if (legacyObjectType === LegacyObjectType.Tags) {
    return {
      ...commonFields,
      internal_title: legacyObject.name,
      // type: legacyObject
      // All fields should be handled by the introspection create
    };
  }

  if (legacyObjectType === LegacyObjectType.Roles) {
    return {
      ...commonFields,
      internal_title: legacyObject.title,
      // All fields should be handled by the introspection create
    };
  }

  return commonFields;
};

const parseSL8Dimensions = (schedules: Record<string, LegacySchedule[]>) => {
  // Never has a language
  const allCustomerTypes = Object.values(schedules)[0].reduce(
    (previous, schedule) => {
      const parsedTypes = schedule.customer_type_urls.map((cust) => ({
        _id: cust.uid,
        title: cust.name,
        slug: cust.slug,
      }));
      return [...previous, ...parsedTypes];
    },
    [] as { _id: string; title: string; slug: string }[],
  );

  const uniqueCustomerTypes = allCustomerTypes.filter(
    (customerType, index) =>
      // eslint-disable-next-line no-underscore-dangle
      allCustomerTypes.findIndex((ct) => ct._id === customerType._id) === index,
  );

  return uniqueCustomerTypes;
};

export const ingestClientC = async ({
  readFromDisk,
  isCreateOnly,
}: {
  readFromDisk: boolean;
  isCreateOnly: boolean;
}) => {
  const objectsToFetch: Record<keyof CustomerCLegacyObjects, LegacyObjectType> =
    {
      schedules: LegacyObjectType.Schedules,
      tagCategories: LegacyObjectType.TagCategories,
      tags: LegacyObjectType.Tags,
      genres: LegacyObjectType.Genres,
      ratings: LegacyObjectType.Ratings,
      people: LegacyObjectType.People,
      roles: LegacyObjectType.Roles,
      images: LegacyObjectType.Images,
      assets: LegacyObjectType.Assets,
      episodes: LegacyObjectType.Episodes,
      seasons: LegacyObjectType.Seasons,
      brands: LegacyObjectType.Brands,
      sets: LegacyObjectType.Sets,
    };

  const legacyObjects =
    await fetchAndWriteLegacyObjects<CustomerCLegacyObjects>(
      objectsToFetch,
      languagesToCheck,
      {
        readFromDisk,
      },
    );

  const legacyCredits = convertSL8CreditsToLegacyObjects(
    legacyObjects.assets.objects,
    legacyObjects.episodes.objects,
    legacyObjects.seasons.objects,
    legacyObjects.brands.objects,
  );

  await commonSkylarkConfigurationUpdates({
    assets: legacyObjects.assets.objects,
    images: legacyObjects.images.objects,
    sets: legacyObjects.sets.objects,
    defaultLanguage: languagesToCheck[0].toLowerCase(),
  });

  console.log("\nCreating Legacy Objects in Skylark...");

  await clearUnableToFindVersionNoneObjectsFile();

  const dimensionsToCreate = [
    {
      title: "Customer Type",
      slug: "customer-types",
    },
  ];
  await createDimensions(dimensionsToCreate);

  const customerTypes = parseSL8Dimensions(legacyObjects.schedules.objects);

  const dimensions: GraphQLDimension[] = await getExistingDimensions();
  const validProperties = await getValidPropertiesForObject("DimensionValue");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  const createdDimensions = await createOrUpdateDimensionValues(
    dimensionsToCreate[0].slug,
    validProperties,
    customerTypes,
    dimensions,
  );

  const sl8SchedulesInAirtableFormat = Object.values(
    legacyObjects.schedules.objects,
  )[0].map((obj) => ({
    id: obj.uid,
    fields: {
      ...obj,
      customers: obj.customer_type_urls.map(({ uid }) => uid),
      title: `[LEGACY] ${obj.rights ? `${obj.title} (License)` : obj.title}`,
    } as unknown as FieldSet,
  }));
  const availabilities = await createOrUpdateAvailability(
    sl8SchedulesInAirtableFormat,
    {
      properties: [],
      regions: [],
    },
    [],
  );

  const skylarkObjects = createEmptySkylarkObjects();

  const commonArgs = {
    relationshipObjects: skylarkObjects,
    legacyObjectConverter: convertLegacyObject,
    isCreateOnly,
    legacyCredits,
    // alwaysAvailability,
    availabilities: [],
  };

  // skylarkObjects.tagCategories = await createObjectsInSkylark(
  //   legacyObjects.tagCategories,
  //   commonArgs,
  // );

  skylarkObjects.tags = await createObjectsInSkylark(
    legacyObjects.tags,
    commonArgs,
  );

  skylarkObjects.images = await createObjectsInSkylark(
    legacyObjects.images,
    commonArgs,
  );

  skylarkObjects.ratings = await createObjectsInSkylark(
    legacyObjects.ratings,
    commonArgs,
  );

  skylarkObjects.genres = await createObjectsInSkylark(
    legacyObjects.genres,
    commonArgs,
  );

  skylarkObjects.people = await createObjectsInSkylark(
    legacyObjects.people,
    commonArgs,
  );

  skylarkObjects.roles = await createObjectsInSkylark(
    legacyObjects.roles,
    commonArgs,
  );

  // Create Credits after People and Roles but before Assets/Episodes/Seasons/Brands/Sets
  const alwaysAvailabilityForCredit = availabilities.find(
    (availability) => availability.slug === "always",
  ); // This should be the always schedule (not license)
  skylarkObjects.credits = await createObjectsInSkylark(legacyCredits, {
    ...commonArgs,
    alwaysAvailability: alwaysAvailabilityForCredit,
  });

  skylarkObjects.assets = await createObjectsInSkylark(
    legacyObjects.assets,
    commonArgs,
  );

  skylarkObjects.episodes = await createObjectsInSkylark(
    legacyObjects.episodes,
    {
      ...commonArgs,
      alwaysAvailability: {
        uid: "01J9RK1809VAFMBBQZ56YYP7QG",
        external_id: "always-public",
        slug: "",
        __typename: "SkylarkAvailability",
      },
    },
  );

  skylarkObjects.seasons = await createObjectsInSkylark(
    legacyObjects.seasons,
    commonArgs,
  );

  skylarkObjects.brands = await createObjectsInSkylark(
    legacyObjects.brands,
    commonArgs,
  );

  skylarkObjects.sets = await createObjectsInSkylark(
    legacyObjects.sets,
    commonArgs,
  );

  await createSetContent(
    skylarkObjects.sets,
    legacyObjects.sets,
    skylarkObjects,
  );
};

/* eslint-enable no-console */
