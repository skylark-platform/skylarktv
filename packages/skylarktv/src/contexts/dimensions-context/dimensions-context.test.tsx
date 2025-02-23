import React from "react";
import { render, RenderOptions, screen } from "../../../test-utils";
import { DimensionsContextProvider, useDimensions } from "./dimensions-context";
import { DimensionKey } from "../../lib/interfaces";

const customRender = (ui: React.ReactElement, renderOptions?: RenderOptions) =>
  render(
    <DimensionsContextProvider {...renderOptions}>
      {ui}
    </DimensionsContextProvider>,
    renderOptions,
  );

const Consumer: React.FC<{ property?: string }> = ({ property }) => {
  const { dimensions, setProperty } = useDimensions();
  return (
    <div>
      <p>{`Language: ${dimensions.language}`}</p>
      <p onClick={() => setProperty(property || "")}>{`Customer Type: ${
        dimensions[DimensionKey.Property]
      }`}</p>
    </div>
  );
};

describe("Dimensions Context", () => {
  it("Returns the active language", () => {
    customRender(<Consumer />);
    expect(screen.getByText(/^Language:/).textContent).toBe("Language: en-gb");
  });

  // it("Returns the active customer type", () => {
  //   customRender(<Consumer />);
  //   expect(screen.getByText(/^Customer Type:/).textContent).toBe(
  //     "Customer Type: premium",
  //   );
  // });

  // it("Sets a customer type", () => {
  //   customRender(<Consumer property="standard" />);
  //   fireEvent.click(screen.getByText(/^Customer Type:/));
  //   expect(screen.getByText(/^Customer Type:/).textContent).toBe(
  //     "Customer Type: standard",
  //   );
  // });

  // it("Returns the active device type", () => {
  //   customRender(<Consumer />);
  //   expect(screen.getByText(/^Device Type:/).textContent).toBe(
  //     "Device Type: pc",
  //   );
  // });

  // it("Sets an active device type", () => {
  //   customRender(<Consumer deviceType="phone" />);
  //   fireEvent.click(screen.getByText(/^Device Type:/));
  //   expect(screen.getByText(/^Device Type:/).textContent).toBe(
  //     "Device Type: phone",
  //   );
  // });
});
