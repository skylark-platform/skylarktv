import { graphQLClient } from "@skylark-reference-apps/lib";
import { gql } from "graphql-request";
import {
  EnumType,
  jsonToGraphQLQuery,
  VariableType,
} from "json-to-graphql-query";
import { ENUMS } from "../../constants";
import { pause } from "./utils";

const GET_ACCOUNT_STATUS = gql`
  query GET_ACCOUNT_STATUS {
    getActivationStatus {
      active_version
      update_in_progress
      update_started_at
    }
  }
`;

const ACTIVATE_CONFIGURATION_VERSION = gql`
  mutation ACTIVATE_CONFIGURATION_VERSION($version: Int!) {
    activateConfigurationVersion(version: $version) {
      messages
      version
    }
  }
`;

const GET_ENUM_VALUES = gql`
  query GET_ENUM_VALUES($name: String!) {
    __type(name: $name) {
      enumValues {
        name
      }
    }
  }
`;

const getActivationStatus = async () => {
  const res = await graphQLClient.uncachedRequest<{
    getActivationStatus: {
      active_version: string;
      update_in_progress: boolean;
      update_started_at: string;
    };
  }>(GET_ACCOUNT_STATUS);

  return res.getActivationStatus;
};

export const activateConfigurationVersion = async (version: number) => {
  const res = await graphQLClient.uncachedRequest<{
    activateConfigurationVersion: { version: number; messages: string };
  }>(ACTIVATE_CONFIGURATION_VERSION, { version });

  return res.activateConfigurationVersion;
};

const getEnumValues = async (name: string) => {
  const data = await graphQLClient.uncachedRequest<{
    __type: { enumValues: { name: string }[] };
  }>(GET_ENUM_VALUES, { name });

  // eslint-disable-next-line no-underscore-dangle
  const values = data.__type.enumValues.map((e) => e.name.toUpperCase());
  return values;
};

export const updateEnumTypes = async (
  enumName: string,
  values: string[],
  version: number | string
): Promise<{ version: number | null }> => {
  const existingValues = await getEnumValues(enumName);
  if (values.every((value) => existingValues.includes(value.toUpperCase()))) {
    return {
      version: null,
    };
  }

  const mutation = {
    mutation: {
      __name: `UPDATE_${enumName}`,
      __variables: {
        version: "Int!",
      },
      editEnumConfiguration: {
        __args: {
          version: new VariableType("version"),
          enums: {
            name: enumName,
            operation: new EnumType("UPDATE"),
            values,
          },
        },
        version: true,
        messages: true,
      },
    },
  };

  const graphQLQuery = jsonToGraphQLQuery(mutation);

  const { editEnumConfiguration } = await graphQLClient.uncachedRequest<{
    editEnumConfiguration: { version: number; messages: string };
  }>(graphQLQuery, { version });

  return {
    version: editEnumConfiguration.version,
  };
};

const addPreferredImageTypeToSeason = async (version?: number) => {
  const UPDATE_SEASON_FIELDS = gql`
    mutation UPDATE_SEASON_FIELDS($version: Int!) {
      editFieldConfiguration(
        version: $version
        fields: {
          name: "preferred_image_type"
          operation: CREATE
          type: ENUM
          enum_name: "ImageType"
          is_translatable: false
        }
        object_class: Season
      ) {
        messages
        version
      }
    }
  `;

  try {
    const { editFieldConfiguration } = await graphQLClient.uncachedRequest<{
      editFieldConfiguration: { version: number; messages: string };
    }>(UPDATE_SEASON_FIELDS, { version });
    return {
      version: editFieldConfiguration.version,
    };
  } catch (e) {
    const err = e as { response?: { errors?: { message: string }[] } };
    // Ignore error if all fields have been added already
    if (
      err?.response?.errors &&
      err.response.errors.length === 1 &&
      err.response.errors[0].message ===
        "Some fields already exist on type Season: ['preferred_image_type']"
    ) {
      return {
        version,
      };
    }
    throw e;
  }
};

export const waitForUpdatingSchema = async () => {
  const {
    active_version: activeVersion,
    update_in_progress: updateInProgress,
  } = await getActivationStatus();

  if (updateInProgress) {
    let currentlyUpdating = true;
    while (currentlyUpdating) {
      // eslint-disable-next-line no-await-in-loop
      await pause(2500);
      const { update_in_progress: updateStillRunning } =
        // eslint-disable-next-line no-await-in-loop
        await getActivationStatus();
      currentlyUpdating = updateStillRunning;
    }
  }

  return parseInt(activeVersion, 10);
};

export const updateSkylarkSchema = async () => {
  const initialVersion = await waitForUpdatingSchema();

  const { version: setTypeVersion } = await updateEnumTypes(
    "SetType",
    ENUMS.SET_TYPES,
    initialVersion
  );

  const { version: imageTypeVersion } = await updateEnumTypes(
    "ImageType",
    ENUMS.IMAGE_TYPES,
    setTypeVersion || initialVersion
  );

  const { version: seasonUpdateVersion } = await addPreferredImageTypeToSeason(
    imageTypeVersion || initialVersion
  );

  const finalVersionNumber = seasonUpdateVersion;

  if (finalVersionNumber && finalVersionNumber !== initialVersion) {
    await activateConfigurationVersion(finalVersionNumber);

    const activeVersion = await waitForUpdatingSchema();
    return { version: activeVersion };
  }

  return { version: initialVersion };
};
