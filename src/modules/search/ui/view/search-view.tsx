import { CategoriesSection } from "../sections/categories-section";

interface PageProps {
  query: string;
  categoryId: string | undefined;
}

export const SearchView = ({ query, categoryId }: PageProps) => {
  return (
    <div className="max-w-[1300px] mx-auto mb-10 flex flex-col gap-y-6 px-4 pt-2.5">
      <h1 className="text-2xl font-bold">Search</h1>
      <p className="text-sm text-gray-500">
        Search results for <span className="font-bold">{query}</span>
        {categoryId && (
          <span className="font-bold">
            in <span className="font-bold">{categoryId}</span>
          </span>
        )}
      </p>
      <CategoriesSection categoryId={categoryId} />
    </div>
  );
};
