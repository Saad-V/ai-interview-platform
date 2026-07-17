import { useContext } from 'react';
import { InterviewContext, InterviewDispatchContext } from '../contexts/InterviewContext';

export function useInterview() {
  return useContext(InterviewContext);
}

export function useInterviewDispatch() {
  return useContext(InterviewDispatchContext);
}
