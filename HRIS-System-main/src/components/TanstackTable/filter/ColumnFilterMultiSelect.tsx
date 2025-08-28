import { useEffect, useState } from 'react';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Checkbox, FormControl, MenuItem, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { Column, ColumnFiltersState, Table } from '@tanstack/react-table';
import { Typography } from '@mui/material';

import { transformToArray } from '../utils';
import { getSelectUxProps } from './common';

type Props<TData, TCellData> = {
  column: Column<TData, TCellData>;
  table: Table<TData>;
  preselectedFilters: ColumnFiltersState;
};
export const ColumnFilterMultiSelect = <TData extends object, TCellData>({
  column,
  table,
  preselectedFilters,
}: Props<TData, TCellData>) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const preselectedColumnValues = getPreSelectedValuesForColumn(column.id, preselectedFilters);

  const uniqueValues = getUniqueValues(table, column);
  const selectedValues = getSelectedValues(column);

  useEffect(() => {
    column.setFilterValue(preselectedColumnValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); //// Only run this effect once when the component mounts

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const newValues = event.target.value as string[];
    column.setFilterValue(newValues);
  };

  return (
    <FormControl variant="standard" size="small">
      <Select
        multiple
        data-testid={`ColumnFilterMultiSelect-${column.id}`}
        size="small"
        displayEmpty
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        value={selectedValues}
        disableUnderline
        IconComponent={FilterAltIcon}
        onChange={handleChange}
        renderValue={() => ''}
        sx={{
          ...getSelectUxProps({
            hasSelection: selectedValues.length !== 0,
            isActive: isOpen || selectedValues.length !== 0 || !!column.getIsSorted(),
            colorDisabled: theme.palette.text.disabled,
            colorActive: theme.palette.text.secondary,
          }),
        }}
      >
        {Array.from(uniqueValues)
          .sort()
          .map((value, index) => (
            <MenuItem key={index} value={value} sx={{ display: 'flex', gap: 1 }}>
              <Checkbox
                data-testid={`MultilevelCheckbox-${column.id}-${value}`}
                checked={selectedValues.includes(value)}
                tabIndex={-1}
                disableRipple
                size="small"
                style={{ padding: 0 }}
              />
              <Typography>{value}</Typography>
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

const getUniqueValues = <TData, TCellData>(
  table: Table<TData>,
  column: Column<TData, TCellData>
): Set<string> => {
  return new Set(
    table.getCoreRowModel().rows.flatMap(row => {
      const cellValues: string | string[] = row.getValue(column.id);
      return transformToArray(cellValues);
    })
  );
};

const getSelectedValues = <TData, TCellData>(column: Column<TData, TCellData>) => {
  const selectedValues = column.getFilterValue() as string | string[] | undefined;
  return transformToArray(selectedValues);
};

const getPreSelectedValuesForColumn = (
  columnId: string,
  preselectedFilters: ColumnFiltersState
): string[] => {
  const filterForThisColumn = preselectedFilters
    .filter(e => e.id === columnId)
    .map(e => e.value) as string[];

  return transformToArray(filterForThisColumn);
};
