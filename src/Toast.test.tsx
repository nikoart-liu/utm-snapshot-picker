import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { Toast } from './Toast';

test('renders message when visible', () => {
  render(<Toast message="Test Message" isVisible={true} onClose={() => {}} />);
  expect(screen.getByText('Test Message')).toBeInTheDocument();
});

test('renders nothing when not visible', () => {
  render(<Toast message="Test Message" isVisible={false} onClose={() => {}} />);
  expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
});
