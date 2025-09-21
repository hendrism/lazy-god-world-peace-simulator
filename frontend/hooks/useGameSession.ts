'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchNextEvent, startRun, submitDecision } from '@/lib/api';
import { applyMockChoice, createMockSession } from '@/lib/mockData';
import type { DecisionKey, GameEvent, GameState } from '@/types/game';

interface UseGameSessionResult {
  state: GameState | null;
  currentEvent: GameEvent | null;
  runId: string | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  outcomeSummary: string | null;
  mode: 'live' | 'mock';
  restartSession: () => Promise<void>;
  choose: (choice: DecisionKey) => Promise<void>;
}

export function useGameSession(): UseGameSessionResult {
  const [state, setState] = useState<GameState | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcomeSummary, setOutcomeSummary] = useState<string | null>(null);
  const [mode, setMode] = useState<'live' | 'mock'>('live');
  const mockSessionRef = useRef(createMockSession());
  const mockEventsIndex = useRef(0);

  const initializeMock = useCallback(() => {
    const mock = createMockSession();
    mockSessionRef.current = mock;
    mockEventsIndex.current = 0;
    setRunId(mock.state.run_id);
    setState(mock.state);
    setCurrentEvent(mock.events[0]);
    setOutcomeSummary('Simulated run engaged. Outcomes shown are illustrative.');
    setMode('mock');
  }, []);

  const bootstrapSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOutcomeSummary(null);
    try {
      const start = await startRun();
      setRunId(start.run_id);
      setState(start.state);
      const next = await fetchNextEvent(start.run_id);
      setCurrentEvent(next.event);
      setState(next.state);
      setMode('live');
    } catch (err) {
      console.error('Falling back to mock session', err);
      initializeMock();
    } finally {
      setIsLoading(false);
    }
  }, [initializeMock]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

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
        const response = await submitDecision(runId, currentEvent.id, choice);
        setState(response.state);
        setOutcomeSummary(response.outcome_summary);
        if (response.state.run_status !== 'active') {
          setCurrentEvent(null);
          return;
        }
        const next = await fetchNextEvent(runId);
        setCurrentEvent(next.event);
        setState(next.state);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsProcessing(false);
      }
    },
    [currentEvent, isProcessing, mode, runId, state],
  );

  const restartSession = useCallback(async () => {
    if (isProcessing) return;
    setState(null);
    setCurrentEvent(null);
    setOutcomeSummary(null);
    setRunId(null);
    mockSessionRef.current = createMockSession();
    mockEventsIndex.current = 0;
    await bootstrapSession();
  }, [bootstrapSession, isProcessing]);

  return useMemo(
    () => ({
      state,
      currentEvent,
      runId,
      isLoading,
      isProcessing,
      error,
      outcomeSummary,
      mode,
      restartSession,
      choose,
    }),
    [choose, currentEvent, error, isLoading, isProcessing, mode, outcomeSummary, restartSession, runId, state],
  );
}
