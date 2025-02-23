import { Record, FieldSet } from "airtable";
import axios from "axios";
import { Airtables } from "./interfaces";
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from "./constants";
import { pause } from "./skylark/saas/utils";

/**
 * getTable - fetches a table from Airtable and filters empty rows
 * @param name - the table name
 * @returns table contents
 */
const getTable = async (
  name: string,
  offset = "",
): Promise<Record<FieldSet>[]> => {
  try {
    const res = await axios.get<{
      records: Record<FieldSet>[];
      offset?: string;
    }>(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${name}?offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      },
    );
    const dataWithoutEmptyRecords = res.data.records.filter(
      ({ id, fields }) =>
        !(
          fields &&
          id !== "" &&
          Object.keys(fields).length === 0 &&
          Object.getPrototypeOf(fields) === Object.prototype
        ),
    );

    const parsedRecords: Record<FieldSet>[] = dataWithoutEmptyRecords.map(
      (records) => ({
        ...records,
        _table: {
          name,
        },
      }),
    ) as Record<FieldSet>[];

    if (res.data.offset) {
      const otherRecords = await getTable(name, res.data.offset);
      return [...parsedRecords, ...otherRecords];
    }

    return parsedRecords;
  } catch (err) {
    // If table is not found, log warning but return empty array
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      // eslint-disable-next-line no-console
      console.warn(`warn: Table "${name}" does not exist`);
      return [];
    }
    throw err;
  }
};

/**
 * Fetches and returns the tables from Airtable
 * @returns Object containing Airtable tables
 */
export const getAllTables = async (): Promise<Airtables> => {
  const dimensionTables = ["properties", "regions"];
  const [properties, regions] = await Promise.all(
    dimensionTables.map((table) => getTable(table)),
  );

  const tables = [
    "Media Content",
    "Media Content - Translations",
    "roles",
    "roles - Translations",
    "people",
    "people - Translations",
    "credits",
    "credits - Translations",
    "genres",
    "genres - Translations",
    "themes",
    "themes - Translations",
    "ratings",
    "tags",
    "images",
    "availability",
    "audience-segments",
    "sets",
    "sets-metadata",
    "asset-types",
    "image-types",
    "tag-types",
    "languages",
    "call-to-actions",
    "call-to-actions - Translations",
    "articles",
    "articles - Translations",
  ];

  const responses: Record<FieldSet>[][] = [];

  // API is limited to 5 requests per second https://airtable.com/developers/web/api/rate-limits
  // eslint-disable-next-line no-restricted-syntax
  for (const table of tables) {
    // eslint-disable-next-line no-await-in-loop
    const res = await getTable(table);

    responses.push(res);

    // eslint-disable-next-line no-await-in-loop
    await pause(500);
  }

  const [
    mediaObjects,
    mediaObjectsTranslations,
    roles,
    rolesTranslations,
    people,
    peopleTranslations,
    credits,
    creditsTranslations,
    genres,
    genresTranslations,
    themes,
    themesTranslations,
    ratings,
    tags,
    images,
    availability,
    audienceSegments,
    sets,
    setsMetadata,
    assetTypes,
    imageTypes,
    tagTypes,
    languages,
    callToActions,
    callToActionsTranslations,
    articles,
    articlesTranslations,
  ] = responses;

  return {
    dimensions: {
      properties,
      regions,
    },
    translations: {
      mediaObjects: mediaObjectsTranslations,
      callToActions: callToActionsTranslations,
      roles: rolesTranslations,
      people: peopleTranslations,
      credits: creditsTranslations,
      genres: genresTranslations,
      themes: themesTranslations,
      articles: articlesTranslations,
    },
    mediaObjects,
    articles,
    roles,
    people,
    credits,
    genres,
    themes,
    ratings,
    tags,
    images,
    availability,
    audienceSegments,
    sets,
    setsMetadata,
    assetTypes,
    imageTypes,
    tagTypes,
    callToActions,
    languages,
  };
};
