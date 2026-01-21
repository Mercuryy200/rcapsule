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
  Chip,
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
  conditions,
  purchaseTypes,
  materials,
  silhouettes,
  styles,
  necklines,
  patterns,
  lengths,
  fits,
  currencies,
} from "@/lib/data";
import { ImageUpload } from "@/components/closet/ImageUpload";

export default function NewItemPage() {
  const { status } = useSession();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload");
  const [isScraping, setIsScraping] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    category: "",
    brand: "",
    description: "",
    imageUrl: "",
    status: "owned" as "owned" | "wishlist",

    // Purchase Info
    price: "",
    originalPrice: "",
    purchaseDate: "",
    purchaseLocation: "",
    purchaseType: "",
    purchaseCurrency: "CAD",
    link: "",

    // Physical Attributes
    size: "",
    colors: [] as string[],
    season: [] as string[],
    materials: "", // Changed to string for free-form composition
    condition: "excellent",

    // Style Details
    style: "",
    silhouette: "",
    pattern: "",
    neckline: "",
    length: "",
    fit: "",
    placesToWear: [] as string[],

    // Care & Sustainability
    careInstructions: "",
    sustainability: "",

    // Tags
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  /* const handleAutoFill = async () => {
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
*/
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      alert("Please fill in Name and Category.");
      return;
    }

    const data = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      originalPrice: formData.originalPrice
        ? parseFloat(formData.originalPrice)
        : null,
      brand: formData.brand.trim() || null,
      season: formData.season.length > 0 ? formData.season : null,
      size: formData.size || null,
      link: formData.link || null,
      imageUrl: formData.imageUrl || null,
      purchaseDate: formData.purchaseDate || null,
      colors: formData.colors.length > 0 ? formData.colors : null,
      placesToWear:
        formData.placesToWear.length > 0 ? formData.placesToWear : null,
      materials: formData.materials || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
      careInstructions: formData.careInstructions || null,
      sustainability: formData.sustainability || null,
      description: formData.description || null,
      style: formData.style || null,
      silhouette: formData.silhouette || null,
      pattern: formData.pattern || null,
      neckline: formData.neckline || null,
      length: formData.length || null,
      fit: formData.fit || null,
      purchaseLocation: formData.purchaseLocation || null,
      purchaseType: formData.purchaseType || null,
      condition: formData.condition,
      purchaseCurrency: formData.purchaseCurrency,
    };

    try {
      setSaving(true);
      const response = await fetch(`/api/clothes?status=${formData.status}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push(formData.status === "wishlist" ? "/wishlist" : "/closet");
      } else {
        alert("Error saving item");
      }
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
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <div className="flex items-center gap-4">
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

        {/* Status Toggle */}
        <Tabs
          selectedKey={formData.status}
          onSelectionChange={(key) =>
            setFormData({ ...formData, status: key as "owned" | "wishlist" })
          }
          size="sm"
          radius="sm"
          classNames={{
            tabList: "bg-default-100 p-1",
            cursor: "bg-background shadow-sm",
            tab: "px-4 h-8",
          }}
        >
          <Tab key="owned" title="Owned" />
          <Tab key="wishlist" title="Wishlist" />
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Left Column: Image Upload */}
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

        {/* Right Column: Form with Tabs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Auto Import Section */}
          {/*
          <section className="pb-6 border-b border-divider">
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
          */}
          {/* Tabbed Form Sections */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            classNames={{
              base: "w-full",
              tabList: "w-full bg-default-100 p-1",
              cursor: "bg-background shadow-sm",
              tab: "h-9 text-xs",
              panel: "pt-6",
            }}
          >
            {/* Basic Info Tab */}
            <Tab key="basic" title="Basic Info">
              <div className="space-y-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <Textarea
                  label="Description"
                  placeholder="Add any notes or details about this piece..."
                  labelPlacement="outside"
                  variant="bordered"
                  radius="sm"
                  minRows={3}
                  classNames={{ inputWrapper: "border-default-300" }}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Condition"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    classNames={{ trigger: "border-default-300" }}
                    selectedKeys={
                      formData.condition ? [formData.condition] : []
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                  >
                    {conditions.map((cond) => (
                      <SelectItem key={cond} className="capitalize">
                        {cond}
                      </SelectItem>
                    ))}
                  </Select>

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
              </div>
            </Tab>

            {/* Purchase Info Tab */}
            <Tab key="purchase" title="Purchase">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      label="Current Price"
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
                  <div className="space-y-2">
                    <Input
                      label="Original Price"
                      placeholder="0.00"
                      type="number"
                      labelPlacement="outside"
                      variant="bordered"
                      radius="sm"
                      classNames={{ inputWrapper: "border-default-300" }}
                      startContent={
                        <span className="text-default-400 text-sm">$</span>
                      }
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Currency"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    classNames={{ trigger: "border-default-300" }}
                    selectedKeys={[formData.purchaseCurrency]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseCurrency: e.target.value,
                      })
                    }
                  >
                    {currencies.map((curr) => (
                      <SelectItem key={curr}>{curr}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="date"
                    label="Purchase Date"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    classNames={{ inputWrapper: "border-default-300" }}
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Purchase Location"
                    placeholder="Store name or location"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    classNames={{ inputWrapper: "border-default-300" }}
                    value={formData.purchaseLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseLocation: e.target.value,
                      })
                    }
                  />

                  <Select
                    label="Purchase Type"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    placeholder="Select type"
                    classNames={{ trigger: "border-default-300" }}
                    selectedKeys={
                      formData.purchaseType ? [formData.purchaseType] : []
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseType: e.target.value,
                      })
                    }
                  >
                    {purchaseTypes.map((type) => (
                      <SelectItem key={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </Tab>

            {/* Style Details Tab */}
            <Tab key="style" title="Style">
              <div className="space-y-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Style"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    placeholder="Select style"
                    classNames={{ trigger: "border-default-300" }}
                    selectedKeys={formData.style ? [formData.style] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, style: e.target.value })
                    }
                  >
                    {styles.map((s) => (
                      <SelectItem key={s}>{s}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Silhouette"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    placeholder="Select silhouette"
                    classNames={{ trigger: "border-default-300" }}
                    selectedKeys={
                      formData.silhouette ? [formData.silhouette] : []
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, silhouette: e.target.value })
                    }
                  >
                    {silhouettes.map((s) => (
                      <SelectItem key={s}>{s}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Pattern"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    placeholder="Select pattern"
                    classNames={{ trigger: "border-default-300" }}
                    selectedKeys={formData.pattern ? [formData.pattern] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, pattern: e.target.value })
                    }
                  >
                    {patterns.map((p) => (
                      <SelectItem key={p}>{p}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Fit"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    placeholder="Select fit"
                    classNames={{ trigger: "border-default-300" }}
                    selectedKeys={formData.fit ? [formData.fit] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, fit: e.target.value })
                    }
                  >
                    {fits.map((f) => (
                      <SelectItem key={f}>{f}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Length"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    placeholder="Select length"
                    classNames={{ trigger: "border-default-300" }}
                    selectedKeys={formData.length ? [formData.length] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, length: e.target.value })
                    }
                  >
                    {lengths.map((l) => (
                      <SelectItem key={l}>{l}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Neckline"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="sm"
                    placeholder="Select neckline"
                    classNames={{ trigger: "border-default-300" }}
                    selectedKeys={formData.neckline ? [formData.neckline] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, neckline: e.target.value })
                    }
                  >
                    {necklines.map((n) => (
                      <SelectItem key={n}>{n}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </Tab>

            {/* Materials & Care Tab */}
            {/* Materials & Care Tab */}
            <Tab key="materials" title="Materials">
              <div className="space-y-6">
                <Textarea
                  label="Material Composition"
                  placeholder="Body:\n81% Nylon, 19% Lycra Elastane\n\nLining:\n56% Polyester, 33% Coolmax Polyester, 11% Lycra Elastane"
                  labelPlacement="outside"
                  variant="bordered"
                  radius="sm"
                  minRows={5}
                  classNames={{ inputWrapper: "border-default-300" }}
                  value={formData.materials}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      materials: e.target.value,
                    })
                  }
                  description="Specify material composition including percentages and part names (Body, Lining, etc.)"
                />

                <Textarea
                  label="Care Instructions"
                  placeholder="Washing, drying, and storage instructions..."
                  labelPlacement="outside"
                  variant="bordered"
                  radius="sm"
                  minRows={3}
                  classNames={{ inputWrapper: "border-default-300" }}
                  value={formData.careInstructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      careInstructions: e.target.value,
                    })
                  }
                />

                <Textarea
                  label="Sustainability Notes"
                  placeholder="Certifications, eco-friendly materials, brand values..."
                  labelPlacement="outside"
                  variant="bordered"
                  radius="sm"
                  minRows={3}
                  classNames={{ inputWrapper: "border-default-300" }}
                  value={formData.sustainability}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sustainability: e.target.value,
                    })
                  }
                />
              </div>
            </Tab>

            {/* Tags Tab */}
            <Tab key="tags" title="Tags">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    variant="bordered"
                    radius="sm"
                    classNames={{ inputWrapper: "border-default-300" }}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button radius="sm" variant="bordered" onPress={handleAddTag}>
                    Add
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-default-50 rounded-lg">
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        onClose={() => handleRemoveTag(tag)}
                        variant="flat"
                        radius="sm"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                )}

                <p className="text-xs text-default-400">
                  Use tags to organize and search your items (e.g., "vintage",
                  "investment piece", "needs repair")
                </p>
              </div>
            </Tab>
          </Tabs>
          {/* Submit Buttons */}
          <div className="pt-6 flex flex-col-reverse sm:flex-row gap-4 border-t border-divider">
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
              Add to {formData.status === "wishlist" ? "Wishlist" : "Closet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
