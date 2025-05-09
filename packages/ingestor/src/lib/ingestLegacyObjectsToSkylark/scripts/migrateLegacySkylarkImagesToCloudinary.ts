/* eslint-disable no-console */
import "../../../env";
import "../env";
import { gql } from "graphql-request";
import { chunk } from "lodash";
import { graphQLClient } from "@skylark-apps/skylarktv/src/lib/skylark/graphqlClient";
import { checkEnvVars } from "../utils";
import { GraphQLBaseObject } from "../../interfaces";
import { createGraphQLOperation, pause } from "../../skylark/saas/utils";
import { mutateMultipleObjects } from "../../skylark/saas/create";
import {
  createCloudinaryClient,
  uploadCloudinaryImage,
} from "../../cloudinary";

/**
 * Assumptions:
 * - Always SkylarkImage
 * - Only one language (en-GB)
 */

const LIST_IMAGES = gql`
  query LIST_IMAGES($nextToken: String, $language: String) {
    listSkylarkImage(
      next_token: $nextToken
      language: $language
      ignore_availability: true
      limit: 100
    ) {
      count
      next_token
      objects {
        __typename
        uid
        external_id
        slug
        external_url
        url
        download_from_url
      }
    }
  }
`;

interface GraphQLImage extends GraphQLBaseObject {
  external_url: string | null;
  url: string | null;
}

const main = async () => {
  console.log("here we go");

  const { legacyApiUrl } = checkEnvVars([
    "CLIENT_CLOUDINARY_ENV",
    "CLIENT_CLOUDINARY_PRESET",
  ]);

  console.log("\nFetching all Images...");

  const allImages = [];
  let nextToken = "";
  let hasNextPage = true;

  while (hasNextPage) {
    // eslint-disable-next-line no-await-in-loop
    const data = await graphQLClient.uncachedRequest<{
      listSkylarkImage: {
        count: number;
        next_token: string | null;
        objects: GraphQLImage[];
      };
    }>(LIST_IMAGES, { language: "en-GB", nextToken });

    const { objects, next_token: newNextToken, count } = data.listSkylarkImage;

    if (objects && objects.length > 0) {
      allImages.push(...objects);
    }

    console.log(newNextToken, count, objects[0].uid);

    if (!newNextToken || newNextToken === nextToken) {
      hasNextPage = false;
    } else {
      nextToken = newNextToken;
      // hasNextPage = false;
    }
  }

  const imagesHostedOnSl8 = allImages.filter(({ external_url }) =>
    external_url?.startsWith(legacyApiUrl),
  );

  const otherImages = allImages.filter(
    ({ external_url }) => !external_url?.startsWith(legacyApiUrl),
  );

  console.log(allImages, imagesHostedOnSl8, otherImages);

  const cloudinaryClient = createCloudinaryClient(
    process.env.CLIENT_CLOUDINARY_ENV as string,
  );

  const chunkedImages = chunk(imagesHostedOnSl8, 20);

  const imagesToUpdateInSkylark = [];

  for (let i = 0; i < chunkedImages.length; i += 1) {
    const imagesToCreate = chunkedImages[i];

    const promises = imagesToCreate.map(async (image) => {
      if (!image.external_url) {
        return { ...image, file_name: null };
      }

      const data = await uploadCloudinaryImage(
        cloudinaryClient,
        process.env.CLIENT_CLOUDINARY_PRESET as string,
        image.external_url,
      );

      console.log(data);

      // http://res.cloudinary.com/dgpk3lchx/image/upload/v1713979374/tqenurusvjdrexlkb9ui.png

      console.log(data.url);

      return {
        ...image,
        external_url: data.url,
        file_name: `${data.original_filename}.${data.format}`,
        external_id: image.external_id,
      };
    });

    // eslint-disable-next-line no-await-in-loop
    const resolved = await Promise.all(promises);
    imagesToUpdateInSkylark.push(...resolved);
    // eslint-disable-next-line no-await-in-loop
    await pause(1000);
  }

  console.log(imagesToUpdateInSkylark);

  const operations = imagesToUpdateInSkylark.reduce(
    (previousOperations, { uid, external_url, file_name }) => {
      const args = {
        skylark_image: {
          external_url,
          file_name,
        },
      };

      const { operation, method } = createGraphQLOperation(
        "SkylarkImage",
        true,
        args,
        { uid },
      );

      const updatedOperations: { [key: string]: object } = {
        ...previousOperations,
        [`${method}${uid}`]: operation,
      };
      return updatedOperations;
    },
    {} as { [key: string]: object },
  );

  const arr = await mutateMultipleObjects<GraphQLBaseObject>(
    "updateImagesWithCloudinaryUrls",
    operations,
  );

  console.log(arr);
};

main().catch((err) => {
  console.error(err);
});

/* eslint-enable no-console */
