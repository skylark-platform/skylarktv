import type { NextPage } from "next";
import Head from "next/head";
import {
  Carousel,
  CollectionThumbnail,
  EpisodeThumbnail,
  MovieThumbnail,
  Rail,
} from "@skylark-reference-apps/react";
import { useRouter } from "next/router";
import {
  ImageUrl,
  Episode,
  SkylarkObject,
  EntertainmentType,
  AllEntertainment,
} from "@skylark-reference-apps/lib";

import { collectionThumbnails } from "../test-data";
import { useHomepageSet, homepageSetFetcher } from "../hooks/useHomepageSet";

export async function getStaticProps() {
  const initialData = await homepageSetFetcher();
  return {
    props: {
      initialData,
    },
    revalidate: 300, // Skylark cache reset is 300 seconds
  };
}

const Home: NextPage<{ initialData: AllEntertainment }> = ({ initialData }) => {
  const { query } = useRouter();
  const { homepage } = useHomepageSet(initialData);

  const activeCarouselItem = query?.carousel_item
    ? parseInt(query.carousel_item as string, 10)
    : undefined;

  return (
    <div className="mb-20 flex min-h-screen flex-col items-center bg-gray-900">
      <Head>
        <title>{`Skylark Media Reference App`}</title>
      </Head>

      {homepage?.isExpanded &&
        homepage.items?.map((item) => {
          if (item.isExpanded) {
            const key = `${item.self}-${item.slug}-${item.uid}-${item.objectTitle}`;
            if (item.type === "slider") {
              return (
                <div className="h-[90vh] w-full md:h-[95vh]" key={key}>
                  <Carousel
                    activeItem={activeCarouselItem}
                    changeInterval={6}
                    items={(
                      item.items?.filter(
                        (carouselItem) => carouselItem.isExpanded === true
                      ) as SkylarkObject[]
                    ).map((carouselItem) => ({
                      uid: carouselItem.uid || "",
                      title:
                        carouselItem.title?.medium ||
                        carouselItem.title?.short ||
                        carouselItem.objectTitle ||
                        "",
                      href:
                        carouselItem.type && carouselItem.slug
                          ? `/${carouselItem.type}/${carouselItem.slug}`
                          : "",
                      image:
                        carouselItem.images && typeof window !== "undefined"
                          ? `${
                              (
                                (carouselItem.images as ImageUrl[]).find(
                                  (image) =>
                                    image.isExpanded && image.type === "Main"
                                )?.url as string
                              ).split(".jpg")[0]
                            }-${window.innerHeight}x${window.innerWidth}.webp`
                          : "",
                      type: carouselItem.type as EntertainmentType,
                      releaseDate: carouselItem.releaseDate || "",
                    }))}
                  />
                </div>
              );
            }

            if (item.type === "rail") {
              return (
                <div className="my-6 w-full" key={key}>
                  <Rail
                    displayCount
                    header={item.title?.medium || item.title?.short}
                  >
                    {(
                      item.items?.filter(
                        (railItem) => railItem.isExpanded === true
                      ) as SkylarkObject[]
                    ).map((movie) => (
                      <MovieThumbnail
                        backgroundImage={
                          movie.images
                            ? `${
                                (
                                  (movie.images as ImageUrl[]).find(
                                    (image) =>
                                      image.isExpanded &&
                                      image.type === "Thumbnail"
                                  )?.url as string
                                ).split(".jpg")[0]
                              }-384x216.jpg`
                            : ""
                        }
                        contentLocation="below"
                        href={
                          movie.type && movie.slug
                            ? `/${movie.type}/${movie.slug}`
                            : ""
                        }
                        key={movie.objectTitle || movie.uid || movie.slug}
                        title={movie.title?.short || ""}
                      />
                    ))}
                  </Rail>
                </div>
              );
            }

            if (item.type === "season") {
              return (
                <div className="my-6 w-full" key={key}>
                  <Rail
                    displayCount
                    header={item.title?.medium || item.title?.short}
                  >
                    {(
                      item.items?.filter(
                        (railItem) => railItem.isExpanded === true
                      ) as Episode[]
                    )
                      .sort((a: Episode, b: Episode) =>
                        (a.number || 0) > (b.number || 0) ? 1 : -1
                      )
                      .map((episode) => (
                        <EpisodeThumbnail
                          backgroundImage={
                            episode.images
                              ? `${
                                  (
                                    (episode.images as ImageUrl[]).find(
                                      (image) =>
                                        image.isExpanded &&
                                        image.type === "Thumbnail"
                                    )?.url as string
                                  )?.split(".jpg")?.[0]
                                }-384x216.jpg`
                              : ""
                          }
                          contentLocation="below"
                          description={
                            episode.synopsis?.short ||
                            episode.synopsis?.medium ||
                            episode.synopsis?.long ||
                            ""
                          }
                          href={
                            episode.type && episode.slug
                              ? `/${episode.type}/${episode.slug}`
                              : ""
                          }
                          key={
                            episode.objectTitle || episode.uid || episode.slug
                          }
                          number={episode.number || 0}
                          title={episode.title?.short || ""}
                        />
                      ))}
                  </Rail>
                </div>
              );
            }
          }

          return <>{item.isExpanded && item.objectTitle}</>;
        })}

      <div className="my-6 w-full">
        <Rail displayCount header="Discover">
          {collectionThumbnails.map((collection) => (
            <CollectionThumbnail key={collection.title} {...collection} />
          ))}
        </Rail>
      </div>
    </div>
  );
};

export default Home;
