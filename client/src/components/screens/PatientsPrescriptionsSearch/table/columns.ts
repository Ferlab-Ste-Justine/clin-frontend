type RenderValue = (v: string) => JSX.Element | string;
type RenderRecord = (r: Record<string, string>) => JSX.Element | string;

export type TColumn = {
  title: string | JSX.Element;
  dataIndex?: string | string[];
  name?: string | string[];
  width?: number;
  summary?: boolean;
  render?: RenderValue  | RenderRecord;
  children?: TColumn[];
  key: string;
};
