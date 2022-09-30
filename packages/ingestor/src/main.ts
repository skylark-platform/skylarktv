// Import dotenv must be first
import "./env";
import {
  ApiAssetType,
  ApiImageType,
  ApiPerson,
  ApiRating,
  ApiRole,
  ApiSetType,
  ApiTag,
  ApiTagCategory,
  ApiThemeGenre,
  SKYLARK_API,
} from "@skylark-reference-apps/lib";
import axios from "axios";
import { Attachment } from "airtable";
import {
  createOrUpdateDynamicObject,
  createOrUpdateSetAndContents,
  createOrUpdateAirtableObjectsInSkylark,
  getResources,
  createOrUpdateAirtableObjectsInSkylarkWithParentsInSameTable,
  createTranslationsForObjects,
  connectExternallyCreatedAssetToMediaObject,
  createOrUpdateSchedules,
  createOrUpdateScheduleDimensions,
  getAlwaysSchedule,
  createOrUpdateContentTypes,
} from "./lib/skylark/classic";
import { getAllTables } from "./lib/airtable";
import {
  Airtables,
  ApiEntertainmentObjectWithAirtableId,
  GraphQLBaseObject,
  GraphQLMetadata,
  Metadata,
} from "./lib/interfaces";
import {
  orderedSetsToCreate,
  orderedSetsToCreateWithoutDynamicObject,
} from "./additional-objects/sets";
import { quentinTarantinoMovies } from "./additional-objects/dynamicObjects";
import {
  configureAmplify,
  signInToCognito,
  uploadToWorkflowServiceWatchBucket,
} from "./lib/amplify";
import {
  SAAS_ACCOUNT_ID,
  SAAS_API_ENDPOINT,
  UNLICENSED_BY_DEFAULT,
} from "./lib/constants";
import {
  createGraphQLMediaObjects,
  createOrUpdateGraphQLCredits,
  createOrUpdateGraphQlObjectsUsingIntrospection,
} from "./lib/skylark/saas/create";
import { createOrUpdateGraphQLSet } from "./lib/skylark/saas/sets";
import {
  createDimensions,
  createOrUpdateAvailability,
  createOrUpdateScheduleDimensionValues,
} from "./lib/skylark/saas/availability";

const createMetadata = async (airtable: Airtables): Promise<Metadata> => {
  const [alwaysSchedule, setTypes, dimensions] = await Promise.all([
    getAlwaysSchedule(),
    getResources<ApiSetType>("set-types"),
    createOrUpdateScheduleDimensions(airtable.dimensions),
  ]);
  const createdSchedules = await createOrUpdateSchedules(
    airtable.availibility,
    dimensions
  );
  // eslint-disable-next-line no-console
  console.log("Schedule objects created");
  // eslint-disable-next-line no-console
  console.log(
    `Default license: ${
      UNLICENSED_BY_DEFAULT
        ? "undefined"
        : `${alwaysSchedule.title} (${alwaysSchedule.self})`
    }`
  );

  const metadata: Metadata = {
    schedules: {
      default: UNLICENSED_BY_DEFAULT ? undefined : alwaysSchedule,
      always: alwaysSchedule,
      all: createdSchedules,
    },
    imageTypes: [],
    assetTypes: [],
    tagTypes: [],
    people: [],
    roles: [],
    genres: [],
    themes: [],
    ratings: [],
    tags: [],
    airtableCredits: airtable.credits,
    airtableImages: airtable.images,
    set: {
      types: setTypes,
      additionalRecords: airtable.setsMetadata,
    },
    dimensions,
  };

  metadata.assetTypes = await createOrUpdateContentTypes<ApiAssetType>(
    "asset-types",
    airtable.assetTypes,
    metadata
  );

  metadata.imageTypes = await createOrUpdateContentTypes<ApiImageType>(
    "image-types",
    airtable.imageTypes,
    metadata
  );

  metadata.tagTypes = await createOrUpdateContentTypes<ApiTagCategory>(
    "tag-categories",
    airtable.tagTypes,
    metadata
  );

  metadata.roles = await createOrUpdateAirtableObjectsInSkylark<ApiRole>(
    airtable.roles,
    metadata
  );

  metadata.people = await createOrUpdateAirtableObjectsInSkylark<ApiPerson>(
    airtable.people,
    metadata
  );

  metadata.genres = await createOrUpdateAirtableObjectsInSkylark<ApiThemeGenre>(
    airtable.genres,
    metadata
  );

  metadata.themes = await createOrUpdateAirtableObjectsInSkylark<ApiThemeGenre>(
    airtable.themes,
    metadata
  );

  metadata.ratings = await createOrUpdateAirtableObjectsInSkylark<ApiRating>(
    airtable.ratings,
    metadata
  );

  metadata.tags = await createOrUpdateAirtableObjectsInSkylark<ApiTag>(
    airtable.tags,
    metadata
  );

  // eslint-disable-next-line no-console
  console.log("Metadata objects created");
  return metadata;
};

