"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Image,
  Chip,
} from "@heroui/react";

import { colors, occasions, seasons, categories } from "@/lib/data";

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

export default function ItemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [item, setItem] = useState<ClothingItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    colors: [] as string[],
    season: "",
    size: "",
    link: "",
    brand: "",
    imageUrl: "",
    placesToWear: [] as string[],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchItem();
    }
  }, [status, router, itemId]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/clothes/${itemId}`);

      if (response.ok) {
        const data = await response.json();
        setItem(data);
        setFormData({
          name: data.name,
          category: data.category,
          price: data.price?.toString() || "",
          colors: data.colors || [],
          season: data.season || "",
          size: data.size || "",
          link: data.link || "",
          brand: data.brand || "",
          imageUrl: data.imageUrl || "",
          placesToWear: data.placesToWear || [],
        });
      } else {
        alert("Item not found");
        router.push("/closet");
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      alert("Please fill in required fields (Name and Category)");
      return;
    }

    const data = {
      name: formData.name,
      category: formData.category,
      price: formData.price ? parseFloat(formData.price) : null,
      colors: formData.colors,
      brand: formData.brand.trim() || null,
      season: formData.season || null,
      size: formData.size || null,
      link: formData.link || null,
      imageUrl: formData.imageUrl || null,
      placesToWear: formData.placesToWear,
    };

    try {
      setSaving(true);
      const response = await fetch(`/api/clothes/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setItem(updatedData);
        setIsEditing(false);
      } else {
        alert("Error saving changes");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving changes");
    } finally {
      setSaving(false);
      router.push("/closet");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/clothes/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/closet");
      } else {
        alert("Error deleting item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item");
    }
  };

  const handleCancel = () => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price?.toString() || "",
        colors: item.colors || [],
        season: item.season || "",
        size: item.size || "",
        link: item.link || "",
        brand: item.brand || "",
        imageUrl: item.imageUrl || "",
        placesToWear: item.placesToWear || [],
      });
    }
    setIsEditing(false);
  };

  if (status === "loading" || loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!item) {
    return <div className="text-center p-8">Item not found</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="flat" onPress={() => router.push("/closet")}>
            ← Back to Closet
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Item" : item.name}
          </h1>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <Button color="primary" onPress={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button color="danger" variant="flat" onPress={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardBody className="p-0">
              <Image
                alt={item.name}
                className="object-cover w-full h-96"
                src={item.imageUrl || "/images/placeholder.png"}
              />
            </CardBody>
          </Card>
        </div>

        <div>
          {!isEditing ? (
            <Card>
              <CardBody className="gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-semibold">{item.name}</p>
                </div>
                {item.brand && (
                  <div>
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="text-lg">{item.brand}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-lg capitalize">{item.category}</p>
                </div>
                {item.price && (
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-lg font-semibold">${item.price}</p>
                  </div>
                )}
                {item.colors && item.colors.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {item.colors.map((color) => (
                        <Chip key={color} variant="flat">
                          {color}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                {item.season && (
                  <div>
                    <p className="text-sm text-gray-500">Season</p>
                    <p className="text-lg capitalize">{item.season}</p>
                  </div>
                )}
                {item.size && (
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="text-lg">{item.size}</p>
                  </div>
                )}
                {item.placesToWear && item.placesToWear.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Places to Wear</p>
                    <div className="flex flex-wrap gap-2">
                      {item.placesToWear.map((place) => (
                        <Chip key={place} color="primary" variant="flat">
                          {place}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                {item.link && (
                  <div>
                    <p className="text-sm text-gray-500">Link</p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Product
                    </a>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="gap-4">
                <Input
                  isRequired
                  label="Name"
                  placeholder="e.g., Blue Denim Jacket"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  label="Brand"
                  placeholder="e.g., Aritzia, Zara, H&M"
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
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
                  selectedKeys={new Set(formData.colors || [])}
                  selectionMode="multiple"
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
                  selectedKeys={new Set(formData.placesToWear || [])}
                  selectionMode="multiple"
                  onSelectionChange={(keys) => {
                    const selectedArray = Array.from(keys) as string[];
                    setFormData({ ...formData, placesToWear: selectedArray });
                  }}
                >
                  {occasions.map((occasion) => (
                    <SelectItem key={occasion}>{occasion}</SelectItem>
                  ))}
                </Select>

                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="flat" onPress={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    isLoading={saving}
                    onPress={handleSave}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
