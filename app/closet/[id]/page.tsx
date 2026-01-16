"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Image,
  Divider,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

import type { Clothes } from "@/lib/database.type";
import { colors, occasions, seasons, categories } from "@/lib/data";
import { ImageUpload } from "@/components/closet/ImageUpload";

export default function ItemPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload");

  const [item, setItem] = useState<Clothes | null>(null);

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
    purchaseDate: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchItem();
  }, [status, router, itemId]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/clothes/${itemId}`);
      if (response.ok) {
        const data: Clothes = await response.json();
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
          purchaseDate: data.purchaseDate
            ? data.purchaseDate.split("T")[0]
            : "",
        });

        if (data.imageUrl && !data.imageUrl.startsWith("https")) {
          setImageMethod("upload");
        } else {
          setImageMethod("url");
        }
      } else {
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
      alert("Name and Category are required.");
      return;
    }

    const data = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      brand: formData.brand.trim() || null,
      season: formData.season || null,
      size: formData.size || null,
      link: formData.link || null,
      imageUrl: formData.imageUrl || null,
      purchaseDate: formData.purchaseDate || null,
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
        const updatedData: Clothes = await response.json();
        setItem(updatedData);
        setIsEditing(false);
      } else {
        alert("Error saving changes");
      }
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this piece from your collection?")) return;
    try {
      const response = await fetch(`/api/clothes/${itemId}`, {
        method: "DELETE",
      });
      if (response.ok) router.push("/closet");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (status === "loading" || loading || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Button
          variant="light"
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
          className="uppercase tracking-widest text-xs font-bold pl-0"
          onPress={() => router.push("/closet")}
        >
          Back to Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
        <div className="relative w-full bg-content2">
          <Image
            alt={item.name}
            src={item.imageUrl || "/images/placeholder.png"}
            radius="none"
            className="w-full h-full object-cover"
            classNames={{ wrapper: "w-full h-full" }}
          />
        </div>

        <div className="flex flex-col justify-center">
          {!isEditing ? (
            <div className="space-y-8">
              <div>
                {item.brand && (
                  <h2 className="text-sm font-bold uppercase tracking-widest text-default-500 mb-2">
                    {item.brand}
                  </h2>
                )}
                <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none mb-4">
                  {item.name}
                </h1>

                <div className="flex items-baseline gap-4">
                  {item.price && (
                    <p className="text-2xl font-light text-foreground">
                      ${item.price.toFixed(2)}
                    </p>
                  )}
                  {item.purchaseDate && (
                    <p className="text-xs text-default-400 uppercase tracking-widest flex items-center gap-1">
                      <CalendarDaysIcon className="w-3 h-3" />
                      Acquired:{" "}
                      {new Date(item.purchaseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <Divider />

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-1">
                    Category
                  </span>
                  <span className="capitalize">{item.category}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-1">
                    Size
                  </span>
                  <span>{item.size || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-1">
                    Season
                  </span>
                  <span className="capitalize">
                    {item.season || "All Season"}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-2">
                    Colors
                  </span>
                  {item.colors && item.colors.length > 0 ? (
                    <div className="flex gap-2">
                      {item.colors.map((color) => (
                        <div
                          key={color}
                          className="w-5 h-5 rounded-full border border-default-200 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </div>

              {item.placesToWear && item.placesToWear.length > 0 && (
                <div className="pt-2">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-2">
                    Best For
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.placesToWear.map((place) => (
                      <span
                        key={place}
                        className="px-3 py-1 border border-default-200 text-xs uppercase tracking-wider"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-8 flex flex-col gap-4">
                {item.link && (
                  <Button
                    as="a"
                    href={item.link}
                    target="_blank"
                    variant="solid"
                    radius="none"
                    className="w-full bg-foreground text-background font-bold uppercase tracking-widest"
                    endContent={
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    }
                  >
                    View Product Link
                  </Button>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="bordered"
                    radius="none"
                    className="flex-1 font-medium uppercase tracking-wider border-default-300"
                    startContent={<PencilSquareIcon className="w-4 h-4" />}
                    onPress={() => setIsEditing(true)}
                  >
                    Edit Details
                  </Button>
                  <Button
                    variant="light"
                    radius="none"
                    color="danger"
                    className="font-medium uppercase tracking-wider"
                    startContent={<TrashIcon className="w-4 h-4" />}
                    onPress={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center border-b border-divider pb-4">
                <h2 className="text-xl font-bold uppercase tracking-tighter">
                  Edit Piece
                </h2>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Name"
                  variant="bordered"
                  radius="none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Brand"
                    variant="bordered"
                    radius="none"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                  />
                  <Select
                    label="Category"
                    variant="bordered"
                    radius="none"
                    selectedKeys={formData.category ? [formData.category] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <SelectItem key={cat}>{cat}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    variant="bordered"
                    radius="none"
                    startContent={<span className="text-default-400">$</span>}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                  <Input
                    label="Size"
                    variant="bordered"
                    radius="none"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Purchase Date"
                    placeholder="Select date"
                    variant="bordered"
                    radius="none"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                  />
                  <Input
                    label="Product Link"
                    placeholder="https://..."
                    variant="bordered"
                    radius="none"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                  />
                </div>

                <Select
                  label="Colors"
                  variant="bordered"
                  radius="none"
                  selectionMode="multiple"
                  selectedKeys={new Set(formData.colors || [])}
                  onSelectionChange={(keys) =>
                    setFormData({
                      ...formData,
                      colors: Array.from(keys) as string[],
                    })
                  }
                >
                  {colors.map((color) => (
                    <SelectItem
                      key={color}
                      startContent={
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ background: color }}
                        />
                      }
                    >
                      {color}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Season"
                  variant="bordered"
                  radius="none"
                  selectedKeys={formData.season ? [formData.season] : []}
                  onChange={(e) =>
                    setFormData({ ...formData, season: e.target.value })
                  }
                >
                  {seasons.map((s) => (
                    <SelectItem key={s}>{s}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Occasions"
                  variant="bordered"
                  radius="none"
                  selectionMode="multiple"
                  selectedKeys={new Set(formData.placesToWear || [])}
                  onSelectionChange={(keys) =>
                    setFormData({
                      ...formData,
                      placesToWear: Array.from(keys) as string[],
                    })
                  }
                >
                  {occasions.map((o) => (
                    <SelectItem key={o}>{o}</SelectItem>
                  ))}
                </Select>

                <div className="pt-4 border-t border-divider">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3">
                    Update Image
                  </h3>

                  <div className="flex flex-col gap-4">
                    <Tabs
                      selectedKey={imageMethod}
                      onSelectionChange={(key) =>
                        setImageMethod(key as "upload" | "url")
                      }
                      radius="sm"
                      size="sm"
                      classNames={{
                        base: "w-auto",
                        tabList: "bg-default-100 p-1 gap-2",
                        cursor: "bg-foreground",
                        tab: "px-6 h-9",
                        tabContent:
                          "group-data-[selected=true]:text-background text-default-600 font-medium",
                      }}
                    >
                      <Tab key="upload" title="Upload" />
                      <Tab key="url" title="URL" />
                    </Tabs>

                    {imageMethod === "upload" ? (
                      <div className="h-48 border-2 border-dashed border-default-200">
                        <ImageUpload
                          value={formData.imageUrl}
                          onChange={(url) =>
                            setFormData({ ...formData, imageUrl: url })
                          }
                          folder="clothes"
                          label="Drop image here"
                        />
                      </div>
                    ) : (
                      <Input
                        label="Image URL"
                        variant="bordered"
                        radius="none"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                      />
                    )}
                  </div>
                </div>

                <Button
                  fullWidth
                  color="primary"
                  radius="none"
                  className="font-bold uppercase tracking-widest mt-4 shadow-lg shadow-primary/20"
                  isLoading={saving}
                  onPress={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