const createMediaObjects = async (airtable: Airtables, metadata: Metadata) => {
  const mediaObjects =
    await createOrUpdateAirtableObjectsInSkylarkWithParentsInSameTable(
      airtable.mediaObjects,
      metadata
    );

  // eslint-disable-next-line no-console
  console.log("Media objects created");

  await connectExternallyCreatedAssetToMediaObject(
    airtable.mediaObjects,
    mediaObjects,
    metadata
  );

  // eslint-disable-next-line no-console
  console.log("Media objects linked to external assets");

  await createTranslationsForObjects(
    mediaObjects,
    airtable.translations.mediaObjects,
    metadata
  );

  // eslint-disable-next-line no-console
  console.log("Media objects translated");

  return mediaObjects;
};

const createAndUploadAssets = async (
  table: Airtables["mediaObjects"],
  mediaObjects: ApiEntertainmentObjectWithAirtableId[]
) => {
  const assets = mediaObjects.filter((obj) =>
    obj.self.startsWith("/api/assets/")
  );

  await Promise.all(
    assets.map(async (asset) => {
      const airtableAsset = table.find(
        (record) => record.id === asset.airtableId
      );
      const files = (airtableAsset?.fields?.file as Attachment[]) || [];
      if (!airtableAsset || files.length === 0) {
        return;
      }
      const [file] = files;
      const response = await axios.get<string>(file.url, {
        responseType: "arraybuffer",
        decompress: false,
      });

      await uploadToWorkflowServiceWatchBucket(
        file.filename,
        response.data,
        asset.uid
      );
    })
  );

  // eslint-disable-next-line no-console
  console.log("Assets uploaded to S3");
};

const createAdditionalObjects = async (metadata: Metadata) => {
  await createOrUpdateDynamicObject(quentinTarantinoMovies, metadata);

  // eslint-disable-next-line no-restricted-syntax
  for (const set of orderedSetsToCreate) {
    // eslint-disable-next-line no-await-in-loop
    await createOrUpdateSetAndContents(set, metadata);
  }

  // eslint-disable-next-line no-console
  console.log("Additional objects created");
};

