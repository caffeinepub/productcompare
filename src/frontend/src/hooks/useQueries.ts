import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Feature, Product, Variant } from "../backend.d";
import { useActor } from "./useActor";

export function useAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProduct(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useVariantsByProduct(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Variant[]>({
    queryKey: ["variants", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return [];
      return actor.getVariantsByProductId(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.seedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      category,
      imageUrl,
    }: {
      name: string;
      description: string;
      category: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addProduct(name, description, category, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAddVariant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      name,
      price,
      features,
    }: {
      productId: bigint;
      name: string;
      price: number;
      features: Feature[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addVariant(productId, name, price, features);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["variants", variables.productId.toString()],
      });
    },
  });
}

export function useDeleteVariant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      productId: _productId,
    }: {
      id: bigint;
      productId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteVariant(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["variants", variables.productId.toString()],
      });
    },
  });
}
