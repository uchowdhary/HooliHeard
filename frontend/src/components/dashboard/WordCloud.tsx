import { Card } from "@/components/shared/Card";
import { PRODUCT_AREA_COLORS } from "@/lib/constants";
import type { WordFrequency } from "@/types/dashboard";

interface Props {
  data?: WordFrequency[];
  loading?: boolean;
}

// Vibrant palette for word cloud
const CLOUD_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#EF4444", // red
  "#06B6D4", // cyan
  "#F97316", // orange
  "#14B8A6", // teal
  "#A855F7", // purple
  ...Object.values(PRODUCT_AREA_COLORS),
];

export function WordCloud({ data, loading }: Props) {
  if (loading) {
    return (
      <Card title="Word Cloud">
        <div className="flex h-64 items-center justify-center text-gray-400">Loading...</div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card title="Word Cloud">
        <div className="flex h-64 items-center justify-center text-gray-400">No data</div>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const minCount = Math.min(...data.map((d) => d.count));
  const range = maxCount - minCount || 1;

  // Map count to font size (12px - 48px)
  const fontSize = (count: number) => {
    const ratio = (count - minCount) / range;
    return Math.round(12 + ratio * 36);
  };

  // Map count to opacity (0.5 - 1.0)
  const opacity = (count: number) => {
    const ratio = (count - minCount) / range;
    return 0.5 + ratio * 0.5;
  };

  // Shuffle words for visual variety (seeded by first word)
  const shuffled = [...data].sort((a, b) => {
    const hashA = a.word.charCodeAt(0) * 31 + a.count;
    const hashB = b.word.charCodeAt(0) * 31 + b.count;
    return hashA - hashB;
  });

  return (
    <Card title="Word Cloud" subtitle="Most frequent terms across insights">
      <div className="flex min-h-[280px] flex-wrap items-center justify-center gap-x-3 gap-y-1 py-4">
        {shuffled.map((item, i) => (
          <span
            key={item.word}
            className="cursor-default transition-transform hover:scale-110"
            style={{
              fontSize: `${fontSize(item.count)}px`,
              color: CLOUD_COLORS[i % CLOUD_COLORS.length],
              opacity: opacity(item.count),
              fontWeight: item.count > maxCount * 0.5 ? 700 : 500,
              lineHeight: 1.2,
            }}
            title={`"${item.word}" — ${item.count} mentions`}
          >
            {item.word}
          </span>
        ))}
      </div>
    </Card>
  );
}