const main = async () => {
  // eslint-disable-next-line no-console
  console.time("Completed in:");

  const shouldCreateAdditionalObjects = process.env.CREATE_SETS === "true";
  // eslint-disable-next-line no-console
  console.log(
    `Additional StreamTV sets / dynamic objects creation ${
      shouldCreateAdditionalObjects ? "enabled" : "disabled"
    }`
  );

  const airtable = await getAllTables();

  // eslint-disable-next-line no-constant-condition
  if (process.env.INGEST_TO_SAAS_SKYLARK === "true") {
    // eslint-disable-next-line no-console
    console.log(
      `Starting ingest to SaaS Skylark: ${SAAS_API_ENDPOINT} (account: ${SAAS_ACCOUNT_ID})`
    );

    await createDimensions();

    const dimensions = await createOrUpdateScheduleDimensionValues(
      airtable.dimensions
    );

    const availability = await createOrUpdateAvailability(
      airtable.availibility,
      dimensions
    );
    const alwaysSchedule = availability.find(
      ({ slug }) => slug === "always-license"
    );

    // eslint-disable-next-line no-console
    console.log(
      `Default license: ${
        UNLICENSED_BY_DEFAULT || !alwaysSchedule
          ? "undefined"
          : `${alwaysSchedule.slug} (${alwaysSchedule.external_id})`
      }`
    );

    const metadata: GraphQLMetadata = {
      dimensions,
      availability: {
        all: availability,
        always: alwaysSchedule,
        default: UNLICENSED_BY_DEFAULT ? undefined : alwaysSchedule,
      },
      people: [],
      roles: [],
      genres: [],
      themes: [],
      ratings: [],
      tags: [],
      credits: [],
      images: [],
    };

    metadata.images = await createOrUpdateGraphQlObjectsUsingIntrospection(
      "Image",
      airtable.images
    );
    metadata.themes = await createOrUpdateGraphQlObjectsUsingIntrospection(
      "Theme",
      airtable.themes
    );
    metadata.genres = await createOrUpdateGraphQlObjectsUsingIntrospection(
      "Genre",
      airtable.genres
    );
    metadata.ratings = await createOrUpdateGraphQlObjectsUsingIntrospection(
      "Rating",
      airtable.ratings
    );
    metadata.tags = await createOrUpdateGraphQlObjectsUsingIntrospection(
      "Tag",
      airtable.tags
    );
    metadata.people = await createOrUpdateGraphQlObjectsUsingIntrospection(
      "Person",
      airtable.people
    );
    metadata.roles = await createOrUpdateGraphQlObjectsUsingIntrospection(
      "Role",
      airtable.roles
    );
    metadata.credits = await createOrUpdateGraphQLCredits(
      airtable.credits,
      metadata
    );

    // eslint-disable-next-line no-console
    console.log("Metadata objects created");

    const mediaObjects = await createGraphQLMediaObjects(
      airtable.mediaObjects.filter(
        ({ fields }) => fields.skylark_object_type !== "assets"
      ),
      metadata
    );

    // eslint-disable-next-line no-console
    console.log("Media objects created");

    if (shouldCreateAdditionalObjects) {
      const createdSets: GraphQLBaseObject[] = [];

      for (
        let i = 0;
        i < orderedSetsToCreateWithoutDynamicObject.length;
        i += 1
      ) {
        const setConfig = orderedSetsToCreateWithoutDynamicObject[i];
        // eslint-disable-next-line no-await-in-loop
        const set = await createOrUpdateGraphQLSet(setConfig, [
          ...mediaObjects,
          ...createdSets,
        ]);
        createdSets.push(set);
      }

      // eslint-disable-next-line no-console
      console.log("Additional objects created");
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(`Starting ingest to V8 Skylark: ${SKYLARK_API}`);

    configureAmplify();

    await signInToCognito();

    const metadata = await createMetadata(airtable);

    const mediaObjects = await createMediaObjects(airtable, metadata);

    if (shouldCreateAdditionalObjects) {
      await createAdditionalObjects(metadata);
    }

    await createAndUploadAssets(airtable.mediaObjects, mediaObjects);
  }

  // eslint-disable-next-line no-console
  console.timeEnd("Completed in:");
  // eslint-disable-next-line no-console
  console.log("great success");
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Error while ingesting to Skylark");
  // eslint-disable-next-line no-console
  console.error(err);
  if (axios.isAxiosError(err) && err.response) {
    // eslint-disable-next-line no-console
    console.log("Axios response status: ", err.response.status);
  }
  process.exit(1);
});
