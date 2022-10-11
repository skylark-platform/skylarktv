import type { GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import {
  HomePage,
  HomepageItem,
  HomePageParsedRailItem,
} from "@skylark-reference-apps/react";
import {
  AllEntertainment,
  Episode,
  getImageSrc,
  getSynopsisByOrder,
  getTitleByOrder,
  sortObjectByNumberProperty,
} from "@skylark-reference-apps/lib";
import { ReactNode } from "react";
import { homepageSlug, useHomepageSet } from "../hooks/useHomepageSet";
import { getSeoDataForSet, SeoObjectData } from "../lib/getPageSeoData";
import { DataFetcher, SliderDataFetcher } from "../components/dataFetcher";

const RailItemDataFetcher: React.FC<{
  slug: string;
  self: string;
  isPortrait: boolean;
  children(data: HomePageParsedRailItem): ReactNode;
}> = ({ slug, self, isPortrait, children }) => (
  <DataFetcher self={self} slug={slug}>
    {(item: AllEntertainment) => (
      <>
        {children({
          title: getTitleByOrder(item.title, ["short", "medium"]),
          synopsis: getSynopsisByOrder(item.synopsis, [
            "short",
            "medium",
            "long",
          ]),
          image: getImageSrc(
            item.images,
            "Thumbnail",
            isPortrait ? "350x350" : "384x216"
          ),
          uid: item.uid,
          href: item.type && item.slug ? `/${item.type}/${item.slug}` : "",
          number:
            (item.type === "episode" && (item as Episode).number) || undefined,
        })}
      </>
    )}
  </DataFetcher>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const seo = await getSeoDataForSet("homepage", homepageSlug, locale || "");
  return {
    revalidate: 300,
    props: {
      seo,
    },
  };
};

const Home: NextPage<{ seo: SeoObjectData }> = ({ seo }) => {
  const { homepage, isLoading } = useHomepageSet();

  const homepageItems =
    homepage?.isExpanded &&
    homepage?.items?.isExpanded &&
    homepage.items.objects
      ? homepage.items.objects.filter(
          (item) =>
            item.isExpanded &&
            item.items?.isExpanded &&
            item.items.objects.every((objectItem) => objectItem.isExpanded)
        )
      : [];

  const parsedItems: HomepageItem[] = homepageItems.map((item) => {
    let content: AllEntertainment[] = [];
    if (item.items?.isExpanded) {
      if (
        item.items.objects.some((obj) =>
          Object.prototype.hasOwnProperty.call(obj, "number")
        )
      ) {
        content = (
          item.items.objects as (AllEntertainment & { number?: number })[]
        ).sort(sortObjectByNumberProperty);
      } else {
        content = item.items.objects;
      }
    }

    return {
      uid: item.uid,
      type: item.type,
      slug: item.slug,
      self: item.self,
      title: getTitleByOrder(item.title, ["short", "medium"]),
      content: content.map((contentItem) => ({
        self: contentItem.self,
        slug: contentItem.slug,
        uid: "",
        type: "",
      })),
    };
  });

  return (
    <>
      <NextSeo openGraph={{ images: seo.images }} />
      <HomePage
        RailItemDataFetcher={RailItemDataFetcher}
        SliderDataFetcher={SliderDataFetcher}
        items={parsedItems}
        loading={isLoading}
      />
    </>
  );
};

export default Home;
