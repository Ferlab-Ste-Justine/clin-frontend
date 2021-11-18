import React from "react";

import { IconProps } from "./Props";

const MaleIcon = ({
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
    <path d="M8.25 8.25C9.4325 8.25 10.5417 8.62583 11.4308 9.2675L16.115 4.58333H11.9167V2.75H19.25V10.0833H17.4167V5.87583L12.7325 10.5417C13.3742 11.4583 13.75 12.5583 13.75 13.75C13.75 16.7876 11.2876 19.25 8.25 19.25C5.21243 19.25 2.75 16.7876 2.75 13.75C2.75 10.7124 5.21243 8.25 8.25 8.25ZM8.25 10.0833C6.22496 10.0833 4.58333 11.725 4.58333 13.75C4.58333 15.775 6.22496 17.4167 8.25 17.4167C10.275 17.4167 11.9167 15.775 11.9167 13.75C11.9167 11.725 10.275 10.0833 8.25 10.0833Z" fill="#8B9DB2"/>
  </svg>
);
export default MaleIcon;