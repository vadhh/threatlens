import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';

function setup(overrides: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  const props = {
    analystMode: false,
    onToggleMode: vi.fn(),
    onClearSession: vi.fn(),
    isOpen: false,
    onClose: vi.fn(),
    messageCount: 0,
    ...overrides,
  };
  const result = render(<Sidebar {...props} />);
  return { ...props, ...result };
}

describe('Sidebar', () => {
  describe('branding', () => {
    it('renders the ThreatLens logo text', () => {
      setup();
      expect(screen.getAllByText('ThreatLens').length).toBeGreaterThan(0);
    });

    it('renders SVG icons', () => {
      const { container } = setup();
      expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
    });
  });

  describe('mode toggle', () => {
    it('shows Explain Mode by default', () => {
      setup({ analystMode: false });
      expect(screen.getAllByText('Explain Mode').length).toBeGreaterThan(0);
    });

    it('shows Analyst Mode when analystMode is true', () => {
      setup({ analystMode: true });
      expect(screen.getAllByText('Analyst Mode').length).toBeGreaterThan(0);
    });

    it('shows accessible subtitle for explain mode', () => {
      setup({ analystMode: false });
      expect(screen.getAllByText('Plain English · Accessible').length).toBeGreaterThan(0);
    });

    it('shows technical subtitle for analyst mode', () => {
      setup({ analystMode: true });
      expect(screen.getAllByText('Technical · SOC-level').length).toBeGreaterThan(0);
    });

    it('calls onToggleMode when mode button is clicked', () => {
      const { onToggleMode } = setup({ analystMode: false });
      const modeButton = screen.getAllByText('Explain Mode')[0].closest('button')!;
      fireEvent.click(modeButton);
      expect(onToggleMode).toHaveBeenCalledOnce();
    });
  });

  describe('session info', () => {
    it('shows 0 exchanges when no messages', () => {
      setup({ messageCount: 0 });
      expect(screen.getAllByText(/0 exchanges/)[0]).toBeInTheDocument();
    });

    it('shows correct exchange count for even message count', () => {
      setup({ messageCount: 6 });
      expect(screen.getAllByText(/3 exchanges/)[0]).toBeInTheDocument();
    });

    it('shows message count', () => {
      setup({ messageCount: 4 });
      expect(screen.getAllByText(/4 messages/)[0]).toBeInTheDocument();
    });

    it('shows localStorage notice', () => {
      setup();
      expect(screen.getAllByText(/Stored locally/)[0]).toBeInTheDocument();
    });
  });

  describe('clear session', () => {
    it('renders the Clear Session button', () => {
      setup();
      expect(screen.getAllByText('Clear Session').length).toBeGreaterThan(0);
    });

    it('calls onClearSession when Clear Session is clicked', () => {
      const { onClearSession } = setup();
      fireEvent.click(screen.getAllByText('Clear Session')[0]);
      expect(onClearSession).toHaveBeenCalledOnce();
    });
  });

  describe('mobile sidebar visibility', () => {
    it('is translated off-screen when isOpen is false', () => {
      const { container } = setup({ isOpen: false });
      const mobileSidebar = container.querySelector('.md\\:hidden');
      expect(mobileSidebar).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('is visible when isOpen is true', () => {
      const { container } = setup({ isOpen: true });
      const mobileSidebar = container.querySelector('.md\\:hidden');
      expect(mobileSidebar).toHaveStyle({ transform: 'translateX(0)' });
    });
  });
});
