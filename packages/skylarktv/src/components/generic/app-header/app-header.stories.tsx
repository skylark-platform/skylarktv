import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import {
  MdStream,
  MdAccountCircle,
  MdMovie,
  MdHome,
  MdOutlineStar,
  MdSearch,
} from "react-icons/md";
import { AppHeader } from "./app-header.component";
import { Button } from "../button";

export default {
  title: "React/AppHeader",
  component: AppHeader,
} as Meta<typeof AppHeader>;

const Template: StoryFn<typeof AppHeader> = (args) => <AppHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
  links: [
    { text: "Discover", href: "/", icon: <MdHome /> },
    { text: "Movies", href: "/movies", icon: <MdMovie /> },
    {
      text: "Featured",
      href: "/featured",
      icon: <MdOutlineStar />,
    },
  ],
  activeHref: "/",
  children: (
    <>
      <div className="flex items-center justify-center text-3xl text-gray-100">
        <MdStream className="h-9 w-9 md:mx-8 md:h-10 md:w-10 lg:mx-16 lg:h-12 lg:w-12 xl:mx-20" />
        <h2 className="mx-1 text-base md:mx-2 md:text-xl lg:text-2xl">
          <a>{`SkylarkTV`}</a>
        </h2>
        <span className="absolute right-2 md:hidden">
          <Button
            icon={<MdAccountCircle size={20} />}
            size="sm"
            variant="tertiary"
          />
        </span>
      </div>
      <div className="hidden gap-1 md:flex">
        <Button text="Sign in" />
        <Button text="Register" variant="tertiary" />
      </div>
    </>
  ),
  search: {
    text: "Search",
    onClick: () => "",
    icon: <MdSearch />,
    isMobileOnly: true,
  },
};

export const DefaultRTL = Template.bind({});
DefaultRTL.args = {
  ...Default.args,
  forceRtl: true,
};

export const Mobile = Template.bind({});
Mobile.args = {
  ...Default.args,
};
Mobile.parameters = {
  chromatic: { viewports: [320] },
  viewport: {
    defaultViewport: "mobile1",
  },
};
