import {
  ALL_DIMENSION_QUERY_KEYS,
  DimensionKey,
  Dimensions,
} from "@skylark-reference-apps/lib";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import setLanguage from "next-translate/setLanguage";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useDeviceType } from "../../hooks";
import { persistQueryValues } from "../../lib/utils";

interface ReducerAction {
  type: DimensionKey;
  value: string;
}

export type DimensionsContextType = {
  dimensions: Dimensions;
  isLoadingDimensions: boolean;
  setLanguage: (language: string) => void;
  setProperty: (customerType: string) => void;
  setRegion: (region: string) => void;
  setTimeTravel: (timeTravel: string) => void;
};

const dimensionsReducer = (
  state: Dimensions,
  action: ReducerAction,
): Dimensions => {
  switch (action.type) {
    case DimensionKey.Language:
      return {
        ...state,
        [DimensionKey.Language]: action.value,
      };
    case DimensionKey.Property:
      return {
        ...state,
        [DimensionKey.Property]: action.value,
      };
    case DimensionKey.Region:
      return {
        ...state,
        [DimensionKey.Region]: action.value,
      };
    case DimensionKey.TimeTravel:
      return {
        ...state,
        [DimensionKey.TimeTravel]: action.value,
      };
    default:
      throw new Error();
  }
};

const DimensionsContext = createContext<DimensionsContextType>({
  dimensions: {
    [DimensionKey.Language]: "en-gb",
    [DimensionKey.Property]: "",
    [DimensionKey.Region]: "",
    [DimensionKey.TimeTravel]: "",
  },
  isLoadingDimensions: true,
  setLanguage: () => {},
  setProperty: () => {},
  setRegion: () => {},
  setTimeTravel: () => {},
});

export const DimensionsContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { deviceType, isLoading: isLoadingDimensions } = useDeviceType();
  const { lang } = useTranslation();

  const [dimensions, dispatch] = useReducer(dimensionsReducer, {
    [DimensionKey.Language]: lang,
    [DimensionKey.Property]: "fremantle",
    [DimensionKey.Region]: "europe",
    [DimensionKey.TimeTravel]: "",
  });

  // Automatically updates device type dimension depending on screen size
  useEffect(() => {
    if (deviceType !== undefined)
      dispatch({ type: DimensionKey.Property, value: deviceType });
  }, [deviceType]);

  useEffect(() => {
    dispatch({ type: DimensionKey.Language, value: lang });
  }, [lang]);

  return (
    <DimensionsContext.Provider
      value={{
        isLoadingDimensions,
        dimensions,
        setProperty: (value: string) =>
          dispatch({ type: DimensionKey.Property, value }),
        setLanguage: (value: string) => {
          void setLanguage(value);
          dispatch({ type: DimensionKey.Language, value });
        },
        setRegion: (value: string) =>
          dispatch({ type: DimensionKey.Region, value }),
        setTimeTravel: (value: string) =>
          dispatch({ type: DimensionKey.TimeTravel, value }),
      }}
    >
      {children}
    </DimensionsContext.Provider>
  );
};

const getDimensionsFromQuery = (
  query: NextParsedUrlQuery,
): Record<string, string> => {
  const persistedQuery = persistQueryValues(query, ALL_DIMENSION_QUERY_KEYS);

  const dimensionsQuery: Record<string, string> = Object.entries(
    persistedQuery,
  ).reduce(
    (prev, [key, value]) => {
      if (value && typeof value === "string") {
        return {
          ...prev,
          [key]: value,
        };
      }

      return prev;
    },
    {} as Record<string, string>,
  );

  return dimensionsQuery;
};

export const useDimensions = (): DimensionsContextType => {
  const { query } = useRouter();
  const { dimensions: contextDimensions, ...context } =
    useContext(DimensionsContext);

  const queryDimensions = getDimensionsFromQuery(query);

  const dimensions: Dimensions = {
    ...contextDimensions,
    ...queryDimensions,
  };

  return {
    ...context,
    dimensions,
  };
};
