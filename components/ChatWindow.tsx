'use client';

import { useEffect, useRef } from 'react';
import { Menu, Shield } from 'lucide-react';
import { Message, IPReport } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { IPBadge } from './IPBadge';
import { extractIPs } from '@/lib/extractIPs';

interface Props {
  messages: Message[];
  isStreaming: boolean;
  ipReports: Record<string, IPReport>;
  onChipClick: (text: string) => void;
  onMenuClick: () => void;
}

const EXAMPLE_CHIPS = [
  'Analyze SSH brute force logs from 192.168.1.100',
  'Check IP: 45.142.212.100',
  'What is DNS tunneling?',
];

export function ChatWindow({ messages, isStreaming, ipReports, onChipClick, onMenuClick }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          position: 'relative',
        }}
      >
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex md:hidden"
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#64748b',
            background: '#111318',
            border: '1px solid #2a2d35',
            borderRadius: 4,
            padding: '6px 8px',
            cursor: 'pointer',
          }}
        >
          <Menu size={18} />
        </button>

        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <Shield size={36} color="#22c55e" />
            <span
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#e2e8f0',
                fontFamily: 'var(--font-geist-mono)',
                letterSpacing: '-0.02em',
              }}
            >
              ThreatLens AI
            </span>
          </div>
          <p
            style={{
              color: '#64748b',
              fontSize: 14,
              marginBottom: 32,
              lineHeight: 1.6,
              fontFamily: 'var(--font-geist-sans)',
            }}
          >
            Paste network logs, IPs, or describe suspicious behavior to get instant threat analysis.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => onChipClick(chip)}
                style={{
                  background: '#1a1d24',
                  border: '1px solid #2a2d35',
                  borderRadius: 4,
                  padding: '8px 14px',
                  color: '#94a3b8',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-sans)',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#22c55e';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2d35';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const showTyping =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    messages[messages.length - 1].content === '';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px', position: 'relative' }}>
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex md:hidden"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 10,
          color: '#64748b',
          background: '#111318',
          border: '1px solid #2a2d35',
          borderRadius: 4,
          padding: '6px 8px',
          cursor: 'pointer',
        }}
      >
        <Menu size={18} />
      </button>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const resolvedBadges = isUser
            ? extractIPs(message.content)
                .map((ip) => ipReports[ip])
                .filter(Boolean)
            : [];

          return (
            <div key={message.id}>
              <MessageBubble message={message} ipReports={ipReports} />
              {resolvedBadges.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  {resolvedBadges.map((report) => (
                    <IPBadge key={report.ip} report={report} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {showTyping && (
          <div style={{ display: 'flex', gap: 5, padding: '8px 0 16px', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#22c55e',
                  opacity: 0.4,
                  animation: `tl-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
