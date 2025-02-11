"use client";
import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
interface Props {
  categoryId?: string;
}

const CategoriesSectionSkeleton = () => {
  return <FilterCarousel isLoading={true} data={[]} />;
};

const CategoriesSectionSuspense: React.FC<Props> = ({ categoryId }) => {
  const [categories] = trpc.categories.getAll.useSuspenseQuery();

  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return <FilterCarousel value={categoryId} data={data} />;
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
