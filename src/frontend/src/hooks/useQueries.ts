import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GamePrompt,
  Message,
  Moment,
  SpecialDate,
  UserProfile,
} from "../backend.d";
import type { ExternalBlob } from "../backend.d";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetUpcomingSpecialDates() {
  const { actor, isFetching } = useActor();
  return useQuery<SpecialDate[]>({
    queryKey: ["specialDates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUpcomingSpecialDates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSpecialDate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      date: bigint;
      description: string;
      emoji: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createSpecialDate(
        params.title,
        params.date,
        params.description,
        params.emoji,
        params.category,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["specialDates"] }),
  });
}

export function useUpdateSpecialDate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      title: string;
      date: bigint;
      description: string;
      emoji: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSpecialDate(
        params.id,
        params.title,
        params.date,
        params.description,
        params.emoji,
        params.category,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["specialDates"] }),
  });
}

export function useDeleteSpecialDate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteSpecialDate(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["specialDates"] }),
  });
}

export function useGetAllMoments() {
  const { actor, isFetching } = useActor();
  return useQuery<Moment[]>({
    queryKey: ["moments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMoments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMoment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      caption: string;
      date: bigint;
      // biome-ignore lint/suspicious/noExplicitAny: ExternalBlob type conflict between modules
      photo: any;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createMoment(params.caption, params.date, params.photo);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["moments"] }),
  });
}

export function useDeleteMoment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteMoment(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["moments"] }),
  });
}

export function useGetMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { sender: string; message: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendMessage(params.sender, params.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useGetRandomPrompt() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (gameType: string): Promise<GamePrompt | null> => {
      if (!actor) throw new Error("Actor not available");
      return actor.getRandomPrompt(gameType);
    },
  });
}

export function useSeedGamePrompts() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.seedGamePrompts();
    },
  });
}

export function useGetLoveNote() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["loveNote"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getLoveNote();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateLoveNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLoveNote(note);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loveNote"] }),
  });
}
