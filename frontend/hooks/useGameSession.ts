'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchNextEvent, startRun, submitDecision } from '@/lib/api';
import { applyMockChoice, createMockSession } from '@/lib/mockData';
import type { DecisionKey, GameEvent, GameState } from '@/types/game';

const SESSION_STORAGE_KEY = 'lazy-god-session-id';

export interface RunSummary {
  runId: string;
  seed: number;
  score: number;
  finalStability: number;
  stabilityState: GameState['stability_state'];
  turns: number;
  peaceStreak: number;
  chaosStreak: number;
  notableQuips: string[];
  decisionLog: string[];
  completedAt: string;
}

interface RestartOptions {
  seed?: number | null;
  resume?: boolean;
}

interface UseGameSessionResult {
  state: GameState | null;
  currentEvent: GameEvent | null;
  runId: string | null;
  sessionId: string | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  outcomeSummary: string | null;
  lastRunSummary: RunSummary | null;
  mode: 'live' | 'mock';
  restartSession: (options?: RestartOptions) => Promise<void>;
  choose: (choice: DecisionKey) => Promise<void>;
  clearError: () => void;
}

export function useGameSession(): UseGameSessionResult {
  const [state, setState] = useState<GameState | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcomeSummary, setOutcomeSummary] = useState<string | null>(null);
  const [lastRunSummary, setLastRunSummary] = useState<RunSummary | null>(null);
  const [mode, setMode] = useState<'live' | 'mock'>('live');
  const [hasLoadedSessionId, setHasLoadedSessionId] = useState(false);
  const mockSessionRef = useRef(createMockSession());
  const mockEventsIndex = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      setSessionId(stored);
    }
    setHasLoadedSessionId(true);
  }, []);

  const persistSessionId = useCallback((value: string | null | undefined) => {
    if (!value) return;
    setSessionId(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_STORAGE_KEY, value);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const initializeMock = useCallback(() => {
    const mock = createMockSession();
    mockSessionRef.current = mock;
    mockEventsIndex.current = 0;
    setRunId(mock.state.run_id);
    setSessionId('mock');
    setState(mock.state);
    setCurrentEvent(mock.events[0]);
    setOutcomeSummary('Simulated run engaged. Outcomes shown are illustrative.');
    setMode('mock');
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  const captureSummary = useCallback((resolvedState: GameState, resolvedEvent: GameEvent | null) => {
    const summary: RunSummary = {
      runId: resolvedState.run_id,
      seed: resolvedState.seed,
      score: resolvedState.score,
      finalStability: resolvedState.stability,
      stabilityState: resolvedState.stability_state,
      turns: resolvedState.turn,
      peaceStreak: resolvedState.peace_streak,
      chaosStreak: resolvedState.chaos_streak,
      notableQuips: resolvedState.god_quips.slice(-3),
      decisionLog:
        resolvedEvent && resolvedEvent.resolution ? resolvedEvent.resolution.logs.slice(-4) : [],
      completedAt: new Date().toISOString(),
    };
    setLastRunSummary(summary);
  }, []);

  const startSession = useCallback(
    async (options: RestartOptions = {}) => {
      const { seed = null, resume = true } = options;
      const showSpinner = state === null || !resume;
      if (showSpinner) {
        setIsLoading(true);
      } else {
        setIsProcessing(true);
      }
      setError(null);
      setOutcomeSummary(null);
      try {
        const start = await startRun({
          sessionId,
          seed,
          resume,
        });
        persistSessionId(start.session_id);
        setRunId(start.run_id);
        setState(start.state);
        setMode('live');
        setLastRunSummary(null);

        if (start.pending_event) {
          setCurrentEvent(start.pending_event);
        } else if (start.state.run_status === 'active') {
          const next = await fetchNextEvent(start.run_id, start.session_id);
          if (next.session_id) {
            persistSessionId(next.session_id);
          }
          setCurrentEvent(next.event);
          setState(next.state);
        } else {
          setCurrentEvent(null);
          captureSummary(start.state, null);
        }
      } catch (err) {
        console.error('Falling back to mock session', err);
        initializeMock();
      } finally {
        setIsLoading(false);
        setIsProcessing(false);
      }
    },
    [captureSummary, initializeMock, persistSessionId, sessionId, state],
  );

  useEffect(() => {
    if (!hasLoadedSessionId) return;
    void startSession({ resume: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoadedSessionId]);

  const choose = useCallback(
    async (choice: DecisionKey) => {
      if (isProcessing) return;
      if (!currentEvent || !state) return;
      setIsProcessing(true);
      setError(null);

      if (mode === 'mock') {
        const { updatedState, outcome } = applyMockChoice(state, currentEvent, choice);
        const mock = mockSessionRef.current;
        setState(updatedState);
        setOutcomeSummary(outcome);
        if (updatedState.run_status !== 'active') {
          setCurrentEvent(null);
          captureSummary(updatedState, null);
          setIsProcessing(false);
          return;
        }
        mockEventsIndex.current = (mockEventsIndex.current + 1) % mock.events.length;
        const nextEvent = mock.events[mockEventsIndex.current];
        setCurrentEvent({ ...nextEvent, turn: updatedState.turn });
        setIsProcessing(false);
        return;
      }

      if (!runId) {
        setError('No active run.');
        setIsProcessing(false);
        return;
      }

      try {
        const response = await submitDecision(runId, currentEvent.id, choice, sessionId);
        if (response.session_id) {
          persistSessionId(response.session_id);
        }
        setState(response.state);
        setOutcomeSummary(response.outcome_summary);
        if (response.state.run_status !== 'active') {
          setCurrentEvent(null);
          captureSummary(response.state, response.resolved_event);
          return;
        }
        const next = await fetchNextEvent(response.run_id, response.session_id ?? sessionId);
        if (next.session_id) {
          persistSessionId(next.session_id);
        }
        setCurrentEvent(next.event);
        setState(next.state);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsProcessing(false);
      }
    },
    [captureSummary, currentEvent, isProcessing, mode, persistSessionId, runId, sessionId, state],
  );

  const restartSession = useCallback(
    async (options?: RestartOptions) => {
      if (isProcessing) return;
      setState(null);
      setCurrentEvent(null);
      setOutcomeSummary(null);
      mockSessionRef.current = createMockSession();
      mockEventsIndex.current = 0;
      await startSession({ ...options, resume: options?.resume ?? false });
    },
    [isProcessing, startSession],
  );

  return useMemo(
    () => ({
      state,
      currentEvent,
      runId,
      sessionId,
      isLoading,
      isProcessing,
      error,
      outcomeSummary,
      lastRunSummary,
      mode,
      restartSession,
      choose,
      clearError,
    }),
    [
      choose,
      clearError,
      currentEvent,
      error,
      isLoading,
      isProcessing,
      lastRunSummary,
      mode,
      outcomeSummary,
      restartSession,
      runId,
      sessionId,
      state,
    ],
  );
}
