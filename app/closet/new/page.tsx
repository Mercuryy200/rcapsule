"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Input, Select, SelectItem, Tabs, Tab } from "@heroui/react";
import { ArrowLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { colors, occasions, seasons, categories } from "@/lib/data";
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
  }, [status, router]);

  const handleAutoFill = async () => {
    if (!formData.link) {
      return;
    }

    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.link }),
      });

      const data = await res.json();

      if (res.status === 403 || data.blocked) {
        // Only alert on failure
        alert(
          data.message ||
            "Unable to import from this site. Please enter details manually."
        );

        if (data.prefill) {
          setFormData((prev) => ({
            ...prev,
            brand: data.prefill.brand || prev.brand,
            link: data.prefill.link || prev.link,
          }));
        }
      } else if (res.ok && !data.blocked) {
        // Silent success - just fill the form
        setFormData((prev) => ({
          ...prev,
          name: data.name || prev.name,
          brand: data.brand || prev.brand,
          imageUrl: data.imageUrl || prev.imageUrl,
          price: data.price || prev.price,
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
      season: formData.season || null,
      size: formData.size || null,
      link: formData.link || null,
      imageUrl: formData.imageUrl || null,
      purchaseDate: formData.purchaseDate || null,
    };

    try {
      setSaving(true);
      const response = await fetch("/api/clothes", {
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

  if (status === "loading") return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-12">
        <Button
          isIconOnly
          variant="light"
          radius="full"
          onPress={() => router.back()}
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            New Acquisition
          </h1>
          <p className="text-xs uppercase tracking-widest text-default-500">
            Add a piece to your collection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 flex flex-col w-full gap-6">
          <div className="relative w-full">
            <div className="flex justify-center mb-4">
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
                <Tab key="upload" title="Upload File" />
                <Tab key="url" title="External URL" />
              </Tabs>
            </div>
            <div className="aspect-[3/4] bg-content2 border-2 border-dashed border-default-300 rounded-lg overflow-hidden">
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
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
                  {formData.imageUrl ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onPress={() =>
                          setFormData({ ...formData, imageUrl: "" })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full max-w-md space-y-4">
                      <Input
                        label="Image URL"
                        placeholder="https://example.com/image.jpg"
                        variant="bordered"
                        radius="sm"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        classNames={{
                          input: "text-sm",
                          inputWrapper: "border-default-300",
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
          </div>

          <p className="text-[10px] text-default-400 text-center uppercase tracking-wider">
            Supported: JPG, PNG, WEBP • Max 10MB
          </p>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <section className="pb-8 border-b border-black/10">
            <div className="flex items-center gap-2 mb-6">
              <SparklesIcon className="w-4 h-4 text-black/60" />
              <h3 className="text-[10px] font-light uppercase tracking-[0.25em] text-black/60">
                Auto Import
              </h3>
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="Paste product URL"
                variant="bordered"
                radius="none"
                classNames={{
                  input: "text-sm font-light",
                  inputWrapper:
                    "border-black/20 hover:border-black/40 bg-white",
                }}
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
              <Button
                radius="none"
                className="bg-black text-white hover:bg-black/90 font-light tracking-[0.15em] uppercase text-[10px] px-8 h-[44px]"
                isLoading={isScraping}
                onPress={handleAutoFill}
              >
                Import
              </Button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-divider pb-2">
              Item Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                isRequired
                label="Name"
                placeholder="Ex: Vintage Leather Jacket"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                classNames={{ inputWrapper: "h-12 border-default-300" }}
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
                classNames={{ inputWrapper: "h-12 border-default-300" }}
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select
                isRequired
                label="Category"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                placeholder="Select..."
                classNames={{ trigger: "h-12 border-default-300" }}
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
                classNames={{ inputWrapper: "h-12 border-default-300" }}
                startContent={
                  <span className="text-default-400 text-sm">$</span>
                }
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="date"
                label="Purchase Date"
                labelPlacement="outside"
                variant="bordered"
                radius="none"
                classNames={{ inputWrapper: "h-12 border-default-300" }}
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
                radius="none"
                classNames={{ inputWrapper: "h-12 border-default-300" }}
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
              />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-divider pb-2">
              Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select
                label="Colors"
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                placeholder="Select..."
                selectionMode="multiple"
                classNames={{ trigger: "border-default-300" }}
                selectedKeys={new Set(formData.colors || [])}
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
                    startContent={
                      <div
                        className="w-3 h-3 rounded-full border border-default-300"
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
                labelPlacement="outside"
                variant="bordered"
                radius="sm"
                placeholder="Select..."
                classNames={{ trigger: "border-default-300" }}
                selectedKeys={formData.season ? [formData.season] : []}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
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
                placeholder="Where will you wear this?"
                selectionMode="multiple"
                classNames={{ trigger: "border-default-300" }}
                selectedKeys={new Set(formData.placesToWear || [])}
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
          </section>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 mt-auto">
            <Button
              fullWidth
              variant="bordered"
              radius="sm"
              className="h-12 uppercase tracking-widest font-medium border-default-400 hover:bg-default-100"
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
