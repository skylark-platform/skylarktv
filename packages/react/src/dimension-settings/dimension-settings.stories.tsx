import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { DimensionSettings } from "./dimension-settings.component";

export default {
  title: "React/DimensionSettings",
  component: DimensionSettings,
} as ComponentMeta<typeof DimensionSettings>;

const Template: ComponentStory<typeof DimensionSettings> = (args) => (
  <div className="h-screen w-screen bg-gray-900">
    <DimensionSettings {...args} />
  </div>
);

export const Default = Template.bind({});

export const WithShow = Template.bind({});
WithShow.args = {
  show: true,
};
