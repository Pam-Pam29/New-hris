import '@tanstack/react-table';
import { SkillDomain } from '@flipsight/common';

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterType?: 'select' | 'multiselect';
    domain?: SkillDomain;
    title?: string;
    requiredForRoles?: string[];
  }
}
