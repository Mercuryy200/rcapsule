"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Tooltip } from "@heroui/react";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";

interface SaveButtonProps {
  targetType: "wardrobe" | "outfit" | "clothes";
  targetId: string;
  initialSaved: boolean;
  size?: "sm" | "md" | "lg";
}

export default function SaveButton({
  targetType,
  targetId,
  initialSaved,
  size = "md",
}: SaveButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    const previousSaved = isSaved;
    setIsSaved(!isSaved);
    setIsLoading(true);

    try {
      const response = await fetch("/api/saves", {
        method: previousSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle save");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(previousSaved);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  return (
    <Tooltip content={isSaved ? "Unsave" : "Save"}>
      <Button
        isIconOnly
        variant="flat"
        radius="none"
        size={size}
        isLoading={isLoading}
        onPress={handleSave}
        className={`${isSaved ? "text-primary" : "text-default-500"} transition-colors`}
      >
        {!isLoading &&
          (isSaved ? (
            <BookmarkSolid className={iconSize} />
          ) : (
            <BookmarkOutline className={iconSize} />
          ))}
      </Button>
    </Tooltip>
  );
}
