import React from "react";
import clsx from "clsx";
import { CLIENT_NAVIGATION_CONFIG } from "../../../constants/navigation";
import {
  NavigationItem,
  NavigationLink,
} from "./navigation-item/navigation-item.component";

export interface NavigationProps {
  links: NavigationLink[];
  search: NavigationLink;
  activeHref: string;
  mobileNavIsOpen?: boolean;
  children?: React.ReactNode;
}

const { mobileVariant } = CLIENT_NAVIGATION_CONFIG;

export const Navigation: React.FC<NavigationProps> = ({
  links,
  search,
  activeHref,
  mobileNavIsOpen,
}) => (
  <nav
    className={clsx(
      `fixed z-60 w-full items-center justify-center bg-gray-900 text-center font-body lg:relative lg:inset-auto lg:h-full lg:justify-start lg:bg-gray-900/70 lg:opacity-100`,
      mobileVariant === "hamburger" &&
        clsx(
          "flex-col lg:flex-row",
          mobileNavIsOpen
            ? "bottom-0 left-0 right-0 top-0 flex"
            : "hidden lg:flex",
        ),
      mobileVariant === "bar" && "bottom-0 left-0 right-0 flex",
    )}
  >
    <ul
      className={clsx(
        "flex lg:gap-6 xl:gap-8 ltr:lg:ml-8 ltr:xl:ml-xl-gutter rtl:lg:ml-8 rtl:xl:mr-xl-gutter",
        mobileVariant === "bar" && "h-14 flex-row",
        mobileVariant === "hamburger" &&
          "flex-col max-lg:gap-2 lg:h-14 lg:flex-row",
      )}
    >
      {links.map((link) => (
        <NavigationItem
          activeHref={activeHref}
          key={link.text}
          link={link}
          variant={mobileVariant === "bar" ? "default" : "text"}
        />
      ))}
      {mobileVariant === "bar" && (
        <NavigationItem
          activeHref={activeHref}
          key={search.text}
          link={search}
          variant={"default"}
        />
      )}
    </ul>
  </nav>
);

export default Navigation;
