"use client";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions/auth";
import {
  Dropdown,
  DropdownTrigger,
  Avatar,
  DropdownMenu,
  DropdownItem,
  Link,
} from "@heroui/react";

export function ProfileDropdown() {
  const { data: session } = useSession();

  if (!session?.user) {
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
          name={session.user.name || "User"}
          size="sm"
          src={session.user.image || "/images/Default_pfp.png"}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold">{session.user.email}</p>
        </DropdownItem>
        <DropdownItem as={Link} href="/settings" key="settings">
          My Settings
        </DropdownItem>
        <DropdownItem as={Link} href="/closet" key="closet">
          My Closet
        </DropdownItem>
        <DropdownItem key="logout" onPress={() => logout()} color="danger">
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
