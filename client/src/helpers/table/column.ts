type OrderedColumn = {
  label: string;
}
type OrderedColumns = OrderedColumn[];

type OrderedColumnsArguments = {
  orderedColumns: OrderedColumns;
  schema: OrderedColumn[];
};

export const getOrderedColumns = ({ orderedColumns, schema }: OrderedColumnsArguments) => {
  const output: OrderedColumns = [];

  orderedColumns.forEach((ordered) => {
    const column = schema.find((c) => c.label === ordered.label);
    if (column != null) {
      output.push(column);
    }
  });
  schema.forEach((column: any) => {
    const ordered = orderedColumns.find((o) => o.label === column.label);
    if (ordered == null) {
      output.push(column);
    }
  });
  return output;
};
