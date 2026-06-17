'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
import { Message, IPReport } from '@/lib/types';
import { extractIPs } from '@/lib/extractIPs';

const STORAGE_KEY = 'threatlens_history';
const MAX_MESSAGES = 20; // 10 pairs

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  ipReports: Record<string, IPReport>;
  error: string | null;
}

type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; message: Message }
  | { type: 'ADD_ASSISTANT_MESSAGE'; message: Message }
  | { type: 'APPEND_TOKEN'; token: string }
  | { type: 'REMOVE_EMPTY_ASSISTANT' }
  | { type: 'SET_IP_REPORT'; report: IPReport }
  | { type: 'SET_STREAMING'; streaming: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'LOAD_HISTORY'; messages: Message[] }
  | { type: 'CLEAR_SESSION' };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return { ...state, messages: [...state.messages, action.message], error: null };
    case 'ADD_ASSISTANT_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'APPEND_TOKEN': {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + action.token };
      }
      return { ...state, messages: msgs };
    }
    case 'REMOVE_EMPTY_ASSISTANT': {
      const last = state.messages[state.messages.length - 1];
      if (last && last.role === 'assistant' && last.content === '') {
        return { ...state, messages: state.messages.slice(0, -1) };
      }
      return state;
    }
    case 'SET_IP_REPORT':
      return { ...state, ipReports: { ...state.ipReports, [action.report.ip]: action.report } };
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.streaming };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'LOAD_HISTORY':
      return { ...state, messages: action.messages };
    case 'CLEAR_SESSION':
      return { messages: [], isStreaming: false, ipReports: {}, error: null };
    default:
      return state;
  }
}

function saveToStorage(messages: Message[]) {
  let capped = messages;
  while (capped.length > MAX_MESSAGES) {
    capped = capped.slice(2);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // localStorage full or unavailable
  }
}

function loadFromStorage(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Message[];
  } catch {
    return [];
  }
}

export function useChat(analystMode: boolean) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isStreaming: false,
    ipReports: {},
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const history = loadFromStorage();
    if (history.length > 0) {
      dispatch({ type: 'LOAD_HISTORY', messages: history });
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || state.isStreaming) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
      };

      dispatch({ type: 'ADD_USER_MESSAGE', message: userMessage });
      dispatch({ type: 'SET_STREAMING', streaming: true });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
      };

      dispatch({ type: 'ADD_ASSISTANT_MESSAGE', message: assistantMessage });

      const detectedIPs = extractIPs(content);

      // Fire IP badge lookups in parallel (non-blocking for chat)
      for (const ip of detectedIPs) {
        fetch(`/api/ip-check?ip=${encodeURIComponent(ip)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((report) => {
            if (report) dispatch({ type: 'SET_IP_REPORT', report });
          })
          .catch(() => {});
      }

      const allMessages = [...state.messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        abortRef.current = new AbortController();

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages,
            analystMode,
            detectedIPs,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error('Stream failed');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          dispatch({ type: 'APPEND_TOKEN', token: chunk });
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          dispatch({ type: 'SET_ERROR', error: 'Analysis failed. Please try again.' });
        }
        // Drop the placeholder bubble if nothing streamed (error or early cancel).
        dispatch({ type: 'REMOVE_EMPTY_ASSISTANT' });
      } finally {
        dispatch({ type: 'SET_STREAMING', streaming: false });
        abortRef.current = null;
      }
    },
    [state.messages, state.isStreaming, analystMode]
  );

  useEffect(() => {
    if (!state.isStreaming && state.messages.length > 0) {
      saveToStorage(state.messages);
    }
  }, [state.isStreaming, state.messages]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearSession = useCallback(() => {
    abortRef.current?.abort();
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'CLEAR_SESSION' });
  }, []);

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    ipReports: state.ipReports,
    error: state.error,
    sendMessage,
    stop,
    clearSession,
  };
}
