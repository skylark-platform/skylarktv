// Disabled tests should be enabled when constants / CREATE_OBJECT_CHUNK_SIZE is greater than 1
/* eslint-disable jest/no-disabled-tests */
import { FieldSet, Records, Record, Table } from "airtable";

import { graphQLClient } from "@skylark-apps/skylarktv/src/lib/skylark";
import { GraphQLBaseObject, GraphQLMetadata } from "../../interfaces";
import {
  createGraphQLMediaObjects,
  createOrUpdateGraphQLCredits,
  createOrUpdateGraphQlObjectsFromAirtableUsingIntrospection,
  createTranslationsForGraphQLObjects,
} from "./create";
import { CREATE_OBJECT_CHUNK_SIZE } from "../../constants";

jest.mock("@skylark-apps/skylarktv/src/lib/skylark");

describe("saas/create.ts", () => {
  let graphQlRequest: jest.Mock;

  beforeEach(() => {
    graphQlRequest = graphQLClient.uncachedRequest as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("createOrUpdateGraphQlObjectsFromAirtableUsingIntrospection", () => {
    const records: Partial<Record<FieldSet>>[] = [
      {
        id: "brand_1",
        fields: {
          title: "Brand 1",
        },
      },
    ];

    beforeEach(() => {
      const mockedGraphQLResponse = {
        IntrospectionOnType: {
          fields: [
            {
              name: "title",
              type: {
                name: "String",
                kind: "SCALAR",
              },
            },
          ],
        },
      };
      graphQlRequest.mockResolvedValue(mockedGraphQLResponse);
    });

    it("makes a request to check whether the brand exists", async () => {
      await createOrUpdateGraphQlObjectsFromAirtableUsingIntrospection(
        "Brand",
        records as Records<FieldSet>,
        {
          all: [],
        },
      );
      expect(graphQLClient.uncachedRequest).toHaveBeenNthCalledWith(
        1,
        'query getBrands { brand_1: getBrand (external_id: "brand_1", ignore_availability: true) { __typename uid slug external_id } }',
        {},
      );
    });

    it("makes a request to create the brand when it does not exist", async () => {
      const mockedGraphQLResponse = {
        response: {
          data: {
            brand_1: null,
          },
          errors: [],
        },
      };
      graphQlRequest.mockRejectedValueOnce(mockedGraphQLResponse);

      await createOrUpdateGraphQlObjectsFromAirtableUsingIntrospection(
        "Brand",
        records as Records<FieldSet>,
        {
          all: [],
        },
      );
      expect(graphQLClient.uncachedRequest).toHaveBeenNthCalledWith(
        3,
        'mutation createOrUpdateBrands { updateBrand_brand_1: updateBrand (external_id: "brand_1", brand: {title: "Brand 1", availability: {link: []}}, upsert: true) { __typename uid slug external_id } }',
        {},
      );
    });

    it("makes a request to update the brand when it exists", async () => {
      await createOrUpdateGraphQlObjectsFromAirtableUsingIntrospection(
        "Brand",
        records as Records<FieldSet>,
        {
          all: [],
        },
      );
      expect(graphQLClient.uncachedRequest).toHaveBeenNthCalledWith(
        3,
        'mutation createOrUpdateBrands { updateBrand_brand_1: updateBrand (external_id: "brand_1", brand: {title: "Brand 1", availability: {link: []}}, upsert: true) { __typename uid slug external_id } }',
        {},
      );
    });

    it("makes multiple requests when more than 10 records are sent", async () => {
      const manyRecords: Partial<Record<FieldSet>>[] = Array.from(
        { length: 20 },
        (_, index) => ({
          id: `brand_${index + 1}`,
          fields: {
            title: `Brand ${index + 1}`,
            slug: `brand-${index + 1}`,
          },
        }),
      );

      await createOrUpdateGraphQlObjectsFromAirtableUsingIntrospection(
        "Brand",
        manyRecords as Records<FieldSet>,
        {
          all: [],
        },
      );
      // 2 requests are always made regardless of requests, then its 20 records divided by chunkSize
      const numOfRequestChunks = Math.round(
        manyRecords.length / CREATE_OBJECT_CHUNK_SIZE,
      );
      expect(graphQlRequest).toHaveBeenCalledTimes(numOfRequestChunks + 2);
      expect(graphQlRequest).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("mutation createOrUpdateBrands_chunk_1"),
        {},
      );
      expect(graphQlRequest).toHaveBeenNthCalledWith(
        4,
        expect.stringContaining("mutation createOrUpdateBrands_chunk_2"),
        {},
      );
      expect(graphQlRequest).toHaveBeenNthCalledWith(
        graphQlRequest.mock.calls.length,
        expect.stringContaining(
          `mutation createOrUpdateBrands_chunk_${numOfRequestChunks}`,
        ),
        {},
      );
    });

    it("adds the default availability to the request", async () => {
      await createOrUpdateGraphQlObjectsFromAirtableUsingIntrospection(
        "Brand",
        records as Records<FieldSet>,
        {
          all: [],
          default: "default-external-id-1",
        },
      );
      expect(graphQLClient.uncachedRequest).toHaveBeenNthCalledWith(
        3,
        'mutation createOrUpdateBrands { updateBrand_brand_1: updateBrand (external_id: "brand_1", brand: {title: "Brand 1", availability: {link: ["default-external-id-1"]}}, upsert: true) { __typename uid slug external_id } }',
        {},
      );
    });
  });

  describe("createOrUpdateGraphQLCredits", () => {
    const records: Partial<Record<FieldSet>>[] = [
      {
        id: "credit_1",
        fields: {
          title: "Credit 1",
          person: ["ext_person_1"],
          role: ["ext_role_1"],
        },
      },
    ];

    const metadata: Partial<GraphQLMetadata> = {
      availability: {
        all: [],
      },
      roles: [
        {
          __typename: "Role",
          uid: "role_1",
          external_id: "ext_role_1",
          slug: "role-1",
        },
      ],
      people: [
        {
          __typename: "Person",
          uid: "person_1",
          external_id: "ext_person_1",
          slug: "person-1",
        },
      ],
    };

    beforeEach(() => {
      const mockedGraphQLResponse = {
        IntrospectionOnType: {
          fields: [
            {
              name: "title",
              type: {
                name: "String",
                kind: "SCALAR",
              },
            },
          ],
        },
      };
      graphQlRequest.mockResolvedValueOnce(mockedGraphQLResponse);
    });

    it("makes a request to check whether the Credit exists", async () => {
      await createOrUpdateGraphQLCredits(
        records as Records<FieldSet>,
        metadata as GraphQLMetadata,
      );
      expect(graphQLClient.uncachedRequest).toHaveBeenNthCalledWith(
        2,
        'query getCredits { credit_1: getCredit (external_id: "credit_1", ignore_availability: true) { __typename uid slug external_id } }',
        {},
      );
    });

    it("makes a request to create the Credit when it does not exist", async () => {
      const mockedGraphQLResponse = {
        response: {
          data: {
            credit_1: null,
          },
          errors: [],
        },
      };
      graphQlRequest.mockRejectedValueOnce(mockedGraphQLResponse);

      await createOrUpdateGraphQLCredits(
        records as Records<FieldSet>,
        metadata as GraphQLMetadata,
      );
      expect(graphQLClient.uncachedRequest).toHaveBeenNthCalledWith(
        3,
        'mutation createOrUpdateCredits { createCreditcredit_1: createCredit (credit: {title: "Credit 1", availability: {link: []}, relationships: {people: {link: "person_1"}, roles: {link: "role_1"}}, external_id: "credit_1"}) { __typename uid slug external_id } }',
        {},
      );
    });

    it("makes a request to update the Credit when it exists", async () => {
      await createOrUpdateGraphQLCredits(
        records as Records<FieldSet>,
        metadata as GraphQLMetadata,
      );
      expect(graphQLClient.uncachedRequest).toHaveBeenNthCalledWith(
        3,
        'mutation createOrUpdateCredits { updateCreditcredit_1: updateCredit (external_id: "credit_1", credit: {title: "Credit 1", availability: {link: []}, relationships: {people: {link: "person_1"}, roles: {link: "role_1"}}}) { __typename uid slug external_id } }',
        {},
      );
    });
  });

  describe("createGraphQLMediaObjects", () => {
    const table = { name: "episodes" } as Table<FieldSet>;
    const airtableEpisodeRecords: Partial<Record<FieldSet>>[] = [
      {
        id: "airtable-episode-1",
        _table: table,
        fields: {
          title: "episode-1",
          slug: "episode-1",
          title_short: "short title",
          skylark_object_type: "Episode",
        },
      },
      {
        id: "airtable-episode-2",
        _table: table,
        fields: {
          title: "episode-2",
          slug: "episode-2",
          synopsis_short: "short synopsis",
          skylark_object_type: "Episode",
        },
      },
    ];

    const metadata: GraphQLMetadata = {
      images: [
        {
          __typename: "Image",
          uid: "image_1",
          external_id: "ext_image_1",
          slug: "image-1",
        },
      ],
      roles: [
        {
          __typename: "Role",
          uid: "role_1",
          external_id: "ext_role_1",
          slug: "role-1",
        },
      ],
      people: [
        {
          __typename: "Person",
          uid: "person_1",
          external_id: "ext_person_1",
          slug: "person-1",
        },
      ],
      credits: [
        {
          __typename: "Credit",
          uid: "credit_1",
          external_id: "ext_credit_1",
          slug: "credit-1",
        },
      ],
      themes: [
        {
          __typename: "Theme",
          uid: "theme_1",
          external_id: "ext_theme_1",
          slug: "theme-1",
        },
      ],
      genres: [
        {
          __typename: "Genre",
          uid: "genre_1",
          external_id: "ext_genre_1",
          slug: "genre-1",
        },
      ],
      tags: [
        {
          __typename: "Tag",
          uid: "tag_1",
          external_id: "ext_tag_1",
          slug: "tag-1",
        },
      ],
      ratings: [
        {
          __typename: "Rating",
          uid: "rating_1",
          external_id: "ext_rating_1",
          slug: "rating-1",
        },
      ],
      call_to_actions: [
        {
          __typename: "CallToAction",
          uid: "call_to_action_1",
          external_id: "ext_cta_1",
          slug: "call-to-action-1",
        },
      ],
      availability: {
        all: [],
      },
      dimensions: {
        properties: [],
        regions: [],
      },
    };

    it("does nothing when no airtable records are given", async () => {
      // Arrange.
      const mockedGraphQLResponse = {
        IntrospectionOnType: {
          fields: [
            {
              name: "title",
              type: {
                name: "String",
                kind: "SCALAR",
              },
            },
          ],
        },
      };
      graphQlRequest.mockResolvedValue(mockedGraphQLResponse);

      // Act.
      const records = await createGraphQLMediaObjects([], metadata, []);

      // Assert.
      expect(records).toEqual([]);
    });

    it.skip("calls Skylark 11 times when all records don't have parents", async () => {
      // Arrange.
      const mockedIntrospectionResponse = {
        IntrospectionOnType: {
          fields: [
            {
              name: "title",
              type: {
                name: "String",
                kind: "SCALAR",
              },
            },
          ],
        },
      };
      const mockedGetEpisodesResponse = {
        response: {
          data: {
            "airtable-episode-1": null,
            "airtable-episode-2": null,
          },
        },
      };
      const mockedGraphQLResponse = {
        "airtable-episode-1": { external_id: "airtable-episode-1" },
        "airtable-episode-2": { external_id: "airtable-episode-2" },
      };

      graphQlRequest.mockImplementation(() => {
        if (graphQlRequest.mock.calls.length <= 7) {
          return mockedIntrospectionResponse;
        }
        if (graphQlRequest.mock.calls.length === 8) {
          return mockedGetEpisodesResponse;
        }
        return mockedGraphQLResponse;
      });

      // Act.
      await createGraphQLMediaObjects(
        airtableEpisodeRecords as Record<FieldSet>[],
        metadata,
        [],
      );

      // Assert.
      expect(graphQlRequest).toHaveBeenCalledTimes(11);
      expect(graphQlRequest).toHaveBeenNthCalledWith(
        11,
        'mutation createMediaObjects { updateEpisode_airtable-episode-1: updateEpisode (external_id: "airtable-episode-1", episode: {title: "episode-1", relationships: {}, availability: {link: []}}) { __typename uid slug external_id } updateEpisode_airtable-episode-2: updateEpisode (external_id: "airtable-episode-2", episode: {title: "episode-2", relationships: {}, availability: {link: []}}) { __typename uid slug external_id } }',
        {},
        expect.any(Object),
      );
    });

    it("creates the relationships", async () => {
      // Arrange.
      const airtableRecordWithRelationships: Partial<Record<FieldSet>>[] = [
        {
          id: "airtable-episode-1",
          _table: table,
          fields: {
            title: "episode with relationships",
            slug: "episode-relationships",
            skylark_object_type: "Episode",
            themes: [metadata.themes[0].external_id],
            genres: [metadata.genres[0].external_id],
            ratings: [metadata.ratings[0].external_id],
            tags: [metadata.tags[0].external_id],
            credits: [metadata.credits[0].external_id],
          },
        },
      ];

      const mockedIntrospectionResponse = {
        IntrospectionOnType: {
          fields: [
            {
              name: "title",
              type: {
                name: "String",
                kind: "SCALAR",
              },
            },
          ],
        },
      };
      const mockedGetEpisodesResponse = {
        response: {
          data: {
            "airtable-episode-1": null,
          },
        },
      };
      const mockedGraphQLResponse = {
        "airtable-episode-1": { external_id: "airtable-episode-1" },
      };

      graphQlRequest.mockImplementation(() => {
        if (graphQlRequest.mock.calls.length <= 7) {
          return mockedIntrospectionResponse;
        }
        if (graphQlRequest.mock.calls.length === 8) {
          return mockedGetEpisodesResponse;
        }
        return mockedGraphQLResponse;
      });

      // Act.
      await createGraphQLMediaObjects(
        airtableRecordWithRelationships as Record<FieldSet>[],
        metadata,
        [],
      );

      // Assert.
      expect(graphQlRequest).toHaveBeenCalledTimes(9);
      expect(graphQlRequest).toHaveBeenNthCalledWith(
        9,
        'mutation createMediaObjects { updateEpisode_airtable-episode-1: updateEpisode (external_id: "airtable-episode-1", episode: {title: "episode with relationships", relationships: {themes: {link: ["theme_1"]}, genres: {link: ["genre_1"]}, ratings: {link: ["rating_1"]}, tags: {link: ["tag_1"]}, credits: {link: ["credit_1"]}}, availability: {link: []}}) { __typename uid slug external_id } }',
        {},
      );
    });

    it.skip("calls Axios five times when one record has a parent", async () => {
      // Arrange.
      const airtableRecordsWithParentField = [
        ...airtableEpisodeRecords,
        {
          id: "airtable-episode-3",
          _table: table,
          fields: {
            title: "episode 3",
            slug: "episode-3",
            synopsis_short: "short synopsis",
            parent: ["airtable-episode-1"],
            skylark_object_type: "Episode",
          },
        },
      ];

      const mockedIntrospectionResponse = {
        IntrospectionOnType: {
          fields: [
            {
              name: "title",
              type: {
                name: "String",
                kind: "SCALAR",
              },
            },
          ],
        },
      };
      const mockedGetEpisodesResponse = {
        response: {
          data: {
            "airtable-episode-1": null,
            "airtable-episode-2": null,
          },
        },
      };
      const mockedGraphQLResponse = {
        "airtable-episode-1": {
          __typename: "Episode",
          external_id: "airtable-episode-1",
        },
        "airtable-episode-2": {
          __typename: "Episode",
          external_id: "airtable-episode-2",
        },
      };

      graphQlRequest.mockImplementation(() => {
        if (graphQlRequest.mock.calls.length <= 7) {
          return mockedIntrospectionResponse;
        }
        if (graphQlRequest.mock.calls.length === 8) {
          return mockedGetEpisodesResponse;
        }
        return mockedGraphQLResponse;
      });

      // Act.
      await createGraphQLMediaObjects(
        airtableRecordsWithParentField as Record<FieldSet>[],
        metadata,
        [],
      );

      // Assert.
      expect(graphQlRequest).toHaveBeenCalledTimes(12);
      expect(graphQlRequest).toHaveBeenNthCalledWith(
        12,
        'mutation createMediaObjects { updateEpisode_airtable-episode-3: updateEpisode (external_id: "airtable-episode-3", episode: {title: "episode 3", relationships: {episodes: {link: undefined}}, availability: {link: []}}) { __typename uid slug external_id } }',
        {},
      );
    });
  });

  describe("createTranslationsForGraphQLObjects", () => {
    const mockedIntrospectionResponse = {
      IntrospectionOnType: {
        fields: [
          {
            name: "title",
            type: {
              name: "String",
              kind: "SCALAR",
            },
          },
        ],
      },
    };

    const originalObjects: GraphQLBaseObject[] = [
      {
        uid: "episode-1-uid",
        external_id: "recepisode1",
        slug: "episode-1",
        __typename: "Episode",
      },
      {
        uid: "brand-1-uid",
        external_id: "recbrand1",
        slug: "brand-1",
        __typename: "Brand",
      },
    ];

    const languageTable: Partial<Record<FieldSet>>[] = [
      { id: "reclang1", fields: { code: "es-ES" } },
      { id: "reclang2", fields: { code: "pt-PT" } },
    ];

    it("creates the language version for a given object", async () => {
      graphQlRequest.mockResolvedValue(mockedIntrospectionResponse);
      const translationsTable: Partial<Record<FieldSet>>[] = [
        {
          id: "translation-1",
          fields: {
            object: ["recepisode1"],
            languages: ["reclang1"],
            title: "Title in spanish",
          },
        },
      ];

      await createTranslationsForGraphQLObjects(
        originalObjects,
        translationsTable as Records<FieldSet>,
        languageTable as Records<FieldSet>,
      );

      expect(graphQlRequest).toHaveBeenNthCalledWith(
        3,
        'mutation createEpisodeTranslations { translation_es_ES_translation-1: updateEpisode (uid: "episode-1-uid", language: "es-ES", episode: {title: "Title in spanish"}) { __typename uid slug external_id } }',
        {},
      );
    });

    it.skip("creates multiple language versions when multiple langauges are given in Airtable", async () => {
      const translationsTable: Partial<Record<FieldSet>>[] = [
        {
          id: "translation-1",
          fields: {
            object: ["recepisode1"],
            languages: ["reclang1", "reclang2"],
            title: "Title in spanishy portuguese",
          },
        },
      ];
      graphQlRequest.mockResolvedValue(mockedIntrospectionResponse);

      await createTranslationsForGraphQLObjects(
        originalObjects,
        translationsTable as Records<FieldSet>,
        languageTable as Records<FieldSet>,
      );

      expect(graphQlRequest).toHaveBeenNthCalledWith(
        7,
        'mutation createMediaObjectTranslations { translation_es_ES_translation-1: updateEpisode (uid: "episode-1-uid", language: "es-ES", episode: {title: "Title in spanishy portuguese"}) { __typename uid slug external_id } translation_pt_PT_translation-1: updateEpisode (uid: "episode-1-uid", language: "pt-PT", episode: {title: "Title in spanishy portuguese"}) { __typename uid slug external_id } }',
        {},
      );
    });

    it.skip("makes multiple mutations when multiple translations are given", async () => {
      graphQlRequest.mockResolvedValue(mockedIntrospectionResponse);
      const translationsTable: Partial<Record<FieldSet>>[] = [
        {
          id: "translation-1",
          fields: {
            object: ["recepisode1"],
            languages: ["reclang1"],
            title: "Title in spanish",
          },
        },
        {
          id: "translation-2",
          fields: {
            object: ["recepisode1"],
            languages: ["reclang2"],
            title: "Title in portuguese",
          },
        },
        {
          id: "translation-3",
          fields: {
            object: ["recbrand1"],
            languages: ["reclang2"],
            title: "Brand title in portuguese",
          },
        },
      ];

      await createTranslationsForGraphQLObjects(
        originalObjects,
        translationsTable as Records<FieldSet>,
        languageTable as Records<FieldSet>,
      );

      expect(graphQlRequest).toHaveBeenNthCalledWith(
        7,
        'mutation createMediaObjectTranslations { translation_es_ES_translation-1: updateEpisode (uid: "episode-1-uid", language: "es-ES", episode: {title: "Title in spanish"}) { __typename uid slug external_id } translation_pt_PT_translation-2: updateEpisode (uid: "episode-1-uid", language: "pt-PT", episode: {title: "Title in portuguese"}) { __typename uid slug external_id } translation_pt_PT_translation-3: updateBrand (uid: "brand-1-uid", language: "pt-PT", brand: {title: "Brand title in portuguese"}) { __typename uid slug external_id } }',
        {},
      );
    });

    it("does nothing when the mediaObject doesn't exist", async () => {
      const translationsTable: Partial<Record<FieldSet>>[] = [
        {
          id: "translation-1",
          fields: {
            object: ["recepisode1"],
            languages: ["reclang1", "reclang2"],
            title: "Title in spanishy portuguese",
          },
        },
      ];
      graphQlRequest.mockResolvedValue(mockedIntrospectionResponse);

      await createTranslationsForGraphQLObjects(
        [],
        translationsTable as Records<FieldSet>,
        languageTable as Records<FieldSet>,
      );

      expect(graphQlRequest).toHaveBeenCalledTimes(0);
    });
  });
});
/* eslint-enable jest/no-disabled-tests */
