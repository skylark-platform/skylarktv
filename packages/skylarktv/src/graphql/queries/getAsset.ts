import { gql } from "graphql-request";
import {
  ImageListingFragment,
  TimecodeEventListingFragment,
} from "./fragments";

export const GET_ASSET = gql`
  ${ImageListingFragment}
  ${TimecodeEventListingFragment}

  query GET_ASSET($uid: String, $externalId: String) {
    getObject: getSkylarkAsset(uid: $uid, external_id: $externalId) {
      external_id
      slug
      title
      type
      policy
      images {
        ...imageListingFragment
      }
      chapters(limit: 100) {
        objects {
          uid
          start_time
          slug
          title
          chapter_type
          timecode_events(limit: 100) {
            ...timecodeEventListingFragment
          }
        }
      }
      timecode_events(limit: 100) {
        ...timecodeEventListingFragment
      }
    }
  }
`;
