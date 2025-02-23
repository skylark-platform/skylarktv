import React from "react";
import { fireEvent, render, RenderOptions, screen } from "../../../test-utils";
import { DimensionsContextProvider, useDimensions } from "./dimensions-context";
import { DimensionKey } from "../../lib/interfaces";

const customRender = (ui: React.ReactElement, renderOptions?: RenderOptions) =>
  render(
    <DimensionsContextProvider {...renderOptions}>
      {ui}
    </DimensionsContextProvider>,
    renderOptions,
  );

const Consumer: React.FC<{ customerType?: string; deviceType?: string }> = ({
  customerType,
  deviceType,
}) => {
  const { dimensions, setCustomerType, setDeviceType } = useDimensions();
  return (
    <div>
      <p>{`Language: ${dimensions.language}`}</p>
      <p onClick={() => setCustomerType(customerType || "")}>{`Customer Type: ${
        dimensions[DimensionKey.CustomerType]
      }`}</p>
      <p onClick={() => setDeviceType(deviceType || "")}>{`Device Type: ${
        dimensions[DimensionKey.DeviceType]
      }`}</p>
    </div>
  );
};

describe("Dimensions Context", () => {
  it("Returns the active language", () => {
    customRender(<Consumer />);
    expect(screen.getByText(/^Language:/).textContent).toBe("Language: en-gb");
  });

  it.skip("Returns the active customer type", () => {
    customRender(<Consumer />);
    expect(screen.getByText(/^Customer Type:/).textContent).toBe(
      "Customer Type: premium",
    );
  });

  it("Sets a customer type", () => {
    customRender(<Consumer customerType="standard" />);
    fireEvent.click(screen.getByText(/^Customer Type:/));
    expect(screen.getByText(/^Customer Type:/).textContent).toBe(
      "Customer Type: standard",
    );
  });

  it("Returns the active device type", () => {
    customRender(<Consumer />);
    expect(screen.getByText(/^Device Type:/).textContent).toBe(
      "Device Type: pc",
    );
  });

  it("Sets an active device type", () => {
    customRender(<Consumer deviceType="phone" />);
    fireEvent.click(screen.getByText(/^Device Type:/));
    expect(screen.getByText(/^Device Type:/).textContent).toBe(
      "Device Type: phone",
    );
  });
});
