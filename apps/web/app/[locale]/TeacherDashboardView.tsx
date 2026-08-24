'use client';

import { Award, BookOpen, Medal, Star, TrendingUp, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { RankBadge } from '@/components/ui/RankBadge';
import { StatCard } from '@/components/ui/StatCard';
import { Link } from '@/i18n/navigation';
import { usePublishedTests } from '@/hooks/use-attempts';
import { useTeacherDashboard } from '@/hooks/use-dashboard';

export function TeacherDashboardView() {
  const t = useTranslations('dashboard.teacher');
  const { data } = useTeacherDashboard();
  const { data: tests } = usePublishedTests();

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <DashboardSkeleton />
      </div>
    );
  }

  const chartData = data.recentAttempts.map((attempt) => ({
    name: new Date(attempt.submittedAt).toLocaleDateString(),
    score: attempt.score,
  }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={Trophy}
          label={t('stats.republicRank')}
          value={data.republicRank ? `#${data.republicRank}` : '—'}
          accent="warning"
        />
        <StatCard icon={Medal} label={t('stats.regionRank')} value={data.regionRank ? `#${data.regionRank}` : '—'} accent="primary" />
        <StatCard icon={TrendingUp} label={t('stats.avgScore')} value={`${data.avgScore}%`} accent="success" />
        <StatCard icon={Star} label={t('stats.bestScore')} value={`${data.bestScore}%`} accent="warning" />
        <StatCard icon={BookOpen} label={t('stats.attemptCount')} value={data.attemptCount} accent="primary" />
        <StatCard icon={Award} label={t('stats.certificateCount')} value={data.certificateCount} accent="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('chartTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-muted-foreground">{t('chartEmpty')}</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} />
                    <YAxis domain={[0, 100]} fontSize={12} tickLine={false} width={32} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('topTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.topTeachers.length === 0 ? (
              <p className="text-muted-foreground">{t('topEmpty')}</p>
            ) : (
              data.topTeachers.slice(0, 10).map((teacher) => (
                <div key={teacher.teacherId} className="flex items-center gap-3">
                  <RankBadge rank={teacher.rank} />
                  <span className="min-w-0 flex-1 truncate text-sm">{teacher.fullName}</span>
                  <span className="text-sm font-semibold text-primary">{teacher.compositeScore}%</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('testsTitle')}</h2>
          <Link href="/tests">
            <Button variant="ghost" size="sm">
              {t('testsViewAll')}
            </Button>
          </Link>
        </div>
        {!tests?.length ? (
          <p className="text-muted-foreground">{t('testsEmpty')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tests.slice(0, 6).map((test) => (
              <Card key={test.id}>
                <CardContent className="flex flex-col gap-2 py-4">
                  <p className="font-medium">{test.title}</p>
                  <p className="text-sm text-muted-foreground">{test.subjectName}</p>
                  <Link href={{ pathname: '/tests/[testId]', params: { testId: test.id } }}>
                    <Button size="sm" className="mt-1 w-full">
                      {t('testsStart')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <h2 className="text-xl font-semibold">{t('cta.title')}</h2>
          <p className="max-w-md text-muted-foreground">{t('cta.subtitle')}</p>
          <Link href="/tests">
            <Button size="lg">{t('cta.button')}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
