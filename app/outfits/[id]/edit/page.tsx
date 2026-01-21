"use client";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Image,
  Input,
  Textarea,
  Select,
  SelectItem,
  Spinner,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Chip,
  Tooltip,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ImageUpload } from "@/components/closet/ImageUpload";
import CollageBuilder from "@/components/outfit/CollageBuilder";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  imageUrl?: string;
  colors: string[];
  price?: number;
}

interface Wardrobe {
  id: string;
  title: string;
}

const ACCESSORY_CATEGORIES = [
  "Bag",
  "Belt",
  "Hat",
  "Scarf",
  "Sunglasses",
  "Jewelry",
  "Beanie",
  "Cap",
  "Purse",
  "Wallet",
  "Necklace",
  "Earrings",
  "Card Holder",
  "Watch",
  "Bracelet",
  "Ring",
];

const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All Season"];
const OCCASIONS = [
  "Casual",
  "Work",
  "Formal",
  "Date Night",
  "Athletic",
  "Lounge",
  "Party",
  "Travel",
  "Wedding",
  "Interview",
];

export default function EditOutfitPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const outfitId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [availableClothes, setAvailableClothes] = useState<ClothingItem[]>([]);
  const [availableWardrobes, setAvailableWardrobes] = useState<Wardrobe[]>([]);
  const [selectedClothes, setSelectedClothes] = useState<ClothingItem[]>([]);
  const [selectedWardrobes, setSelectedWardrobes] = useState<Set<string>>(
    new Set(),
  );

  const [originalClothesIds, setOriginalClothesIds] = useState<Set<string>>(
    new Set(),
  );
  const [originalWardrobeIds, setOriginalWardrobeIds] = useState<Set<string>>(
    new Set(),
  );
  const [originalFormData, setOriginalFormData] = useState<
    typeof formData | null
  >(null);

  const [showCollageBuilder, setShowCollageBuilder] = useState(false);
  const [imageMethod, setImageMethod] = useState<"builder" | "upload" | "url">(
    "upload",
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    season: "",
    occasion: "",
    imageUrl: "",
    isFavorite: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const addClothesModal = useDisclosure();
  const confirmLeaveModal = useDisclosure();
  const confirmDeleteModal = useDisclosure();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!originalFormData) return false;
    const formChanged =
      formData.name !== originalFormData.name ||
      formData.description !== originalFormData.description ||
      formData.season !== originalFormData.season ||
      formData.occasion !== originalFormData.occasion ||
      formData.imageUrl !== originalFormData.imageUrl ||
      formData.isFavorite !== originalFormData.isFavorite;
    const currentClothesIds = new Set(selectedClothes.map((c) => c.id));
    const clothesChanged =
      currentClothesIds.size !== originalClothesIds.size ||
      [...currentClothesIds].some((id) => !originalClothesIds.has(id));
    const wardrobesChanged =
      selectedWardrobes.size !== originalWardrobeIds.size ||
      [...selectedWardrobes].some((id) => !originalWardrobeIds.has(id));
    return formChanged || clothesChanged || wardrobesChanged;
  }, [
    formData,
    originalFormData,
    selectedClothes,
    originalClothesIds,
    selectedWardrobes,
    originalWardrobeIds,
  ]);

  const changesSummary = useMemo(() => {
    if (!originalFormData) return null;
    const changes: string[] = [];
    if (formData.name !== originalFormData.name) changes.push("title");
    if (formData.description !== originalFormData.description)
      changes.push("notes");
    if (formData.season !== originalFormData.season) changes.push("season");
    if (formData.occasion !== originalFormData.occasion)
      changes.push("occasion");
    if (formData.imageUrl !== originalFormData.imageUrl) changes.push("image");
    if (formData.isFavorite !== originalFormData.isFavorite)
      changes.push("favorite");
    const currentClothesIds = new Set(selectedClothes.map((c) => c.id));
    const addedClothes = [...currentClothesIds].filter(
      (id) => !originalClothesIds.has(id),
    ).length;
    const removedClothes = [...originalClothesIds].filter(
      (id) => !currentClothesIds.has(id),
    ).length;
    if (addedClothes > 0) changes.push(`+${addedClothes} items`);
    if (removedClothes > 0) changes.push(`-${removedClothes} items`);
    return changes;
  }, [formData, originalFormData, selectedClothes, originalClothesIds]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchAllData();
  }, [status, router, outfitId]);

  const fetchAllData = async () => {
    try {
      const [clothesRes, wardrobesRes, outfitRes] = await Promise.all([
        fetch("/api/clothes?status=owned"),
        fetch("/api/wardrobes"),
        fetch(`/api/outfits/${outfitId}`),
      ]);
      if (clothesRes.ok) setAvailableClothes(await clothesRes.json());
      if (wardrobesRes.ok) setAvailableWardrobes(await wardrobesRes.json());
      if (outfitRes.ok) {
        const outfit = await outfitRes.json();
        const initialFormData = {
          name: outfit.name || "",
          description: outfit.description || "",
          season: outfit.season || "",
          occasion: outfit.occasion || "",
          imageUrl: outfit.imageUrl || "",
          isFavorite: outfit.isFavorite || false,
        };
        setFormData(initialFormData);
        setOriginalFormData(initialFormData);
        if (outfit.clothes && Array.isArray(outfit.clothes)) {
          setSelectedClothes(outfit.clothes);
          setOriginalClothesIds(new Set(outfit.clothes.map((c: any) => c.id)));
        }
        if (outfit.wardrobes && Array.isArray(outfit.wardrobes)) {
          const ids = outfit.wardrobes.map((w: any) => w.id);
          setSelectedWardrobes(new Set(ids));
          setOriginalWardrobeIds(new Set(ids));
        }
        if (outfit.imageUrl) {
          setImageMethod(
            outfit.imageUrl.includes("base64") ? "builder" : "url",
          );
        }
      } else {
        alert("Outfit not found");
        router.push("/outfits");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClothes = (item: ClothingItem) => {
    if (selectedClothes.find((c) => c.id === item.id)) return;
    const isAccessory = ACCESSORY_CATEGORIES.includes(item.category);
    if (!isAccessory) {
      const filtered = selectedClothes.filter(
        (c) => c.category !== item.category,
      );
      setSelectedClothes([...filtered, item]);
    } else {
      setSelectedClothes([...selectedClothes, item]);
    }
  };

  const handleRemoveClothes = (itemId: string) => {
    setSelectedClothes(selectedClothes.filter((c) => c.id !== itemId));
  };

  const getSelectedInCategory = (
    category: string,
  ): ClothingItem | undefined => {
    return selectedClothes.find((c) => c.category === category);
  };

  const toggleWardrobe = (id: string) => {
    const s = new Set(selectedWardrobes);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedWardrobes(s);
  };

  const handleCollageSave = async (file: File) => {
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "outfits");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        setShowCollageBuilder(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const totalCost = selectedClothes.reduce(
    (sum, item) => sum + (item.price || 0),
    0,
  );

  const handleNavigateAway = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      confirmLeaveModal.onOpen();
    } else {
      router.push(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) router.push(pendingNavigation);
    confirmLeaveModal.onClose();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || selectedClothes.length === 0) {
      alert("Name and items required.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clothesIds: selectedClothes.map((c) => c.id),
          wardrobeIds: Array.from(selectedWardrobes),
        }),
      });
      if (response.ok) {
        router.push(`/outfits/${outfitId}`);
      } else {
        const err = await response.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: "DELETE",
      });
      if (response.ok) router.push("/outfits");
      else alert("Failed to delete");
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
      confirmDeleteModal.onClose();
    }
  };

  const resetChanges = () => {
    if (originalFormData) setFormData(originalFormData);
    const originalClothes = availableClothes.filter((c) =>
      originalClothesIds.has(c.id),
    );
    setSelectedClothes(originalClothes);
    setSelectedWardrobes(new Set(originalWardrobeIds));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const unselectedClothes = availableClothes.filter(
    (item) => !selectedClothes.find((s) => s.id === item.id),
  );

  const filteredClothes = unselectedClothes.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedClothes = filteredClothes.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ClothingItem[]>,
  );

  const allCategories = [
    ...new Set(availableClothes.map((c) => c.category)),
  ].sort();

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-12">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            onPress={() => handleNavigateAway(`/outfits/${outfitId}`)}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              Edit Look
            </h1>
            <p className="text-xs uppercase tracking-widest text-default-500">
              Refine your curation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <>
              <Tooltip content={`Changes: ${changesSummary?.join(", ")}`}>
                <Chip
                  size="sm"
                  variant="flat"
                  color="warning"
                  startContent={<ExclamationTriangleIcon className="w-3 h-3" />}
                >
                  {changesSummary?.length} changes
                </Chip>
              </Tooltip>
              <Button
                size="sm"
                variant="light"
                onPress={resetChanges}
                startContent={<ArrowPathIcon className="w-4 h-4" />}
              >
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12"
      >
        <div className="lg:col-span-5 h-fit lg:sticky lg:top-24 space-y-6">
          <div className="aspect-[3/4] bg-content2 border border-dashed border-default-300 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-4 z-10">
              <Tabs
                selectedKey={imageMethod}
                onSelectionChange={(k) =>
                  setImageMethod(k as typeof imageMethod)
                }
                radius="none"
                size="sm"
                classNames={{
                  tabList:
                    "bg-background/80 backdrop-blur border border-default-200",
                }}
              >
                <Tab key="builder" title="Collage" />
                <Tab key="upload" title="Upload" />
                <Tab key="url" title="URL" />
              </Tabs>
            </div>
            <div className="w-full h-full p-8 flex items-center justify-center">
              {formData.imageUrl ? (
                <div className="relative w-full h-full group">
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain shadow-xl"
                  />
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100"
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, imageUrl: "" }))
                    }
                  >
                    Change
                  </Button>
                </div>
              ) : imageMethod === "builder" ? (
                <div className="text-center">
                  <Button
                    variant="flat"
                    size="lg"
                    radius="none"
                    startContent={<SparklesIcon className="w-5 h-5" />}
                    onPress={() => setShowCollageBuilder(true)}
                    isDisabled={selectedClothes.length === 0}
                    className="uppercase font-bold text-xs tracking-widest h-14 px-8"
                  >
                    Open Collage Studio
                  </Button>
                  <p className="text-[10px] text-default-400 mt-4 uppercase tracking-wider">
                    {selectedClothes.length === 0
                      ? "Select clothes first"
                      : `${selectedClothes.length} items ready`}
                  </p>
                </div>
              ) : imageMethod === "upload" ? (
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, imageUrl: url }))
                  }
                  folder="outfits"
                  label="Upload"
                />
              ) : (
                <div className="w-full max-w-xs">
                  <Input
                    label="Image URL"
                    variant="bordered"
                    radius="none"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          </div>

          {selectedClothes.length > 0 && (
            <div className="bg-content2 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-default-500">
                  Items
                </span>
                <span className="text-2xl font-light">
                  {selectedClothes.length}
                </span>
              </div>
              {totalCost > 0 && (
                <div className="flex justify-between items-center border-t border-divider pt-3">
                  <span className="text-xs uppercase tracking-widest text-default-500">
                    Total Value
                  </span>
                  <span className="text-xl font-light">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="border border-danger-200 p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-danger mb-3">
              Danger Zone
            </h4>
            <Button
              color="danger"
              variant="flat"
              radius="none"
              size="sm"
              startContent={<TrashIcon className="w-4 h-4" />}
              onPress={confirmDeleteModal.onOpen}
              className="uppercase tracking-widest text-xs"
            >
              Delete This Look
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-12">
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-divider pb-2">
              Look Details
            </h3>
            <Input
              isRequired
              label="Title"
              variant="bordered"
              radius="none"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              classNames={{ inputWrapper: "h-12" }}
            />
            <Textarea
              label="Notes"
              placeholder="Styling notes..."
              variant="bordered"
              radius="none"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              minRows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Season"
                variant="bordered"
                radius="none"
                selectedKeys={formData.season ? [formData.season] : []}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, season: e.target.value }))
                }
              >
                {SEASONS.map((s) => (
                  <SelectItem key={s}>{s}</SelectItem>
                ))}
              </Select>
              <Select
                label="Occasion"
                variant="bordered"
                radius="none"
                selectedKeys={formData.occasion ? [formData.occasion] : []}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, occasion: e.target.value }))
                }
              >
                {OCCASIONS.map((o) => (
                  <SelectItem key={o}>{o}</SelectItem>
                ))}
              </Select>
            </div>
            <Checkbox
              isSelected={formData.isFavorite}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, isFavorite: v }))
              }
            >
              <span className="text-sm uppercase tracking-wide">Favorite</span>
            </Checkbox>
          </section>

          <section className="space-y-6">
            <div className="flex justify-between items-end border-b border-divider pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest">
                Pieces ({selectedClothes.length})
              </h3>
              <Button
                size="sm"
                variant="light"
                radius="none"
                startContent={<PlusIcon className="w-4 h-4" />}
                onPress={addClothesModal.onOpen}
                className="uppercase font-bold text-[10px]"
              >
                Add Items
              </Button>
            </div>
            {selectedClothes.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-default-300">
                <p className="text-default-400 text-sm italic mb-4">
                  No items selected
                </p>
                <Button
                  variant="flat"
                  radius="none"
                  size="sm"
                  onPress={addClothesModal.onOpen}
                  startContent={<PlusIcon className="w-4 h-4" />}
                >
                  Browse Closet
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(
                  selectedClothes.reduce(
                    (acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    },
                    {} as Record<string, ClothingItem[]>,
                  ),
                )
                  .sort(([catA], [catB]) => catA.localeCompare(catB))
                  .map(([category, items]) => (
                    <div key={category}>
                      <div className="text-[10px] uppercase tracking-widest text-default-500 mb-2">
                        {category}
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {items.map((item) => {
                          const isNew = !originalClothesIds.has(item.id);
                          return (
                            <div
                              key={item.id}
                              className={`relative group aspect-[3/4] border-2 cursor-pointer hover:border-danger transition-colors ${isNew ? "border-success" : "border-default-200"}`}
                              onClick={() => handleRemoveClothes(item.id)}
                            >
                              <Image
                                src={item.imageUrl || ""}
                                radius="none"
                                className="w-full h-full object-cover"
                                classNames={{ wrapper: "w-full h-full" }}
                              />
                              <div className="absolute bottom-0 w-full bg-white/90 p-1 text-[9px] uppercase truncate text-center">
                                {item.name}
                              </div>
                              {isNew && (
                                <div className="absolute top-1 left-1">
                                  <Chip
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                    className="text-[8px] h-4"
                                  >
                                    NEW
                                  </Chip>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-danger/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <div className="bg-danger text-white p-2 rounded-full">
                                  <XMarkIcon className="w-5 h-5" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {availableWardrobes.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest border-b border-divider pb-2">
                Collections
              </h3>
              <div className="flex flex-wrap gap-3">
                {availableWardrobes.map((w) => {
                  const isSelected = selectedWardrobes.has(w.id);
                  const isNew = isSelected && !originalWardrobeIds.has(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleWardrobe(w.id)}
                      className={`relative px-4 py-2 border text-xs uppercase tracking-wide transition-all ${isSelected ? "border-primary bg-primary text-white" : "border-default-200 hover:border-default-400"}`}
                    >
                      {w.title}
                      {isNew && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <div className="pt-8 flex gap-4">
            <Button
              fullWidth
              variant="bordered"
              radius="none"
              className="h-12 uppercase tracking-widest"
              onPress={() => handleNavigateAway(`/outfits/${outfitId}`)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              color="primary"
              radius="none"
              className="h-12 uppercase tracking-widest font-bold"
              type="submit"
              isLoading={submitting}
              isDisabled={
                !formData.name.trim() ||
                selectedClothes.length === 0 ||
                !hasUnsavedChanges
              }
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={addClothesModal.isOpen}
        onClose={addClothesModal.onClose}
        size="5xl"
        scrollBehavior="inside"
        radius="none"
      >
        <ModalContent>
          <ModalHeader className="flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <span className="uppercase tracking-widest font-bold">
                Select Pieces
              </span>
              <span className="text-xs text-default-400 font-normal">
                {selectedClothes.length} selected
              </span>
            </div>
            <div className="flex gap-3 w-full">
              <Input
                placeholder="Search..."
                variant="bordered"
                radius="none"
                size="sm"
                startContent={
                  <MagnifyingGlassIcon className="w-4 h-4 text-default-400" />
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                isClearable
                onClear={() => setSearchQuery("")}
              />
              <Select
                placeholder="All Categories"
                variant="bordered"
                radius="none"
                size="sm"
                className="w-48"
                selectedKeys={activeCategory ? [activeCategory] : []}
                onChange={(e) => setActiveCategory(e.target.value || null)}
              >
                {allCategories.map((cat) => (
                  <SelectItem key={cat}>{cat}</SelectItem>
                ))}
              </Select>
            </div>
          </ModalHeader>
          <ModalBody className="pb-6">
            {Object.keys(groupedClothes).length === 0 ? (
              <div className="py-12 text-center text-default-400">
                No items found
              </div>
            ) : (
              Object.entries(groupedClothes)
                .sort(([catA], [catB]) => catA.localeCompare(catB))
                .map(([category, items]) => {
                  const isAccessory = ACCESSORY_CATEGORIES.includes(category);
                  const selectedInCategory = getSelectedInCategory(category);
                  return (
                    <div key={category} className="mb-8">
                      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-default-200">
                        <h4 className="text-xs font-bold uppercase tracking-widest">
                          {category}
                        </h4>
                        <Chip size="sm" variant="flat" className="text-[10px]">
                          {isAccessory ? "Multiple OK" : "Pick One"}
                        </Chip>
                        {!isAccessory && selectedInCategory && (
                          <span className="text-[10px] text-success-600 uppercase tracking-wider ml-auto flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            {selectedInCategory.name}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {items.map((item) => {
                          const isSelected = selectedClothes.some(
                            (c) => c.id === item.id,
                          );
                          const wouldReplace =
                            !isAccessory && selectedInCategory && !isSelected;
                          return (
                            <Tooltip
                              key={item.id}
                              content={
                                wouldReplace
                                  ? `Replace ${selectedInCategory.name}`
                                  : item.name
                              }
                            >
                              <div
                                className={`aspect-[3/4] cursor-pointer group relative border-2 transition-all ${isSelected ? "border-primary shadow-lg" : wouldReplace ? "border-warning-300 hover:border-warning" : "border-transparent hover:border-default-300"}`}
                                onClick={() => handleAddClothes(item)}
                              >
                                <Image
                                  src={item.imageUrl || ""}
                                  radius="none"
                                  className="w-full h-full object-cover group-hover:opacity-90"
                                />
                                <div
                                  className={`absolute bottom-0 w-full p-1 text-[9px] uppercase truncate text-center ${isSelected ? "bg-primary text-white" : "bg-white/90 text-foreground"}`}
                                >
                                  {item.name}
                                </div>
                                {isSelected && (
                                  <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    ✓
                                  </div>
                                )}
                                {wouldReplace && (
                                  <div className="absolute top-1 right-1">
                                    <ArrowPathIcon className="w-4 h-4 text-warning" />
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
          </ModalBody>
          <ModalFooter className="border-t border-divider">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-default-500">
                {selectedClothes.length} items selected
              </span>
              <Button
                radius="none"
                color="primary"
                onPress={addClothesModal.onClose}
              >
                Done
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showCollageBuilder}
        onClose={() => setShowCollageBuilder(false)}
        size="5xl"
        radius="none"
        classNames={{ body: "p-0", header: "border-b border-default-200" }}
      >
        <ModalContent className="h-[85vh]">
          <ModalHeader className="uppercase tracking-widest font-bold">
            Collage Studio
          </ModalHeader>
          <ModalBody className="overflow-hidden">
            <CollageBuilder
              items={selectedClothes}
              onSave={handleCollageSave}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={confirmLeaveModal.isOpen}
        onClose={confirmLeaveModal.onClose}
        radius="none"
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
            Unsaved Changes
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              You have unsaved changes. Are you sure you want to leave?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              radius="none"
              onPress={confirmLeaveModal.onClose}
            >
              Stay
            </Button>
            <Button color="danger" radius="none" onPress={confirmNavigation}>
              Leave
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={confirmDeleteModal.isOpen}
        onClose={confirmDeleteModal.onClose}
        radius="none"
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <TrashIcon className="w-5 h-5 text-danger" />
            Delete Outfit
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Are you sure you want to delete <strong>"{formData.name}"</strong>
              ? This cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              radius="none"
              onPress={confirmDeleteModal.onClose}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              radius="none"
              onPress={handleDelete}
              isLoading={deleting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
