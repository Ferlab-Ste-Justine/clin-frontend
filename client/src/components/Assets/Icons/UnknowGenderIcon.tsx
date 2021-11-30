import React from "react";

import { IconProps } from "./Props";

const UnknowGenderIcon = ({
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
    <path clip-rule="evenodd" d="M12.2962 1.29964L21.3708 10.3742C22.0838 11.0872 22.0838 12.2539 21.3708 12.9669L12.2962 22.0414C11.5833 22.7544 10.4165 22.7544 9.70352 22.0414L0.628988 12.9669C-0.0840115 12.2539 -0.0840117 11.0872 0.628988 10.3742L9.70352 1.29964C10.4165 0.586643 11.5833 0.586643 12.2962 1.29964ZM10.9999 20.7451L20.0744 11.6705L10.9999 2.596L1.92535 11.6705L10.9999 20.7451Z" fill="#8B9DB2" fill-rule="evenodd"/>
    <path clip-rule="evenodd" d="M7.33325 9.83732C7.33325 7.81149 8.97409 6.17065 10.9999 6.17065C13.0258 6.17065 14.6666 7.81149 14.6666 9.83732C14.6666 11.0133 13.9424 11.6462 13.2373 12.2624C12.5684 12.847 11.9166 13.4166 11.9166 14.4207H10.0833C10.0833 12.7512 10.9469 12.0892 11.7062 11.5072C12.3018 11.0506 12.8333 10.6433 12.8333 9.83732C12.8333 8.82899 12.0083 8.00399 10.9999 8.00399C9.99159 8.00399 9.16659 8.82899 9.16659 9.83732H7.33325ZM11.9166 15.3373V17.1707H10.0833V15.3373H11.9166Z" fill="#8B9DB2" fill-rule="evenodd"/>
  </svg>
);
export default UnknowGenderIcon;