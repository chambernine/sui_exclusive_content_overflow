import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Link } from 'react-router-dom';

export function Navbar() {
  const account = useCurrentAccount();

  return (
    <div className="w-full border-b border-zinc-700">
      <div className="flex items-center justify-between px-6 py-4 bg-black text-white">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold">
            SWEETY Dapps
          </Link>
          <Link to="/profile" className="hover:underline">Profile</Link>
          <Link to="/create-draft" className="hover:underline">Create Draft</Link>
          <Link to="/approve" className="hover:underline">approve</Link>
          <Link to="/my-requests" className="hover:underline">My Requests</Link>
        </div>

        <div className="flex items-center gap-4">
          {account && (
            <div className="bg-zinc-800 px-3 py-1 rounded-full text-sm">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </div>
          )}
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}