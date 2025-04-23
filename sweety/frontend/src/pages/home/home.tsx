// src/pages/Home.tsx
import React from 'react';
import { useSuiAccount } from '@/hooks/useSuiAccount';

export default function Home() {
  const { account, address } = useSuiAccount();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#eef4ff] to-[#d5e9ff] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <h1 className="text-3xl font-bold text-sky-600 mb-4">Welcome to Sweety 🎵</h1>

        {account ? (
          <>
            <p className="text-gray-700 text-lg font-medium">
              Wallet connected:
              <br />
              <span className="text-blue-500">{address}</span>
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Navigate to your dashboard to get started.
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-700 text-lg font-medium">
              Please connect your Sui wallet to continue.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              This app uses wallet login to manage profile, albums, and permissions securely.
            </p>
          </>
        )}
      </div>
    </div>
  );
}