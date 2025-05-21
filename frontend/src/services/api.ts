import axios from "axios";
import { DraftAlbum } from "@/types/album";
import { DOMAIN_DEV } from "@/constant/constant";

const API_URL = DOMAIN_DEV;
const api = axios.create({
  baseURL: API_URL,
});

// Album exploration endpoints
export const fetchExploreAlbums = async () => {
  const response = await api.get("/explore-albums");
  return response.data;
};

export const fetchExploreAlbumById = async (albumId: string) => {
  const response = await api.get(`/explore-album/${albumId}`);
  return response.data;
};

// Draft album and approval endpoints
export const submitDraftAlbumForApproval = async (draftAlbum: DraftAlbum) => {
  const response = await api.post("/draft-album/request-approval", draftAlbum);
  return response.data;
};

export const fetchPendingApprovalAlbums = async (address: string) => {
  const response = await api.get(`/draft-album-approval/${address}`);
  return response.data;
};

export const fetchMyAlbums = async (address: string) => {
  const response = await api.get(`/my-album/${address}`);
  return response.data;
};

export const fetchMyPublishAlbums = async (address: string) => {
  const response = await api.get(`/my-album/published/${address}`);
  return response.data;
};

export const fetchPurchasedAlbums = async (address: string) => {
  const response = await api.get(`/my-album/purchase/${address}`);
  return response.data;
};

export const approveAlbum = async (
  albumId: string,
  approverAddress: string
) => {
  const response = await api.patch(
    `/draft-album-approval/${albumId}/${approverAddress}`
  );
  return response.data;
};

export const publishAlbum = async (album: string) => {
  const response = await api.patch(JSON.stringify({ album }), {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const updateProfile = async (formData: any) => {
  const response = await api.post("/edit-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchProfile = async (address: string) => {
  const response = await api.get(`/profile/${address}`);

  return response.data;
};
