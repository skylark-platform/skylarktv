import {
  Attachment,
  Collaborator,
  FieldSet,
  Records,
  Record as AirtableRecord,
} from "airtable";
import { EnumType } from "json-to-graphql-query";
import { has, isArray, isString } from "lodash";
import { GraphQLObjectTypes } from "@skylark-apps/skylarktv/src/lib/interfaces";
import {
  CreateOrUpdateRelationships,
  GraphQLBaseObject,
  GraphQLIntrospectionProperties,
  GraphQLMetadata,
} from "../../interfaces";

export const pause = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const getExtId = (externalId: string) =>
  externalId.substring(externalId.indexOf("#") + 1);

export const getUidsFromField = (
  field: string[] | null,
  skylarkData: GraphQLBaseObject[],
) => {
  if (!field || field.length === 0) {
    return null;
  }

  const urls = skylarkData
    .filter(({ external_id }) => field.includes(getExtId(external_id)))
    .map(({ uid }) => uid);
  return urls;
};

export const gqlObjectMeta = (
  type: string,
): {
  createFunc: string;
  updateFunc: string;
  objectType: GraphQLObjectTypes;
  argName: string;
  relName: string;
} => {
  switch (type) {
    case "episodes":
    case "Episode":
      return {
        createFunc: "createEpisode",
        updateFunc: "updateEpisode",
        objectType: "Episode",
        argName: "episode",
        relName: "episodes",
      };
    case "seasons":
    case "Season":
      return {
        createFunc: "createSeason",
        updateFunc: "updateSeason",
        objectType: "Season",
        argName: "season",
        relName: "seasons",
      };
    case "movies":
    case "Movie":
      return {
        createFunc: "createMovie",
        updateFunc: "updateMovie",
        objectType: "Movie",
        argName: "movie",
        relName: "movies",
      };
    case "assets":
    case "SkylarkAsset":
      return {
        createFunc: "createSkylarkAsset",
        updateFunc: "updateSkylarkAsset",
        objectType: "SkylarkAsset",
        argName: "skylark_asset",
        relName: "assets",
      };
    case "brands":
    case "Brand":
      return {
        createFunc: "createBrand",
        updateFunc: "updateBrand",
        objectType: "Brand",
        argName: "brand",
        relName: "brands",
      };
    case "CallToAction":
      return {
        createFunc: "createCallToAction",
        updateFunc: "updateCallToAction",
        objectType: "CallToAction",
        argName: "call_to_action",
        relName: "call_to_actions",
      };
    case "Role":
      return {
        createFunc: "createRole",
        updateFunc: "updateRole",
        objectType: "Role",
        argName: "role",
        relName: "roles",
      };
    case "Credit":
      return {
        createFunc: "createCredit",
        updateFunc: "updateCredit",
        objectType: "Credit",
        argName: "credit",
        relName: "credits",
      };
    case "Theme":
      return {
        createFunc: "createTheme",
        updateFunc: "updateTheme",
        objectType: "Theme",
        argName: "theme",
        relName: "themes",
      };
    case "Genre":
      return {
        createFunc: "createGenre",
        updateFunc: "updateGenre",
        objectType: "Genre",
        argName: "genre",
        relName: "genres",
      };
    case "SkylarkLiveAsset":
      return {
        createFunc: "createSkylarkLiveAsset",
        updateFunc: "updateSkylarkLiveAsset",
        objectType: "SkylarkLiveAsset",
        argName: "skylark_live_asset",
        relName: "live_assets",
      };
    case "LiveStream":
      return {
        createFunc: "createLiveStream",
        updateFunc: "updateLiveStream",
        objectType: "LiveStream",
        argName: "live_stream",
        relName: "live_streams",
      };
    case "Article":
      return {
        createFunc: "createArticle",
        updateFunc: "updateArticle",
        objectType: "Article",
        argName: "article",
        relName: "articles",
      };
    case "Person":
      return {
        createFunc: "createPerson",
        updateFunc: "updatePerson",
        objectType: "Person",
        argName: "person",
        relName: "people",
      };
    default:
      throw new Error(
        `[gqlObjectMeta] Object type "${type}" does not have GQL values`,
      );
  }
};

