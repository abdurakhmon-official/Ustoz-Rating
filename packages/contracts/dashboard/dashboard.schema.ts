import type { RatingListItem } from '../rating/rating.schema';

// interfaces

export interface TeacherDashboardOutput {
  republicRank: number | null;
  republicTotal: number;
  regionRank: number | null;
  regionTotal: number;
  avgScore: number;
  bestScore: number;
  attemptCount: number;
  certificateCount: number;
  recentAttempts: { id: string; testTitle: string; score: number; submittedAt: string }[];
  topTeachers: RatingListItem[];
}

export interface DashboardTrendPoint {
  date: string;
  count: number;
}

export interface DashboardGroupAverage {
  label: string;
  avgScore: number;
}

export interface AdminDashboardOutput {
  teacherCount: number;
  subjectCount: number;
  testCount: number;
  questionCount: number;
  todaySubmissions: number;
  avgScore: number;
  scoresBySubject: DashboardGroupAverage[];
  scoresByRegion: DashboardGroupAverage[];
  submissionsPerDay: DashboardTrendPoint[];
  teacherGrowth: DashboardTrendPoint[];
}
