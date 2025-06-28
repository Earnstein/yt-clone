"use client";
import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
interface Props {
  categoryId?: string;
}

const CategoriesSectionSkeleton = () => {
  return <FilterCarousel isLoading={true} data={[]} onSelect={() => {}} />;
};

const CategoriesSectionSuspense: React.FC<Props> = ({ categoryId }) => {
  const [categories] = trpc.categories.getAll.useSuspenseQuery();
  const router = useRouter();

  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }
    router.push(url.toString());
  };

  return <FilterCarousel value={categoryId} data={data} onSelect={onSelect} />;
};

export const CategoriesSection: React.FC<Props> = ({ categoryId }) => {
  return (
    <Suspense fallback={<CategoriesSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};
