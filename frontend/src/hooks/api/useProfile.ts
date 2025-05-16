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
  return useQuery({
    queryKey: profileKeys.profile(address || ""),
    queryFn: () => fetchProfile(address || ""),
    enabled: !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Update profile data
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: any) => updateProfile(formData),
    onSuccess: (data: any) => {
      toast.success("Profile updated successfully!");

      // Extract the address from FormData if it exists
      const address = data.address;

      if (address) {
        // Invalidate the profile query to refresh data
        queryClient.invalidateQueries({
          queryKey: profileKeys.profile(address),
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
