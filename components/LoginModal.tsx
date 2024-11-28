import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogLoginProps {
  loginAzure: () => void;
  session: any; 
  setGuestmode?: any;
}

export function DialogLogin({ loginAzure, session , setGuestmode }: DialogLoginProps) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!session) {
      setIsOpen(true);
    }
  }, [session]);

  if (session) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] mx-auto text-center">
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>
            Login with Azure or continue as a guest.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button type="button" className="mx-auto" onClick={() => loginAzure()}>
            Login with Azure
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="mx-auto"
            onClick={() =>{
              setIsOpen(false);
              setGuestmode(true);
            }} 
          >
            Continue as Guest
          </Button>
        </div>
        <DialogFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Your data will remain secure.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
