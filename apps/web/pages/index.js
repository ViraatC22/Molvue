import React from 'react';
import { Button } from '../components/ui/button';
import { signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    // Placeholder; in a real app we would read session via useSession
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Molvue Web</h1>
      <p className="text-gray-600 mt-2">Next.js + NextAuth + Supabase + ShadCN UI</p>
      <div className="mt-6 flex gap-3">
        <Button variant="primary" onClick={() => signIn('credentials')}>Sign in</Button>
        <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
      </div>
    </div>
  );
}