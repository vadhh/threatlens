'use client';

import { useRef, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function InputBar({ value, onChange, onSend, onStop, isStreaming }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div
      style={{
        borderTop: '1px solid #2a2d35',
        background: '#0a0c10',
        padding: '12px 24px 16px',
        flexShrink: 0,
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Paste network logs, IPs, or describe suspicious behavior..."
          rows={1}
          style={{
            flex: 1,
            background: '#111318',
            border: '1px solid #2a2d35',
            borderRadius: 4,
            padding: '10px 14px',
            color: '#e2e8f0',
            fontSize: 14,
            fontFamily: 'var(--font-geist-sans)',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.6,
            minHeight: 44,
            maxHeight: 160,
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#22c55e'; }}
          onBlur={(e) => { e.target.style.borderColor = '#2a2d35'; }}
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            aria-label="Stop generating"
            style={{
              background: '#1a1d24',
              border: '1px solid #2a2d35',
              borderRadius: 4,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <Square size={16} color="#ef4444" fill="#ef4444" />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!canSend}
            aria-label="Send message"
            style={{
              background: canSend ? '#22c55e' : '#1a1d24',
              border: 'none',
              borderRadius: 4,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canSend ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <Send size={18} color={canSend ? '#0a0c10' : '#374151'} />
          </button>
        )}
      </div>
      <p
        style={{
          textAlign: 'center',
          color: '#374151',
          fontSize: 11,
          marginTop: 8,
          fontFamily: 'var(--font-geist-sans)',
        }}
      >
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
