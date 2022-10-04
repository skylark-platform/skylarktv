import type { CodegenConfig } from "@graphql-codegen/cli";
import { SAAS_API_ENDPOINT, SAAS_API_KEY } from "@skylark-reference-apps/lib";

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    [SAAS_API_ENDPOINT]: {
      headers: {
        "x-api-key": SAAS_API_KEY,
      },
    },
  },
  documents: [
    "components/**/*.tsx",
    "pages/**/*.tsx",
    "hooks/**/*.tsx",
    "!/gql/**/*",
  ],
  generates: {
    "./types/gql.ts": {
      plugins: [
        "typescript",
        {
          add: {
            content:
              "/* eslint-disable eslint-comments/no-unlimited-disable */",
          },
        },
        {
          add: {
            content: "/* eslint-disable */",
          },
        },
        {
          add: {
            content: "/* eslint-enable */",
            placement: "append",
          },
        },
      ],
    },
  },
};

export default config;
