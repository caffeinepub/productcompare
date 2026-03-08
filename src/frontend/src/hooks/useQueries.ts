import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CarCategory, CarModel, Feature, Trim } from "../backend.d";
import { useActor } from "./useActor";

export function useAllCarModels() {
  const { actor, isFetching } = useActor();
  return useQuery<CarModel[]>({
    queryKey: ["carModels"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCarModels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCarModel(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<CarModel | null>({
    queryKey: ["carModel", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCarModel(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useTrimsByCarModel(carModelId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Trim[]>({
    queryKey: ["trims", carModelId?.toString()],
    queryFn: async () => {
      if (!actor || carModelId === null) return [];
      return actor.getTrimsByCarModelId(carModelId);
    },
    enabled: !!actor && !isFetching && carModelId !== null,
  });
}

export function useTrimsByIds(trimIds: bigint[]) {
  const { actor, isFetching } = useActor();
  return useQuery<Trim[]>({
    queryKey: ["trimsByIds", trimIds.map((id) => id.toString()).join(",")],
    queryFn: async () => {
      if (!actor || trimIds.length === 0) return [];
      return actor.getTrimsByIds(trimIds);
    },
    enabled: !!actor && !isFetching && trimIds.length > 0,
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
      queryClient.invalidateQueries({ queryKey: ["carModels"] });
    },
  });
}

export function useIsSeeded() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isSeeded"],
    queryFn: async () => {
      if (!actor) return true;
      return actor.isSeeded();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTrims() {
  const { actor, isFetching } = useActor();
  const { data: models } = useAllCarModels();
  return useQuery<(Trim & { modelName: string })[]>({
    queryKey: [
      "allTrims",
      (models ?? []).map((m) => m.id.toString()).join(","),
    ],
    queryFn: async () => {
      if (!actor || !models || models.length === 0) return [];
      const trimGroups = await Promise.all(
        models.map((m) => actor.getTrimsByCarModelId(m.id)),
      );
      return trimGroups.flatMap((trims, idx) =>
        trims.map((t) => ({ ...t, modelName: models[idx].name })),
      );
    },
    enabled: !!actor && !isFetching && !!models && models.length > 0,
  });
}

export function useAddCarModel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      name: string;
      description: string;
      category: CarCategory;
      tagline: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addCarModel(
        args.name,
        args.description,
        args.category,
        args.tagline,
        args.imageUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carModels"] });
      queryClient.invalidateQueries({ queryKey: ["allTrims"] });
    },
  });
}

export function useUpdateCarModel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      name: string;
      description: string;
      category: CarCategory;
      tagline: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCarModel(
        args.id,
        args.name,
        args.description,
        args.category,
        args.tagline,
        args.imageUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carModels"] });
      queryClient.invalidateQueries({ queryKey: ["allTrims"] });
    },
  });
}

export function useDeleteCarModel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCarModel(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carModels"] });
      queryClient.invalidateQueries({ queryKey: ["allTrims"] });
    },
  });
}

export function useAddTrim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      carModelId: bigint;
      name: string;
      price: number;
      monthlyEMI: number;
      features: Feature[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTrim(
        args.carModelId,
        args.name,
        args.price,
        args.monthlyEMI,
        args.features,
      );
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["trims", vars.carModelId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["allTrims"] });
    },
  });
}

export function useUpdateTrim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      carModelId: bigint;
      name: string;
      price: number;
      monthlyEMI: number;
      features: Feature[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTrim(
        args.id,
        args.carModelId,
        args.name,
        args.price,
        args.monthlyEMI,
        args.features,
      );
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["trims", vars.carModelId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["allTrims"] });
    },
  });
}

export function useDeleteTrim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: bigint; carModelId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTrim(args.id);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["trims", vars.carModelId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["allTrims"] });
    },
  });
}

export function useClaimAdminIfNoneExists() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.claimAdminIfNoneExists();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
    },
  });
}

export function useResetAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.resetAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
    },
  });
}

export function useGetCallerPrincipal() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["callerPrincipal"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getCallerPrincipal();
    },
    enabled: !!actor && !isFetching,
  });
}
