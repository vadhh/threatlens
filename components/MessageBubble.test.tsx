import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';
import { Message } from '@/lib/types';

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => {} }));

const userMsg: Message = { id: '1', role: 'user', content: 'Check IP 10.0.0.1' };
const assistantMsg: Message = {
  id: '2',
  role: 'assistant',
  content: '**[BRUTE FORCE]** — SSH brute force detected from 10.0.0.1.',
};
const emptyAssistant: Message = { id: '3', role: 'assistant', content: '' };

describe('MessageBubble', () => {
  describe('user messages', () => {
    it('renders user message content', () => {
      render(<MessageBubble message={userMsg} ipReports={{}} />);
      expect(screen.getByText('Check IP 10.0.0.1')).toBeInTheDocument();
    });

    it('aligns user message to the right', () => {
      const { container } = render(<MessageBubble message={userMsg} ipReports={{}} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ justifyContent: 'flex-end' });
    });

    it('does not render ThreatBadge for user messages', () => {
      render(<MessageBubble message={{ ...userMsg, content: '**[BRUTE FORCE]**' }} ipReports={{}} />);
      expect(screen.queryByText('BRUTE FORCE')).not.toBeInTheDocument();
    });

    it('does not render react-markdown for user messages', () => {
      render(<MessageBubble message={userMsg} ipReports={{}} />);
      expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
    });
  });

  describe('assistant messages', () => {
    it('renders assistant content via react-markdown', () => {
      render(<MessageBubble message={assistantMsg} ipReports={{}} />);
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
    });

    it('renders ThreatBadge when classification is present', () => {
      render(<MessageBubble message={assistantMsg} ipReports={{}} />);
      expect(screen.getByText('BRUTE FORCE')).toBeInTheDocument();
    });

    it('does not render ThreatBadge when no classification in content', () => {
      const plain: Message = { id: '4', role: 'assistant', content: 'No threat detected.' };
      render(<MessageBubble message={plain} ipReports={{}} />);
      expect(screen.queryByText(/BRUTE FORCE|BENIGN|RECONNAISSANCE/)).not.toBeInTheDocument();
    });

    it('renders empty assistant message without crashing', () => {
      render(<MessageBubble message={emptyAssistant} ipReports={{}} />);
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
    });

    it('does not right-align assistant messages', () => {
      const { container } = render(<MessageBubble message={assistantMsg} ipReports={{}} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).not.toHaveStyle({ justifyContent: 'flex-end' });
    });
  });

  describe('classification badges in assistant messages', () => {
    const classifications = [
      'RECONNAISSANCE',
      'EXFILTRATION',
      'LATERAL MOVEMENT',
      'BENIGN',
      'INSUFFICIENT DATA',
      'DDOS / FLOODING',
    ];

    classifications.forEach((c) => {
      it(`shows ${c} badge`, () => {
        const msg: Message = { id: '5', role: 'assistant', content: `**[${c}]** — Detail.` };
        render(<MessageBubble message={msg} ipReports={{}} />);
        expect(screen.getByText(c)).toBeInTheDocument();
      });
    });
  });
});
