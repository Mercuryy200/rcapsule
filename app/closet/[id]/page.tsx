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
  Chip,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  XMarkIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

import type { Clothes } from "@/lib/database.type";
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

export default function ItemPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState("basic");

  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload");
  const [item, setItem] = useState<Clothes | null>(null);
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    imageUrl: "",
    status: "owned" as "owned" | "wishlist",
    price: "",
    originalPrice: "",
    purchaseDate: "",
    purchaseLocation: "",
    purchaseType: "",
    purchaseCurrency: "CAD",
    link: "",
    size: "",
    colors: [] as string[],
    season: [] as string[],
    materials: "",
    condition: "excellent",
    style: "",
    silhouette: "",
    pattern: "",
    neckline: "",
    length: "",
    fit: "",
    placesToWear: [] as string[],
    careInstructions: "",
    sustainability: "",
    tags: [] as string[],
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

        let seasonData: string[] = [];
        if (Array.isArray(data.season)) {
          seasonData = data.season;
        } else if (typeof data.season === "string" && data.season) {
          seasonData = [data.season];
        }

        setFormData({
          name: data.name,
          category: data.category,
          brand: data.brand || "",
          description: data.description || "",
          imageUrl: data.imageUrl || "",
          status: (data.status as "owned" | "wishlist") || "owned",
          price: data.price?.toString() || "",
          originalPrice: data.originalPrice?.toString() || "",
          purchaseDate: data.purchaseDate
            ? data.purchaseDate.split("T")[0]
            : "",
          purchaseLocation: data.purchaseLocation || "",
          purchaseType: data.purchaseType || "",
          purchaseCurrency: data.purchaseCurrency || "CAD",
          link: data.link || "",
          size: data.size || "",
          colors: data.colors || [],
          season: seasonData,
          materials: data.materials || "",
          condition: data.condition || "excellent",
          style: data.style || "",
          silhouette: data.silhouette || "",
          pattern: data.pattern || "",
          neckline: data.neckline || "",
          length: data.length || "",
          fit: data.fit || "",
          placesToWear: data.placesToWear || [],
          careInstructions: data.careInstructions || "",
          sustainability: data.sustainability || "",
          tags: data.tags || [],
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

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      alert("Name and Category are required.");
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
      purchaseLocation: formData.purchaseLocation || null,
      purchaseType: formData.purchaseType || null,
      placesToWear:
        formData.placesToWear.length > 0 ? formData.placesToWear : null,
      colors: formData.colors.length > 0 ? formData.colors : null,
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
      condition: formData.condition,
      purchaseCurrency: formData.purchaseCurrency,
      status: formData.status,
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
      if (response.ok)
        router.push(item?.status === "wishlist" ? "/wishlist" : "/closet");
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
      <div className="mb-8">
        <Button
          variant="light"
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
          className="uppercase tracking-widest text-xs font-bold pl-0 text-default-500 hover:text-foreground"
          onPress={() =>
            router.push(item.status === "wishlist" ? "/wishlist" : "/closet")
          }
        >
          Back to {item.status === "wishlist" ? "Wishlist" : "Collection"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
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

        <div className="flex flex-col">
          {!isEditing ? (
            <ViewMode
              item={item}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          ) : (
            <EditMode
              formData={formData}
              setFormData={setFormData}
              imageMethod={imageMethod}
              setImageMethod={setImageMethod}
              editTab={editTab}
              setEditTab={setEditTab}
              newTag={newTag}
              setNewTag={setNewTag}
              handleAddTag={handleAddTag}
              handleRemoveTag={handleRemoveTag}
              saving={saving}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// View Mode Component
function ViewMode({
  item,
  onEdit,
  onDelete,
}: {
  item: Clothes;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
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

        <div className="flex flex-wrap items-baseline gap-4">
          {item.price && (
            <p className="text-2xl font-light text-foreground">
              ${item.price.toFixed(2)} {item.purchaseCurrency}
            </p>
          )}
          {item.originalPrice && item.originalPrice !== item.price && (
            <p className="text-lg line-through text-default-400">
              ${item.originalPrice.toFixed(2)}
            </p>
          )}
          {item.purchaseDate && (
            <p className="text-xs text-default-400 uppercase tracking-widest flex items-center gap-1">
              <CalendarDaysIcon className="w-3 h-3" />
              {new Date(item.purchaseDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {item.description && (
          <p className="mt-4 text-sm text-default-600 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <Divider />

      <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
        <DetailItem label="Category" value={item.category} capitalize />
        <DetailItem label="Size" value={item.size || "N/A"} />
        <DetailItem
          label="Condition"
          value={item.condition || "excellent"}
          capitalize
        />
        <DetailItem
          label="Season"
          value={
            Array.isArray(item.season) && item.season.length > 0
              ? item.season.join(", ")
              : typeof item.season === "string" && item.season
                ? item.season
                : "All Season"
          }
          capitalize
        />
      </div>

      {item.colors && item.colors.length > 0 && (
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-2">
            Colors
          </span>
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
        </div>
      )}

      {(item.style || item.silhouette || item.pattern || item.fit) && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-default-400 mb-3">
            Style Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {item.style && <DetailItem label="Style" value={item.style} />}
            {item.silhouette && (
              <DetailItem label="Silhouette" value={item.silhouette} />
            )}
            {item.pattern && (
              <DetailItem label="Pattern" value={item.pattern} />
            )}
            {item.fit && <DetailItem label="Fit" value={item.fit} />}
            {item.length && <DetailItem label="Length" value={item.length} />}
            {item.neckline && (
              <DetailItem label="Neckline" value={item.neckline} />
            )}
          </div>
        </div>
      )}
      {item.materials && (
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-2">
            Material Composition
          </span>
          <p className="text-sm whitespace-pre-wrap">{item.materials}</p>
        </div>
      )}

      {(item.purchaseLocation || item.purchaseType) && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-default-400 mb-3">
            Purchase Info
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {item.purchaseLocation && (
              <DetailItem label="Location" value={item.purchaseLocation} />
            )}
            {item.purchaseType && (
              <DetailItem label="Type" value={item.purchaseType} capitalize />
            )}
          </div>
        </div>
      )}

      {(item.careInstructions || item.sustainability) && (
        <div className="space-y-4">
          {item.careInstructions && (
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-2">
                Care Instructions
              </span>
              <p className="text-sm text-default-600 whitespace-pre-wrap">
                {item.careInstructions}
              </p>
            </div>
          )}
          {item.sustainability && (
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-2">
                Sustainability
              </span>
              <p className="text-sm text-default-600 whitespace-pre-wrap">
                {item.sustainability}
              </p>
            </div>
          )}
        </div>
      )}

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

      {item.tags && item.tags.length > 0 && (
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-2">
            Tags
          </span>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Chip
                key={tag}
                size="sm"
                variant="flat"
                startContent={<TagIcon className="w-3 h-3" />}
              >
                {tag}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {(item.timesworn !== undefined || item.lastwornat) && (
        <div className="bg-default-50 p-4 rounded-lg">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-default-400 mb-3">
            Wear Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-default-500">Times Worn</span>
              <p className="text-lg font-semibold">{item.timesworn || 0}</p>
            </div>
            {item.lastwornat && (
              <div>
                <span className="text-default-500">Last Worn</span>
                <p className="text-lg font-semibold">
                  {new Date(item.lastwornat).toLocaleDateString()}
                </p>
              </div>
            )}
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
            endContent={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
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
            onPress={onEdit}
          >
            Edit Details
          </Button>
          <Button
            isIconOnly
            variant="flat"
            radius="sm"
            color="danger"
            className="font-medium"
            onPress={onDelete}
          >
            <TrashIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-default-400 mb-1">
        {label}
      </span>
      <span className={`text-lg ${capitalize ? "capitalize" : ""}`}>
        {value}
      </span>
    </div>
  );
}

// Edit Mode Component
function EditMode({
  formData,
  setFormData,
  imageMethod,
  setImageMethod,
  editTab,
  setEditTab,
  newTag,
  setNewTag,
  handleAddTag,
  handleRemoveTag,
  saving,
  onSave,
  onCancel,
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 bg-content1 p-1 sm:p-6 rounded-lg max-h-[800px] overflow-y-auto">
      <div className="flex justify-between items-center border-b border-divider pb-4 sticky top-0 bg-content1 z-10">
        <h2 className="text-xl font-bold uppercase tracking-tighter">
          Edit Piece
        </h2>
        <Button size="sm" variant="light" color="danger" onPress={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Image Upload Section */}
      <div className="pb-4 border-b border-divider">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-default-500">
          Update Image
        </h3>
        <Tabs
          selectedKey={imageMethod}
          onSelectionChange={(key) => setImageMethod(key)}
          radius="sm"
          size="sm"
          classNames={{
            base: "w-auto mb-4",
            tabList: "bg-default-100 p-1 gap-2",
            cursor: "bg-background shadow-sm",
            tab: "px-6 h-9",
          }}
        >
          <Tab key="upload" title="Upload" />
          <Tab key="url" title="URL" />
        </Tabs>

        <div className="aspect-video bg-content2 border border-dashed border-default-300 rounded-lg overflow-hidden relative">
          {imageMethod === "upload" ? (
            <div className="w-full h-full flex items-center justify-center">
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
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
                    onPress={() => setFormData({ ...formData, imageUrl: "" })}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Input
                  label="Image URL"
                  placeholder="https://"
                  variant="bordered"
                  radius="sm"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  classNames={{ inputWrapper: "bg-background" }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabbed Edit Sections - Similar structure to new item page but more compact */}
      <Tabs
        selectedKey={editTab}
        onSelectionChange={(key) => setEditTab(key as string)}
        size="sm"
        classNames={{
          base: "w-full",
          tabList: "w-full bg-default-100 p-1",
          cursor: "bg-background shadow-sm",
          tab: "h-8 text-xs",
          panel: "pt-4",
        }}
      >
        <Tab key="basic" title="Basic">
          <div className="space-y-4">
            <Input
              isRequired
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
                isRequired
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

            <Textarea
              label="Description"
              variant="bordered"
              radius="sm"
              minRows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              classNames={{ inputWrapper: "border-default-300" }}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Condition"
                variant="bordered"
                radius="sm"
                selectedKeys={formData.condition ? [formData.condition] : []}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                classNames={{ trigger: "border-default-300" }}
              >
                {conditions.map((cond) => (
                  <SelectItem key={cond} className="capitalize">
                    {cond}
                  </SelectItem>
                ))}
              </Select>
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
          </div>
        </Tab>

        <Tab key="purchase" title="Purchase">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Current Price"
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
                label="Original Price"
                type="number"
                variant="bordered"
                radius="sm"
                startContent={<span className="text-default-400">$</span>}
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value })
                }
                classNames={{ inputWrapper: "border-default-300" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Currency"
                variant="bordered"
                radius="sm"
                selectedKeys={[formData.purchaseCurrency]}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseCurrency: e.target.value })
                }
                classNames={{ trigger: "border-default-300" }}
              >
                {currencies.map((curr) => (
                  <SelectItem key={curr}>{curr}</SelectItem>
                ))}
              </Select>
              <Input
                type="date"
                label="Purchase Date"
                variant="bordered"
                radius="sm"
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
                classNames={{ inputWrapper: "border-default-300" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Purchase Location"
                variant="bordered"
                radius="sm"
                value={formData.purchaseLocation}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseLocation: e.target.value })
                }
                classNames={{ inputWrapper: "border-default-300" }}
              />
              <Select
                label="Purchase Type"
                variant="bordered"
                radius="sm"
                selectedKeys={
                  formData.purchaseType ? [formData.purchaseType] : []
                }
                onChange={(e) =>
                  setFormData({ ...formData, purchaseType: e.target.value })
                }
                classNames={{ trigger: "border-default-300" }}
              >
                {purchaseTypes.map((type) => (
                  <SelectItem key={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Input
              label="Product Link"
              variant="bordered"
              radius="sm"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              classNames={{ inputWrapper: "border-default-300" }}
            />
          </div>
        </Tab>

        <Tab key="style" title="Style">
          <div className="space-y-4">
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
                label="Style"
                variant="bordered"
                radius="sm"
                selectedKeys={formData.style ? [formData.style] : []}
                onChange={(e) =>
                  setFormData({ ...formData, style: e.target.value })
                }
                classNames={{ trigger: "border-default-300" }}
              >
                {styles.map((s) => (
                  <SelectItem key={s}>{s}</SelectItem>
                ))}
              </Select>
              <Select
                label="Silhouette"
                variant="bordered"
                radius="sm"
                selectedKeys={formData.silhouette ? [formData.silhouette] : []}
                onChange={(e) =>
                  setFormData({ ...formData, silhouette: e.target.value })
                }
                classNames={{ trigger: "border-default-300" }}
              >
                {silhouettes.map((s) => (
                  <SelectItem key={s}>{s}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Pattern"
                variant="bordered"
                radius="sm"
                selectedKeys={formData.pattern ? [formData.pattern] : []}
                onChange={(e) =>
                  setFormData({ ...formData, pattern: e.target.value })
                }
                classNames={{ trigger: "border-default-300" }}
              >
                {patterns.map((p) => (
                  <SelectItem key={p}>{p}</SelectItem>
                ))}
              </Select>
              <Select
                label="Fit"
                variant="bordered"
                radius="sm"
                selectedKeys={formData.fit ? [formData.fit] : []}
                onChange={(e) =>
                  setFormData({ ...formData, fit: e.target.value })
                }
                classNames={{ trigger: "border-default-300" }}
              >
                {fits.map((f) => (
                  <SelectItem key={f}>{f}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Length"
                variant="bordered"
                radius="sm"
                selectedKeys={formData.length ? [formData.length] : []}
                onChange={(e) =>
                  setFormData({ ...formData, length: e.target.value })
                }
                classNames={{ trigger: "border-default-300" }}
              >
                {lengths.map((l) => (
                  <SelectItem key={l}>{l}</SelectItem>
                ))}
              </Select>
              <Select
                label="Neckline"
                variant="bordered"
                radius="sm"
                selectedKeys={formData.neckline ? [formData.neckline] : []}
                onChange={(e) =>
                  setFormData({ ...formData, neckline: e.target.value })
                }
                classNames={{ trigger: "border-default-300" }}
              >
                {necklines.map((n) => (
                  <SelectItem key={n}>{n}</SelectItem>
                ))}
              </Select>
            </div>

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
          </div>
        </Tab>

        <Tab key="materials" title="Materials">
          <div className="space-y-4">
            <Textarea
              label="Material Composition"
              placeholder="Body:
81% Nylon, 19% Lycra Elastane

Lining:
56% Polyester, 33% Coolmax Polyester, 11% Lycra Elastane"
              variant="bordered"
              radius="sm"
              minRows={5}
              value={formData.materials}
              onChange={(e) =>
                setFormData({ ...formData, materials: e.target.value })
              }
              classNames={{ inputWrapper: "border-default-300" }}
              description="Specify material composition including percentages and part names (Body, Lining, etc.)"
            />

            <Textarea
              label="Care Instructions"
              variant="bordered"
              radius="sm"
              minRows={2}
              value={formData.careInstructions}
              onChange={(e) =>
                setFormData({ ...formData, careInstructions: e.target.value })
              }
              classNames={{ inputWrapper: "border-default-300" }}
            />

            <Textarea
              label="Sustainability Notes"
              variant="bordered"
              radius="sm"
              minRows={2}
              value={formData.sustainability}
              onChange={(e) =>
                setFormData({ ...formData, sustainability: e.target.value })
              }
              classNames={{ inputWrapper: "border-default-300" }}
            />
          </div>
        </Tab>

        <Tab key="tags" title="Tags">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                variant="bordered"
                radius="sm"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                classNames={{ inputWrapper: "border-default-300" }}
              />
              <Button radius="sm" variant="bordered" onPress={handleAddTag}>
                Add
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-default-50 rounded-lg">
                {formData.tags.map((tag: string) => (
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
          </div>
        </Tab>
      </Tabs>

      <Button
        fullWidth
        color="primary"
        radius="sm"
        className="h-12 font-bold uppercase tracking-widest mt-4 shadow-lg shadow-primary/20"
        isLoading={saving}
        onPress={onSave}
      >
        Save Changes
      </Button>
    </div>
  );
}
