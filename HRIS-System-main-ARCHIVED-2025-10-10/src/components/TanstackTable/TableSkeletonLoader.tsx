import { Skeleton, Stack } from '@mui/material';

// the values values in here will need to be manually updated to match the layout of the matrix if it changes
export const TableSkeletonLoader = ({ rows = 10 }: { rows?: number }) => {
  return (
    <Stack width="80vw" gap={2}>
      <Skeleton key={'menu'} variant="rectangular" animation="wave" width="100%" height={80} />
      <Stack gap={1}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} variant="rectangular" animation="wave" width="100%" height={64} />
        ))}
      </Stack>
    </Stack>
  );
};
