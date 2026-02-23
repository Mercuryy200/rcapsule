"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Tooltip } from "@heroui/react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface LikeButtonProps {
  targetType: "wardrobe" | "outfit" | "clothes";
  targetId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function LikeButton({
  targetType,
  targetId,
  initialLiked,
  initialCount,
  size = "md",
  showCount = true,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(previousLiked ? likeCount - 1 : likeCount + 1);
    setIsLoading(true);

    try {
      const response = await fetch("/api/likes", {
        method: previousLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  return (
    <Tooltip content={isLiked ? "Unlike" : "Like"}>
      <Button
        isIconOnly={!showCount}
        variant="flat"
        radius="none"
        size={size}
        isLoading={isLoading}
        onPress={handleLike}
        className={`${isLiked ? "text-danger" : "text-default-500"} transition-colors`}
      >
        {!isLoading && (
          <>
            {isLiked ? (
              <HeartSolid className={iconSize} />
            ) : (
              <HeartOutline className={iconSize} />
            )}
            {showCount && (
              <span className="text-xs font-medium ml-1">{likeCount}</span>
            )}
          </>
        )}
      </Button>
    </Tooltip>
  );
}
