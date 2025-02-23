import useTranslation from "next-translate/useTranslation";
import React, { useState } from "react";
import { MdOutlineWatchLater } from "react-icons/md";
import DOMPurify from "dompurify";

import Link from "next/link";
import clsx from "clsx";
import { List } from "../list";
import { CLIENT_APP_CONFIG } from "../../../constants/app";

interface InformationPanelProps {
  brand?: {
    title: string;
    uid: string;
  };
  season?: {
    title?: string;
    number?: string | number;
  };
  title: string;
  duration?: number;
  rating?: string;
  availableUntil?: { unit: "day" | "month" | "year" | "never"; number: number };
  description?: string;
  genres?: string[];
  themes?: string[];
  actors?: {
    personUid: string;
    name: string;
    character?: string;
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
const getTranslationStringForAvailability = (
  unit: "day" | "month" | "year" | "never",
  number: number,
) => {
  switch (unit) {
    case "day":
      if (number === 0) {
        return "available-for.leaving-today";
      }
      return "available-for.days";
    case "month":
      return "available-for.months";
    case "year":
      return "available-for.years";
    default:
      return "available-for.ever";
  }
};

const Description = ({ description }: { description: string }) => {
  const [isExpanded, setExpand] = useState(false);
  const [isTrunicated, setTrunicated] = useState(false);

  const setTrunicatedWrapper = (el: HTMLParagraphElement) => {
    const trunc = !!(el && el.clientHeight < el.scrollHeight);
    setTrunicated(trunc);
  };

  const { t } = useTranslation("common");

  const cleanHTML = DOMPurify.sanitize(description);

  return (
    <div className="mb-5 pt-2 text-sm text-gray-200 md:text-base">
      <p
        className={`${isExpanded ? "line-clamp-none" : "line-clamp-4"}`}
        dangerouslySetInnerHTML={{ __html: cleanHTML }}
        ref={setTrunicatedWrapper}
      />
      {(isTrunicated || isExpanded) && (
        <button
          className="font-semibold underline"
          onClick={() => setExpand(!isExpanded)}
        >
          {isExpanded ? t("show-less") : t("show-more")}
        </button>
      )}
    </div>
  );
};

export const InformationPanel: React.FC<InformationPanelProps> = ({
  brand,
  season,
  title,
  duration,
  rating,
  availableUntil,
  description,
  genres,
  themes,
  actors,
}) => {
  const { t } = useTranslation("common");

  const seasonBreadcrumb =
    (season?.number
      ? `${t("skylark.object.season")} ${season.number}`
      : season?.title) || null;

  return (
    <div className="h-full w-full bg-gray-900">
      <div className="p-2 text-white">
        <div className="left flex w-full flex-col gap-3">
          {brand && (
            <Link
              className="hidden opacity-90 transition-opacity hover:opacity-100 md:flex"
              href={`/brand/${brand.uid}${
                season ? `#season-${season.number}` : ""
              }`}
            >
              <List
                contents={[brand.title, seasonBreadcrumb]}
                highlightAll
                textSize={"lg"}
              />
            </Link>
          )}
          <h1 className="pt-2 text-2xl md:text-3xl">{title}</h1>
          <span className="mb-2 mt-4 hidden w-36 border-b border-gray-800 md:flex" />
          <List
            contents={[
              duration ? (
                <span
                  className="flex items-center"
                  key={`duration-icon-for-${title}`}
                >
                  <MdOutlineWatchLater className="mr-2 mt-0" size={25} />
                  {`${duration}m`}
                </span>
              ) : undefined,
              rating,
              availableUntil
                ? t(
                    getTranslationStringForAvailability(
                      availableUntil.unit,
                      availableUntil.number,
                    ),
                    {
                      number: availableUntil?.number,
                      name: CLIENT_APP_CONFIG.name,
                    },
                  )
                : t(getTranslationStringForAvailability("never", -1), {
                    name: CLIENT_APP_CONFIG.name,
                  }),
            ]}
            highlightFirst
            textSize={"sm"}
          />
          {description && <Description description={description} />}
          {actors && (
            <p
              className={clsx(
                "mb-2 text-xs text-gray-400 md:text-sm",
                description && "-mt-4",
              )}
            >
              {`Starring `}
              {actors.map(({ name, character }, i) => (
                <>
                  {`${character ? `${name} as ${character}` : name}`}
                  {i < actors.length - 1
                    ? `${i < actors.length - 2 ? `, ` : ` & `}`
                    : "."}
                </>
              ))}
            </p>
          )}
          {[
            { key: "genres", items: genres },
            { key: "themes", items: themes },
          ].map(
            ({ key, items }) =>
              items && (
                <div
                  className="-my-0.5 text-gray-500"
                  key={`${key}-${items?.join("")}`}
                >
                  <List contents={items} />
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  );
};

export default InformationPanel;
