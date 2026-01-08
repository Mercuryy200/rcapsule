// app/closet/new/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { colors, occasions, seasons, categories } from "@/lib/data";
import { ImageUpload } from "@/components/closet/ImageUpload";

export default function NewItemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload");

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
    }
  }, [status, router]);

  const handleSubmit = async () => {
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
      const response = await fetch("/api/clothes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/closet");
      } else {
        alert("Error saving item");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving item");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="solid" onPress={() => router.push("/closet")}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Add New Item</h1>
      </div>

      <Card>
        <CardBody className="gap-4">
          <Input
            isRequired
            label="Name"
            placeholder="e.g., Blue Denim Jacket"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          />
          <Input
            label="Link"
            placeholder="https://..."
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />

          {/* Image Upload Section with Tabs */}
          <div className="space-y-2">
            <Tabs
              selectedKey={imageMethod}
              onSelectionChange={(key) =>
                setImageMethod(key as "upload" | "url")
              }
              aria-label="Image input method"
              color="primary"
              size="sm"
            >
              <Tab key="upload" title="Upload Image" />
              <Tab key="url" title="Image URL" />
            </Tabs>

            {imageMethod === "upload" ? (
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                folder="clothes"
                label="Clothing Image"
              />
            ) : (
              <Input
                label="Image URL"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                description="Paste a direct link to an image"
              />
            )}
          </div>

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
            <Button variant="solid" onPress={() => router.push("/closet")}>
              Cancel
            </Button>
            <Button color="primary" isLoading={saving} onPress={handleSubmit}>
              Add Item
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
