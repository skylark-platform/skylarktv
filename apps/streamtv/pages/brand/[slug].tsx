import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import {
  CallToAction,
  Header,
  Hero,
  SkeletonPage,
} from "@skylark-reference-apps/react";
import useTranslation from "next-translate/useTranslation";
import { Brand, ImageType, Season } from "../../types/gql";
import { getSeoDataForObject, SeoObjectData } from "../../lib/getPageSeoData";
import {
  getGraphQLImageSrc,
  getSynopsisByOrderForGraphQLObject,
  getTitleByOrderForGraphQLObject,
  sortEpisodesByNumber,
} from "../../lib/utils";
import { DisplayError } from "../../components/displayError";
import { useObject } from "../../hooks/useObject";
import { GET_BRAND } from "../../graphql/queries";
import { SeasonRail } from "../../components/rails";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const seo = await getSeoDataForObject(
    "Brand",
    context.query.slug as string,
    context.locale || ""
  );

  return {
    props: {
      seo,
    },
  };
};

const BrandPage: NextPage<{ seo: SeoObjectData }> = ({ seo }) => {
  const { query } = useRouter();

  const {
    data: brand,
    isError,
    isLoading,
  } = useObject<Brand>(GET_BRAND, query?.slug as string);

  const { t } = useTranslation("common");

  if (!isLoading && isError) {
    return (
      <DisplayError
        error={isError}
        notFoundMessage={`Brand "${query?.slug as string}" not found.`}
      />
    );
  }

  const title = getTitleByOrderForGraphQLObject(brand);
  const synopsis = getSynopsisByOrderForGraphQLObject(brand);

  const seasons =
    (brand?.seasons?.objects?.sort((s1, s2) =>
      (s1?.season_number || 0) > (s2?.season_number || 0) ? 1 : -1
    ) as Season[]) || [];

  const firstEpisodeOfFirstSeason =
    seasons.length > 0 &&
    seasons?.[0].episodes?.objects?.sort(sortEpisodesByNumber)?.[0];

  return (
    <div className="mb-20 mt-48 flex min-h-screen w-full flex-col items-center bg-gray-900 font-body">
      <NextSeo
        description={seo.synopsis}
        openGraph={{ images: seo.images }}
        title={title || seo.title}
      />
      <SkeletonPage show={isLoading}>
        <div className="-mt-48 w-full">
          <Hero bgImage={getGraphQLImageSrc(brand?.images, ImageType.Main)}>
            <div className="flex w-full flex-col">
              <Header
                description={synopsis}
                numberOfItems={seasons.length}
                rating={
                  brand?.ratings?.objects?.[0]?.value as string | undefined
                }
                tags={brand?.tags?.objects?.map((tag) => tag?.name || "") || []}
                title={title}
                typeOfItems="season"
              />
              {firstEpisodeOfFirstSeason && (
                <CallToAction
                  episodeNumber={firstEpisodeOfFirstSeason.episode_number || 1}
                  episodeTitle={
                    firstEpisodeOfFirstSeason.title ||
                    firstEpisodeOfFirstSeason.title_short ||
                    undefined
                  }
                  href={
                    firstEpisodeOfFirstSeason
                      ? `/episode/${
                          firstEpisodeOfFirstSeason.slug ||
                          firstEpisodeOfFirstSeason.uid
                        }`
                      : ""
                  }
                  inProgress={false}
                  seasonNumber={seasons[0].season_number || 1}
                />
              )}
            </div>
          </Hero>
        </div>

        {seasons.map((season) => (
          <SeasonRail
            className="my-6"
            header={`${t("skylark.object.season")} ${
              season.season_number || "-"
            }`}
            key={season.uid}
            season={season}
          />
        ))}
      </SkeletonPage>
    </div>
  );
};

export default BrandPage;