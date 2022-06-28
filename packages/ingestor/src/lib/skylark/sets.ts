import {
  ApiDynamicObject,
  ApiEntertainmentObject,
  ApiSetItem,
} from "@skylark-reference-apps/lib";
import { FieldSet } from "airtable";
import { SetConfig, Metadata } from "../../interfaces";
import { authenticatedSkylarkRequest } from "./api";
import {
  convertAirtableFieldsToSkylarkObject,
  parseAirtableImagesAndUploadToSkylark,
} from "./create";
import {
  getResourceByName,
  getResourceBySlug,
  getSetBySlug,
  getSetItems,
} from "./get";

const createOrUpdateSet = async (
  setConfig: SetConfig,
  metadata: Metadata,
  airtableProperties?: { id: string; fields: FieldSet }
) => {
  const { title, slug, set_type_slug: setTypeSlug } = setConfig;
  const setType = metadata.set.types.find(
    ({ slug: metadataSlug }) => metadataSlug === setTypeSlug
  );

  const existingSet = await getResourceBySlug<ApiEntertainmentObject>(
    "sets",
    slug
  );

  let object = {};
  if (airtableProperties) {
    object = convertAirtableFieldsToSkylarkObject(
      airtableProperties.id,
      airtableProperties.fields,
      metadata
    );
  }

  const url = existingSet ? `/api/sets/${existingSet.uid}` : `/api/sets/`;
  const { data: set } =
    await authenticatedSkylarkRequest<ApiEntertainmentObject>(url, {
      method: existingSet ? "PUT" : "POST",
      data: {
        ...existingSet,
        ...object,
        uid: existingSet?.uid || "",
        self: existingSet?.self || "",
        title,
        slug,
        set_type_url: setType?.self,
        schedule_urls: [metadata.schedules.default.self],
      },
    });

  return set;
};

const createOrUpdateSetItem = async (
  setUid: string,
  contentUrl: string,
  position: number,
  existingSetItems: ApiSetItem[],
  metadata: Metadata
) => {
  const existingItemInSet = existingSetItems.find(
    (item) => item.content_url === contentUrl
  );

  const itemUrl = existingItemInSet
    ? `/api/sets/${setUid}/items/${existingItemInSet.uid}/`
    : `/api/sets/${setUid}/items/`;
  await authenticatedSkylarkRequest(itemUrl, {
    method: existingItemInSet ? "PUT" : "POST",
    data: {
      content_url: contentUrl,
      position,
      schedule_urls: [metadata.schedules.default.self],
    },
  });
};

export const createOrUpdateSetAndContents = async (
  setConfig: SetConfig,
  metadata: Metadata
) => {
  const additionalAirtableProperties = metadata.set.additionalRecords.find(
    ({ fields: { slug: metadataSlug } }) => metadataSlug === setConfig.slug
  );

  const set = await createOrUpdateSet(
    setConfig,
    metadata,
    additionalAirtableProperties
  );

  if (
    additionalAirtableProperties &&
    additionalAirtableProperties.fields?.images
  ) {
    await parseAirtableImagesAndUploadToSkylark(
      additionalAirtableProperties.fields.images as string[],
      set,
      metadata
    );
  }

  if (setConfig.contents.length > 0) {
    const existingSetItems = set ? await getSetItems(set.uid) : [];

    await Promise.all(
      setConfig.contents.map(async (config, index) => {
        const position = index + 1;
        let object: ApiEntertainmentObject | ApiDynamicObject | null;
        if (config.type === "set") {
          object = await getSetBySlug(config.set_type, config.slug);
        } else if (config.type === "dynamic-object") {
          object = await getResourceByName<ApiDynamicObject>(
            "computed-scheduled-items",
            config.name
          );
        } else {
          object = await getResourceBySlug<ApiEntertainmentObject>(
            config.type,
            config.slug
          );
        }

        if (!object) {
          throw new Error(
            `Object requested for set item ${
              config.type === "dynamic-object" ? config.name : config.slug
            } (${config.type}) not found`
          );
        }

        return createOrUpdateSetItem(
          set.uid,
          object.self,
          position,
          existingSetItems,
          metadata
        );
      })
    );
  }
};