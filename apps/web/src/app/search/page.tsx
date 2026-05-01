import { Suspense } from "react";

import { FilterSidebar } from "./_filter-sidebar";
import { SearchResults } from "./_search-results";

export default function SearchPage() {
  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
          {/* Filter sidebar — reads searchParams internally */}
          <Suspense>
            <FilterSidebar />
          </Suspense>

          {/* Results — reads searchParams, fires own backend requests */}
          <div className="flex-1 min-w-0">
            <Suspense>
              <SearchResults />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
