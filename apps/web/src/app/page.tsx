import { HomeListingsBrowser } from "./_home-listings-browser";

export default function HomePage() {
  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8 space-y-10">
        <HomeListingsBrowser />
      </div>
    </main>
  );
}

