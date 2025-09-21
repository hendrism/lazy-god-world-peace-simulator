import type {
  DecisionKey,
  DecisionResponse,
  NextEventResponse,
  StartRunResponse,
} from '@/types/game';

const DEFAULT_BASE_URL = 'http://localhost:8000';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

interface StartRunOptions {
  sessionId?: string | null;
  seed?: number | null;
  resume?: boolean;
}

export async function startRun(options: StartRunOptions = {}): Promise<StartRunResponse> {
  const response = await fetch(`${API_BASE_URL}/runs/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: options.sessionId ?? undefined,
      seed: options.seed ?? undefined,
      resume: options.resume ?? true,
    }),
  });
  return handleResponse<StartRunResponse>(response);
}

export async function fetchNextEvent(
  runId: string,
  sessionId?: string | null,
): Promise<NextEventResponse> {
  const response = await fetch(`${API_BASE_URL}/runs/${runId}/next`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId ?? undefined,
    }),
  });
  return handleResponse<NextEventResponse>(response);
}

export async function submitDecision(
  runId: string,
  eventId: string,
  choice: DecisionKey,
  sessionId?: string | null,
): Promise<DecisionResponse> {
  const response = await fetch(`${API_BASE_URL}/runs/${runId}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_id: eventId,
      choice,
      session_id: sessionId ?? undefined,
    }),
  });
  return handleResponse<DecisionResponse>(response);
}
