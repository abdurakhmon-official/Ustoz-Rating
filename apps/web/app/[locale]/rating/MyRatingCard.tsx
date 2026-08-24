'use client';

import { useTranslations } from 'next-intl';
import type { MyRatingOutput } from '@repo/contracts';
import { Card, CardContent } from '@/components/ui/Card';
import { RankBadge } from '@/components/ui/RankBadge';

export function MyRatingCard({ rating }: { rating: MyRatingOutput }) {
  const t = useTranslations('rating.myRating');

  if (!rating.eligible) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">{t('notEligible')}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <p className="font-semibold">{t('title')}</p>
        <div className="grid grid-cols-3 gap-3">
          <RankStat label={t('republic')} rank={rating.republicRank} total={rating.republicTotal} t={t} />
          <RankStat label={t('region')} rank={rating.regionRank} total={rating.regionTotal} t={t} />
          <RankStat label={t('district')} rank={rating.districtRank} total={rating.districtTotal} t={t} />
        </div>
      </CardContent>
    </Card>
  );
}

function RankStat({
  label,
  rank,
  total,
  t,
}: {
  label: string;
  rank: number | null;
  total: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-center">
      {rank ? (
        <>
          <RankBadge rank={rank} className="size-10 text-base" />
          <p className="text-sm font-semibold">{t('place', { rank })}</p>
        </>
      ) : (
        <>
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-muted-foreground">—</span>
          <p className="text-sm font-semibold text-muted-foreground">{t('notRanked')}</p>
        </>
      )}
      <p className="text-xs text-muted-foreground">{label}</p>
      {rank && <p className="text-xs text-muted-foreground">{t('of', { total })}</p>}
    </div>
  );
}
