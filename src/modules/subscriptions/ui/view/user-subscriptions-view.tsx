import { UserSubscriptionsSection } from "../sections/user-subscriptions-section";

export const UserSubscriptionsView = () => {
  return (
    <div className="max-w-screen-md mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-bold">Your Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Users you&apos;ve subscribed to
        </p>
      </div>
      <UserSubscriptionsSection />
    </div>
  );
};
