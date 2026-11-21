import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface RatingBucket {
  star: number;
  label: string;
  count: number;
  pct: number;
}

const STAR_COLORS: Record<number, string> = {
  5: '#1f9d66',
  4: '#48b382',
  3: '#ffb547',
  2: '#ee7c3b',
  1: '#d6455d',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RatingBucket }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div
      dir="rtl"
      style={{
        background: '#1c0a0d',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: 12,
        fontSize: 13,
        boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 2 }}>
        {item.star} {item.star === 1 ? 'نجمة' : 'نجوم'}
      </div>
      <div>
        {item.count} تقييم ({item.pct}%)
      </div>
    </div>
  );
}

function ReviewsDistributionChart({ data }: { data: RatingBucket[] }) {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0) {
    return (
      <div className="empty" style={{ padding: '20px 10px' }}>
        لا توجد تقييمات لعرض الرسم البياني بعد
      </div>
    );
  }

  return (
    <div dir="ltr" style={{ width: '100%', height: 230 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: -12, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece2e3" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#1a1416', fontSize: 13, fontWeight: 700 }}
            axisLine={{ stroke: '#ece2e3' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#7b6f73', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(180, 33, 39, 0.06)' }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
            {data.map((entry) => (
              <Cell key={entry.star} fill={STAR_COLORS[entry.star] || '#b42127'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const roots = new WeakMap<HTMLElement, Root>();

declare global {
  interface Window {
    renderReviewsChart?: (
      container: HTMLElement | null,
      reviews: Array<{ rating?: number }>
    ) => void;
  }
}

window.renderReviewsChart = (container, reviews) => {
  if (!container) return;
  const counts = [0, 0, 0, 0, 0];
  for (const r of reviews || []) {
    const rt = Math.round(Number(r?.rating) || 0);
    if (rt >= 1 && rt <= 5) counts[rt - 1] += 1;
  }
  const total = counts.reduce((a, b) => a + b, 0);
  const data: RatingBucket[] = [5, 4, 3, 2, 1].map((star) => {
    const count = counts[star - 1];
    const pct = total ? Math.round((count / total) * 100) : 0;
    return {
      star,
      label: `${star} ★`,
      count,
      pct,
    };
  });

  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  root.render(<ReviewsDistributionChart data={data} />);
};
