import { getSeoDataForObject } from "../../src/lib/getPageSeoData";
import { graphQLClient } from "../../src/lib/skylark";
import { Episode } from "../../src/types";

jest.spyOn(graphQLClient, "request");

describe.skip("getPageSeoData.ts", () => {
  let graphQlRequest: jest.Mock;

  beforeEach(() => {
    graphQlRequest = graphQLClient.request as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns the data required for SEO previews", async () => {
    const episode: Episode = {
      uid: "uid",
      title_short: "short title",
      title: "title",
      synopsis_short: "short synopsis",
      synopsis: "synopsis",
      images: {
        objects: [{ uid: "image-1", url: "https://skylark.com/image.jpg" }],
      },
    };
    graphQlRequest.mockResolvedValueOnce({
      getEpisode: episode,
    });

    const seo = await getSeoDataForObject("Episode", "uid", "");

    expect(seo).toEqual({
      title: "title",
      synopsis: "synopsis",
      images: [
        {
          url: "https://skylark.com/image.jpg",
        },
      ],
    });
  });

  it("returns NotFound when Skylark returns a NotFound error", async () => {
    graphQlRequest.mockRejectedValueOnce({
      response: {
        errors: [{ errorType: "NotFound", message: "Not found message" }],
      },
    });

    const seo = await getSeoDataForObject("Episode", "uid", "");

    expect(seo).toEqual({
      title: "Not found",
      synopsis: "Not found message",
      images: [],
    });
  });

  it("returns empty data when an unexpected error occurs", async () => {
    graphQlRequest.mockRejectedValueOnce("Unexpected");

    const seo = await getSeoDataForObject("Episode", "uid", "");

    expect(seo).toEqual({
      title: "",
      synopsis: "",
      images: [],
    });
  });
});
