import { useState } from 'react';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { FormControl, MenuItem, Select, useTheme } from '@mui/material';
import { Column, Table } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { Typography } from '@mui/material';
import { transformToArray } from '../utils';
import { getSelectUxProps } from './common';

type Props<TData, TCellData> = {
  column: Column<TData, TCellData>;
  table: Table<TData>;
};

export const ColumnFilterSingleSelect = <TData, TCellData>({
  column,
  table,
}: Props<TData, TCellData>) => {
  const { t: _t } = useTranslation(['common']);
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const uniqueValues = new Set<string>();
  const rows = table.getCoreRowModel().rows;

  rows.forEach(r => {
    const values = transformToArray(r.getValue(column.id));
    values.forEach(value => uniqueValues.add(value));
  });

  const sortedUniqueValues = [...uniqueValues].sort();

  const columnFilterValue = column?.getFilterValue() ?? 'none';

  const allItem = (
    <MenuItem key={'none'} value={'none'}>
      {_t('labelFilterAll', 'All')}
    </MenuItem>
  );

  const items = [
    allItem,
    ...sortedUniqueValues.map((v, index) => (
      <MenuItem key={index} value={v}>
        <Typography>{v}</Typography>
      </MenuItem>
    )),
  ];

  return (
    <FormControl variant="standard" size="small">
      <Select
        displayEmpty
        data-testid={`ColumnFilterSingleSelect-${column.id}`}
        value={columnFilterValue}
        disableUnderline
        IconComponent={FilterAltIcon}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        onChange={event => {
          const v = event.target.value;
          column.setFilterValue(v === 'none' ? undefined : v);
        }}
        renderValue={() => ''}
        sx={{
          ...getSelectUxProps({
            hasSelection: columnFilterValue !== 'none',
            isActive: isOpen || columnFilterValue !== 'none' || !!column.getIsSorted(),
            colorDisabled: theme.palette.text.disabled,
            colorActive: theme.palette.text.secondary,
          }),
        }}
      >
        {items}
      </Select>
    </FormControl>
  );
};
