"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
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
} from "@heroui/react";
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { ImageUpload } from "@/components/closet/ImageUpload";

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
  coverImage?: string;
}

export default function CreateOutfitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingCollage, setGeneratingCollage] = useState(false);

  const [availableClothes, setAvailableClothes] = useState<ClothingItem[]>([]);
  const [availableWardrobes, setAvailableWardrobes] = useState<Wardrobe[]>([]);
  const [selectedClothes, setSelectedClothes] = useState<ClothingItem[]>([]);
  const [selectedWardrobes, setSelectedWardrobes] = useState<Set<string>>(
    new Set()
  );

  const [imageMethod, setImageMethod] = useState<"auto" | "upload" | "url">(
    "auto"
  );

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
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [clothesRes, wardrobesRes] = await Promise.all([
        fetch("/api/clothes"),
        fetch("/api/wardrobes"),
      ]);

      if (clothesRes.ok) {
        const clothesData = await clothesRes.json();
        setAvailableClothes(Array.isArray(clothesData) ? clothesData : []);
      }

      if (wardrobesRes.ok) {
        const wardrobesData = await wardrobesRes.json();
        setAvailableWardrobes(
          Array.isArray(wardrobesData) ? wardrobesData : []
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClothes = (item: ClothingItem) => {
    if (!selectedClothes.find((c) => c.id === item.id)) {
      setSelectedClothes([...selectedClothes, item]);
    }
  };

  const handleRemoveClothes = (itemId: string) => {
    setSelectedClothes(selectedClothes.filter((c) => c.id !== itemId));
  };

  const toggleWardrobe = (wardrobeId: string) => {
    const newSelection = new Set(selectedWardrobes);
    if (newSelection.has(wardrobeId)) {
      newSelection.delete(wardrobeId);
    } else {
      newSelection.add(wardrobeId);
    }
    setSelectedWardrobes(newSelection);
  };

  // Generate collage using canvas
  const generateCollage = async (): Promise<string | null> => {
    if (selectedClothes.length === 0) {
      alert("Please add clothing items first");
      return null;
    }

    setGeneratingCollage(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const collageWidth = 1200;
      const collageHeight = 1200;
      canvas.width = collageWidth;
      canvas.height = collageHeight;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, collageWidth, collageHeight);

      // Load images
      const imageUrls = selectedClothes
        .map((item) => item.imageUrl)
        .filter(Boolean) as string[];

      if (imageUrls.length === 0) {
        alert("Selected items have no images");
        return null;
      }

      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load ${url}`));
          img.src = url;
        });
      };

      const images = await Promise.all(imageUrls.map(loadImage));

      // Calculate grid layout
      const cols = Math.ceil(Math.sqrt(images.length));
      const rows = Math.ceil(images.length / cols);
      const cellWidth = collageWidth / cols;
      const cellHeight = collageHeight / rows;
      const padding = 10;

      // Draw each image
      images.forEach((img, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * cellWidth;
        const y = row * cellHeight;

        const availableWidth = cellWidth - padding * 2;
        const availableHeight = cellHeight - padding * 2;
        const scale = Math.min(
          availableWidth / img.width,
          availableHeight / img.height
        );

        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        const offsetX = x + (cellWidth - scaledWidth) / 2;
        const offsetY = y + (cellHeight - scaledHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

        // Draw border
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
      });

      // Convert to blob and upload
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("Failed to generate collage"));
              return;
            }

            try {
              const formData = new FormData();
              formData.append("file", blob, "outfit-collage.png");
              formData.append("folder", "outfits");

              const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload failed");
              }

              const data = await response.json();
              resolve(data.url);
            } catch (error) {
              reject(error);
            }
          },
          "image/png",
          0.95
        );
      });
    } catch (error) {
      console.error("Error generating collage:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate collage"
      );
      return null;
    } finally {
      setGeneratingCollage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter an outfit name");
      return;
    }

    if (selectedClothes.length === 0) {
      alert("Please add at least one clothing item");
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Auto-generate collage if no image provided
      if (imageMethod === "auto" && !finalImageUrl) {
        const generatedUrl = await generateCollage();
        if (generatedUrl) {
          finalImageUrl = generatedUrl;
        }
      }

      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: finalImageUrl,
          clothesIds: selectedClothes.map((c) => c.id),
          wardrobeIds: Array.from(selectedWardrobes),
        }),
      });

      if (response.ok) {
        const outfit = await response.json();
        router.push(`/outfits/${outfit.id}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to create outfit: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating outfit:", error);
      alert("An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const unselectedClothes = availableClothes.filter(
    (item) => !selectedClothes.find((selected) => selected.id === item.id)
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push("/outfits")}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl font-light tracking-wide">
              Create New Outfit
            </h1>
          </div>
          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={submitting}
            className="font-light"
          >
            Create Outfit
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Card */}
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <h2 className="text-xl font-light mb-4">
                  Selected Items Preview
                </h2>

                <div className="bg-gray-50 rounded-xl p-4 min-h-[200px] border border-dashed border-gray-300">
                  {selectedClothes.length === 0 ? (
                    <div className="text-gray-400 text-center py-12">
                      <CameraIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Add clothes to see preview</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedClothes.map((item) => (
                        <div
                          key={item.id}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-default-200 bg-white"
                        >
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-contain p-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Basic Info */}
            <Card className="border border-gray-200">
              <CardBody className="p-6 space-y-4">
                <h2 className="text-xl font-light mb-2">Details</h2>
                <Input
                  isRequired
                  label="Outfit Name"
                  placeholder="e.g., Smart Casual Friday"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  classNames={{ label: "font-light" }}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe this outfit..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  classNames={{ label: "font-light" }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Season"
                    placeholder="Select season"
                    selectedKeys={formData.season ? [formData.season] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, season: e.target.value })
                    }
                    classNames={{ label: "font-light" }}
                  >
                    <SelectItem key="spring">Spring</SelectItem>
                    <SelectItem key="summer">Summer</SelectItem>
                    <SelectItem key="fall">Fall</SelectItem>
                    <SelectItem key="winter">Winter</SelectItem>
                  </Select>
                  <Input
                    label="Occasion"
                    placeholder="e.g., Work, Casual"
                    value={formData.occasion}
                    onChange={(e) =>
                      setFormData({ ...formData, occasion: e.target.value })
                    }
                    classNames={{ label: "font-light" }}
                  />
                </div>

                {/* Image Method Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Outfit Image
                  </label>
                  <Tabs
                    selectedKey={imageMethod}
                    onSelectionChange={(key) =>
                      setImageMethod(key as "auto" | "upload" | "url")
                    }
                    color="primary"
                    size="sm"
                  >
                    <Tab key="auto" title="Auto-Generate Collage" />
                    <Tab key="upload" title="Upload Image" />
                    <Tab key="url" title="Image URL" />
                  </Tabs>

                  {imageMethod === "auto" && (
                    <div className="space-y-2">
                      <p className="text-sm text-default-500">
                        A collage will be automatically generated from your
                        selected items when you save
                      </p>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<SparklesIcon className="w-4 h-4" />}
                        onPress={async () => {
                          const url = await generateCollage();
                          if (url) {
                            setFormData({ ...formData, imageUrl: url });
                            alert("✨ Collage generated successfully!");
                          }
                        }}
                        isLoading={generatingCollage}
                        isDisabled={selectedClothes.length === 0}
                      >
                        {generatingCollage
                          ? "Generating..."
                          : "Preview Collage Now"}
                      </Button>
                      {formData.imageUrl && (
                        <div className="relative w-full aspect-square max-w-xs rounded-lg overflow-hidden border-2 border-success">
                          <Image
                            src={formData.imageUrl}
                            alt="Generated collage"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {imageMethod === "upload" && (
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(url) =>
                        setFormData({ ...formData, imageUrl: url })
                      }
                      folder="outfits"
                      label="Upload Outfit Image"
                    />
                  )}

                  {imageMethod === "url" && (
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

                <Checkbox
                  isSelected={formData.isFavorite}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isFavorite: value })
                  }
                >
                  Mark as favorite
                </Checkbox>
              </CardBody>
            </Card>

            {/* Selected Clothes List */}
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-light">
                    Selected Items ({selectedClothes.length})
                  </h2>
                  <Button
                    color="primary"
                    variant="light"
                    startContent={<PlusIcon className="w-5 h-5" />}
                    onPress={addClothesModal.onOpen}
                  >
                    Add Items
                  </Button>
                </div>

                {selectedClothes.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="font-light">No items selected yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedClothes.map((item) => (
                      <Card
                        key={item.id}
                        className="border border-gray-200 relative group"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveClothes(item.id)}
                          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        <CardBody className="p-0">
                          <div className="w-full h-40 bg-gray-100">
                            <Image
                              alt={item.name}
                              className="w-full h-full object-cover"
                              src={item.imageUrl || "/images/placeholder.png"}
                            />
                          </div>
                        </CardBody>
                        <CardFooter className="flex-col items-start p-3">
                          <p className="font-light text-sm truncate w-full">
                            {item.name}
                          </p>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar - Wardrobes */}
          <div>
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <h2 className="text-xl font-light mb-4">Add to Wardrobes</h2>
                {availableWardrobes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No wardrobes yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableWardrobes.map((wardrobe) => (
                      <Card
                        key={wardrobe.id}
                        isPressable
                        className={`border transition-all ${
                          selectedWardrobes.has(wardrobe.id)
                            ? "border-primary bg-primary/5"
                            : "border-gray-200"
                        }`}
                        onPress={() => toggleWardrobe(wardrobe.id)}
                      >
                        <CardBody className="p-3">
                          <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                              {wardrobe.coverImage && (
                                <Image
                                  alt={wardrobe.title}
                                  className="w-full h-full object-cover"
                                  src={wardrobe.coverImage}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-light truncate">
                                {wardrobe.title}
                              </p>
                            </div>
                            {selectedWardrobes.has(wardrobe.id) && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </form>

      {/* Add Clothes Modal */}
      <Modal
        isOpen={addClothesModal.isOpen}
        size="3xl"
        scrollBehavior="inside"
        onClose={addClothesModal.onClose}
      >
        <ModalContent>
          <ModalHeader className="font-light text-2xl">
            Add Clothing Items
          </ModalHeader>
          <ModalBody>
            {unselectedClothes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  All your items are already in this outfit
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {unselectedClothes.map((item) => (
                  <Card
                    key={item.id}
                    isPressable
                    className="border border-gray-200 hover:border-primary transition-colors"
                    onPress={() => {
                      handleAddClothes(item);
                      addClothesModal.onClose();
                    }}
                  >
                    <CardBody className="p-0">
                      <div className="w-full h-40 bg-gray-100">
                        <Image
                          alt={item.name}
                          className="w-full h-full object-cover"
                          src={item.imageUrl || "/images/placeholder.png"}
                        />
                      </div>
                    </CardBody>
                    <CardFooter className="flex-col items-start p-3">
                      <p className="font-light text-sm truncate w-full">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {item.category}
                      </p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={addClothesModal.onClose}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
