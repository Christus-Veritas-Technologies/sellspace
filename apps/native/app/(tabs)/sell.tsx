import { useRouter } from "expo-router";
import { ListingForm } from "@/components/listing-form";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SellScreen() {
  const router = useRouter();

  return (
    <ListingForm
      onSuccess={(id) => {
        router.push(`/listings/${id}` as never);
      }}
    />
  );
}