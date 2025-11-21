"use client";
import { useSession } from "next-auth/react";
import {
  Dropdown,
  DropdownTrigger,
  Avatar,
  DropdownMenu,
  DropdownItem,
  Link,
} from "@heroui/react";

import { logout } from "@/lib/actions/auth";
import { useUser } from "@/contexts/UserContext";

export function ProfileDropdown() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

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
        <DropdownItem key="profile" as={Link} href="/profile">
          My Profile
        </DropdownItem>
        <DropdownItem key="settings" as={Link} href="/settings">
          My Settings
        </DropdownItem>
        <DropdownItem key="closet" as={Link} href="/closet">
          My Closet
        </DropdownItem>
        <DropdownItem key="logout" color="danger" onPress={() => logout()}>
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
