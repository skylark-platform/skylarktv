import { gql } from "graphql-request";
import { ImageListingFragment } from "./fragments";

export const LIST_ARTICLES = gql`
  ${ImageListingFragment}
  query LIST_ARTICLES(
    $language: String!
    $deviceType: String!
    $customerType: String!
    $region: String!
    $nextToken: String
  ) {
    listObjects: listArticle(
      language: $language
      dimensions: [
        { dimension: "device-types", value: $deviceType }
        { dimension: "customer-types", value: $customerType }
        { dimension: "regions", value: $region }
      ]
      next_token: $nextToken
      limit: 50
    ) {
      next_token
      objects {
        __typename
        uid
        external_id
        slug
        title
        type
        description
        body
        publish_date
        images {
          ...imageListingFragment
        }
      }
    }
  }
`;