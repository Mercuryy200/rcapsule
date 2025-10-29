"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";

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

interface Wardrobe {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  clothes: ClothingItem[];
}

const categories = [
  "shirt",
  "pants",
  "dress",
  "shoes",
  "jacket",
  "accessories",
  "tank top",
  "denim",
];
const seasons = ["spring", "summer", "fall", "winter", "all-season"];
const occasions = [
  "casual",
  "work",
  "formal",
  "sports",
  "party",
  "school",
  "home",
];
const colors = [
  "red",
  "blue",
  "green",
  "black",
  "white",
  "gray",
  "brown",
  "pink",
  "yellow",
  "purple",
];
export default function WardrobePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const wardrobeId = params.id as string;

  const [wardrobe, setWardrobe] = useState<Wardrobe | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    colors: [] as string[],
    season: "",
    size: "",
    link: "",
    imageUrl: "",
    placesToWear: [] as string[],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchWardrobe();
    }
  }, [status, router, wardrobeId]);

  const fetchWardrobe = async () => {
    try {
      const response = await fetch(`/api/wardrobes/${wardrobeId}`);

      if (response.ok) {
        const data = await response.json();
        setWardrobe(data);
      } else if (response.status === 404) {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error fetching wardrobe:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      category: "",
      brand: "",
      price: "",
      colors: [] as string[],
      season: "",
      size: "",
      link: "",
      imageUrl: "",
      placesToWear: [] as string[],
    });
    onOpen();
  };

  const handleOpenEdit = (item: ClothingItem) => {
    setIsEditing(true);
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      brand: item.brand || "",
      price: item.price?.toString() || "",
      colors: item.colors || [],
      season: item.season || "",
      size: item.size || "",
      link: item.link || "",
      imageUrl: item.imageUrl || "",
      placesToWear: item.placesToWear || [],
    });
    onOpen();
  };

  const handleSubmit = async () => {
    const data = {
      name: formData.name,
      category: formData.category,
      brand: formData.brand || null,
      price: formData.price ? parseFloat(formData.price) : null,
      colors: formData.colors,
      season: formData.season || null,
      size: formData.size || null,
      link: formData.link || null,
      imageUrl: formData.imageUrl || null,
      placesToWear: formData.placesToWear,
      wardrobeId: wardrobeId, // Link to this wardrobe
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
        fetchWardrobe();
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
        fetchWardrobe();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleRemoveFromWardrobe = async (id: string) => {
    if (!confirm("Remove this item from the wardrobe?")) return;

    try {
      const response = await fetch(`/api/clothes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wardrobeId: null }),
      });

      if (response.ok) {
        fetchWardrobe();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!wardrobe) {
    return <div className="text-center p-8">Wardrobe not found</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push("/profile")}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{wardrobe.title}</h1>
            {wardrobe.description && (
              <p className="text-gray-500">{wardrobe.description}</p>
            )}
          </div>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-5 h-5" />}
          onPress={handleOpenAdd}
        >
          Add Item
        </Button>
      </div>

      {/* Clothes Grid */}
      {wardrobe.clothes.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-lg text-gray-500 mb-4">
              No items in this wardrobe yet
            </p>
            <Button color="primary" onPress={handleOpenAdd}>
              Add Your First Item
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wardrobe.clothes.map((item) => (
            <Card key={item.id} className="w-full">
              <CardBody className="p-0 overflow-hidden">
                <div className="w-full h-64 relative">
                  <Image
                    alt={item.name}
                    className="w-full h-full object-cover"
                    classNames={{
                      img: "w-full h-full object-cover",
                    }}
                    src={item.imageUrl || "/images/placeholder.png"}
                  />
                </div>
              </CardBody>
              <CardFooter className="flex flex-col items-start gap-2">
                <div className="w-full">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {item.category}
                  </p>
                  {item.brand && (
                    <p className="text-xs text-gray-400">{item.brand}</p>
                  )}
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
                    className="flex-1"
                    color="primary"
                    size="sm"
                    variant="flat"
                    onPress={() => handleOpenEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    className="flex-1"
                    color="warning"
                    size="sm"
                    variant="flat"
                    onPress={() => handleRemoveFromWardrobe(item.id)}
                  >
                    Remove
                  </Button>
                  <Button
                    className="flex-1"
                    color="danger"
                    size="sm"
                    variant="flat"
                    onPress={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Item" : "Add New Item"}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                label="Name"
                placeholder="e.g., Blue Denim Jacket"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Select
                isRequired
                label="Category"
                placeholder="Select category"
                selectedKeys={formData.category ? [formData.category] : []}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <SelectItem key={cat}>{cat}</SelectItem>
                ))}
              </Select>
              <Input
                label="Brand"
                placeholder="e.g., Nike, Zara"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
              <Input
                label="Price"
                placeholder="29.99"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
              <Select
                label="Colors"
                placeholder="Select colors"
                selectionMode="multiple"
                selectedKeys={new Set(formData.colors || [])}
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys) as string[];
                  setFormData({ ...formData, colors: selectedArray });
                }}
              >
                {colors.map((color) => (
                  <SelectItem key={color}>{color}</SelectItem>
                ))}
              </Select>
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
              <Select
                label="Places to Wear"
                placeholder="Select places"
                selectionMode="multiple"
                selectedKeys={new Set(formData.placesToWear || [])}
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys) as string[];
                  setFormData({ ...formData, placesToWear: selectedArray });
                }}
              >
                {occasions.map((occasion) => (
                  <SelectItem key={occasion}>{occasion}</SelectItem>
                ))}
              </Select>
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
