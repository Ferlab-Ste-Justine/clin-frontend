import React from "react";
import { IconProps } from ".";

const AccountCircleIcon = ({
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
      d="M10 1.66666C5.40002 1.66666 1.66669 5.39999 1.66669 9.99999C1.66669 14.6 5.40002 18.3333 10 18.3333C14.6 18.3333 18.3334 14.6 18.3334 9.99999C18.3334 5.39999 14.6 1.66666 10 1.66666ZM10 4.16666C11.3834 4.16666 12.5 5.28332 12.5 6.66666C12.5 8.04999 11.3834 9.16666 10 9.16666C8.61669 9.16666 7.50002 8.04999 7.50002 6.66666C7.50002 5.28332 8.61669 4.16666 10 4.16666ZM5.00002 13.3167C6.07502 14.9333 7.91669 16 10 16C12.0834 16 13.925 14.9333 15 13.3167C14.975 11.6583 11.6584 10.75 10 10.75C8.33335 10.75 5.02502 11.6583 5.00002 13.3167Z"
      fill={fill}
    />
  </svg>
);
export default AccountCircleIcon;
