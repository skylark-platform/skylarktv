import React, { FC, ReactNode } from "react";
import { useInView } from "react-intersection-observer";
import {
  AllEntertainment,
  convertUrlToObjectType,
} from "@skylark-reference-apps/lib";
import { Skeleton } from "@skylark-reference-apps/react";

import { useSingleObject } from "../hooks/useSingleObject";

const Data: FC<{
  children(data: AllEntertainment): ReactNode;
  self: string;
  slug: string;
}> = ({ children, self, slug }) => {
  const { data, isLoading } = useSingleObject(
    convertUrlToObjectType(self),
    slug
  );

  return !isLoading && data ? <>{children(data)}</> : <Skeleton show />;
};

export const DataFetcher: FC<{
  children(data: AllEntertainment): ReactNode;
  self: string;
  slug: string;
}> = (props) => {
  const { children, self, slug } = props;
  const { ref, inView } = useInView({ triggerOnce: true });

  if (!self || !slug) return <></>;

  return (
    <div ref={ref}>
      {inView ? (
        <Data self={self} slug={slug}>
          {children}
        </Data>
      ) : (
        <Skeleton show />
      )}
    </div>
  );
};