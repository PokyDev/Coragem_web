import type { Metadata } from "next";
import CategoriesPageClient from "@/components/admin/categories/CategoriesPageClient";

export const metadata: Metadata = {
  title: "Categorías",
};

export default function Page() {
  return <CategoriesPageClient />;
}