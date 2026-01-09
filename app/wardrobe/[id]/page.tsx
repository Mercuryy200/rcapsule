"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Spinner,
  Textarea,
  Checkbox,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price?: number;
  colors: string[];
  season?: string;
  size?: string;
  link?: string;
  imageUrl?: string;
  placesToWear: string[];
  addedToWardrobeAt?: string;
  wardrobeNotes?: string;
}

interface Wardrobe {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  clothes: ClothingItem[]; // Changed from Clothes to clothes
}

export default function WardrobePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const wardrobeId = params.id as string;

  const [wardrobe, setWardrobe] = useState<Wardrobe | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableClothes, setAvailableClothes] = useState<ClothingItem[]>([]);

  const wardrobeModal = useDisclosure();
  const addExistingModal = useDisclosure();

  const [selectedExistingItems, setSelectedExistingItems] = useState<
    Set<string>
  >(new Set());
  const [wardrobeFormData, setWardrobeFormData] = useState({
    title: "",
    description: "",
    isPublic: false,
    coverImage: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchWardrobe();
      fetchAvailableClothes();
    }
  }, [status, router, wardrobeId]);

  const fetchWardrobe = async () => {
    try {
      const response = await fetch(`/api/wardrobes/${wardrobeId}`);

      if (response.ok) {
        const data = await response.json();
        // Ensure clothes is always an array
        const safeData = {
          ...data,
          clothes: Array.isArray(data.clothes) ? data.clothes : [],
        };
        setWardrobe(safeData);
        setWardrobeFormData({
          title: data.title,
          description: data.description || "",
          isPublic: data.isPublic,
          coverImage: data.coverImage || "",
        });
      } else if (response.status === 404) {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error fetching wardrobe:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableClothes = async () => {
    try {
      const response = await fetch("/api/clothes");
      if (response.ok) {
        const data = await response.json();
        setAvailableClothes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching clothes:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item permanently?"))
      return;

    try {
      const response = await fetch(`/api/closet/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchWardrobe();
        fetchAvailableClothes();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleRemoveFromWardrobe = async (clothesId: string) => {
    if (!confirm("Remove this item from the wardrobe?")) return;

    try {
      const response = await fetch(
        `/api/wardrobes/${wardrobeId}/clothes/${clothesId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchWardrobe();
        fetchAvailableClothes();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleUpdateWardrobe = async () => {
    try {
      const response = await fetch(`/api/wardrobes/${wardrobeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wardrobeFormData),
      });

      if (response.ok) {
        fetchWardrobe();
        wardrobeModal.onClose();
      }
    } catch (error) {
      console.error("Error updating wardrobe:", error);
    }
  };

  const handleDeleteWardrobe = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this wardrobe? Items will remain in your clothes list."
      )
    )
      return;

    try {
      const response = await fetch(`/api/wardrobes/${wardrobeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error deleting wardrobe:", error);
    }
  };

  const handleOpenAddExisting = () => {
    setSelectedExistingItems(new Set());
    addExistingModal.onOpen();
  };

  const handleAddExistingItems = async () => {
    try {
      const response = await fetch(`/api/wardrobes/${wardrobeId}/clothes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clothesIds: Array.from(selectedExistingItems),
        }),
      });

      if (response.ok) {
        fetchWardrobe();
        fetchAvailableClothes();
        addExistingModal.onClose();
      }
    } catch (error) {
      console.error("Error adding items:", error);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedExistingItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedExistingItems(newSelection);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!wardrobe) {
    return <div className="text-center p-8">Wardrobe not found</div>;
  }

  // Safe access to wardrobe.clothes - moved after null checks
  const wardrobeClothes = wardrobe.clothes || [];

  const itemsNotInWardrobe = availableClothes.filter(
    (item) =>
      !wardrobeClothes.some((wardrobeItem) => wardrobeItem.id === item.id)
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push("/profile")}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{wardrobe.title}</h1>
            {wardrobe.description && (
              <p className="text-gray-500">{wardrobe.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="solid"
            startContent={<PencilIcon className="w-5 h-5" />}
            onPress={wardrobeModal.onOpen}
          >
            Edit Wardrobe
          </Button>
          <Button
            color="danger"
            variant="solid"
            startContent={<TrashIcon className="w-5 h-5" />}
            onPress={handleDeleteWardrobe}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          as={Link}
          color="primary"
          startContent={<PlusIcon className="w-5 h-5" />}
          href="/closet/new"
        >
          Add New Item
        </Button>
        <Button variant="solid" onPress={handleOpenAddExisting}>
          Add Existing Items
        </Button>
      </div>

      {/* Clothes Grid */}
      {wardrobeClothes.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-lg text-gray-500 mb-4">
              No items in this wardrobe yet
            </p>
            <div className="flex gap-3 justify-center">
              <Button color="primary" as={Link} href="/closet/new">
                Add New Item
              </Button>
              <Button variant="solid" onPress={handleOpenAddExisting}>
                Add Existing Items
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wardrobeClothes.map((item) => (
            <Card
              key={item.id}
              className="w-full"
              isPressable
              onPress={() => router.push(`/closet/${item.id}`)}
            >
              <CardBody className="p-0 overflow-hidden">
                <div className="w-full h-64 relative">
                  <Image
                    alt={item.name}
                    className="w-full h-full object-cover"
                    classNames={{ img: "w-full h-full object-cover" }}
                    src={item.imageUrl || "/images/placeholder.png"}
                  />
                </div>
              </CardBody>
              <CardFooter className="flex flex-col items-start gap-2">
                <div className="w-full">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {item.category}
                  </p>
                  {item.brand && (
                    <p className="text-xs text-gray-400">{item.brand}</p>
                  )}
                  {item.price && (
                    <p className="text-sm font-semibold">${item.price}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.colors?.map((color) => (
                    <Chip key={color} size="sm" variant="solid">
                      {color}
                    </Chip>
                  ))}
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <Button
                    className="flex-1"
                    color="warning"
                    size="sm"
                    variant="solid"
                    onPress={() => handleRemoveFromWardrobe(item.id)}
                  >
                    Remove
                  </Button>
                  <Button
                    className="flex-1"
                    color="danger"
                    size="sm"
                    variant="solid"
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Wardrobe Modal */}
      <Modal
        isOpen={wardrobeModal.isOpen}
        size="lg"
        onClose={wardrobeModal.onClose}
      >
        <ModalContent>
          <ModalHeader>Edit Wardrobe</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                label="Title"
                placeholder="e.g., Summer Collection"
                value={wardrobeFormData.title}
                onChange={(e) =>
                  setWardrobeFormData({
                    ...wardrobeFormData,
                    title: e.target.value,
                  })
                }
              />
              <Textarea
                label="Description"
                placeholder="Describe this wardrobe..."
                value={wardrobeFormData.description}
                onChange={(e) =>
                  setWardrobeFormData({
                    ...wardrobeFormData,
                    description: e.target.value,
                  })
                }
              />
              <Input
                label="Cover Image URL"
                placeholder="https://..."
                value={wardrobeFormData.coverImage}
                onChange={(e) =>
                  setWardrobeFormData({
                    ...wardrobeFormData,
                    coverImage: e.target.value,
                  })
                }
              />
              <Checkbox
                isSelected={wardrobeFormData.isPublic}
                onValueChange={(value) =>
                  setWardrobeFormData({ ...wardrobeFormData, isPublic: value })
                }
              >
                Make this wardrobe public
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="solid" onPress={wardrobeModal.onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleUpdateWardrobe}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Existing Items Modal */}
      <Modal
        isOpen={addExistingModal.isOpen}
        size="3xl"
        scrollBehavior="inside"
        onClose={addExistingModal.onClose}
      >
        <ModalContent>
          <ModalHeader>Add Existing Items to Wardrobe</ModalHeader>
          <ModalBody>
            {itemsNotInWardrobe.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  All your items are already in this wardrobe
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {itemsNotInWardrobe.map((item) => (
                  <Card
                    key={item.id}
                    isPressable
                    className={`cursor-pointer ${
                      selectedExistingItems.has(item.id)
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onPress={() => toggleItemSelection(item.id)}
                  >
                    <CardBody className="p-0">
                      <div className="relative">
                        <Image
                          alt={item.name}
                          className="w-full h-40 object-cover"
                          src={item.imageUrl || "/images/placeholder.png"}
                        />
                        {selectedExistingItems.has(item.id) && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                clipRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                fillRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </CardBody>
                    <CardFooter className="flex-col items-start">
                      <p className="font-semibold text-sm">{item.name}</p>
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
            <Button variant="solid" onPress={addExistingModal.onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={selectedExistingItems.size === 0}
              onPress={handleAddExistingItems}
            >
              Add {selectedExistingItems.size} Item
              {selectedExistingItems.size !== 1 ? "s" : ""}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
