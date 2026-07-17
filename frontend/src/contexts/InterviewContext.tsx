import { createContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { QuestionResponse, InterviewReport, InterviewStatus } from '../types/interview';

// ── State ──

export interface InterviewState {
  sessionId: string | null;
  status: InterviewStatus | null;
  currentQuestion: QuestionResponse | null;
  report: InterviewReport | null;
}

const initialState: InterviewState = {
  sessionId: null,
  status: null,
  currentQuestion: null,
  report: null,
};

// ── Actions ──

type InterviewAction =
  | { type: 'SET_SESSION'; payload: { sessionId: string; status: InterviewStatus } }
  | { type: 'SET_STATUS'; payload: InterviewStatus }
  | { type: 'SET_QUESTION'; payload: QuestionResponse }
  | { type: 'SET_REPORT'; payload: InterviewReport }
  | { type: 'RESET' };

function interviewReducer(state: InterviewState, action: InterviewAction): InterviewState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, sessionId: action.payload.sessionId, status: action.payload.status };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_QUESTION':
      return { ...state, currentQuestion: action.payload };
    case 'SET_REPORT':
      return { ...state, report: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ── Context ──

export const InterviewContext = createContext<InterviewState>(initialState);
export const InterviewDispatchContext = createContext<Dispatch<InterviewAction>>(() => {});

// ── Provider ──

interface InterviewProviderProps {
  children: ReactNode;
}

export function InterviewProvider({ children }: InterviewProviderProps) {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  return (
    <InterviewContext.Provider value={state}>
      <InterviewDispatchContext.Provider value={dispatch}>
        {children}
      </InterviewDispatchContext.Provider>
    </InterviewContext.Provider>
  );
}
