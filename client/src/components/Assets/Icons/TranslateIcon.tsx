import React from "react";
import { IconProps } from ".";

const TranslateIcon = ({
  className = "",
  width = "20",
  height = "20",
  fill
}: IconProps) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.725 12.5583L8.60831 10.4667L8.63331 10.4417C10.0833 8.82499 11.1166 6.96666 11.725 4.99999H14.1666V3.33332H8.33331V1.66666H6.66665V3.33332H0.833313V4.99166H10.1416C9.58331 6.59999 8.69998 8.12499 7.49998 9.45832C6.72498 8.59999 6.08331 7.65832 5.57498 6.66666H3.90831C4.51665 8.02499 5.34998 9.30832 6.39165 10.4667L2.14998 14.65L3.33331 15.8333L7.49998 11.6667L10.0916 14.2583L10.725 12.5583ZM15.4166 8.33332H13.75L9.99998 18.3333H11.6666L12.6 15.8333H16.5583L17.5 18.3333H19.1666L15.4166 8.33332ZM14.5833 10.5583L13.2333 14.1667H15.9333L14.5833 10.5583Z"
      fill={fill}
    />
  </svg>
);
export default TranslateIcon;
