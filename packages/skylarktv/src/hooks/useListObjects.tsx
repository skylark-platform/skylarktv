import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Metadata } from "../types/gql";
import { GQLError } from "../types";
import { skylarkRequestWithDimensions } from "../lib/utils";
import { useDimensions } from "../contexts";
import { Dimensions } from "../lib/interfaces";

interface ListData<T extends Metadata> {
  objects?: T[];
  next_token?: string | null;
}

const select = <T extends Metadata>(
  data: InfiniteData<{
    listObjects: ListData<Metadata>;
  }>,
): T[] => {
  const objects: T[] | undefined =
    data &&
    (data.pages
      .flatMap((item) => item.listObjects.objects)
      .filter((item) => !!item) as T[]);

  return objects;
};

const fetcher = <T extends Metadata>(
  query: string,
  dimensions: Dimensions,
  nextToken?: string | null,
) =>
  skylarkRequestWithDimensions<{ listObjects: ListData<T> }>(
    query,
    dimensions,
    {
      nextToken,
    },
  );

export const useListObjects = <T extends Metadata>(
  query: string,
  disabled?: boolean,
) => {
  const { dimensions, isLoadingDimensions } = useDimensions();

  const { data, isLoading, error, fetchNextPage, hasNextPage } =
    useInfiniteQuery<
      {
        listObjects: ListData<Metadata>;
      },
      GQLError,
      T[],
      QueryKey,
      string
    >({
      queryKey: [query, Object.values(dimensions)],
      queryFn: ({ pageParam: nextToken }: { pageParam?: string }) =>
        fetcher(query, dimensions, nextToken),
      getNextPageParam: (lastPage): string | undefined =>
        lastPage.listObjects?.next_token || undefined,
      enabled: Boolean(!disabled && !isLoadingDimensions && query),
      initialPageParam: "",
      select,
    });

  // This if statement ensures that all data is fetched
  // We could remove it and add a load more button
  if (hasNextPage) {
    void fetchNextPage();
  }

  return {
    objects: data,
    isLoading,
    isError: error,
  };
};
