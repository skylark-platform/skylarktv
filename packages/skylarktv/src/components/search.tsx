import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdOutlineRotateRight, MdClear, MdSearch } from "react-icons/md";
import { useDebounce } from "use-debounce";
import DOMPurify from "dompurify";
import { sentenceCase } from "change-case";

import useTranslation from "next-translate/useTranslation";
import { useSearch } from "../hooks/useSearch";
import {
  addCloudinaryOnTheFlyImageTransformation,
  convertGraphQLSetType,
  convertTypenameToObjectType,
  formatReleaseDate,
  getGraphQLImageSrc,
  hasProperty,
} from "../lib/utils";
import { ImageType, Maybe } from "../types";
import { Link } from "./generic/link";

const findMatchOrReturnFirst = (
  strings: (string | Maybe<string> | undefined)[],
): string => {
  const filteredStrings = strings.filter((str) => !!str) as string[];
  return (
    filteredStrings.find((str) => str.includes("skylark-search-highlight")) ||
    filteredStrings?.[0] ||
    ""
  );
};

const SearchIcon = ({
  searchQuery,
  isLoading,
  onClearClick,
}: {
  searchQuery: string;
  isLoading: boolean;
  onClearClick: () => void;
}) => {
  const sharedClassName = "text-2xl";

  if (!searchQuery) {
    return <MdSearch className={sharedClassName} />;
  }

  if (searchQuery && !isLoading) {
    return (
      <button className={sharedClassName} onClick={onClearClick}>
        <MdClear />
      </button>
    );
  }

  return (
    <MdOutlineRotateRight className={clsx(sharedClassName, "animate-spin")} />
  );
};

// Skylark Search is able to highlight the matches in a search response by adding <span></span> around a match
// We need to parse this tag to display it to the user, but we don't want to assume all the HTML is valid and not XSS
const HighlightedSearchResultText = ({
  text,
  className,
  matchClassName,
}: {
  text: string;
  className?: string;
  matchClassName?: string;
}) => {
  const cleanHTML = DOMPurify.sanitize(text, { ALLOWED_TAGS: ["span"] });
  return (
    <p
      className={clsx(
        className,
        matchClassName,
        "[&>span]:text-skylarktv-accent [&>span]:transition-colors group-hover:[&>span]:text-skylarktv-accent",
      )}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
};

const SearchResultImage = ({
  alt,
  image: uncachedImage,
}: {
  image: string;
  alt: string;
}) => {
  const image = useMemo(
    () =>
      addCloudinaryOnTheFlyImageTransformation(uncachedImage, { width: 400 }),
    [uncachedImage],
  );

  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className="h-auto max-h-[4rem] w-auto max-w-full"
        src={image}
      />
    </div>
  );
};

const SearchResultItem = ({
  title,
  description,
  href,
  date,
  image,
  typename,
  onClick,
}: {
  title: string;
  description: string;
  href: string;
  date: string;
  image: string;
  typename: string;
  onClick: () => void;
}) => (
  <Link
    className="group mb-4 grid grid-cols-[4fr_1fr] items-center gap-4 last:mb-0"
    href={href}
    onClick={() => onClick()}
  >
    <div className="flex h-full flex-col">
      <div className="flex flex-col">
        <HighlightedSearchResultText
          className="text-lg font-medium text-gray-100 transition-colors group-hover:text-white"
          matchClassName="[&>span]:font-bold"
          text={title}
        />
        {description && (
          <HighlightedSearchResultText
            className="line-clamp-3 text-sm text-gray-400 transition-colors group-hover:text-gray-300"
            matchClassName="[&>span]:font-semibold"
            text={description}
          />
        )}
      </div>
      <div className="flex flex-row justify-between gap-2 text-sm text-gray-600 transition-colors group-hover:text-gray-500">
        <HighlightedSearchResultText
          matchClassName="[&>span]:font-semibold"
          text={typename}
        />
        {date && <p>{formatReleaseDate(date)}</p>}
      </div>
    </div>
    {image && <SearchResultImage alt={title} image={image} />}
  </Link>
);

