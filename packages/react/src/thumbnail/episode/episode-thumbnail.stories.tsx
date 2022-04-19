import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { EpisodeThumbnail as EpisodeThumbnailComponent } from "./episode-thumbnail.component";

export default {
  title: "React/Thumbnails/Episode",
  component: EpisodeThumbnailComponent,
  argTypes: {
    contentLocation: {
      options: ["inside", "below"],
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof EpisodeThumbnailComponent>;

const Template: ComponentStory<typeof EpisodeThumbnailComponent> = (args) => (
  <div className="flex h-72 w-full flex-col justify-center overflow-y-visible mt-10">
    <div className="p-10 bg-gray-900 w-96">
      <EpisodeThumbnailComponent {...args} />
    </div>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  href: "/",
  title: "Episode Title",
  number: 1,
  backgroundImage: "/episodes/GOT%20-%20S1%20-%201.png",
  description:
    "Series Premiere. Lord Ned Stark is troubled by disturbing reports from a Night's Watch deserter.",
  duration: "55m",
  releaseDate: "22 Jan 2022",
};

export const DefaultWithHoverState = Template.bind({});
DefaultWithHoverState.args = {
  ...Default.args,
};
DefaultWithHoverState.parameters = { pseudo: { hover: true } };
