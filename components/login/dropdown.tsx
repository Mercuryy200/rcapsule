"use client";
import {
  Dropdown,
  DropdownTrigger,
  Avatar,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import NextLink from "next/link";

import { logout } from "@/lib/actions/auth";

export function ProfileDropdown({ user }: { user: any }) {
  if (!user) return null;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="primary"
          name={user.name || "User"}
          size="sm"
          src={user.image || "/images/Default_pfp.png"}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem
          key="user-info"
          className="h-14 gap-2 opacity-100 italic"
          textValue="Signed in as"
        >
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold text-primary">{user.email}</p>
        </DropdownItem>

        <DropdownItem key="profile" as={NextLink} href="/profile">
          My Profile
        </DropdownItem>

        <DropdownItem key="closet" as={NextLink} href="/closet">
          My Closet
        </DropdownItem>

        <DropdownItem key="settings" as={NextLink} href="/settings">
          Settings
        </DropdownItem>

        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger"
          onPress={() => logout()}
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