export const Search = ({ onSearch }: { onSearch?: () => void }) => {
  const { t } = useTranslation("common");

  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const onFocus = () => setSearchResultsOpen(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 1000);

  const { data, isLoading } = useSearch(debouncedSearchQuery);

  const clearSearchQuery = () => setSearchQuery("");
  const onSearchWrapper = () => {
    onSearch?.();
    clearSearchQuery();
  };

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setSearchResultsOpen(false);
      }
    };
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return (
    <div
      className="fixed inset-0 z-100 flex flex-col items-center justify-start pt-[16vh] lg:relative lg:block lg:pt-0"
      ref={ref}
      onFocus={onFocus}
    >
      <div
        className={clsx(
          "flex items-center justify-center rounded-full border-0 border-gray-300 bg-skylarktv-purple-500/80 p-3 px-4 transition-colors focus-within:border-white focus-within:text-white lg:bg-button-tertiary",
          searchQuery ? "text-white" : "text-gray-300",
        )}
      >
        <input
          className={clsx(
            "w-full border-none bg-transparent px-2 py-0 shadow-none outline-none ring-0 placeholder:text-gray-100 focus:border-none focus:shadow-none focus:outline-none focus:ring-0 focus:placeholder:text-white focus-visible:border-none focus-visible:outline-none lg:w-44",
          )}
          placeholder={t("search")}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchIcon
          isLoading={isLoading}
          searchQuery={searchQuery}
          onClearClick={clearSearchQuery}
        />
      </div>
      {searchResultsOpen && searchQuery && (
        <div className="z-100 mt-2 lg:absolute ltr:right-0 rtl:left-0">
          <div className="max-h-[70vh] min-h-[2rem] w-[94vw] overflow-y-auto rounded bg-gray-800 px-4 py-6 lg:max-h-[24rem] lg:w-[34rem] lg:px-8 lg:py-8">
            {(isLoading || data?.objects?.length === 0) && (
              <p className="text-lg font-medium text-gray-100">
                {isLoading ? t("loading") : t("nothing-found")}
              </p>
            )}
            {!isLoading &&
              data?.objects?.map((obj) => {
                const typename = obj.__typename;
                const highlightedTypename = hasProperty(obj, "_context")
                  ? (obj._context?.typename_highlight as string)
                  : typename || "";
                const parsedType = convertTypenameToObjectType(typename);
                const href = `/${parsedType}/${obj.uid}`;

                if (typename === "Person") {
                  return (
                    <SearchResultItem
                      date={(obj.date_of_birth as string) || ""}
                      description={findMatchOrReturnFirst([
                        obj.bio_short,
                        obj.bio_medium,
                        obj.bio_long,
                      ])}
                      href={href}
                      image={getGraphQLImageSrc(obj?.images, ImageType.Main)}
                      key={obj.uid}
                      title={obj.name || ""}
                      typename={highlightedTypename}
                      onClick={onSearchWrapper}
                    />
                  );
                }

                if (typename === "SkylarkSet") {
                  const setHref = `/${convertGraphQLSetType(obj?.type || "")}/${
                    obj.uid
                  }`;
                  return (
                    <SearchResultItem
                      date={(obj.release_date as string) || ""}
                      description={findMatchOrReturnFirst([
                        obj.synopsis_short,
                        obj.synopsis,
                      ])}
                      href={setHref}
                      image={getGraphQLImageSrc(
                        obj?.images,
                        ImageType.Thumbnail,
                      )}
                      key={obj.uid}
                      title={findMatchOrReturnFirst([
                        obj.title_short,
                        obj.title,
                      ])}
                      typename={sentenceCase(obj.type || "")}
                      onClick={onSearchWrapper}
                    />
                  );
                }

                if (
                  typename === "Brand" ||
                  typename === "Episode" ||
                  typename === "Movie" ||
                  typename === "LiveStream"
                ) {
                  return (
                    <SearchResultItem
                      date={
                        hasProperty(obj, "release_date")
                          ? (obj.release_date as string)
                          : ""
                      }
                      description={findMatchOrReturnFirst([
                        obj.synopsis_short,
                        obj.synopsis,
                      ])}
                      href={href}
                      image={getGraphQLImageSrc(
                        obj?.images,
                        ImageType.Thumbnail,
                      )}
                      key={obj.uid}
                      title={findMatchOrReturnFirst([
                        obj.title_short,
                        obj.title,
                      ])}
                      typename={highlightedTypename}
                      onClick={onSearchWrapper}
                    />
                  );
                }

                return null;
              })}
          </div>
        </div>
      )}
    </div>
  );
};
