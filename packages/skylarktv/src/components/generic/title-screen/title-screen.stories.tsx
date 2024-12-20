import React from "react";
import { MdStream } from "react-icons/md";
import { StoryFn, Meta } from "@storybook/react";
import { TitleScreen } from "./title-screen.component";

export default {
  title: "React/TitleScreen",
  component: TitleScreen,
} as Meta<typeof TitleScreen>;

const Template: StoryFn<typeof TitleScreen> = (args) => (
  <TitleScreen {...args} />
);

export const Default = Template.bind({});
Default.args = {
  title: "SkylarkTV",
};
Default.parameters = {
  chromatic: { disableSnapshot: true },
};

export const WithLogo = Template.bind({});
WithLogo.args = {
  ...Default.args,
  logo: (
    <MdStream className="h-12 w-12 rounded-md bg-skylarktv-primary sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
  ),
};
WithLogo.parameters = {
  ...Default.parameters,
};
