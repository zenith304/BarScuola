"use client";

import { CartProvider } from "@/app/context/CartContext"; // uguale agli altri file

export default function StudentProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
