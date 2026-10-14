
import { money } from "@/lib/settlement/format-money";
import SummaryCard from "@/components/shared/SummaryCard";

type Props = {
  totalSpent: number;
  memberCount: number;
  transferCount: number;
};

export default function SettlementSummary({
  totalSpent,
  memberCount,
  transferCount,
}: Props) {
  return (
    <SummaryCard
      title="Total trip spending"
      value={money(totalSpent)}
      description="Combined spending recorded for this trip"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-5 text-emerald-100"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h3" />
        </svg>
      }
      metrics={[
        {
          label: "Group members",
          value: memberCount,
          detail: memberCount === 1 ? "person" : "people",
        },
        {
          label: "Suggested payments",
          value: transferCount,
          detail: transferCount === 1 ? "transfer" : "transfers",
        },
      ]}
    />
  );
}
