"use client";
import { Avatar, Button } from "@heroui/react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

interface ProfileHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  stats: {
    items: number;
    wardrobes: number;
    outfits: number;
    totalValue: number;
  };
  onEdit: () => void;
}

export default function ProfileHeader({
  user,
  stats,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12 border-b border-divider pb-8">
      <Avatar
        src={user.image || undefined}
        className="w-32 h-32 text-large"
        isBordered
        radius="none"
        name={user.name || "User"}
      />

      <div className="flex-1 w-full">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              {user.name}
            </h1>
            <p className="text-sm text-default-400 uppercase tracking-widest mt-1">
              {user.email}
            </p>
          </div>
          <Button isIconOnly variant="light" radius="none" onPress={onEdit}>
            <Cog6ToothIcon className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex gap-8 mt-8">
          <div>
            <p className="text-3xl font-light">{stats.items}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
              Pieces
            </p>
          </div>
          <div>
            <p className="text-3xl font-light">{stats.wardrobes}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
              Collections
            </p>
          </div>
          <div>
            <p className="text-3xl font-light">{stats.outfits}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
              Looks
            </p>
          </div>
          <div className="hidden sm:block border-l border-divider pl-8">
            <p className="text-3xl font-light">
              ${stats.totalValue.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
              Closet Value
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
