'use client';

import { Shield, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';

interface Props {
  analystMode: boolean;
  onToggleMode: () => void;
  onClearSession: () => void;
  isOpen: boolean;
  onClose: () => void;
  messageCount: number;
}

export function Sidebar({ analystMode, onToggleMode, onClearSession, isOpen, onClose, messageCount }: Props) {
  const sidebarStyle: React.CSSProperties = {
    width: 260,
    flexShrink: 0,
    background: '#111318',
    borderRight: '1px solid #2a2d35',
    height: '100vh',
    flexDirection: 'column',
  };

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex" style={sidebarStyle}>
        <SidebarContent
          analystMode={analystMode}
          onToggleMode={onToggleMode}
          onClearSession={onClearSession}
          messageCount={messageCount}
        />
      </aside>

      {/* Mobile */}
      <aside
        className="flex md:hidden"
        style={{
          ...sidebarStyle,
          position: 'fixed',
          inset: '0 auto 0 0',
          zIndex: 30,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#64748b',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={18} />
        </button>
        <SidebarContent
          analystMode={analystMode}
          onToggleMode={onToggleMode}
          onClearSession={onClearSession}
          messageCount={messageCount}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  analystMode,
  onToggleMode,
  onClearSession,
  messageCount,
}: Omit<Props, 'isOpen' | 'onClose'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px 20px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <Shield size={22} color="#22c55e" />
        <span
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontWeight: 700,
            fontSize: 16,
            color: '#e2e8f0',
            letterSpacing: '-0.02em',
          }}
        >
          ThreatLens
        </span>
      </div>

      {/* Mode toggle */}
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            fontSize: 10,
            color: '#64748b',
            fontFamily: 'var(--font-geist-mono)',
            marginBottom: 8,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Analysis Mode
        </p>
        <button
          onClick={onToggleMode}
          role="switch"
          aria-checked={analystMode}
          aria-label="Toggle analyst mode"
          style={{
            width: '100%',
            background: '#1a1d24',
            border: '1px solid #2a2d35',
            borderRadius: 4,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#22c55e')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2d35')}
        >
          <div>
            <p
              style={{
                color: '#e2e8f0',
                fontSize: 13,
                fontFamily: 'var(--font-geist-sans)',
                fontWeight: 500,
              }}
            >
              {analystMode ? 'Analyst Mode' : 'Explain Mode'}
            </p>
            <p style={{ color: '#64748b', fontSize: 11, fontFamily: 'var(--font-geist-sans)', marginTop: 2 }}>
              {analystMode ? 'Technical · SOC-level' : 'Plain English · Accessible'}
            </p>
          </div>
          {analystMode ? (
            <ToggleRight size={22} color="#22c55e" />
          ) : (
            <ToggleLeft size={22} color="#64748b" />
          )}
        </button>
      </div>

      {/* Session info */}
      <div
        style={{
          padding: '12px 14px',
          background: '#0a0c10',
          border: '1px solid #2a2d35',
          borderRadius: 4,
        }}
      >
        <p
          style={{
            fontSize: 10,
            color: '#64748b',
            fontFamily: 'var(--font-geist-mono)',
            marginBottom: 6,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Session
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'var(--font-geist-sans)' }}>
          {Math.floor(messageCount / 2)} exchanges · {messageCount} messages
        </p>
        <p style={{ fontSize: 11, color: '#374151', marginTop: 4, fontFamily: 'var(--font-geist-sans)' }}>
          Stored locally · Max 10 pairs
        </p>
      </div>

      <div style={{ flex: 1 }} />

      {/* Clear session */}
      <button
        onClick={onClearSession}
        style={{
          width: '100%',
          background: 'none',
          border: '1px solid #2a2d35',
          borderRadius: 4,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          color: '#64748b',
          fontSize: 13,
          fontFamily: 'var(--font-geist-sans)',
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#ef4444';
          e.currentTarget.style.color = '#ef4444';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2a2d35';
          e.currentTarget.style.color = '#64748b';
        }}
      >
        <Trash2 size={15} />
        Clear Session
      </button>
    </div>
  );
}
