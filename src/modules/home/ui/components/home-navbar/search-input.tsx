import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

const SearchInput = () => {
  //TODO: Add search functionality
  return (
    <form className="flex w-full max-w-[600px]">
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search"
          className="py-2 pr-12 pl-4 w-full rounded-l-full border focus:outline-none focus:border-blue-500"
        />
        {/*TODO: Add add remove search button*/}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="px-5 py-2.5 bg-gray-100 border rounded-r-full border-l-0 hover:bg-gray-200"
        type="submit"
      >
        <SearchIcon className="size-5" />
      </Button>
    </form>
  );
};

export default SearchInput;
