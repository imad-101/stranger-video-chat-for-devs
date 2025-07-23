"use client";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  User,
  MessageSquare,
  Users,
  ChevronDown,
  Crown,
  Video,
  Phone,
  UserPlus,
  Bell,
  Star,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UserButton, useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export function ProfileSidebar() {
  const { user, isLoaded } = useUser();

  return (
    <>
      <SidebarHeader className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 " />

        <div className="relative flex flex-col items-center pt-8 pb-4 space-y-3">
          <SignedIn>
            {isLoaded ? (
              <>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300" />
                  <div className="relative">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox:
                            "w-16 h-16 group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:h-10",
                        },
                      }}
                    />
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-1 group-data-[state=collapsed]:hidden">
                  <h3 className="font-semibold text-lg bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {user?.fullName || user?.username || "User"}
                  </h3>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Online
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="w-16 h-16 bg-gray-300 rounded-full" />
                <div className="h-4 bg-gray-300 rounded w-20" />
              </div>
            )}
          </SignedIn>

          <SignedOut>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full blur opacity-50" />
              <Avatar className="relative h-16 w-16 mb-2 group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:w-10 border-2 border-gray-200 dark:border-gray-700">
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
                  ?
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center space-y-1 group-data-[state=collapsed]:hidden">
              <span className="font-semibold text-lg text-gray-600 dark:text-gray-400">
                Guest
              </span>
              <span className="text-sm text-muted-foreground">
                Not signed in
              </span>
            </div>
          </SignedOut>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

      <SidebarContent className="overflow-x-hidden space-y-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3 py-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/profile" className="w-full">
                  <SidebarMenuButton className="w-full hover:bg-blue-50 transition-all duration-200 group">
                    <User className="transition-transform group-hover:scale-110" />
                    <span>My Profile</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/upgrade" className="w-full">
                  <SidebarMenuButton className="w-full hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-950/30 dark:hover:to-orange-950/30 hover:text-yellow-700 dark:hover:text-yellow-300 transition-all duration-200 group">
                    <Crown className="transition-transform group-hover:scale-110 text-yellow-500" />
                    <span className="flex items-center justify-between w-full">
                      Upgrade to Premium
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full font-medium group-data-[state=collapsed]:hidden">
                        PRO
                      </span>
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
                  <Settings className="transition-transform group-hover:rotate-90" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-900/50">
        <div className="p-4">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>VideoChat Pro v2.1</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}
