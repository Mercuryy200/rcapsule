"use client";
import { useEffect, useState } from "react";
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
  useDisclosure,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ImageUpload } from "@/components/closet/ImageUpload";
// Make sure to import your CollageBuilder if you want that functionality here too
import CollageBuilder from "@/components/outfit/CollageBuilder";

// Types matching your API response
interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  imageUrl?: string;
  colors: string[];
}
interface Wardrobe {
  id: string;
  title: string;
}

export default function EditOutfitPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const outfitId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data State
  const [availableClothes, setAvailableClothes] = useState<ClothingItem[]>([]);
  const [availableWardrobes, setAvailableWardrobes] = useState<Wardrobe[]>([]);

  // Selection State
  const [selectedClothes, setSelectedClothes] = useState<ClothingItem[]>([]);
  const [selectedWardrobes, setSelectedWardrobes] = useState<Set<string>>(
    new Set()
  );

  // Form State
  const [imageMethod, setImageMethod] = useState<"upload" | "url" | "builder">(
    "upload"
  );
  const [showCollageBuilder, setShowCollageBuilder] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    season: "",
    occasion: "",
    imageUrl: "",
    isFavorite: false,
  });

  const addClothesModal = useDisclosure();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchAllData();
  }, [status, router, outfitId]);

  const fetchAllData = async () => {
    try {
      // Fetch everything in parallel
      const [clothesRes, wardrobesRes, outfitRes] = await Promise.all([
        fetch("/api/clothes"),
        fetch("/api/wardrobes"),
        fetch(`/api/outfits/${outfitId}`),
      ]);

      if (clothesRes.ok) setAvailableClothes(await clothesRes.json());
      if (wardrobesRes.ok) setAvailableWardrobes(await wardrobesRes.json());

      if (outfitRes.ok) {
        const outfit = await outfitRes.json();

        // 1. Pre-fill Form
        setFormData({
          name: outfit.name,
          description: outfit.description || "",
          season: outfit.season || "",
          occasion: outfit.occasion || "",
          imageUrl: outfit.imageUrl || "",
          isFavorite: outfit.isFavorite,
        });

        // 2. Pre-fill Clothes
        if (outfit.clothes && Array.isArray(outfit.clothes)) {
          setSelectedClothes(outfit.clothes);
        }

        // 3. Pre-fill Wardrobes
        if (outfit.wardrobes && Array.isArray(outfit.wardrobes)) {
          const ids = outfit.wardrobes.map((w: any) => w.id);
          setSelectedWardrobes(new Set(ids));
        }

        // 4. Set Image Tab default
        if (outfit.imageUrl && !outfit.imageUrl.includes("base64")) {
          setImageMethod("url");
        }
      } else {
        alert("Outfit not found");
        router.push("/outfits");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || selectedClothes.length === 0) {
      alert("Name and items required.");
      return;
    }
    setSubmitting(true);

    try {
      // Call PUT endpoint
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clothesIds: selectedClothes.map((c) => c.id), // Send IDs for relation update
          wardrobeIds: Array.from(selectedWardrobes), // Send IDs for relation update
        }),
      });

      if (response.ok) {
        router.push(`/outfits/${outfitId}`);
      } else {
        const err = await response.json();
        alert(`Failed to update: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // --- HELPER FUNCTIONS ---
  const handleAddClothes = (item: ClothingItem) => {
    if (!selectedClothes.find((c) => c.id === item.id))
      setSelectedClothes([...selectedClothes, item]);
  };
  const handleRemoveClothes = (itemId: string) => {
    setSelectedClothes(selectedClothes.filter((c) => c.id !== itemId));
  };
  const toggleWardrobe = (id: string) => {
    const s = new Set(selectedWardrobes);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedWardrobes(s);
  };
  const handleCollageSave = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "outfits");
    const res = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });
    if (res.ok) {
      const data = await res.json();
      setFormData({ ...formData, imageUrl: data.url });
      setShowCollageBuilder(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  const unselectedClothes = availableClothes.filter(
    (item) => !selectedClothes.find((s) => s.id === item.id)
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      {/* HEADER */}
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
            Edit Look
          </h1>
          <p className="text-xs uppercase tracking-widest text-default-500">
            Refine your curation
          </p>
        </div>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12"
      >
        {/* LEFT: IMAGE */}
        <div className="lg:col-span-5 h-fit space-y-6">
          <div className="aspect-[3/4] bg-content2 border border-dashed border-default-300 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-4 z-10">
              <Tabs
                selectedKey={imageMethod}
                onSelectionChange={(k) => setImageMethod(k as any)}
                radius="none"
                size="sm"
                classNames={{ tabList: "bg-background/80 backdrop-blur" }}
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
                    onPress={() => setFormData({ ...formData, imageUrl: "" })}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  {imageMethod === "builder" ? (
                    <Button
                      onPress={() => setShowCollageBuilder(true)}
                      variant="flat"
                      className="uppercase font-bold text-[10px] tracking-widest"
                    >
                      Open Studio
                    </Button>
                  ) : imageMethod === "upload" ? (
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(url) =>
                        setFormData({ ...formData, imageUrl: url })
                      }
                      folder="outfits"
                      label="Upload"
                    />
                  ) : (
                    <Input
                      label="URL"
                      variant="underlined"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="lg:col-span-7 space-y-12">
          {/* 1. Metadata */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-divider pb-2">
              Details
            </h3>
            <Input
              label="Title"
              variant="bordered"
              radius="none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Textarea
              label="Notes"
              variant="bordered"
              radius="none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Season"
                variant="bordered"
                radius="none"
                selectedKeys={formData.season ? [formData.season] : []}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
              >
                {["Spring", "Summer", "Fall", "Winter"].map((s) => (
                  <SelectItem key={s}>{s}</SelectItem>
                ))}
              </Select>
              <Input
                label="Occasion"
                variant="bordered"
                radius="none"
                value={formData.occasion}
                onChange={(e) =>
                  setFormData({ ...formData, occasion: e.target.value })
                }
              />
            </div>
            <Checkbox
              isSelected={formData.isFavorite}
              onValueChange={(v) => setFormData({ ...formData, isFavorite: v })}
            >
              <span className="text-sm uppercase tracking-wide">Favorite</span>
            </Checkbox>
          </section>

          {/* 2. Clothes */}
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
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {selectedClothes.map((item) => (
                <div
                  key={item.id}
                  className="relative group aspect-[3/4] border border-default-200 cursor-pointer hover:border-danger transition-colors"
                  onClick={() => handleRemoveClothes(item.id)}
                >
                  <Image
                    src={item.imageUrl || ""}
                    radius="none"
                    className="w-full h-full object-cover"
                    classNames={{ wrapper: "w-full h-full" }}
                  />
                  <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <XMarkIcon className="w-6 h-6 text-danger" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Wardrobes */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-divider pb-2">
              Collections
            </h3>
            <div className="flex flex-wrap gap-3">
              {availableWardrobes.map((w) => {
                const isSelected = selectedWardrobes.has(w.id);
                return (
                  <div
                    key={w.id}
                    onClick={() => toggleWardrobe(w.id)}
                    className={`cursor-pointer px-4 py-2 border text-xs uppercase tracking-wide transition-all ${isSelected ? "border-primary bg-primary text-white" : "border-default-200 hover:border-default-400"}`}
                  >
                    {w.title}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ACTIONS */}
          <div className="pt-8 flex gap-4">
            <Button
              fullWidth
              variant="bordered"
              radius="none"
              className="h-12 uppercase tracking-widest"
              onPress={() => router.back()}
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
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* ADD MODAL & COLLAGE MODAL (Reuse from create page) */}
      <Modal
        isOpen={addClothesModal.isOpen}
        onClose={addClothesModal.onClose}
        size="3xl"
        scrollBehavior="inside"
        radius="none"
      >
        <ModalContent>
          <ModalHeader className="uppercase tracking-widest font-bold">
            Select Pieces
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {unselectedClothes.map((item) => (
                <div
                  key={item.id}
                  className="aspect-[3/4] cursor-pointer group relative"
                  onClick={() => {
                    handleAddClothes(item);
                    addClothesModal.onClose();
                  }}
                >
                  <Image
                    src={item.imageUrl || ""}
                    radius="none"
                    className="w-full h-full object-cover opacity-100 group-hover:opacity-80"
                  />
                  <div className="absolute bottom-0 w-full bg-white/90 p-1 text-[10px] uppercase truncate text-center">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showCollageBuilder}
        onClose={() => setShowCollageBuilder(false)}
        size="5xl"
        radius="none"
        classNames={{ body: "p-0" }}
      >
        <ModalContent className="h-[80vh]">
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
    </div>
  );
}
