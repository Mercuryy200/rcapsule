"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardFooter, Image, Chip } from "@heroui/react";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price?: number;
  colors: string[];
  season?: string;
  size?: string;
  link?: string;
  imageUrl?: string;
  placesToWear: string[];
}

export default function ClosetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchClothes();
    }
  }, [status, router]);

  const fetchClothes = async () => {
    try {
      const response = await fetch("/api/clothes");

      if (response.ok) {
        const data = await response.json();
        setClothes(data);
      }
    } catch (error) {
      console.error("Error fetching clothes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (itemId: string) => {
    router.push(`/closet/${itemId}`);
  };

  const handleAddNew = () => {
    router.push("/closet/new");
  };

  if (status === "loading" || loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Closet</h1>
        <Button color="primary" onPress={handleAddNew}>
          Add New Item
        </Button>
      </div>

      {clothes.length === 0 ? (
        <div className="text-center p-12">
          <p className="text-lg text-gray-500 mb-4">Your closet is empty</p>
          <Button color="primary" onPress={handleAddNew}>
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clothes.map((item) => (
            <Card
              key={item.id}
              className="w-full cursor-pointer hover:shadow-lg transition-shadow"
              isPressable
              onPress={() => handleItemClick(item.id)}
            >
              <CardBody className="p-0 relative h-80 overflow-hidden flex items-center justify-center">
                <Image
                  alt={item.name}
                  className="object-center overflow-hidden  w-full "
                  src={item.imageUrl || "/images/placeholder.png"}
                />
              </CardBody>
              <CardFooter className="flex flex-col items-start gap-2">
                <div className="w-full text-start">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {item.category}
                  </p>
                  {item.brand && (
                    <p className="text-sm text-gray-600">{item.brand}</p>
                  )}
                  {item.price && (
                    <p className="text-sm font-semibold">${item.price}</p>
                  )}
                </div>
                {item.colors && item.colors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.colors.map((color) => (
                      <Chip key={color} size="sm" variant="flat">
                        {color}
                      </Chip>
                    ))}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
