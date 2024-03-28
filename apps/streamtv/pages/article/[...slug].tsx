import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import {
  ParseAndDisplayHTML,
  SkeletonPage,
} from "@skylark-reference-apps/react";
import dayjs from "dayjs";
import { Article } from "../../types/gql";
import { DisplayError } from "../../components/displayError";
import { useObject } from "../../hooks/useObject";
import { convertObjectImagesToSeoImages } from "../../lib/getPageSeoData";
import { GET_ARTICLE } from "../../graphql/queries/getArticle";
import {
  useAddSlugToObjectUrl,
  useUidAndSlugFromObjectUrl,
} from "../../hooks/useUidAndSlugFromObjectUrl";

const ArticlePage: NextPage = () => {
  const { uid } = useUidAndSlugFromObjectUrl();

  const {
    data: article,
    isError,
    isLoading,
  } = useObject<Article>(GET_ARTICLE, uid || "");

  const canonical = useAddSlugToObjectUrl(article);

  if (isError) {
    return (
      <DisplayError
        error={isError}
        notFoundMessage={`Article "${uid as string}" not found.`}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-gray-900 pb-20 pt-4 font-body md:pt-48">
      <NextSeo
        canonical={canonical?.url}
        description={article?.description || ""}
        openGraph={{
          images: convertObjectImagesToSeoImages(article?.images) || [],
        }}
        title={article?.title || "article"}
      />
      <SkeletonPage show={isLoading}>
        <div className="mx-4 flex w-full flex-col items-center px-4 text-white md:max-w-5xl">
          <h1 className="mb-4 rounded-sm bg-streamtv-accent p-4 text-center font-display text-xl md:p-10 md:text-left md:text-4xl">
            {article?.title}
          </h1>
          {article?.publish_date && (
            <p>
              {dayjs(article.publish_date as string).format(
                "dddd, D MMMM YYYY HH:mm",
              )}
            </p>
          )}
          <div className="mt-5 md:mt-10">
            <ParseAndDisplayHTML
              fallbackMessage="Article has no body"
              html={article?.body || null}
            />
          </div>
        </div>
      </SkeletonPage>
    </div>
  );
};

export default ArticlePage;
