export interface GraphQLBaseObject {
  __typename: string;
  uid: string;
  external_id: string;
  slug: string;
}

export interface GraphQLMetadata {
  images: GraphQLBaseObject[];
  roles: GraphQLBaseObject[];
  people: GraphQLBaseObject[];
  themes: GraphQLBaseObject[];
  genres: GraphQLBaseObject[];
  ratings: GraphQLBaseObject[];
  tags: GraphQLBaseObject[];
  credits: GraphQLBaseObject[];
  call_to_actions: GraphQLBaseObject[];
  availability: {
    default?: string;
    all: string[];
  };
  dimensions: {
    properties: GraphQLBaseObject[];
    regions: GraphQLBaseObject[];
  };
}

export type GraphQLIntrospectionKind =
  | "SCALAR"
  | "ENUM"
  | "INPUT_OBJECT"
  | "NON_NULL";

export interface GraphQLIntrospection {
  IntrospectionOnType: {
    name: string;
    fields: {
      name: string;
      type: {
        name: string;
        kind: GraphQLIntrospectionKind;
      };
    }[];
  };
  IntrospectionOnInputType: {
    name: string;
    inputFields: {
      name: string;
      type: {
        name: string;
        kind: GraphQLIntrospectionKind;
      };
    }[];
  } | null;
}

export interface GraphQLIntrospectionProperties {
  property: string;
  kind: GraphQLIntrospectionKind;
}

export interface GraphQLDimension {
  external_id?: string;
  uid: string;
  title: string;
  slug: string;
  description?: string;
}

export interface GraphQLObjectRelationshipsType {
  GET_OBJECT_RELATIONSHIPS: {
    name: string;
    inputFields: {
      name: string;
      type: {
        name: string;
      };
    }[];
  } | null;
}

export type CreateOrUpdateRelationships = Record<
  string,
  Record<string, { link: string[] }>
>;

export type SkylarkGraphQLError = {
  response: {
    errors: { path: string[]; errorType: string; message: string }[];
  };
};
