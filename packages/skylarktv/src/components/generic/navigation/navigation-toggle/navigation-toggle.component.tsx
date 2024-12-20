import React from "react";
import { MdClose, MdMenu } from "react-icons/md";

interface NavigationToggleProps {
  variant: "open" | "close";
  onClick: () => void;
}

export const NavigationToggle: React.FC<NavigationToggleProps> = ({
  variant,
  onClick,
}) => (
  <button
    aria-label="burger-menu"
    className="flex h-mobile-header w-mobile-header items-center justify-center bg-skylarktv-primary text-white md:bg-gray-900/80 md:p-5"
    type="button"
    onClick={onClick}
  >
    {variant === "open" && <MdMenu className="text-xl" />}
    {variant === "close" && <MdClose className="text-xl" />}
  </button>
);

export default NavigationToggle;
