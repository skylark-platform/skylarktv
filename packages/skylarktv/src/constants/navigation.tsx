import { ReactNode } from "react";
import { MdHome, MdMovie, MdOutlineStar } from "react-icons/md";
import { LinkProps as NextLinkProps } from "next/link";

export const CLIENT_NAVIGATION_CONFIG: {
  links: { localeKey: string; href: NextLinkProps["href"]; icon: ReactNode }[];
} = {
  links: [
    { localeKey: "home", href: "/", icon: <MdHome /> },
    { localeKey: "shows", href: "/episodes", icon: <MdMovie /> },
    {
      localeKey: "music-videos",
      href: {
        pathname: "/episodes",
        query: { tag: "01J9PAMFSGSGKEX6HKK0QDN2Z2" },
      },
      icon: <MdMovie />,
    },
    {
      localeKey: "interviews",
      href: {
        pathname: "/episodes",
        query: { tag: "01J9PAMFS321GKYMA67QP44J7E" },
      },
      icon: <MdMovie />,
    },
    {
      localeKey: "podcasts",
      href: {
        pathname: "/episodes",
        query: { tag: "01J9PAMFSPSM1MVPW1M2P45TVC" },
      },
      icon: <MdMovie />,
    },
    {
      localeKey: "blog",
      href: "/articles",
      icon: <MdOutlineStar />,
    },
  ],
};
