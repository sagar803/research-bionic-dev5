"use client";
import * as React from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { UserMenu } from "@/components/user-menu";
import ChatSidebar from "./chat-sidebar";
import { PlusCircle } from "lucide-react";
import { useGlobalState } from "@/context/GlobalContext";

export function Header() {
  const { data: session } = useSession();
  const { setIsOpenSidebar , isOpenSidebar } = useGlobalState();

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b bg-white/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-12">
          <Link href="https://research.bionicdiamond.com/" rel="nofollow">
            <img
              className="h-10 w-auto object-contain"
              src="https://gen.bionicdiamond.com/images/gemini.png"
              alt="gemini logo"
            />
          </Link>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <button
                onClick={() => signIn("azure-ad")}
                className="rounded-xl border bg-white px-4 py-1.5 text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                Login with your Diamond email
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {session && (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 flex flex-col  border-gray-200 z-30">
          <div className="flex-1 overflow-y-auto">
            <ChatSidebar />
          </div>
        </aside>
      )}

      {/* Main Content Spacer */}
      {session && <div className="w-72 flex-none" />}
    </>
  );
}