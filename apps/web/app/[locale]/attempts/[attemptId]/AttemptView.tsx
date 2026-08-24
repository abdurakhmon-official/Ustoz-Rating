'use client';

import { useAttempt } from '@/hooks/use-attempts';
import { TestTakingView } from './TestTakingView';
import { AttemptResultView } from './AttemptResultView';

export function AttemptView({ attemptId }: { attemptId: string }) {
  const { data: attempt } = useAttempt(attemptId);

  if (!attempt) return null;

  if (attempt.status === 'IN_PROGRESS') {
    return <TestTakingView attempt={attempt} />;
  }

  return <AttemptResultView attempt={attempt} />;
}
