import { SubscriptionsSection } from "../sections/subscriptions-section";

export const SubscriptionsView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Videos from your favorite creators
        </p>
      </div>
      <SubscriptionsSection />
    </div>
  );
};
