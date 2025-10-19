export const TanstackTables = {
  SavingsTable: 'SavingsTable',
  CompaniesTable: 'CompaniesTable',
  UsersTable: 'UsersTable',
  ProjectsTable: 'ProjectsTable',
  AddressesTable: 'AddressesTable',
  BuildingsAdminTable: 'BuildingsAdminTable',
  FloorsTable: 'FloorsTable',
  RoomsTable: 'RoomsTable',
} as const;

export type TanstackTablesType = keyof typeof TanstackTables;

export type TablePaginationCache = { page?: number; ttl?: Date; pageSize?: number };
export type TablePaginationCaches = Record<TanstackTablesType, TablePaginationCache | undefined>;
