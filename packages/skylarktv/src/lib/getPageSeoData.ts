import { jsonToGraphQLQuery } from "json-to-graphql-query";
import { Article, Entertainment, Maybe, SkylarkImageListing } from "../types";
import {
  createGraphQLQueryDimensions,
  getSynopsisByOrder,
  getTitleByOrder,
} from "./utils";
import { GraphQLObjectTypes, DimensionKey } from "./interfaces";
import { graphQLClient } from "./skylark";
import { CLIENT_APP_CONFIG } from "../constants/app";

interface SeoObjectImage {
  url: string;
}

export interface SeoObjectData {
  title?: string;
  synopsis?: string;
  images?: SeoObjectImage[];
}

const getFields = (type: GraphQLObjectTypes) => {
  const commonFields = {
    __typename: true,
    uid: true,
    slug: true,
    images: {
      objects: {
        title: true,
        type: true,
        url: true,
      },
    },
  };

  if (type === "Article") {
    return {
      ...commonFields,
      title: true,
      description: true,
    };
  }

  return {
    ...commonFields,
    title: true,
    title_short: true,
    synopsis: true,
    synopsis_short: true,
  };
};

const getSeoTitleAndSynopsis = (data: Entertainment | Article) => {
  if (data.__typename === "Article") {
    return {
      title: data.title || "",
      synopsis: data.description || "",
    };
  }

  const entertainment = data as Entertainment;

  const title = getTitleByOrder({
    title: entertainment.title || "",
    title_short: entertainment.title_short || "",
  });

  const synopsis = getSynopsisByOrder({
    synopsis: entertainment.synopsis || "",
    synopsis_short: entertainment?.synopsis_short || "",
  });

  return {
    title,
    synopsis,
  };
};

export const convertObjectImagesToSeoImages = (
  images?: Maybe<SkylarkImageListing>,
) =>
  images?.objects?.map((image): SeoObjectImage => ({ url: image?.url || "" }));

export const getSeoDataForObject = async (
  type: GraphQLObjectTypes,
  lookupValue: string,
  language?: string,
): Promise<SeoObjectData> => {
  // Helper to use the external_id when an airtable record ID is given
  const lookupField = lookupValue.startsWith("rec") ? "external_id" : "uid";

  const method = `get${type}`;

  const queryAsJson = {
    query: {
      __name: "getSeoData",
      [method]: {
        __args: {
          [lookupField]: lookupValue,
          ...createGraphQLQueryDimensions({
            language,
            // TODO can we work out these before the client loads the page?
            [DimensionKey.Property]:
              CLIENT_APP_CONFIG.dimensions[DimensionKey.Property].values[0]
                .value,
            [DimensionKey.TimeTravel]: "",
            [DimensionKey.Region]:
              CLIENT_APP_CONFIG.dimensions[DimensionKey.Region].values[0].value,
          }),
        },
        ...getFields(type),
      },
    },
  };

  const query = jsonToGraphQLQuery(queryAsJson);

  try {
    const { [method]: data } = await graphQLClient.request<{
      [key: string]: Entertainment | Article;
    }>(query);

    const images = convertObjectImagesToSeoImages(data.images) || [];

    const { title, synopsis } = getSeoTitleAndSynopsis(data);

    return {
      title,
      synopsis,
      images,
    };
  } catch (err) {
    const error = err as {
      response?: { errors?: { errorType: string; message: string }[] };
    };
    if (error && error?.response?.errors?.[0].errorType === "NotFound") {
      return {
        title: "Not found",
        synopsis: error.response.errors?.[0].message,
        images: [],
      };
    }

    return {
      title: "",
      synopsis: "",
      images: [],
    };
  }
};
