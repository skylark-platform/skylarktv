import { graphQLClient } from "@skylark-reference-apps/lib";

import { fetcher } from "../../hooks/useHomepageSet";

jest.mock("@skylark-reference-apps/lib");

describe("graphQLClient", () => {
  let graphQlRequest: jest.Mock;

  beforeEach(() => {
    graphQlRequest = graphQLClient.request as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("makes a request with the expected query", async () => {
    const mockedGraphQLResponse = {
      __type: {
        fields: [],
      },
    };
    graphQlRequest.mockResolvedValueOnce(mockedGraphQLResponse);

    await fetcher("");

    expect(graphQlRequest).toBeCalled();
  });
});