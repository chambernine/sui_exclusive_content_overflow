import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, fetchProfile } from "@/services/api";
import { toast } from "sonner";

// Query keys for cache management
export const profileKeys = {
  all: ["profiles"] as const,
  profile: (address: string) => [...profileKeys.all, address] as const,
};

// Fetch profile data by address
export const useProfile = (address: string | undefined) => {
  const queryResult = useQuery({
    queryKey: profileKeys.profile(address || ""),
    queryFn: () => fetchProfile(address || ""),
    enabled: !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Expose refetch method as part of the returned object
  return {
    ...queryResult,
    refetch: () => {
      if (address) {
        return queryResult.refetch();
      }
      return Promise.resolve();
    },
  };
};

// Update profile data
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: any) => updateProfile(formData),
    onSuccess: (data: any, variables: any) => {
      toast.success("Profile updated successfully!");

      // Extract the address from response data or form data
      const address = data.address || variables.walletAddress;

      if (address) {
        // Invalidate the profile query to refresh data
        queryClient.invalidateQueries({
          queryKey: profileKeys.profile(address),
        });

        // Explicitly refetch the profile data to ensure immediate update
        queryClient.refetchQueries({
          queryKey: profileKeys.profile(address),
          exact: true,
        });
      }

      return data;
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    },
  });
};
