import { rankItem } from '@tanstack/match-sorter-utils';
import intersection from 'lodash/intersection';
import { FilterMeta, Row } from '@tanstack/react-table';

export const fuzzyFilter = <T extends object>(
  row: Row<T>,
  columnId: string,
  value: string | string[],
  addMeta: (meta: FilterMeta) => void
): boolean => {
  const cellValue = row.getValue<string | string[]>(columnId);
  const isSelectFilter = Array.isArray(value);

  if (isSelectFilter) {
    const typedValue = value;
    const typedCellValue = Array.isArray(cellValue) ? cellValue : [cellValue];
    return typedValue.length === 0 || intersection(typedCellValue, typedValue).length > 0;
  }

  const itemRank = rankItem(cellValue, value);
  addMeta({ itemRank });
  return itemRank.passed;
};
