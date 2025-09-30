import { SxProps, Theme } from '@mui/material/styles';

export const getSelectUxProps = ({
  hasSelection,
  isActive,
  colorDisabled,
  colorActive,
}: {
  hasSelection: boolean;
  isActive: boolean;
  colorDisabled: string;
  colorActive: string;
}): SxProps<Theme> => {
  return {
    '& .MuiSelect-icon': {
      top: '50%',
      width: '15px',
      height: '15px',
      color: !hasSelection ? colorDisabled : colorActive,
      transform: 'translateY(-50%)',
      opacity: isActive ? 1 : 0,
      transition: 'opacity 200ms', // Smooth transition for opacity
    },
    '&:hover .MuiSelect-icon': {
      // Ensuring hover on the Select itself shows the icon
      opacity: 1, // Override opacity on hover
    },
    '& .MuiSelect-select.MuiInputBase-input.MuiInput-input:focus': {
      backgroundColor: 'transparent',
    },
    color: !hasSelection ? 'transparent' : 'inherit',
  };
};
