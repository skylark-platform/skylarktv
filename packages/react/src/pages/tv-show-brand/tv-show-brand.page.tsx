import { sortObjectByNumberProperty } from "@skylark-reference-apps/lib";
import useTranslation from "next-translate/useTranslation";
import React from "react";
import {
  SkeletonPage,
  Hero,
  Header,
  Rail,
  EpisodeThumbnail,
  CallToAction,
} from "../../components";

export interface BrandPageParsedEpisode {
  number?: number;
  slug: string;
  uid: string;
  title: string;
  synopsis: string;
  image: string;
  href: string;
}

interface Props {
  loading?: boolean;
  bgImage: string;
  title: string;
  synopsis: string;
  rating: string;
  releaseDate?: string;
  tags: string[];
  seasons: {
    number?: number;
    episodes: {
      uid: string;
      self: string;
      slug: string;
      number?: number;
      title: string;
    }[];
  }[];
  EpisodeDataFetcher: React.FC<{
    slug: string;
    self: string;
    uid: string;
    children(data: BrandPageParsedEpisode): React.ReactNode;
  }>;
}

export const TVShowBrandPage: React.FC<Props> = ({
  loading,
  title,
  bgImage,
  seasons,
  synopsis,
  rating,
  releaseDate,
  tags,
  EpisodeDataFetcher,
}) => {
  const { t } = useTranslation("common");

  const firstEpisodeOfFirstSeason =
    seasons.length > 0 && seasons?.[0].episodes?.[0];
  return (
    <div className="mb-20 mt-48 flex min-h-screen w-full flex-col items-center bg-gray-900 font-body">
      <SkeletonPage show={!!loading}>
        <div className="-mt-48 w-full">
          <Hero bgImage={bgImage}>
            <div className="flex w-full flex-col">
              <Header
                description={synopsis}
                numberOfItems={seasons.length}
                rating={rating}
                releaseDate={releaseDate}
                tags={tags}
                title={title}
                typeOfItems="season"
              />
              {firstEpisodeOfFirstSeason && (
                <CallToAction
                  episodeNumber={firstEpisodeOfFirstSeason.number || 1}
                  episodeTitle={firstEpisodeOfFirstSeason.title}
                  href={
                    firstEpisodeOfFirstSeason
                      ? `/episode/${firstEpisodeOfFirstSeason.slug}`
                      : ""
                  }
                  inProgress={false}
                  seasonNumber={seasons[0].number || 1}
                />
              )}
            </div>
          </Hero>
        </div>

        {seasons.map((season) => (
          <div className="my-6 w-full" key={season.number}>
            <Rail
              displayCount
              header={`${t("skylark.object.season")} ${season.number || "-"}`}
            >
              {season.episodes?.sort(sortObjectByNumberProperty).map((ep) => (
                <EpisodeDataFetcher
                  key={`episode-${ep.slug}`}
                  self={ep.self}
                  slug={ep.slug}
                  uid={ep.uid}
                >
                  {(episode: BrandPageParsedEpisode) => (
                    <EpisodeThumbnail
                      backgroundImage={episode.image}
                      description={episode.synopsis}
                      href={episode.href}
                      key={episode.uid}
                      number={episode.number || 0}
                      title={episode.title}
                    />
                  )}
                </EpisodeDataFetcher>
              ))}
            </Rail>
          </div>
        ))}
      </SkeletonPage>
    </div>
  );
};