import { HistorySection } from "../sections/history-section";

export const HistoryView = () => {
  return (
    <div className="max-w-screen-md mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-muted-foreground">
          Videos you&apos;ve watched recently
        </p>
      </div>
      <HistorySection />
    </div>
  );
};
