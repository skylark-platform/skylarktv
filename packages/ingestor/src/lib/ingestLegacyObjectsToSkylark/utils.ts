import {
  GraphQLObjectTypes,
  SAAS_API_ENDPOINT,
  SAAS_API_KEY,
} from "@skylark-reference-apps/lib";
import {
  FetchedLegacyObjects,
  LegacyObjectType,
  LegacyObjects,
} from "./types/legacySkylark";
import {
  waitForUpdatingSchema,
  updateEnumTypes,
  activateConfigurationVersion,
} from "../skylark/saas/schema";

export const checkEnvVars = () => {
  const legacyApiUrl = process.env.LEGACY_API_URL;
  const legacyToken = process.env.LEGACY_SKYLARK_TOKEN;

  const client = process.env.CLIENT as "CLIENT_A" | "CLIENT_C";
  const validClients = ["CLIENT_A", "CLIENT_C"];
  if (!client) {
    throw new Error(
      "process.env.CLIENT must be specified so we know which data model set up to use. Each corresponds to a Skylark Legacy Customer."
    );
  }
  if (!validClients.includes(client)) {
    throw new Error(
      `value given for process.env.CLIENT is not a valid option (value: ${client}). Valid Options: ${validClients.join(
        ", "
      )}`
    );
  }

  if (!legacyApiUrl)
    throw new Error("process.env.LEGACY_API_URL cannot be undefined");

  if (!legacyToken)
    throw new Error("process.env.LEGACY_SKYLARK_TOKEN cannot be undefined");

  if (!SAAS_API_ENDPOINT)
    throw new Error("process.env.SAAS_API_ENDPOINT cannot be undefined");

  if (!SAAS_API_KEY)
    throw new Error("process.env.SAAS_API_KEY cannot be undefined");

  // eslint-disable-next-line no-console
  console.log(
    "Legacy API URL:",
    legacyApiUrl,
    "\nSkylark API URL:",
    SAAS_API_ENDPOINT
  );

  const readFromDisk = process.env.READ_LEGACY_OBJECTS_FROM_DISK === "true";

  const isCreateOnly = process.env.CREATE_ONLY === "true";
  // eslint-disable-next-line no-console
  console.log(`--- Mode: ${isCreateOnly ? "Create Only" : "Create & Update"}`);

  return { client, readFromDisk, isCreateOnly };
};

export const calculateTotalObjects = (
  objects: Record<string, FetchedLegacyObjects<LegacyObjects[0]>>
) => {
  const totalObjectsFound = Object.values(objects).reduce(
    (previous, { totalFound }) => previous + totalFound,
    0
  );

  return totalObjectsFound;
};

export const convertLegacyObjectTypeToObjectType = (
  legacyType: LegacyObjectType
): GraphQLObjectTypes => {
  switch (legacyType) {
    case LegacyObjectType.TagCategories:
      return "TagCategory";
    case LegacyObjectType.Tags:
      return "SkylarkTag";
    case LegacyObjectType.Assets:
      return "SkylarkAsset";
    case LegacyObjectType.Episodes:
      return "Episode";
    case LegacyObjectType.Seasons:
      return "Season";
    case LegacyObjectType.Brands:
      return "Brand";
    default:
      throw new Error("[convertLegacyObjectTypeToObjectType] Unknown type");
  }
};

export const updateSkylarkSchema = async ({
  assetTypes,
}: {
  assetTypes: string[];
}) => {
  const initialVersion = await waitForUpdatingSchema();
  // eslint-disable-next-line no-console
  console.log("--- Initial Schema version:", initialVersion);

  const { version: updatedVersion } = await updateEnumTypes(
    "AssetType",
    assetTypes,
    initialVersion
  );

  if (updatedVersion && updatedVersion !== initialVersion) {
    // eslint-disable-next-line no-console
    console.log("--- Activating Schema version:", updatedVersion);
    await activateConfigurationVersion(updatedVersion);
    await waitForUpdatingSchema();
  }
};
