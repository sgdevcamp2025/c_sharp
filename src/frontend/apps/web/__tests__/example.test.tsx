import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function Example() {
  return <div>Hello, World!</div>;
}

describe('Example Component', () => {
  it('renders correctly', () => {
    render(<Example />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
});
