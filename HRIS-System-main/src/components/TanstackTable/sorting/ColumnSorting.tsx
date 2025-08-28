import { useState } from 'react';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { FormControl, MenuItem, Select } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Column, OnChangeFn, SortingState } from '@tanstack/table-core';
import { useTranslation } from 'react-i18next';

import { transformToArray } from '../utils';

type Props<TData, TCellData> = {
  column: Column<TData, TCellData>;
  setSorting: OnChangeFn<SortingState>;
};

type SortingValue = 'none' | 'asc' | 'desc';

export const ColumnSorting = <TData extends object, TCellData>({
  column,
  setSorting,
}: Props<TData, TCellData>) => {
  const { t: _t } = useTranslation('common');
  const theme = useTheme();
  const isColumnSorted = column.getIsSorted();
  const [isOpen, setIsOpen] = useState(false);
  const [sortingValue, setSortingValue] = useState<SortingValue>('none');

  const handleSortToggle = (columnId: string, value: SortingValue) => {
    setSorting(currentSorting => {
      const filteredSorting = currentSorting.filter(sort => sort.id !== columnId);

      if (value !== 'none') {
        filteredSorting.push({ id: columnId, desc: value === 'desc' });
      }

      return filteredSorting;
    });
    setSortingValue(value);
  };

  const sortItems = [
    <MenuItem key={'none'} value={'none'}>
      {_t('noSorting', 'No Sorting')}
    </MenuItem>,
    <MenuItem key={'asc'} value={'asc'}>
      {_t('ascending', 'Ascending')}
    </MenuItem>,
    <MenuItem key={'desc'} value={'desc'}>
      {_t('descending', 'Descending')}
    </MenuItem>,
  ];

  const isFiltered =
    transformToArray(column.getFilterValue() as string | string[] | undefined).length > 0;
  return (
    <FormControl variant="standard" size="small">
      <Select
        data-testid="sort-selector"
        value={sortingValue}
        disableUnderline
        IconComponent={ImportExportIcon}
        onChange={e => {
          handleSortToggle(column.id, e.target.value as SortingValue);
        }}
        renderValue={() => ''}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        sx={{
          '.table-header:hover &': {
            opacity: 0.5,
          },
          overflow: 'overlay',
          '& svg': {
            color: isColumnSorted ? theme.palette.text.secondary : theme.palette.text.disabled,
            opacity: isOpen || column.getIsSorted() ? 1 : 0,
            mb: '-6px',
          },
          '& .MuiSelect-select.MuiInputBase-input': {
            minWidth: '0px !important',
          },
          '& .MuiSelect-select.MuiInputBase-input.MuiInput-input:focus': {
            backgroundColor: 'transparent',
          },
          '& .MuiSelect-icon': {
            transform: 'none !important',
            opacity: isOpen || isFiltered || column.getIsSorted() ? 1 : 0,
            transition: 'opacity 200ms', // Smooth transition for opacity
          },
          '&:hover .MuiSelect-icon': {
            // Ensuring hover on the Select itself shows the icon
            opacity: 1, // Override opacity on hover
          },
        }}
      >
        {sortItems}
      </Select>
    </FormControl>
  );
};
