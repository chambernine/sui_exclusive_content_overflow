// src/hooks/useUserInfo.ts
import { useState } from 'react';

export interface UserProfile {
  name: string;
  email?: string;
  // add your fields here
}

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  return { userInfo, setUserInfo, loading, setLoading };
}