import { useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { subscribeToProducts } from "@/lib/firebase/products";

export function useProducts() {
  const { products, loading, setProducts, setLoading } = useProductStore();

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToProducts(setProducts);
    return () => unsub();
  }, [setProducts, setLoading]);

  return { products, loading };
}
