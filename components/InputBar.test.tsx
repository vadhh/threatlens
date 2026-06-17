import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputBar } from './InputBar';

function setup(overrides: Partial<React.ComponentProps<typeof InputBar>> = {}) {
  const props = {
    value: '',
    onChange: vi.fn(),
    onSend: vi.fn(),
    onStop: vi.fn(),
    isStreaming: false,
    ...overrides,
  };
  render(<InputBar {...props} />);
  return props;
}

describe('InputBar', () => {
  describe('rendering', () => {
    it('renders the textarea with correct placeholder', () => {
      setup();
      expect(
        screen.getByPlaceholderText('Paste network logs, IPs, or describe suspicious behavior...')
      ).toBeInTheDocument();
    });

    it('renders the send button', () => {
      setup();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows keyboard hint text', () => {
      setup();
      expect(screen.getByText(/Enter to send/)).toBeInTheDocument();
      expect(screen.getByText(/Shift\+Enter for new line/)).toBeInTheDocument();
    });
  });

  describe('send button state', () => {
    it('is disabled when value is empty', () => {
      setup({ value: '' });
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is disabled when value is only whitespace', () => {
      setup({ value: '   ' });
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is enabled when value has content', () => {
      setup({ value: 'analyze this log' });
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('becomes an enabled stop button while streaming', () => {
      setup({ value: 'some content', isStreaming: true });
      const button = screen.getByRole('button', { name: 'Stop generating' });
      expect(button).not.toBeDisabled();
    });

    it('calls onStop when the stop button is clicked while streaming', () => {
      const { onStop, onSend } = setup({ value: 'some content', isStreaming: true });
      fireEvent.click(screen.getByRole('button', { name: 'Stop generating' }));
      expect(onStop).toHaveBeenCalledOnce();
      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('interactions', () => {
    it('calls onChange when user types', async () => {
      const user = userEvent.setup();
      const { onChange } = setup({ value: '' });
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'h');
      expect(onChange).toHaveBeenCalled();
    });

    it('calls onSend when send button is clicked', () => {
      const { onSend } = setup({ value: 'analyze 192.168.1.1' });
      fireEvent.click(screen.getByRole('button'));
      expect(onSend).toHaveBeenCalledOnce();
    });

    it('does not call onSend when button is disabled (empty value)', () => {
      const { onSend } = setup({ value: '' });
      fireEvent.click(screen.getByRole('button'));
      expect(onSend).not.toHaveBeenCalled();
    });

    it('calls onSend on Enter key', async () => {
      const user = userEvent.setup();
      const { onSend } = setup({ value: 'check this IP' });
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{Enter}');
      expect(onSend).toHaveBeenCalledOnce();
    });

    it('does NOT call onSend on Shift+Enter', async () => {
      const user = userEvent.setup();
      const { onSend } = setup({ value: 'check this IP' });
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{Shift>}{Enter}{/Shift}');
      expect(onSend).not.toHaveBeenCalled();
    });

    it('textarea is disabled while streaming', () => {
      setup({ isStreaming: true });
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('textarea is enabled when not streaming', () => {
      setup({ isStreaming: false });
      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });
  });

  describe('controlled value', () => {
    it('displays the provided value', () => {
      setup({ value: 'Failed SSH from 10.0.0.1' });
      expect(screen.getByRole('textbox')).toHaveValue('Failed SSH from 10.0.0.1');
    });

    it('displays empty string by default', () => {
      setup({ value: '' });
      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });
});
