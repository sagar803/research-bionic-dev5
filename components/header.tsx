/* eslint-disable @next/next/no-img-element */
"use client"
import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { IconSeparator } from "@/components/ui/icons";
import { UserMenu } from "@/components/user-menu";
import { SidebarMobile } from "./sidebar-mobile";
import { SidebarToggle } from "./sidebar-toggle";
import { ChatHistory } from "./chat-history";
import { signOut , useSession , signIn } from "next-auth/react";
import { DialogLogin } from "./LoginModal";
import { Session } from "inspector";


const loginAzure = ()=>{
  signIn('azure-ad')
}

async function UserOrLogin() {
  const { data: session, status }: any = useSession();

  return (
    <>
      {false? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
          <SidebarToggle />
        </>
      ) : (
        <>
          <Link href="https://research.bionicdiamond.com/" rel="nofollow">
            <img
              className="size-14 object-contain"
              src="https://gen.bionicdiamond.com/images/gemini.png"
              alt="gemini logo"
            />
          </Link>
        </>
      )}
      {/* <div className="flex items-center">
        <IconSeparator className="size-6 text-zinc-200" />
        {session?.user ? <UserMenu user={session.user} /> : <div></div>}
      </div> */}
    </>
  );
}

export function Header() {
  const { data: session, status }: any = useSession();
  const logoutAzure = async()=>{
    if(session)
    await signOut();
  }
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-12 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      {session ? 
      <Button type="button" className="ml-auto" onClick={()=>logoutAzure()}>
        Logout
      </Button> :
      <DialogLogin loginAzure={loginAzure} session={session}/>}
   
    </header>
  );
}
