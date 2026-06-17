'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useChat } from '@/hooks/useChat';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/ChatWindow';
import { InputBar } from '@/components/InputBar';

export default function Home() {
  const [analystMode, setAnalystMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const { messages, isStreaming, ipReports, error, sendMessage, stop, clearSession } =
    useChat(analystMode);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isStreaming) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  }, [inputValue, isStreaming, sendMessage]);

  const handleChipClick = useCallback((text: string) => {
    setInputValue(text);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#0a0c10',
      }}
    >
      <Sidebar
        analystMode={analystMode}
        onToggleMode={() => setAnalystMode((v) => !v)}
        onClearSession={clearSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        messageCount={messages.length}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          ipReports={ipReports}
          onChipClick={handleChipClick}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <InputBar
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          onStop={stop}
          isStreaming={isStreaming}
        />
      </div>

      <Toaster theme="dark" position="top-right" />
    </div>
  );
}
