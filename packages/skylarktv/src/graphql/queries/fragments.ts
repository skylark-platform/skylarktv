import { gql } from "graphql-request";

export const ImageListingFragment = gql`
  fragment imageListingFragment on SkylarkImageListing {
    objects {
      uid
      title
      type
      url
      external_url
    }
  }
`;

export const CallToActionListingFragment = gql`
  fragment callToActionListingFragment on CallToActionListing {
    objects {
      uid
      type
      text
      text_short
      description
      description_short
      url
      url_path
    }
  }
`;

export const TimecodeEventListingFragment = gql`
  fragment timecodeEventListingFragment on TimecodeEventListing {
    objects {
      uid
      type
      slug
      title
      copy
      link_text
      link_href
      timecode
      images {
        ...imageListingFragment
      }
    }
  }
`;

export const ObjectLanguageFragment = gql`
  fragment objectLanguageFragment on Metadata {
    uid
    ... on Episode {
      _meta {
        language_data {
          language
        }
      }
    }
    ... on Season {
      _meta {
        language_data {
          language
        }
      }
    }
    ... on Brand {
      _meta {
        language_data {
          language
        }
      }
    }
    ... on Movie {
      _meta {
        language_data {
          language
        }
      }
    }
    ... on SkylarkSet {
      _meta {
        language_data {
          language
        }
      }
    }
    ... on SkylarkAsset {
      _meta {
        language_data {
          language
        }
      }
    }
    ... on SkylarkLiveAsset {
      _meta {
        language_data {
          language
        }
      }
    }
    ... on LiveStream {
      _meta {
        language_data {
          language
        }
      }
    }
  }
`;
