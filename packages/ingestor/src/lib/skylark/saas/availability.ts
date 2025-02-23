import {
  Record as AirtableRecord,
  Attachment,
  Collaborator,
  FieldSet,
  Records,
} from "airtable";
import { EnumType, jsonToGraphQLQuery } from "json-to-graphql-query";
import { gql } from "graphql-request";
import {
  DimensionTypes,
  GraphQLObjectTypes,
} from "@skylark-apps/skylarktv/src/lib/interfaces";
import { graphQLClient } from "@skylark-apps/skylarktv/src/lib/skylark";
import {
  Airtables,
  AvailabilityTableFields,
  GraphQLBaseObject,
  GraphQLDimension,
  GraphQLMetadata,
  GraphQLIntrospectionProperties,
} from "../../interfaces";
import { mutateMultipleObjects } from "./create";
import { getExistingObjects, getValidPropertiesForObject } from "./get";
import {
  convertGraphQLObjectTypeToArgName,
  createGraphQLOperation,
  getValidFields,
} from "./utils";

export const showcaseDimensionsConfig: {
  slug: DimensionTypes;
  title: string;
}[] = [
  {
    title: "Property",
    slug: "properties",
  },
  {
    title: "Region",
    slug: "regions",
  },
];

export const getExistingDimensions = async (
  nextToken?: string,
): Promise<GraphQLDimension[]> => {
  const query = {
    query: {
      __name: "listDimensions",
      listDimensions: {
        __args: {
          limit: 50,
          next_token: nextToken || "",
        },
        objects: {
          __typename: true,
          uid: true,
          title: true,
          slug: true,
          description: true,
        },
        count: true,
        next_token: true,
      },
    },
  };

  const graphQLQuery = jsonToGraphQLQuery(query, { pretty: true });

  const data = await graphQLClient.uncachedRequest<{
    listDimensions: { objects: GraphQLDimension[]; next_token: string };
  }>(graphQLQuery, {});

  if (data.listDimensions.next_token) {
    const some = await getExistingDimensions(data.listDimensions.next_token);
    return [...data.listDimensions.objects, ...some];
  }

  return data.listDimensions.objects;
};

const getExistingDimensionValues = async (
  slug: string,
  nextToken?: string,
): Promise<GraphQLBaseObject[]> => {
  const query = {
    query: {
      __name: "getDimensionValues",
      getDimension: {
        __args: {
          dimension_id: slug, // or uid, slug OR we can use external ID
        },
        values: {
          __args: {
            next_token: nextToken || "",
          },
          count: true,
          next_token: true,
          objects: {
            __typename: true,
            uid: true,
            title: true,
            slug: true,
          },
        },
      },
    },
  };

  const graphQLQuery = jsonToGraphQLQuery(query, { pretty: true });

  const data = await graphQLClient.uncachedRequest<{
    getDimension: {
      values: { next_token: string; objects: GraphQLBaseObject[] };
    };
  }>(graphQLQuery, {});

  const { objects } = data.getDimension.values;

  if (data.getDimension.values.next_token) {
    const some = await getExistingDimensionValues(
      slug,
      data.getDimension.values.next_token,
    );
    return [...objects, ...some];
  }

  return objects;
};

export const createDimensions = async (
  dimensionsConfig: { title: string; slug: string }[],
) => {
  const existingTypes: GraphQLDimension[] = await getExistingDimensions();

  const existingSlugs = existingTypes.map(({ slug }) => slug);

  const operations = dimensionsConfig.reduce(
    (previousOperations, { slug, title }) => {
      const objectExists = existingSlugs.includes(slug);

      const dimension = objectExists
        ? { title }
        : {
            title,
            slug,
          };

      const { operation, method } = createGraphQLOperation(
        "Dimension",
        objectExists,
        { dimension },
        { dimension_id: slug },
      );

      const updatedOperations: { [key: string]: object } = {
        ...previousOperations,
        [`${method}${title.replace(/\s/g, "")}`]: operation,
      };

      return updatedOperations;
    },
    {} as { [key: string]: object },
  );

  const arr = await mutateMultipleObjects<GraphQLDimension>(
    "createOrUpdateDimensions",
    operations,
  );

  return arr;
};

