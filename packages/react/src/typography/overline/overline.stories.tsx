import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Overline as OverlineComponent } from "./overline.component";

export default {
  title: "React/Typography/Overline",
  component: OverlineComponent,
} as ComponentMeta<typeof OverlineComponent>;

const Template: ComponentStory<typeof OverlineComponent> = (args) => (
  <OverlineComponent {...args}>{`Overline ${args.level}`}</OverlineComponent>
);

export const Level1 = Template.bind({});
Level1.args = {
  level: 1,
};

export const Level2 = Template.bind({});
Level2.args = {
  level: 2,
};
