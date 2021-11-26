import React from 'react';

export const encodeSVG = (svg: string) => encodeURI(svg).replace(/#/g, '%23');

export type IconProps = {
  alt?: string;
  fill?: string;
  height?: string;
  style?: object;
  width?: string;
  className?: string;
  svgClass?: string;
};

export type BaseSvgProps = {
  svg: string;
  alt?: string;
  fill?: string;
  height?: string;
  size?: string;
  style?: object;
  width?: string;
};