export const createOrUpdateDimensionValues = async (
  type: string,
  validProperties: GraphQLIntrospectionProperties[],
  valuesToCreate: (Record<
    string,
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
    | ReadonlyArray<Attachment>
  > & { _id: string })[],
  dimensions: GraphQLDimension[],
): Promise<GraphQLBaseObject[]> => {
  const dimension = dimensions.find(({ slug }) => slug === type);
  if (!dimension) {
    throw new Error(`Dimension: ${type} does not exist in Skylark`);
  }

  const existingDimensionValues = await getExistingDimensionValues(
    dimension.slug,
  );

  const existingObjectSlugs = existingDimensionValues.map(({ slug }) => slug);

  const operations = valuesToCreate.reduce(
    (previousOperations, { _id, ...fields }) => {
      const validFields = getValidFields(fields, validProperties);

      const objectExists = existingObjectSlugs.includes(fields.slug as string);

      if (objectExists) {
        // When updating dimensions, changing the slug isn't supported
        delete validFields.slug;
      }

      const dimensionValue = {
        dimension_value: objectExists
          ? validFields
          : {
              ...validFields,
              external_id: _id,
            },
      };

      const args = objectExists
        ? {
            ...dimensionValue,
          }
        : {
            dimension_id: type,
            ...dimensionValue,
          };

      const { operation, method } = createGraphQLOperation(
        "DimensionValue",
        objectExists,
        args,
        { dimension_id: type, value_external_id: _id },
      );

      const updatedOperations: { [key: string]: object } = {
        ...previousOperations,
        [`${method}${_id}`]: operation,
      };
      return updatedOperations;
    },
    {} as { [key: string]: object },
  );

  const arr = await mutateMultipleObjects<GraphQLBaseObject>(
    "createOrUpdateDimensionValues",
    operations,
  );

  return arr;
};

const getValueSlugs = (
  dimensionValues: GraphQLBaseObject[],
  dimensionAirtableField?: string[],
) =>
  dimensionValues
    .filter(({ external_id }) => dimensionAirtableField?.includes(external_id))
    .map(({ slug }) => slug);

const createAvailabilityDimensionsInput = (
  dimensions: GraphQLMetadata["dimensions"],
  fields: AvailabilityTableFields,
): {
  dimension_slug: string;
  value_slugs: string[];
}[] =>
  [
    {
      dimension_slug: "properties",
      value_slugs: getValueSlugs(dimensions.properties, fields.properties),
    },
    {
      dimension_slug: "regions",
      value_slugs: getValueSlugs(dimensions.regions, fields.regions),
    },
  ].filter(({ value_slugs }) => value_slugs.length > 0);

export const createOrUpdateScheduleDimensionValues = async (
  airtable: Airtables["dimensions"],
): Promise<GraphQLMetadata["dimensions"]> => {
  const dimensionValues: {
    type: DimensionTypes;
    data: AirtableRecord<FieldSet>[];
  }[] = [
    { type: "properties", data: airtable.properties },
    { type: "regions", data: airtable.regions },
  ];

  const dimensions: GraphQLDimension[] = await getExistingDimensions();
  const validProperties = await getValidPropertiesForObject("DimensionValue");

  const [properties, regions] = await Promise.all(
    dimensionValues.map(({ data, type }) => {
      const formattedValuesToCreate = data.map(({ id, fields }) => ({
        ...fields,
        _id: id,
      }));
      return createOrUpdateDimensionValues(
        type,
        validProperties,
        formattedValuesToCreate,
        dimensions,
      );
    }),
  );
  return {
    properties,
    regions,
  };
};

export const createOrUpdateAudienceSegments = async (
  segments: Records<FieldSet>,
  dimensions: GraphQLMetadata["dimensions"],
) => {
  const externalIds = segments.map(({ id }) => ({ externalId: id }));
  const { existingExternalIds } = await getExistingObjects(
    "AudienceSegment",
    externalIds,
  );

  const operations = segments.reduce(
    (previousOperations, { id, ...record }) => {
      const fields = record.fields as AvailabilityTableFields;

      const objectExists = existingExternalIds.has(id);

      const availabilityInput: {
        title: string;
        slug: string;
        dimensions?: {
          link: {
            dimension_slug: string;
            value_slugs: string[];
          }[];
        };
      } = {
        title: fields.title,
        slug: fields.slug,
      };

      const availabilityDimensions = createAvailabilityDimensionsInput(
        dimensions,
        fields,
      );

      if (availabilityDimensions.length > 0) {
        availabilityInput.dimensions = {
          link: availabilityDimensions,
        };
      }

      const args = objectExists
        ? { segment: availabilityInput }
        : {
            segment: {
              external_id: id,
              ...availabilityInput,
            },
          };

      const { operation, method } = createGraphQLOperation(
        "AudienceSegment",
        objectExists,
        args,
        { external_id: id },
      );

      const updatedOperations = {
        ...previousOperations,
        [`${method}${id}`]: operation,
      };
      return updatedOperations;
    },
    {} as { [key: string]: object },
  );

  const createdAudienceSegments =
    await mutateMultipleObjects<GraphQLBaseObject>(
      "createOrUpdateAudienceSegment",
      operations,
    );

  return createdAudienceSegments;
};

