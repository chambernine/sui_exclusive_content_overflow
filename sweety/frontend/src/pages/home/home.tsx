// src/pages/Home.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ React Router
import { useSuiAccount } from '@/hooks/useSuiAccount';
import { useUserInfo } from '@/hooks/useUserInfo';

export default function Home() {
  const { account, address } = useSuiAccount();
  const { userInfo, setUserInfo, loading, setLoading } = useUserInfo();
  const navigate = useNavigate(); // ✅ For redirects

  useEffect(() => {
    if (!account || !address) return;

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/profile/${address}`);
        const result = await res.json();
        console.log('User profile:', result);
        if (result.data === undefined) {
          // No profile: redirect to setup page
          navigate('/profile');
        } else {
          // Set user info
          setUserInfo(result.data);
        }
      } catch (err) {
        console.error('❌ Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [account, address]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#eef4ff] to-[#d5e9ff] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <h1 className="text-3xl font-bold text-sky-600 mb-4">Welcome to Sweety 🎵</h1>

        {!account ? (
          <>
            <p className="text-gray-700 text-lg font-medium">
              Please connect your Sui wallet to continue.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              This app uses wallet login to manage profile, albums, and permissions securely.
            </p>
          </>
        ) : loading ? (
          <p className="text-gray-600">Loading your profile...</p>
        ) : (
          <>
            <p className="text-gray-700 text-lg font-medium">
              Wallet connected:
              <br />
              <span className="text-blue-500">{address}</span>
            </p>
            <p className="text-sm text-gray-500 mt-3">
              {userInfo ? "Welcome back! Navigate to your dashboard." : "Redirecting to profile setup..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}