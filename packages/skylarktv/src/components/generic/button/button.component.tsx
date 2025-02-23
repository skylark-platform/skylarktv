import React from "react";
import { Link } from "../link";

interface ButtonProps {
  size?: "xl" | "lg" | "sm";
  text?: string;
  icon?: JSX.Element;
  iconPlacement?: "left" | "right";
  variant?: "primary" | "secondary" | "tertiary" | "outline";
  href?: string;
  externalHref?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const primaryClassName = "bg-skylarktv-primary";
const secondaryClassName = "bg-button-secondary";
const tertiaryClassName = "bg-button-tertiary";
const outlineClassName = "text-gray-600 hover:text-gray-100 font-medium";
const xlClassName = "px-8 md:px-10 lg:px-12 py-4 text-base md:text-lg";
const lgClassName =
  "px-4 md:px-6 lg:px-8 xl:px-10 py-2 lg:py-3 text-sm lg:text-base";
const smClassName = "px-2 md:px-4 lg:px-6 py-2 text-xs md:text-sm";
const onlyIconXlClassName = "p-4 md:p-5";
const onlyIconLgClassName = "p-3";
const onlyIconSmClassName = "p-2";

export const Button: React.FC<ButtonProps> = ({
  size = "lg",
  text,
  icon,
  iconPlacement,
  variant = "primary",
  href,
  externalHref,
  disabled,
  onClick,
}) => {
  let className = `
  ${variant === "primary" ? primaryClassName : ""}
  ${variant === "secondary" ? secondaryClassName : ""}
  ${variant === "tertiary" ? tertiaryClassName : ""}
  ${
    variant === "outline"
      ? outlineClassName
      : "text-white disabled:text-gray-300"
  }
flex justify-center items-center h-full rounded-full
disabled:bg-gray-100 transition-colors
font-body cursor-pointer
`;

  if (text) {
    className += ` rounded-sm w-full md:w-fit px-2
      ${size === "sm" ? smClassName : ""}
      ${size === "lg" ? lgClassName : ""}
      ${size === "xl" ? xlClassName : ""}
    `;
  } else {
    className += ` rounded-full
      ${size === "sm" ? onlyIconSmClassName : ""}
      ${size === "lg" ? onlyIconLgClassName : ""}
      ${size === "xl" ? onlyIconXlClassName : ""}
    `;
  }

  let iconClassName = "";
  if (icon && text) {
    const rightPlacedIcon = iconPlacement === "right";
    className += ` ${rightPlacedIcon ? "flex-row-reverse" : "flex-row"}`;
    iconClassName += ` ${rightPlacedIcon ? "ml-2" : "mr-2"}`;
  }

  if (href && !disabled) {
    return (
      <Link className={className} href={href} isExternal={externalHref}>
        {icon && <span className={iconClassName}>{icon}</span>}
        {text && <span>{text}</span>}
      </Link>
    );
  }

  return (
    <button className={className} disabled={disabled} onClick={onClick}>
      {icon && <span className={iconClassName}>{icon}</span>}
      {text && <span>{text}</span>}
    </button>
  );
};

export default Button;