export const getValidFields = (
  fields: {
    [key: string]:
      | EnumType
      | undefined
      | null
      | object
      | string
      | number
      | boolean
      | Collaborator
      | ReadonlyArray<Collaborator>
      | ReadonlyArray<string>
      | ReadonlyArray<Attachment>;
  },
  validProperties: GraphQLIntrospectionProperties[],
): { [key: string]: string | number | boolean | EnumType | null } => {
  const validObjectFields = validProperties.filter(({ property }) =>
    has(fields, property),
  );
  const validFields = validObjectFields.reduce(
    (obj, { property, kind }) => {
      const val = isArray(fields[property])
        ? (fields[property] as string[])[0]
        : fields[property];

      return {
        ...obj,
        [property]:
          kind === "ENUM" && typeof val === "string"
            ? new EnumType(val.toUpperCase())
            : (val as string | number | boolean | EnumType),
      };
    },
    {} as { [key: string]: string | number | boolean | EnumType },
  );

  return validFields;
};

export const createGraphQLOperation = (
  objectType: GraphQLObjectTypes,
  objectExists: boolean,
  args: { [key: string]: string | number | boolean | object },
  updateLookupFields: { [key: string]: string },
) => {
  const method = objectExists ? `update${objectType}` : `create${objectType}`;

  const operation = {
    __aliasFor: method,
    __args: objectExists
      ? {
          ...updateLookupFields,
          ...args,
        }
      : {
          ...args,
        },
    __typename: true,
    uid: true,
    slug: true,
    external_id: true,
  };

  return { operation, method };
};

export const getGraphQLObjectAvailability = (
  availabilityMetadata: GraphQLMetadata["availability"],
  availabilityField?: string[],
): { link: string[] } => {
  const { default: defaultAvailability } = availabilityMetadata;
  if (!availabilityField || availabilityField.length === 0) {
    return { link: defaultAvailability ? [defaultAvailability] : [] };
  }

  return { link: availabilityField || [] };
};

export const getLanguageCodesFromAirtable = (
  languagesTable: Records<FieldSet>,
) => {
  const languageCodes: { [key: string]: string } = {};
  languagesTable
    .filter(({ fields }) => has(fields, "code") && isString(fields.code))
    .forEach(({ fields, id }) => {
      languageCodes[id] = fields.code as string;
    });

  return languageCodes;
};

export const hasProperty = <T, K extends PropertyKey, P = unknown>(
  object: T,
  property: K,
): object is T & Record<K, P> =>
  Object.prototype.hasOwnProperty.call(object, property);

export const convertGraphQLObjectTypeToArgName = (
  objectType: GraphQLObjectTypes,
) =>
  objectType
    .match(/[A-Z][a-z]+/g)
    ?.join("_")
    .toLowerCase() as string;

export const guessObjectRelationshipsFromAirtableRows = (
  validRelationships: string[],
  objects: AirtableRecord<FieldSet>[],
  metadata: GraphQLMetadata,
): CreateOrUpdateRelationships => {
  const potentialObjectRelationships: CreateOrUpdateRelationships =
    objects.reduce((acc, object) => {
      const potentialRelationships = Object.fromEntries(
        Object.entries(object.fields)
          .filter((tuple): tuple is [string, string[]] => {
            const [relationshipName, value] = tuple;
            if (!validRelationships.includes(relationshipName)) {
              return false;
            }

            return Boolean(
              value &&
                Array.isArray(value) &&
                value.length > 0 &&
                typeof value[0] === "string",
            );
          })
          .map(([relationshipName, externalIds]) => {
            const createdObjects =
              hasProperty(metadata, relationshipName) &&
              (metadata[relationshipName] as GraphQLBaseObject[]);

            if (!createdObjects) {
              return [relationshipName, { link: [] }];
            }

            // In the future we won't need to use uid to link so we can just return the externalIds
            const uids = externalIds
              .map(
                (externalId) =>
                  createdObjects.find(
                    ({ external_id }) => external_id === externalId,
                  )?.uid,
              )
              .filter((str): str is string => Boolean(str));

            return [relationshipName, { link: uids }];
          }),
      );

      return {
        ...acc,
        [object.id]: potentialRelationships,
      };
    }, {});

  return potentialObjectRelationships;
};

export const convertUrlWithSameOriginToPath = (url: string): string => {
  if (url.startsWith("/")) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (
      typeof window !== "undefined" &&
      window.location.origin === parsedUrl.origin
    ) {
      return parsedUrl.pathname;
    }
    return url;
  } catch {
    return url;
  }
};
