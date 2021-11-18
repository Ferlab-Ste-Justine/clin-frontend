import React from "react";

import { IconProps } from "./Props";

const FemaleIcon = ({
  className,
  height,
  viewBox,
  width,
}: IconProps):React.ReactElement => (
  <svg
    className={className}
    fill="none"
    height={height}
    viewBox={viewBox}
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11 2.75C14.0376 2.75 16.5 5.21243 16.5 8.25C16.5 10.9725 14.52 13.2367 11.9167 13.6767V15.5833H13.75V17.4167H11.9167V19.25H10.0833V17.4167H8.25V15.5833H10.0833V13.6767C7.48 13.2367 5.5 10.9725 5.5 8.25C5.5 5.21243 7.96243 2.75 11 2.75ZM11 4.58333C8.97496 4.58333 7.33333 6.22496 7.33333 8.25C7.33333 10.275 8.97496 11.9167 11 11.9167C13.025 11.9167 14.6667 10.275 14.6667 8.25C14.6667 6.22496 13.025 4.58333 11 4.58333Z" fill="#8B9DB2"/>
  </svg>
);
export default FemaleIcon;