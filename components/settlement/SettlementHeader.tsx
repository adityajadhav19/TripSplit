
"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

type Props = {
  groupName: string;
  groupCode: string;
};

export default function SettlementHeader({
  groupName,
  groupCode,
}: Props) {
  const router = useRouter();

  return (
    <PageHeader
      eyebrow={groupName}
      title="Settle up"
      description="Your trip expenses, simplified. See who owes whom and settle up with your group."
      action={
        <button
          type="button"
          onClick={() =>
            router.push(`/trip/${encodeURIComponent(groupCode)}`)
          }
          aria-label="Back to trip"
          className="group flex h-12 items-center gap-2 rounded-xl bg-white px-4 text-zinc-700 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5"
          >
            <path
              d="M19 12H5m7 7-7-7 7-7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to trip</span>
        </button>
      }
    />
  );
}
