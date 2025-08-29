import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loader } from './loader';

describe('Loader Component', () => {
  test('renders with default props', () => {
    render(<Loader />);
    const loaderElement = screen.getByRole('status', { hidden: true });
    expect(loaderElement).toBeInTheDocument();
    expect(loaderElement).toHaveClass('w-6 h-6'); // Default size is md
  });

  test('renders with small size', () => {
    render(<Loader size="sm" />);
    const loaderElement = screen.getByRole('status', { hidden: true });
    expect(loaderElement).toHaveClass('w-4 h-4');
  });

  test('renders with large size', () => {
    render(<Loader size="lg" />);
    const loaderElement = screen.getByRole('status', { hidden: true });
    expect(loaderElement).toHaveClass('w-8 h-8');
  });

  test('applies custom className', () => {
    render(<Loader className="test-class" />);
    const containerElement = screen.getByTestId('loader-container');
    expect(containerElement).toHaveClass('test-class');
  });
});