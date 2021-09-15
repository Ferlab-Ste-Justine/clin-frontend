import { BaseSvg, IconProps } from './index';

const LineStyleIcon = ({
  fill = '#fff',
  width = '24px',
  height = '24px',
  style = {},
}: IconProps) => BaseSvg({
  // eslint-disable-next-line max-len
  svg: `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 8V4H21V8H3ZM11 12H3V10H11V12ZM3 16H8V14H3V16ZM9.5 16H14.5V14H9.5V16ZM21 16H16V14H21V16ZM3 20H5V18H3V20ZM9 18V20H7V18H9ZM11 20H13V18H11V20ZM17 18V20H15V18H17ZM19 20H21V18H19V20ZM13 12H21V10H13V12Z" fill="${fill}"/></svg>`,
  width,
  height,
  style: { ...style },
});

export default LineStyleIcon;
