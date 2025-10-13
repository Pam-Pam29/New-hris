// Utility function for conditionally joining classNames (shadcn/ui standard)
// Usage: cn('foo', isActive && 'bar', ...)
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
} 