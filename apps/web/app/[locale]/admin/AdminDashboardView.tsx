'use client';

import { BookOpen, ClipboardList, HelpCircle, TrendingUp, Users, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { useAdminDashboard } from '@/hooks/use-dashboard';

const BAR_COLOR = 'var(--color-primary)';

export function AdminDashboardView() {
  const t = useTranslations('dashboard.admin');
  const { data } = useAdminDashboard();

  if (!data) return null;

  const growthData = data.teacherGrowth.map((point) => ({ name: point.date.slice(5), count: point.count }));
  const submissionsData = data.submissionsPerDay.map((point) => ({ name: point.date.slice(5), count: point.count }));
  const subjectData = data.scoresBySubject.map((row) => ({ name: row.label, score: row.avgScore }));
  const regionData = data.scoresByRegion.map((row) => ({ name: row.label, score: row.avgScore }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Users} label={t('stats.teacherCount')} value={data.teacherCount} accent="primary" />
        <StatCard icon={BookOpen} label={t('stats.subjectCount')} value={data.subjectCount} accent="success" />
        <StatCard icon={ClipboardList} label={t('stats.testCount')} value={data.testCount} accent="warning" />
        <StatCard icon={HelpCircle} label={t('stats.questionCount')} value={data.questionCount} accent="primary" />
        <StatCard icon={Zap} label={t('stats.todaySubmissions')} value={data.todaySubmissions} accent="success" />
        <StatCard icon={TrendingUp} label={t('stats.avgScore')} value={`${data.avgScore}%`} accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('teacherGrowthTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} tickLine={false} width={28} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke={BAR_COLOR} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('submissionsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={submissionsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} tickLine={false} width={28} />
                  <Tooltip />
                  <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('scoresBySubjectTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectData.length === 0 ? (
              <p className="text-muted-foreground">{t('chartEmpty')}</p>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 100]} fontSize={12} tickLine={false} />
                    <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} width={90} />
                    <Tooltip />
                    <Bar dataKey="score" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('scoresByRegionTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {regionData.length === 0 ? (
              <p className="text-muted-foreground">{t('chartEmpty')}</p>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 100]} fontSize={12} tickLine={false} />
                    <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} width={90} />
                    <Tooltip />
                    <Bar dataKey="score" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
