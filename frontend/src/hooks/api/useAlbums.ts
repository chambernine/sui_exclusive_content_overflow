import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchExploreAlbums,
  fetchExploreAlbumById,
  fetchMyAlbums,
  fetchPendingApprovalAlbums,
  approveAlbum,
  publishAlbum,
  submitDraftAlbumForApproval,
} from "@/services/api";
import { toast } from "sonner";

// Query keys for cache management
export const albumKeys = {
  all: ["albums"] as const,
  lists: () => [...albumKeys.all, "list"] as const,
  list: (filters: string) => [...albumKeys.lists(), filters] as const,
  details: () => [...albumKeys.all, "detail"] as const,
  detail: (id: string) => [...albumKeys.details(), id] as const,
  myAlbums: (address: string) => [...albumKeys.lists(), "my", address] as const,
  pendingApproval: (address: string) =>
    [...albumKeys.lists(), "approval", address] as const,
};

// Fetch all albums for exploration
export const useExploreAlbums = (address?: string) => {
  return useQuery({
    queryKey: albumKeys.lists(),
    queryFn: fetchExploreAlbums,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!address, // Only run query if address exists
  });
};

// Fetch a single album by ID
export const useExploreAlbumById = (albumId: string) => {
  return useQuery({
    queryKey: albumKeys.detail(albumId),
    queryFn: () => fetchExploreAlbumById(albumId),
    enabled: !!albumId,
  });
};

// Fetch albums pending approval
export const usePendingApprovalAlbums = (address: string | undefined) => {
  return useQuery({
    queryKey: albumKeys.pendingApproval(address || ""),
    queryFn: () => fetchPendingApprovalAlbums(address || ""),
    enabled: !!address,
  });
};

// Fetch my albums as a creator
export const useMyAlbums = (address: string | undefined) => {
  return useQuery({
    queryKey: albumKeys.myAlbums(address || ""),
    queryFn: () => fetchMyAlbums(address || ""),
    enabled: !!address,
  });
};

// Submit a draft album for approval
export const useSubmitDraftAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitDraftAlbumForApproval,
    onSuccess: (_data, variables) => {
      toast.success("Draft album submitted for approval!");

      // Invalidate relevant queries if the user address is available
      if (variables.owner) {
        queryClient.invalidateQueries({
          queryKey: albumKeys.myAlbums(variables.owner),
        });
      }
    },
    onError: (error) => {
      console.error("Submission failed:", error);
      toast.error("Submission failed. Please try again.");
    },
  });
};

// Approve an album
export const useApproveAlbum = (approverAddress: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ albumId }: { albumId: string }) =>
      approveAlbum(albumId, approverAddress || ""),
    onSuccess: () => {
      toast.success("Album approved successfully!");

      if (approverAddress) {
        queryClient.invalidateQueries({
          queryKey: albumKeys.pendingApproval(approverAddress),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to approve album:", error);
      toast.error("Failed to approve album. Please try again.");
    },
  });
};

// Publish an album
export const usePublishAlbum = (album) => {
  // const queryClient = useQueryClient();
  console.log("album", album);

  // return useMutation({
  //   mutationFn: publishAlbum,
  //   onSuccess: (response) => {
  //     toast.success("Album prepared for publishing!");

  //     if (album) {
  //       queryClient.invalidateQueries({
  //         queryKey: albumKeys.myAlbums(album),
  //       });
  //       queryClient.invalidateQueries({
  //         queryKey: albumKeys.lists(),
  //       });
  //     }

  //     // Return response data directly to the component for state updates
  //     return response.data;
  //   },
  //   onError: (error) => {
  //     console.error("Failed to publish album:", error);
  //     toast.error("Failed to publish album. Please try again.");
  //   },
  // });
};
