import React from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { useRouter } from "next/router";
import { persistQueryValues } from "../../../lib/utils";
import { ALL_DIMENSION_QUERY_KEYS } from "../../../constants/app";

interface LinkProps extends NextLinkProps {
  isExternal?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Link
 * This component is used to extend next/link to:
 * - Handle External Links
 * - Persist the language query on page navigation
 *
 * You probably don't need this.
 */
export const Link = ({
  isExternal = false,
  href,
  className,
  ...nextLinkProps
}: LinkProps) => {
  const { query: activeQuery } = useRouter();

  if (isExternal) {
    return (
      <a className={className} href={href as string}>
        {nextLinkProps.children}
      </a>
    );
  }

  const pathname = typeof href === "object" ? href.pathname : href;

  const propQuery =
    typeof href === "object" && typeof href.query === "object"
      ? href.query
      : {};

  const persistedQuery = persistQueryValues(activeQuery, [
    "dir",
    ...ALL_DIMENSION_QUERY_KEYS,
  ]);

  return (
    <NextLink
      {...nextLinkProps}
      className={className}
      href={{
        pathname,
        query: {
          ...persistedQuery,
          ...propQuery,
        },
      }}
    />
  );
};

export default Link;
