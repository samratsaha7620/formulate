"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { ViewVerticalIcon } from "@radix-ui/react-icons";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { docsConfig } from "@/config/docs";
import { LoginLink } from "./loginLink";
import { RegisterLink } from "./registerLink";
import Logout from "./logout";

export function MobileNav({ isUserLogged }: { isUserLogged: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur md:hidden">
      <div className="container flex h-14 items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <ViewVerticalIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileLink
              href="/"
              className="flex items-center"
              onOpenChange={setOpen}
            >
              <span className="font-bold ml-6">Formulate</span>
            </MobileLink>
            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {docsConfig.mainNav.map(
                  (item) =>
                    item.href && (
                      <MobileLink
                        key={item.href}
                        href={item.href}
                        onOpenChange={setOpen}
                      >
                        {item.title}
                      </MobileLink>
                    )
                )}
              </div>
              <div className="flex flex-col space-y-2">
                {docsConfig.sidebarNav.map((item, index) => (
                  <div key={index} className="flex flex-col space-y-3 pt-6">
                    <h4 className="font-medium">{item.title}</h4>
                    {item.items.length &&
                      item.items.map((item) => {
                        if (item.title === "Login") {
                          if (!isUserLogged) {
                            return <LoginLink key={item.title} />;
                          }
                          return null;
                        } else if (item.title === "Register") {
                          if (!isUserLogged) {
                            return <RegisterLink key={item.title} />;
                          }
                          return null;
                        } else if (item.title === "Logout") {
                          if (isUserLogged) {
                            return <Logout key={item.title} />;
                          }
                          return null;
                        }
                        return (
                          <React.Fragment key={item.href}>
                            {!item.disabled &&
                              (item.href ? (
                                <MobileLink
                                  href={item.href}
                                  onOpenChange={setOpen}
                                  className="text-muted-foreground"
                                >
                                  {item.title}
                                </MobileLink>
                              ) : (
                                item.title
                              ))}
                          </React.Fragment>
                        );
                      })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}