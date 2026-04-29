import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CreateListingForm } from "./_create-listing-form";

export default async function SellPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token");
  if (!token) redirect("/auth/login?redirect=/sell");

  return (
    <main className="min-h-screen bg-[#F2F2EF]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1
          className="text-[28px] font-[700] text-[#1A1A18] mb-2"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          List an item
        </h1>
        <p className="text-[14px] text-[#8A8A82] mb-8">
          Fill in the details below and your listing will be live immediately.
        </p>

        <div className="bg-[#FAFAF8] rounded-[16px] border border-[#E2E2DC] p-6">
          <CreateListingForm />
        </div>
      </div>
    </main>
  );
}
