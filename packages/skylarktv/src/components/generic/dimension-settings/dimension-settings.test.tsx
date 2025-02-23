import React from "react";
import {
  render,
  RenderOptions,
  screen,
  fireEvent,
} from "../../../../test-utils";
import { DimensionSettings } from "./dimension-settings.component";
import { DimensionsContextProvider } from "../../../contexts";

const customRender = (ui: React.ReactElement, renderOptions?: RenderOptions) =>
  render(
    <DimensionsContextProvider {...renderOptions}>
      {ui}
    </DimensionsContextProvider>,
    renderOptions,
  );

const getCheckBox = (label: string): HTMLInputElement =>
  screen.getByLabelText(label);

describe("Dimension Settings component", () => {
  it("the dimension settings component renders correctly when closed", () => {
    customRender(<DimensionSettings />);
    expect(screen.queryByText(/hello@skylarkplatform.com/)).toBeFalsy();
  });

  it("the dimension settings component renders correctly when open", () => {
    customRender(<DimensionSettings show />);
    expect(screen.getByText(/hello@skylarkplatform.com/)).toBeTruthy();
  });

  it("should change the active dimension language", () => {
    customRender(<DimensionSettings show />);
    expect(getCheckBox("English").checked).toBeTruthy();
    expect(getCheckBox("Portuguese").checked).toBeFalsy();
    fireEvent.click(screen.getByText("Portuguese"));
    expect(getCheckBox("Portuguese").checked).toBeTruthy();
    expect(getCheckBox("English").checked).toBeFalsy();
  });

  it.skip("should change the active dimension customer type", () => {
    customRender(<DimensionSettings show />);
    expect(getCheckBox("Standard").checked).toBeFalsy();
    fireEvent.click(screen.getByText("Standard"));
    expect(getCheckBox("Standard").checked).toBeTruthy();
    expect(getCheckBox("Kids").checked).toBeFalsy();
  });

  it.skip("should change the active dimension region", () => {
    customRender(<DimensionSettings show />);
    fireEvent.click(screen.getByText("Europe"));
    expect(getCheckBox("Europe").checked).toBeTruthy();
    expect(getCheckBox("North America").checked).toBeFalsy();
    fireEvent.click(screen.getByText("North America"));
    expect(getCheckBox("North America").checked).toBeTruthy();
    expect(getCheckBox("Europe").checked).toBeFalsy();
  });
});
