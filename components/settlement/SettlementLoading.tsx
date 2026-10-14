export default function SettlementLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-5">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-700" />
        <p className="text-sm font-medium text-zinc-500">
          Calculating balances...
        </p>
      </div>
    </main>
  );
}