"use client";

import { useState, useTransition } from "react";
import { ListingCard } from "@sellspace/ui/components/listing-card";
import { toggleSave } from "@/app/listings/[id]/_actions";

export interface SavedListingCardProps {
  id: string;
  image: string;
  condition: string;
  category: string;
  title: string;
  sellerName: string;
  city: string;
  price: number;
}

export function SavedListingCardClient({
  id,
  image,
  condition,
  category,
  title,
  sellerName,
  city,
  price,
}: SavedListingCardProps) {
  const [saved, setSaved] = useState(true);
  const [savePending, startSaveTransition] = useTransition();

  function handleUnsave() {
    setSaved(false);
    startSaveTransition(async () => {
      try {
        await toggleSave(id, false);
      } catch {
        setSaved(true);
      }
    });
  }

  return (
    <ListingCard
      id={id}
      image={image}
      condition={condition as any}
      category={category}
      title={title}
      sellerName={sellerName}
      city={city}
      price={price}
      saved={saved}
      saving={savePending}
      onSave={handleUnsave}
      href={`/listings/${id}`}
    />
  );
}
