import axios from "axios";
import { DraftAlbum } from "@/types/album";

const API_URL = "http://localhost:3000";
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
  const response = await api.get(`/album-approval/${address}`);
  return response.data;
};

export const fetchMyAlbums = async (address: string) => {
  const response = await api.get(`/my-album/${address}`);
  return response.data;
};

export const approveAlbum = async (
  albumId: string,
  approverAddress: string
) => {
  const response = await api.patch(
    `/album-approval/${albumId}/${approverAddress}`
  );
  return response.data;
};

export const publishAlbum = async (album: string) => {
  const response = await api.patch(JSON.stringify({ album }), {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};
