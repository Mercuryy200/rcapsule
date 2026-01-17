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
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8 md:mb-12 border-b border-divider pb-8">
      {/* Avatar: Smaller on mobile, Larger on desktop */}
      <Avatar
        src={user.image || undefined}
        className="w-24 h-24 md:w-32 md:h-32 text-large shrink-0"
        isBordered
        radius="none"
        name={user.name || "User"}
      />

      <div className="flex-1 w-full">
        {/* Name & Settings Row */}
        <div className="flex flex-row justify-between items-start w-full relative">
          <div className="text-center md:text-left w-full md:w-auto pr-10 md:pr-0">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic break-words">
              {user.name}
            </h1>
            <p className="text-xs md:text-sm text-default-400 uppercase tracking-widest mt-1 break-all">
              {user.email}
            </p>
          </div>

          {/* Settings Button: Absolute top-right on mobile to save space, relative on desktop */}
          <Button
            isIconOnly
            variant="light"
            radius="none"
            onPress={onEdit}
            className="absolute top-0 right-0 md:relative md:top-auto md:right-auto -mr-2 md:mr-0"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Stats Grid: 2x2 Grid on Mobile -> Single Row on Desktop */}
        <div className="grid grid-cols-2 md:flex md:flex-row gap-y-6 gap-x-4 md:gap-8 mt-8 w-full">
          <div className="text-center md:text-left">
            <p className="text-2xl md:text-3xl font-light">{stats.items}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
              Pieces
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl md:text-3xl font-light">{stats.wardrobes}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
              Collections
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl md:text-3xl font-light">{stats.outfits}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
              Looks
            </p>
          </div>

          {/* Value: Visible on mobile now, borders adjusted */}
          <div className="text-center md:text-left md:border-l md:border-divider md:pl-8">
            <p className="text-2xl md:text-3xl font-light">
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
