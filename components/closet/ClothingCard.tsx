"use client";
import { Card, CardBody, CardFooter, Image } from "@heroui/react";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
}

interface ClothingCardProps {
  item: ClothingItem;
  onClick: (id: string) => void;
}

export default function ClothingCard({ item, onClick }: ClothingCardProps) {
  return (
    <Card
      className="w-full bg-transparent group cursor-pointer"
      isPressable
      onPress={() => onClick(item.id)}
    >
      <CardBody className="p-0 overflow-hidden rounded-none aspect-[3/4] bg-content2 relative">
        <Image
          alt={item.name}
          src={item.imageUrl || "/images/placeholder.png"}
          className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
          radius="none"
          width="100%"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10" />
      </CardBody>

      <CardFooter className="flex flex-col items-start p-4 gap-1">
        <div className="flex justify-between w-full items-baseline">
          <p className="text-[10px] font-bold uppercase tracking-widest text-default-500">
            {item.brand || "Unbranded"}
          </p>
          {item.price && <p className="text-xs font-medium">${item.price}</p>}
        </div>

        <h3 className="text-sm font-light text-foreground truncate w-full capitalize">
          {item.name}
        </h3>

        <p className="text-xs text-default-400 capitalize">{item.category}</p>
      </CardFooter>
    </Card>
  );
}
