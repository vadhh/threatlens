'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, IPReport } from '@/lib/types';
import { ThreatBadge } from './ThreatBadge';

interface Props {
  message: Message;
  ipReports: Record<string, IPReport>;
}

export function MessageBubble({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <div
          style={{
            background: '#1a1d24',
            border: '1px solid #2a2d35',
            borderRadius: 4,
            padding: '10px 14px',
            maxWidth: '70%',
            color: '#e2e8f0',
            fontSize: 14,
            fontFamily: 'var(--font-geist-sans)',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <ThreatBadge content={message.content} />
      <div
        style={{
          background: '#111318',
          border: '1px solid #2a2d35',
          borderRadius: 4,
          padding: '12px 16px',
          maxWidth: '85%',
          color: '#e2e8f0',
          fontSize: 14,
          fontFamily: 'var(--font-geist-sans)',
          lineHeight: 1.7,
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre({ children }) {
              return (
                <pre
                  style={{
                    background: '#0a0c10',
                    border: '1px solid #2a2d35',
                    borderRadius: 4,
                    padding: '12px 16px',
                    overflowX: 'auto',
                    margin: '8px 0',
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: 13,
                  }}
                >
                  {children}
                </pre>
              );
            },
            code({ children, className }: { children?: React.ReactNode; className?: string }) {
              if (className) {
                return (
                  <code style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 13, color: '#e2e8f0' }}>
                    {children}
                  </code>
                );
              }
              return (
                <code
                  style={{
                    background: '#1a1d24',
                    color: '#22c55e',
                    borderRadius: 3,
                    padding: '1px 5px',
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: 13,
                  }}
                >
                  {children}
                </code>
              );
            },
            strong({ children }: { children?: React.ReactNode }) {
              return <strong style={{ color: '#f0f4f8', fontWeight: 600 }}>{children}</strong>;
            },
            ul({ children }: { children?: React.ReactNode }) {
              return <ul style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ul>;
            },
            ol({ children }: { children?: React.ReactNode }) {
              return <ol style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ol>;
            },
            li({ children }: { children?: React.ReactNode }) {
              return <li style={{ marginBottom: 4 }}>{children}</li>;
            },
            p({ children }: { children?: React.ReactNode }) {
              return <p style={{ margin: '6px 0' }}>{children}</p>;
            },
            h1({ children }: { children?: React.ReactNode }) {
              return <h1 style={{ color: '#f0f4f8', fontWeight: 700, margin: '12px 0 6px', fontSize: 18 }}>{children}</h1>;
            },
            h2({ children }: { children?: React.ReactNode }) {
              return <h2 style={{ color: '#f0f4f8', fontWeight: 700, margin: '10px 0 4px', fontSize: 16 }}>{children}</h2>;
            },
            h3({ children }: { children?: React.ReactNode }) {
              return <h3 style={{ color: '#f0f4f8', fontWeight: 600, margin: '8px 0 4px', fontSize: 14 }}>{children}</h3>;
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