export const createOrUpdateAvailability = async (
  schedules: { id: string; fields: FieldSet }[],
  dimensions: GraphQLMetadata["dimensions"],
  segments: GraphQLBaseObject[],
) => {
  const externalIds = schedules.map(({ id }) => ({ externalId: id }));
  const { existingExternalIds } = await getExistingObjects(
    "Availability",
    externalIds,
  );

  const operations = schedules.reduce(
    (previousOperations, { id, ...record }) => {
      const fields = record.fields as AvailabilityTableFields;

      const objectExists = existingExternalIds.has(id);

      const availabilityInput: {
        title: string;
        slug: string;
        start?: string;
        end?: string;
        dimensions?: {
          link: {
            dimension_slug: string;
            value_slugs: string[];
          }[];
        };
        segments?: {
          link: string[];
        };
      } = {
        title: fields.title,
        slug: fields.slug,
      };

      const availabilityDimensions = createAvailabilityDimensionsInput(
        dimensions,
        fields,
      );

      const segmentsToLink = segments
        .filter(({ external_id }) => fields.segments?.includes(external_id))
        .map(({ uid }) => uid);

      if (segmentsToLink && segmentsToLink.length > 0) {
        availabilityInput.segments = {
          link: segmentsToLink,
        };
      }

      if (availabilityDimensions.length > 0) {
        availabilityInput.dimensions = {
          link: availabilityDimensions,
        };
      }

      // Only include start / end field when it exists in Airtable, Skylark errors otherwise
      if (fields.starts) {
        availabilityInput.start = fields.starts;
      }
      if (fields.ends) {
        availabilityInput.end = fields.ends;
      }

      const args = objectExists
        ? { availability: availabilityInput }
        : {
            availability: {
              external_id: id,
              ...availabilityInput,
            },
          };

      const { operation, method } = createGraphQLOperation(
        "Availability",
        objectExists,
        args,
        { external_id: id },
      );

      const updatedOperations = {
        ...previousOperations,
        [`${method}${id}`]: operation,
      };
      return updatedOperations;
    },
    {} as { [key: string]: object },
  );

  const createdAvailabilities = await mutateMultipleObjects<GraphQLBaseObject>(
    "createOrUpdateAvailability",
    operations,
  );

  return createdAvailabilities;
};

export const createAlwaysAndForeverAvailability = async (
  externalId: string,
): Promise<GraphQLBaseObject> => {
  const GET_QUERY = gql`
    query GET_ALWAYS_AVAILABILITY($externalId: String!) {
      getAvailability(external_id: $externalId) {
        __typename
        uid
        external_id
        slug
      }
    }
  `;

  const CREATE_MUTATION = gql`
    mutation CREATE_ALWAYS_AVAILABILITY($externalId: String!) {
      createAvailability(
        availability: {
          title: "Always & Forever"
          external_id: $externalId
          slug: "skylark_legacy_ingest_availability"
        }
      ) {
        __typename
        uid
        external_id
        slug
      }
    }
  `;

  let existingAvailability: GraphQLBaseObject | undefined;
  try {
    const data = await graphQLClient.uncachedRequest<{
      getAvailability: GraphQLBaseObject;
    }>(GET_QUERY, {
      externalId,
    });
    existingAvailability = data.getAvailability;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log("--- Always & Forever Availability not found");
  }

  if (existingAvailability?.uid) {
    // eslint-disable-next-line no-console
    console.log("--- Always & Forever Availability already exists");
    return existingAvailability;
  }

  const data = await graphQLClient.uncachedRequest<{
    createAvailability: GraphQLBaseObject;
  }>(CREATE_MUTATION, {
    externalId,
  });
  // eslint-disable-next-line no-console
  console.log("--- Always & Forever Availability created");

  return data.createAvailability;
};

export const assignAvailabilitiesToObjects = async (
  availabilityArr: GraphQLBaseObject[],
  objectType: GraphQLObjectTypes,
  uids: string[],
) => {
  const operations = uids.reduce(
    (previousOperations, uid) => {
      const availabilityUids = availabilityArr.map((avail) => avail.uid);

      const argName = convertGraphQLObjectTypeToArgName(objectType);

      const args: Record<string, string | number | boolean | object> = {
        [argName]: {
          availability: {
            link: availabilityUids,
          },
        },
      };

      const { operation, method } = createGraphQLOperation(
        objectType,
        true,
        args,
        { uid },
      );

      return {
        ...previousOperations,
        [`${method}_Availability_${uid}`]: operation,
      };
    },
    {} as { [key: string]: object },
  );

  const data = await mutateMultipleObjects<GraphQLBaseObject>(
    "addAvailabilityToObjects",
    operations,
  );

  return data;
};
