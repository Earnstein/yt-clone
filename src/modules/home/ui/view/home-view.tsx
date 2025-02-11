import { CategoriesSection } from "../sections/categories-sections";

interface Props {
  categoryId?: string;
}

export const HomeView = ({ categoryId }: Props) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex gap-y-6">
      <CategoriesSection categoryId={categoryId} />
    </div>
  );
};
