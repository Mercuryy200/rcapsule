"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
  useDisclosure,
} from "@heroui/react";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  price?: number;
  colors: string[];
  season?: string;
  size?: string;
  link?: string;
  imageUrl?: string;
  placesToWear: string[];
}

const categories = [
  "shirt",
  "pants",
  "dress",
  "shoes",
  "jacket",
  "accessories",
];
const seasons = ["spring", "summer", "fall", "winter", "all-season"];
const occasions = ["casual", "work", "formal", "sports", "party", "school"];

export default function ClosetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    colors: "",
    season: "",
    size: "",
    link: "",
    imageUrl: "",
    placesToWear: "",
  });

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

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      category: "",
      price: "",
      colors: "",
      season: "",
      size: "",
      link: "",
      imageUrl: "",
      placesToWear: "",
    });
    onOpen();
  };

  const handleOpenEdit = (item: ClothingItem) => {
    setIsEditing(true);
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price?.toString() || "",
      colors: item.colors.join(", "),
      season: item.season || "",
      size: item.size || "",
      link: item.link || "",
      imageUrl: item.imageUrl || "",
      placesToWear: item.placesToWear.join(", "),
    });
    onOpen();
  };

  const handleSubmit = async () => {
    const data = {
      name: formData.name,
      category: formData.category,
      price: formData.price ? parseFloat(formData.price) : null,
      colors: formData.colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      season: formData.season || null,
      size: formData.size || null,
      link: formData.link || null,
      imageUrl: formData.imageUrl || null,
      placesToWear: formData.placesToWear
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    };

    try {
      const url = isEditing
        ? `/api/clothes/${selectedItem?.id}`
        : "/api/clothes";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchClothes();
        onClose();
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/clothes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchClothes();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Closet</h1>
        <Button color="primary" onPress={handleOpenAdd}>
          Add New Item
        </Button>
      </div>

      {clothes.length === 0 ? (
        <div className="text-center p-12">
          <p className="text-lg text-gray-500 mb-4">Your closet is empty</p>
          <Button color="primary" onPress={handleOpenAdd}>
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clothes.map((item) => (
            <Card key={item.id} className="w-full">
              <CardBody className="p-0">
                <Image
                  src={item.imageUrl || "/images/placeholder.png"}
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />
              </CardBody>
              <CardFooter className="flex flex-col items-start gap-2">
                <div className="w-full">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {item.category}
                  </p>
                  {item.price && (
                    <p className="text-sm font-semibold">${item.price}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.colors.map((color) => (
                    <Chip key={color} size="sm" variant="flat">
                      {color}
                    </Chip>
                  ))}
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => handleOpenEdit(item)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => handleDelete(item.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Item" : "Add New Item"}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Name"
                placeholder="e.g., Blue Denim Jacket"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                isRequired
              />
              <Select
                label="Category"
                placeholder="Select category"
                selectedKeys={formData.category ? [formData.category] : []}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                isRequired
              >
                {categories.map((cat) => (
                  <SelectItem key={cat}>{cat}</SelectItem>
                ))}
              </Select>
              <Input
                label="Price"
                placeholder="29.99"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
              <Input
                label="Colors"
                placeholder="blue, white (comma separated)"
                value={formData.colors}
                onChange={(e) =>
                  setFormData({ ...formData, colors: e.target.value })
                }
              />
              <Select
                label="Season"
                placeholder="Select season"
                selectedKeys={formData.season ? [formData.season] : []}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
              >
                {seasons.map((season) => (
                  <SelectItem key={season}>{season}</SelectItem>
                ))}
              </Select>
              <Input
                label="Size"
                placeholder="e.g., M, L, 32"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
              />
              <Input
                label="Link"
                placeholder="https://..."
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
              <Input
                label="Image URL"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
              <Input
                label="Places to Wear"
                placeholder="casual, work, party (comma separated)"
                value={formData.placesToWear}
                onChange={(e) =>
                  setFormData({ ...formData, placesToWear: e.target.value })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              {isEditing ? "Update" : "Add"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
