import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import { DimensionRadioButton } from "./dimension-radio-button.component";

export default {
  title: "React/DimensionSettings/RadioButton",
  component: DimensionRadioButton,
} as Meta<typeof DimensionRadioButton>;

const Template: StoryFn<typeof DimensionRadioButton> = (args) => (
  <DimensionRadioButton {...args} />
);

export const Default = Template.bind({});
Default.args = {
  options: [
    { text: "Current", value: "current" },
    { text: "Tomorrow", value: "tomorrow" },
  ],
  // eslint-disable-next-line no-console
  onChange: (value: string) => console.log(value),
};
