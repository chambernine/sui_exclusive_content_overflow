import { Draft } from "./types";

const STORAGE_KEY = "cryptofans-drafts";

/**
 * Utility functions for managing content drafts
 */
export const DraftsManager = {
  /**
   * Get all saved drafts
   */
  getDrafts: (): Draft[] => {
    const draftsJson = localStorage.getItem(STORAGE_KEY);
    if (!draftsJson) return [];
    try {
      const drafts = JSON.parse(draftsJson);
      // Convert string dates to Date objects
      return drafts.map((draft: any) => ({
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt),
      }));
    } catch (error) {
      console.error("Error parsing drafts from localStorage:", error);
      return [];
    }
  },

  /**
   * Get a specific draft by ID
   */
  getDraftById: (id: string): Draft | undefined => {
    const drafts = DraftsManager.getDrafts();
    const draft = drafts.find((d) => d.id === id);
    return draft;
  },

  /**
   * Save a new draft or update an existing one
   */
  saveDraft: (draft: Draft): Draft => {
    const drafts = DraftsManager.getDrafts();
    const now = new Date();

    // Check if draft already exists
    const existingDraftIndex = drafts.findIndex((d) => d.id === draft.id);

    if (existingDraftIndex >= 0) {
      // Update existing draft
      const updatedDraft = {
        ...drafts[existingDraftIndex],
        ...draft,
        updatedAt: now,
      };

      drafts[existingDraftIndex] = updatedDraft;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
      return updatedDraft;
    } else {
      // Create new draft
      const newDraft: Draft = {
        ...draft,
        id: draft.id || crypto.randomUUID(),
        createdAt: draft.createdAt || now,
        updatedAt: now,
      };

      drafts.push(newDraft);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
      return newDraft;
    }
  },

  /**
   * Delete a draft by ID
   */
  deleteDraft: (id: string): boolean => {
    const drafts = DraftsManager.getDrafts();
    const filteredDrafts = drafts.filter((draft) => draft.id !== id);

    if (filteredDrafts.length < drafts.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDrafts));
      return true;
    }

    return false;
  },

  /**
   * Clear all drafts
   */
  clearAllDrafts: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
