import type { NextPage } from "next";

import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";
import dayjs from "dayjs";
import Link from "next/link";
import { DisplayError } from "../components/displayError";
import { useListObjects } from "../hooks/useListObjects";
import { LIST_ARTICLES } from "../graphql/queries";
import { Article, ImageType } from "../types";
import {
  addCloudinaryOnTheFlyImageTransformation,
  getGraphQLImageSrc,
} from "../lib/utils";
import { H4 } from "../components/generic/typography";
import { SkeletonPage } from "../components/generic/skeleton";
import { Button } from "../components/generic/button";

const ArticlesPage: NextPage = () => {
  const {
    objects: articles,
    isError,
    isLoading,
  } = useListObjects<Article>(LIST_ARTICLES);

  const { t } = useTranslation("common");

  const sortedArticles = articles?.sort((a, b) =>
    dayjs((a.publish_date || "") as string).isBefore(
      (b.publish_date || "") as string,
    )
      ? 1
      : -1,
  );

  if (!isLoading && isError) {
    return (
      <DisplayError error={isError} notFoundMessage="No Articles found." />
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center bg-gray-900 py-20 font-body">
      <NextSeo title={t("articles")} />
      <div className="px-gutter sm:px-sm-gutter md:pt-20 lg:px-lg-gutter xl:px-xl-gutter">
        <div className="my-10 text-white">
          <h1 className="text-[40px] font-medium md:text-[56px]">
            {t("articles")}
          </h1>
        </div>
      </div>
      {!isLoading && (!articles || articles.length === 0) && (
        <div className="text-center">
          <H4 className="mb-0.5 mt-2 text-white">{`No ${t(
            "articles",
          )} found.`}</H4>
        </div>
      )}
      <SkeletonPage show={isLoading && !articles}>
        {sortedArticles && (
          <div className="grid max-w-5xl grid-cols-1 gap-10 px-4 md:grid-cols-2">
            {sortedArticles.map(
              ({
                uid,
                title,
                description,
                publish_date,
                images,
                slug,
                type,
              }) => {
                const image = getGraphQLImageSrc(images, ImageType.Thumbnail);
                const href = `/article/${uid}${slug ? `/${slug}` : ""}`;

                return (
                  <div
                    className="group flex max-w-4xl flex-col items-center justify-between rounded px-4 py-4 shadow"
                    key={uid}
                  >
                    <Link className="block" href={href}>
                      <div className="relative mb-4 flex h-96 w-full justify-start rounded-sm bg-gray-400 transition-all group-hover:scale-105">
                        {image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={title || "the article"}
                            className="h-full w-full overflow-hidden rounded-sm object-cover"
                            src={addCloudinaryOnTheFlyImageTransformation(
                              image,
                              {
                                width: 600,
                              },
                            )}
                          />
                        )}
                        {type && (
                          <div className="absolute right-2 top-2 rounded-sm bg-skylarktv-accent px-2 py-1 uppercase text-white">
                            {type}
                          </div>
                        )}
                      </div>
                      <h3 className="mb-2 w-full text-left font-display text-xl text-white md:mb-4 md:text-xl">
                        {title}
                      </h3>
                      {publish_date && (
                        <p className="-mt-1 mb-2 w-full text-left text-sm text-skylarktv-accent md:-mt-2 md:mb-4">
                          {dayjs(publish_date as string).format(
                            "dddd, D MMMM YYYY HH:mm",
                          )}
                        </p>
                      )}

                      {description && (
                        <p className="mb-4 line-clamp-4 w-full text-left text-sm text-gray-300 transition-colors group-hover:text-gray-100">
                          {description}
                        </p>
                      )}
                    </Link>
                    <div className="mt-2 w-full">
                      <Button
                        href={href}
                        size="lg"
                        text="Read Article"
                        variant="secondary"
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </SkeletonPage>
    </div>
  );
};

export default ArticlesPage;
