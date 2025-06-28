"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_URL } from "@/lib/constants";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const SearchInput = () => {
  //TODO: Add search functionality
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    const categoryId = params.get("categoryId");

    const url = new URL("/search", APP_URL);
    const newQuery = query.trim();

    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (categoryId) {
      url.searchParams.set("categoryId", encodeURIComponent(categoryId));
    }

    if (newQuery === "") {
      url.searchParams.delete("query");
    }
    router.push(url.toString());
  };
  return (
    <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
      <div className="relative w-full">
        <Input
          placeholder="Search"
          className="py-2 pr-12 pl-4 w-full rounded-l-full border focus:outline-none focus:border-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {/*TODO: Add add remove search button*/}
        {query.trim() && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full "
            type="button"
            onClick={() => setQuery("")}
          >
            <XIcon className="text-gray-500" />
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="px-5 py-2.5 bg-gray-100 border rounded-l-none border-l-0 hover:bg-gray-200"
        type="submit"
        disabled={!query.trim()}
      >
        <SearchIcon className="size-5" />
      </Button>
    </form>
  );
};

export default SearchInput;
