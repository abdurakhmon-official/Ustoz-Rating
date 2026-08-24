// types

interface GradableQuestion {
  id: string;
  correctIndex: number;
}

interface GradeResult {
  score: number;
  correctCount: number;
  questionCount: number;
  passed: boolean;
}

export const gradeAttempt = (questions: GradableQuestion[], answers: Record<string, number>, passingScore: number): GradeResult => {
  const correctCount = questions.reduce((count, question) => {
    return answers[question.id] === question.correctIndex ? count + 1 : count;
  }, 0);

  const questionCount = questions.length;
  const score = questionCount === 0 ? 0 : Math.round((correctCount / questionCount) * 100);

  return { score, correctCount, questionCount, passed: score >= passingScore };
};
