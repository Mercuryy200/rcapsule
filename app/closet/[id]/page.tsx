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
  Spinner,
  Textarea,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type { Clothes } from "@/lib/database.type";
import { colors, occasions, seasons, categories, colorMap } from "@/lib/data";
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
    season: [] as string[],
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

        // Normalize data for form
        let seasonData: string[] = [];
        if (Array.isArray(data.season)) {
          seasonData = data.season;
        } else if (typeof data.season === "string" && data.season) {
          seasonData = [data.season];
        }

        setFormData({
          name: data.name,
          category: data.category,
          price: data.price?.toString() || "",
          colors: data.colors || [],
          season: seasonData,
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
      season: formData.season.length > 0 ? formData.season : null,
      size: formData.size || null,
      link: formData.link || null,
      imageUrl: formData.imageUrl || null,
      purchaseDate: formData.purchaseDate || null,
      placesToWear:
        formData.placesToWear.length > 0 ? formData.placesToWear : null,
      colors: formData.colors.length > 0 ? formData.colors : null,
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
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="light"
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
          className="uppercase tracking-widest text-xs font-bold pl-0 text-default-500 hover:text-foreground"
          onPress={() => router.push("/closet")}
        >
          Back to Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left Column: Image Display */}
        <div className="relative w-full aspect-[3/4] sm:aspect-auto sm:h-[600px] bg-content2 rounded-lg overflow-hidden shadow-inner">
          {item.imageUrl ? (
            <Image
              alt={item.name}
              src={item.imageUrl}
              radius="none"
              removeWrapper
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-default-300">
              <span className="text-6xl font-thin">No Image</span>
            </div>
          )}
        </div>

        {/* Right Column: Details or Edit Form */}
        <div className="flex flex-col">
          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                {item.brand && (
                  <h2 className="text-sm font-bold uppercase tracking-widest text-default-500 mb-2">
                    {item.brand}
                  </h2>
                )}
                <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter italic leading-none mb-4 break-words">
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

              <div className="grid grid-cols-2 gap-y-8 gap-x-4 text-sm">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-1">
                    Category
                  </span>
                  <span className="capitalize text-lg">{item.category}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-1">
                    Size
                  </span>
                  <span className="text-lg">{item.size || "N/A"}</span>
                </div>

                {/* Season Display - Fixed undefined error by using map index */}
                <div className="col-span-2 sm:col-span-1">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-1">
                    Season
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(item.season) && item.season.length > 0 ? (
                      item.season.map((s, index, arr) => (
                        <span key={s} className="capitalize">
                          {s}
                          {index !== arr.length - 1 ? ", " : ""}
                        </span>
                      ))
                    ) : (
                      <span className="capitalize">
                        {typeof item.season === "string" && item.season
                          ? item.season
                          : "All Season"}
                      </span>
                    )}
                  </div>
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
                          className="w-6 h-6 rounded-full border border-default-200 shadow-sm"
                          style={{ background: colorMap[color] || color }}
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
                        className="px-3 py-1 bg-default-100 rounded-full text-xs font-medium uppercase tracking-wider"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-8 flex flex-col gap-4 mt-auto">
                {item.link && (
                  <Button
                    as="a"
                    href={item.link}
                    target="_blank"
                    variant="solid"
                    radius="sm"
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
                    fullWidth
                    variant="bordered"
                    radius="sm"
                    className="font-medium uppercase tracking-wider border-default-300"
                    startContent={<PencilSquareIcon className="w-4 h-4" />}
                    onPress={() => setIsEditing(true)}
                  >
                    Edit Details
                  </Button>
                  <Button
                    isIconOnly
                    variant="flat"
                    radius="sm"
                    color="danger"
                    className="font-medium"
                    onPress={handleDelete}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 bg-content1 p-1 sm:p-6 rounded-lg">
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
                  radius="sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  classNames={{ inputWrapper: "border-default-300" }}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Brand"
                    variant="bordered"
                    radius="sm"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    classNames={{ inputWrapper: "border-default-300" }}
                  />
                  <Select
                    label="Category"
                    variant="bordered"
                    radius="sm"
                    selectedKeys={formData.category ? [formData.category] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    classNames={{ trigger: "border-default-300" }}
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
                    radius="sm"
                    startContent={<span className="text-default-400">$</span>}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    classNames={{ inputWrapper: "border-default-300" }}
                  />
                  <Input
                    label="Size"
                    variant="bordered"
                    radius="sm"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                    classNames={{ inputWrapper: "border-default-300" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Purchase Date"
                    variant="bordered"
                    radius="sm"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseDate: e.target.value,
                      })
                    }
                    classNames={{ inputWrapper: "border-default-300" }}
                  />
                  <Input
                    label="Product Link"
                    placeholder="https://..."
                    variant="bordered"
                    radius="sm"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    classNames={{ inputWrapper: "border-default-300" }}
                  />
                </div>

                <Select
                  label="Colors"
                  variant="bordered"
                  radius="sm"
                  selectionMode="multiple"
                  selectedKeys={new Set(formData.colors || [])}
                  onSelectionChange={(keys) =>
                    setFormData({
                      ...formData,
                      colors: Array.from(keys) as string[],
                    })
                  }
                  classNames={{ trigger: "border-default-300" }}
                >
                  {colors.map((color) => (
                    <SelectItem
                      key={color}
                      startContent={
                        <div
                          className="w-4 h-4 rounded-full border border-default-200"
                          style={{ background: colorMap[color] || color }}
                        />
                      }
                    >
                      {color}
                    </SelectItem>
                  ))}
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Season"
                    variant="bordered"
                    radius="sm"
                    selectionMode="multiple"
                    selectedKeys={new Set(formData.season || [])}
                    onSelectionChange={(keys) =>
                      setFormData({
                        ...formData,
                        season: Array.from(keys) as string[],
                      })
                    }
                    classNames={{ trigger: "border-default-300" }}
                  >
                    {seasons.map((s) => (
                      <SelectItem key={s}>{s}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Occasions"
                    variant="bordered"
                    radius="sm"
                    selectionMode="multiple"
                    selectedKeys={new Set(formData.placesToWear || [])}
                    onSelectionChange={(keys) =>
                      setFormData({
                        ...formData,
                        placesToWear: Array.from(keys) as string[],
                      })
                    }
                    classNames={{ trigger: "border-default-300" }}
                  >
                    {occasions.map((o) => (
                      <SelectItem key={o}>{o}</SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Edit Image Section */}
                <div className="pt-4 border-t border-divider">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-default-500">
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
                        cursor: "bg-background shadow-sm",
                        tab: "px-6 h-9",
                        tabContent:
                          "group-data-[selected=true]:text-foreground text-default-500 font-medium",
                      }}
                    >
                      <Tab key="upload" title="Upload" />
                      <Tab key="url" title="URL" />
                    </Tabs>

                    <div className="aspect-[3/4] sm:aspect-video bg-content2 border border-dashed border-default-300 rounded-lg overflow-hidden relative">
                      {imageMethod === "upload" ? (
                        <div className="w-full h-full flex items-center justify-center">
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
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-4">
                          {formData.imageUrl ? (
                            <div className="relative w-full h-full group">
                              <img
                                src={formData.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-contain rounded-md"
                              />
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="solid"
                                className="absolute top-2 right-2 shadow-lg"
                                onPress={() =>
                                  setFormData({ ...formData, imageUrl: "" })
                                }
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-full max-w-xs space-y-2">
                              <Input
                                label="Image URL"
                                placeholder="https://"
                                variant="bordered"
                                radius="sm"
                                value={formData.imageUrl}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    imageUrl: e.target.value,
                                  })
                                }
                                classNames={{ inputWrapper: "bg-background" }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  fullWidth
                  color="primary"
                  radius="sm"
                  className="h-12 font-bold uppercase tracking-widest mt-4 shadow-lg shadow-primary/20"
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
