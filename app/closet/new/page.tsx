"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Spinner,
  Textarea,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  colors,
  occasions,
  seasons,
  categories,
  colorMap,
  materials,
  conditions,
} from "@/lib/data";
import { ImageUpload } from "@/components/closet/ImageUpload";

export default function NewItemPage() {
  const { status } = useSession();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload");
  const [isScraping, setIsScraping] = useState(false);

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
    materials: [] as string[],
    condition: "excellent" as string,
    careInstructions: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleAutoFill = async () => {
    if (!formData.link) return;

    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.link }),
      });

      const data = await res.json();

      if (res.status === 403 || data.blocked) {
        alert(
          data.message ||
            "Unable to import from this site. Please enter details manually.",
        );
        if (data.prefill) {
          setFormData((prev) => ({
            ...prev,
            brand: data.prefill.brand || prev.brand,
            link: data.prefill.link || prev.link,
          }));
        }
      } else if (res.ok && !data.blocked) {
        setFormData((prev) => ({
          ...prev,
          name: data.name || prev.name,
          brand: data.brand || prev.brand,
          imageUrl: data.imageUrl || prev.imageUrl,
          price: data.price ? String(data.price) : prev.price,
          link: data.link || prev.link,
        }));

        if (data.imageUrl) {
          setImageMethod("url");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Unable to import. Please enter details manually.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      alert("Please fill in Name and Category.");
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
      colors: formData.colors.length > 0 ? formData.colors : null,
      placesToWear:
        formData.placesToWear.length > 0 ? formData.placesToWear : null,
      materials: formData.materials.length > 0 ? formData.materials : null,
      condition: formData.condition || "excellent",
      careInstructions: formData.careInstructions.trim() || null,
    };

    try {
      setSaving(true);
      const response = await fetch("/api/clothes?status=owned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) router.push("/closet");
      else alert("Error saving item");
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving item");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 sm:mb-12">
        <Button
          isIconOnly
          variant="light"
          radius="full"
          onPress={() => router.back()}
          className="text-default-500 hover:text-foreground"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic">
            New Acquisition
          </h1>
          <p className="text-xs uppercase tracking-widest text-default-500">
            Add a piece to your collection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-5 flex flex-col w-full gap-6">
          <div className="relative w-full top-6">
            <Tabs
              fullWidth
              selectedKey={imageMethod}
              onSelectionChange={(key) =>
                setImageMethod(key as "upload" | "url")
              }
              radius="sm"
              size="md"
              classNames={{
                base: "w-full mb-4",
                tabList: "bg-default-100 p-1 gap-2",
                cursor: "bg-background shadow-sm",
                tab: "h-9",
                tabContent:
                  "group-data-[selected=true]:text-foreground text-default-500 font-medium",
              }}
            >
              <Tab key="upload" title="Upload File" />
              <Tab key="url" title="External URL" />
            </Tabs>

            <div className="aspect-[3/4] bg-content2 border border-dashed border-default-300 rounded-lg overflow-hidden relative transition-colors hover:border-default-400">
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
                <div className="w-full h-full flex flex-col items-center justify-center p-6">
                  {formData.imageUrl ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      {/* Remove Button - Always visible on mobile, hover on desktop */}
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="solid"
                        className="absolute top-2 right-2 shadow-lg z-10"
                        onPress={() =>
                          setFormData({ ...formData, imageUrl: "" })
                        }
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full space-y-4">
                      <Input
                        label="Image URL"
                        placeholder="https://"
                        variant="bordered"
                        radius="sm"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        classNames={{
                          inputWrapper: "bg-background",
                        }}
                      />
                      <p className="text-xs text-default-400 text-center">
                        Paste a direct link to an image
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="mt-4 text-[10px] text-default-400 text-center uppercase tracking-wider">
              Supported: JPG, PNG, WEBP • Max 10MB
            </p>
          </div>
        </div>

        {/* Right Column: Form Data */}
        <div className="lg:col-span-7 flex flex-col gap-8 sm:gap-10">
          {/* Auto Import Section */}
          <section className="pb-8 border-b border-divider">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Auto Import
              </h3>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Input
                placeholder="Paste product URL to auto-fill"
                variant="bordered"
                radius="sm"
                classNames={{
                  input: "text-sm",
                  inputWrapper:
                    "border-default-300 bg-background hover:border-default-400",
                }}
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
              <Button
                radius="sm"
                className="bg-foreground text-background font-medium tracking-wide uppercase text-xs px-6 sm:px-8"
                isLoading={isScraping}
                onPress={handleAutoFill}
              >
                Import
              </Button>
            </div>
          </section>

          {/* Core Details */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-default-500">
              Item Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                isRequired
                label="Name"
                placeholder="Ex: Vintage Leather Jacket"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                classNames={{ inputWrapper: "border-default-300" }}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Brand"
                placeholder="Ex: Acne Studios"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                classNames={{ inputWrapper: "border-default-300" }}
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Select
                isRequired
                label="Category"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                placeholder="Select category"
                classNames={{ trigger: "border-default-300" }}
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
                placeholder="0.00"
                type="number"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                classNames={{ inputWrapper: "border-default-300" }}
                startContent={
                  <span className="text-default-400 text-sm">$</span>
                }
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                type="date"
                label="Purchase Date"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                classNames={{ inputWrapper: "border-default-300" }}
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
              />
              <Input
                label="Size"
                placeholder="Ex: M, 32, 8"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                classNames={{ inputWrapper: "border-default-300" }}
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
              />
            </div>
          </section>

          {/* Attributes */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-default-500">
              Attributes
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <Select
                label="Colors"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                placeholder="Select colors"
                selectionMode="multiple"
                classNames={{ trigger: "border-default-300" }}
                selectedKeys={new Set(formData.colors)}
                onSelectionChange={(keys) => {
                  setFormData({
                    ...formData,
                    colors: Array.from(keys) as string[],
                  });
                }}
              >
                {colors.map((color) => (
                  <SelectItem
                    key={color}
                    textValue={color}
                    startContent={
                      <div
                        className="w-4 h-4 rounded-full border border-default-200 shadow-sm"
                        style={{ background: colorMap[color] || color }}
                      />
                    }
                  >
                    {color}
                  </SelectItem>
                ))}
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Select
                  label="Season"
                  labelPlacement="outside"
                  variant="bordered"
                  radius="sm"
                  placeholder="Select seasons"
                  selectionMode="multiple"
                  classNames={{ trigger: "border-default-300" }}
                  selectedKeys={new Set(formData.season)}
                  onSelectionChange={(keys) =>
                    setFormData({
                      ...formData,
                      season: Array.from(keys) as string[],
                    })
                  }
                >
                  {seasons.map((season) => (
                    <SelectItem key={season}>{season}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Occasions"
                  labelPlacement="outside"
                  variant="bordered"
                  radius="sm"
                  placeholder="Select occasions"
                  selectionMode="multiple"
                  classNames={{ trigger: "border-default-300" }}
                  selectedKeys={new Set(formData.placesToWear)}
                  onSelectionChange={(keys) => {
                    setFormData({
                      ...formData,
                      placesToWear: Array.from(keys) as string[],
                    });
                  }}
                >
                  {occasions.map((occ) => (
                    <SelectItem key={occ}>{occ}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </section>

          {/* Care & Condition */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-default-500">
              Care & Condition
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <Select
                label="Materials"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                placeholder="Select materials"
                selectionMode="multiple"
                classNames={{ trigger: "border-default-300" }}
                selectedKeys={new Set(formData.materials)}
                onSelectionChange={(keys) => {
                  setFormData({
                    ...formData,
                    materials: Array.from(keys) as string[],
                  });
                }}
              >
                {materials.map((material) => (
                  <SelectItem key={material}>{material}</SelectItem>
                ))}
              </Select>

              <Select
                label="Condition"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                placeholder="Select condition"
                classNames={{ trigger: "border-default-300" }}
                selectedKeys={formData.condition ? [formData.condition] : []}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
              >
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </SelectItem>
                ))}
              </Select>

              <Textarea
                label="Care Instructions"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                placeholder="e.g., Hand wash cold, lay flat to dry..."
                classNames={{ inputWrapper: "border-default-300" }}
                value={formData.careInstructions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    careInstructions: e.target.value,
                  })
                }
                minRows={3}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="pt-8 flex flex-col-reverse sm:flex-row gap-4 mt-auto">
            <Button
              fullWidth
              variant="bordered"
              radius="sm"
              className="h-12 uppercase tracking-widest font-medium border-default-300 hover:bg-default-100"
              onPress={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              color="primary"
              radius="sm"
              isLoading={saving}
              className="h-12 uppercase tracking-widest font-bold shadow-lg shadow-primary/20"
              onPress={handleSubmit}
            >
              Add to Closet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
