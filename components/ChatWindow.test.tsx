import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWindow } from './ChatWindow';
import { Message } from '@/lib/types';

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => {} }));

const userMsg: Message = { id: '1', role: 'user', content: 'Check 10.0.0.1 for threats' };
const assistantMsg: Message = {
  id: '2',
  role: 'assistant',
  content: '**[BRUTE FORCE]** — Repeated failed logins.',
};
const emptyAssistant: Message = { id: '3', role: 'assistant', content: '' };

function setup(overrides: Partial<React.ComponentProps<typeof ChatWindow>> = {}) {
  const props = {
    messages: [],
    isStreaming: false,
    ipReports: {},
    onChipClick: vi.fn(),
    onMenuClick: vi.fn(),
    ...overrides,
  };
  const result = render(<ChatWindow {...props} />);
  return { ...props, ...result };
}

describe('ChatWindow', () => {
  describe('welcome / empty state', () => {
    it('shows the ThreatLens AI heading', () => {
      setup();
      expect(screen.getByText('ThreatLens AI')).toBeInTheDocument();
    });

    it('shows the description tagline', () => {
      setup();
      expect(
        screen.getByText(/Paste network logs, IPs, or describe suspicious behavior/i)
      ).toBeInTheDocument();
    });

    it('renders all three example chips', () => {
      setup();
      expect(screen.getByText('Analyze SSH brute force logs from 192.168.1.100')).toBeInTheDocument();
      expect(screen.getByText('Check IP: 45.142.212.100')).toBeInTheDocument();
      expect(screen.getByText('What is DNS tunneling?')).toBeInTheDocument();
    });

    it('calls onChipClick with chip text when chip is clicked', () => {
      const { onChipClick } = setup();
      fireEvent.click(screen.getByText('What is DNS tunneling?'));
      expect(onChipClick).toHaveBeenCalledWith('What is DNS tunneling?');
    });

    it('calls onChipClick with correct text for SSH chip', () => {
      const { onChipClick } = setup();
      fireEvent.click(screen.getByText('Analyze SSH brute force logs from 192.168.1.100'));
      expect(onChipClick).toHaveBeenCalledWith('Analyze SSH brute force logs from 192.168.1.100');
    });

    it('calls onChipClick with correct text for IP chip', () => {
      const { onChipClick } = setup();
      fireEvent.click(screen.getByText('Check IP: 45.142.212.100'));
      expect(onChipClick).toHaveBeenCalledWith('Check IP: 45.142.212.100');
    });

    it('does not render message bubbles in empty state', () => {
      setup();
      expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
    });
  });

  describe('message list', () => {
    it('renders user message content', () => {
      setup({ messages: [userMsg] });
      expect(screen.getByText('Check 10.0.0.1 for threats')).toBeInTheDocument();
    });

    it('renders assistant message via markdown', () => {
      setup({ messages: [userMsg, assistantMsg] });
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
    });

    it('renders both user and assistant messages together', () => {
      setup({ messages: [userMsg, assistantMsg] });
      expect(screen.getByText('Check 10.0.0.1 for threats')).toBeInTheDocument();
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
    });

    it('does not show welcome state when messages exist', () => {
      setup({ messages: [userMsg] });
      expect(screen.queryByText('ThreatLens AI')).not.toBeInTheDocument();
    });

    it('renders multiple assistant messages', () => {
      const msg2: Message = { id: '4', role: 'assistant', content: 'Second answer.' };
      setup({ messages: [userMsg, assistantMsg, userMsg, msg2] });
      expect(screen.getAllByTestId('markdown')).toHaveLength(2);
    });

    it('renders threat classification badge from assistant message', () => {
      setup({ messages: [userMsg, assistantMsg] });
      expect(screen.getByText('BRUTE FORCE')).toBeInTheDocument();
    });
  });

  describe('typing indicator', () => {
    it('shows 3 typing dots when streaming with empty last assistant message', () => {
      const { container } = setup({
        messages: [userMsg, emptyAssistant],
        isStreaming: true,
      });
      const dots = container.querySelectorAll('[style*="border-radius: 50%"]');
      expect(dots.length).toBe(3);
    });

    it('does not show typing dots when not streaming', () => {
      const { container } = setup({
        messages: [userMsg, emptyAssistant],
        isStreaming: false,
      });
      const dots = container.querySelectorAll('[style*="border-radius: 50%"]');
      expect(dots.length).toBe(0);
    });

    it('does not show typing dots when last assistant message has content', () => {
      const { container } = setup({
        messages: [userMsg, assistantMsg],
        isStreaming: true,
      });
      const dots = container.querySelectorAll('[style*="border-radius: 50%"]');
      expect(dots.length).toBe(0);
    });
  });

  describe('IP badges', () => {
    it('renders IPBadge when IP in user message has a resolved report', () => {
      setup({
        messages: [userMsg],
        ipReports: {
          '10.0.0.1': {
            ip: '10.0.0.1',
            abuseScore: 75,
            totalReports: 30,
            country: 'RU',
            isp: 'HostSilo',
            usageType: 'Data Center',
            lastReportedAt: '2026-06-01',
          },
        },
      });
      expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
      expect(screen.getByText('75/100')).toBeInTheDocument();
    });

    it('does not render IPBadge when no reports have resolved yet', () => {
      setup({ messages: [userMsg], ipReports: {} });
      expect(screen.queryByText('75/100')).not.toBeInTheDocument();
    });

    it('does not render IPBadge for assistant messages', () => {
      setup({
        messages: [userMsg, assistantMsg],
        ipReports: {
          '10.0.0.1': {
            ip: '10.0.0.1',
            abuseScore: 75,
            totalReports: 30,
            country: 'RU',
            isp: 'HostSilo',
            usageType: 'Data Center',
            lastReportedAt: '2026-06-01',
          },
        },
      });
      // IP badge should only appear once (after user message, not after assistant)
      expect(screen.getAllByText('10.0.0.1')).toHaveLength(1);
    });
  });
});
