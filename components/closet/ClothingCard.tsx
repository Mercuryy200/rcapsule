"use client";
import { Card, CardBody, CardFooter, Image, Chip } from "@heroui/react";
import { HeartIcon } from "@heroicons/react/24/outline";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
  status?: string;
  condition?: string;
  timesworn?: number;
}

interface ClothingCardProps {
  item: ClothingItem;
  onClick: (id: string) => void;
}

export default function ClothingCard({ item, onClick }: ClothingCardProps) {
  const isWishlist = item.status === "wishlist";

  return (
    <Card
      className="w-full bg-transparent group cursor-pointer"
      isPressable
      onPress={() => onClick(item.id)}
    >
      <CardBody className="p-0 overflow-hidden rounded-none aspect-[3/4] bg-content2 relative flex justify-center items-center">
        <Image
          alt={item.name}
          src={item.imageUrl || "/images/placeholder.png"}
          className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-105"
          radius="none"
          width="100%"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10" />

        {/* Status badge for wishlist items */}
        {isWishlist && (
          <div className="absolute top-2 right-2 z-20">
            <Chip
              size="sm"
              variant="flat"
              color="danger"
              startContent={<HeartIcon className="w-3 h-3" />}
              classNames={{
                base: "bg-danger-50/90 backdrop-blur-sm",
                content:
                  "text-danger font-semibold text-[10px] uppercase tracking-wider px-1",
              }}
            >
              Wishlist
            </Chip>
          </div>
        )}

        {/* Condition badge for owned items */}
        {!isWishlist && item.condition && item.condition !== "excellent" && (
          <div className="absolute top-2 left-2 z-20">
            <Chip
              size="sm"
              variant="flat"
              color={
                item.condition === "new"
                  ? "success"
                  : item.condition === "good"
                    ? "primary"
                    : item.condition === "fair"
                      ? "warning"
                      : "default"
              }
              classNames={{
                base: "backdrop-blur-sm",
                content:
                  "text-[10px] uppercase tracking-wider font-semibold px-1 capitalize",
              }}
            >
              {item.condition}
            </Chip>
          </div>
        )}

        {/* Wear count badge */}
        {!isWishlist && item.timesworn !== undefined && item.timesworn > 0 && (
          <div className="absolute bottom-2 left-2 z-20">
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: "bg-default-50/90 backdrop-blur-sm",
                content:
                  "text-default-700 text-[10px] uppercase tracking-wider font-semibold px-1",
              }}
            >
              Worn {item.timesworn}x
            </Chip>
          </div>
        )}
      </CardBody>

      <CardFooter className="flex flex-col items-start p-4 gap-1">
        <div className="flex justify-between w-full items-baseline">
          <p className="text-[10px] font-bold uppercase tracking-widest text-default-500">
            {item.brand || "Unbranded"}
          </p>
          {item.price && (
            <p className="text-xs font-medium">${item.price.toFixed(2)}</p>
          )}
        </div>

        <h3 className="text-sm font-light text-foreground truncate w-full capitalize">
          {item.name}
        </h3>

        <p className="text-xs text-default-400 capitalize">{item.category}</p>
      </CardFooter>
    </Card>
  );
}
