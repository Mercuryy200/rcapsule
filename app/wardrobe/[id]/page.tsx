"use client";
import { use, useEffect, useState } from "react";
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
  Select,
  SelectItem,
  useDisclosure,
  Spinner,
  Textarea,
  Checkbox,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

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
}

interface Wardrobe {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  Clothes: ClothingItem[];
}

const categories = [
  "shirt",
  "pants",
  "dress",
  "shoes",
  "jacket",
  "accessories",
  "tank top",
  "denim",
];
const seasons = ["spring", "summer", "fall", "winter", "all-season"];
const occasions = [
  "casual",
  "work",
  "formal",
  "sports",
  "party",
  "school",
  "home",
];
const colors = [
  "red",
  "blue",
  "green",
  "black",
  "white",
  "gray",
  "brown",
  "pink",
  "yellow",
  "purple",
];

export default function WardrobePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const wardrobeId = params.id as string;

  const [wardrobe, setWardrobe] = useState<Wardrobe | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableClothes, setAvailableClothes] = useState<ClothingItem[]>([]);

  // Modals
  const itemModal = useDisclosure();
  const wardrobeModal = useDisclosure();
  const addExistingModal = useDisclosure();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [selectedExistingItems, setSelectedExistingItems] = useState<
    Set<string>
  >(new Set());

  // Form data for items
  const [itemFormData, setItemFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    colors: [] as string[],
    season: "",
    size: "",
    link: "",
    imageUrl: "",
    placesToWear: [] as string[],
  });

  // Form data for wardrobe
  const [wardrobeFormData, setWardrobeFormData] = useState({
    title: "",
    description: "",
    isPublic: false,
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
        setWardrobe(data);
        setWardrobeFormData({
          title: data.title,
          description: data.description || "",
          isPublic: data.isPublic,
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
        setAvailableClothes(data);
      }
    } catch (error) {
      console.error("Error fetching clothes:", error);
    }
  };

  // Item handlers
  const handleOpenAddNew = () => {
    setIsEditing(false);
    setItemFormData({
      name: "",
      category: "",
      brand: "",
      price: "",
      colors: [] as string[],
      season: "",
      size: "",
      link: "",
      imageUrl: "",
      placesToWear: [] as string[],
    });
    itemModal.onOpen();
  };

  const handleOpenEdit = (item: ClothingItem) => {
    setIsEditing(true);
    setSelectedItem(item);
    setItemFormData({
      name: item.name,
      category: item.category,
      brand: item.brand || "",
      price: item.price?.toString() || "",
      colors: item.colors || [],
      season: item.season || "",
      size: item.size || "",
      link: item.link || "",
      imageUrl: item.imageUrl || "",
      placesToWear: item.placesToWear || [],
    });
    itemModal.onOpen();
  };

  const handleSubmitItem = async () => {
    const data = {
      name: itemFormData.name,
      category: itemFormData.category,
      brand: itemFormData.brand || null,
      price: itemFormData.price ? parseFloat(itemFormData.price) : null,
      colors: itemFormData.colors,
      season: itemFormData.season || null,
      size: itemFormData.size || null,
      link: itemFormData.link || null,
      imageUrl: itemFormData.imageUrl || null,
      placesToWear: itemFormData.placesToWear,
      wardrobeId: wardrobeId,
    };

    try {
      const url = isEditing
        ? `/api/clothes/${selectedItem?.id}`
        : "/api/clothes";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchWardrobe();
        fetchAvailableClothes();
        itemModal.onClose();
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item permanently?"))
      return;

    try {
      const response = await fetch(`/api/clothes/${id}`, {
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

  const handleRemoveFromWardrobe = async (id: string) => {
    if (!confirm("Remove this item from the wardrobe?")) return;

    try {
      const response = await fetch(`/api/clothes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wardrobeId: null }),
      });

      if (response.ok) {
        fetchWardrobe();
        fetchAvailableClothes();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Wardrobe handlers
  const handleOpenEditWardrobe = () => {
    wardrobeModal.onOpen();
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
        "Are you sure you want to delete this wardrobe? This will not delete the items inside."
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

  // Add existing items handlers
  const handleOpenAddExisting = () => {
    setSelectedExistingItems(new Set());
    addExistingModal.onOpen();
  };

  const handleAddExistingItems = async () => {
    try {
      const promises = Array.from(selectedExistingItems).map((itemId) =>
        fetch(`/api/clothes/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wardrobeId: wardrobeId }),
        })
      );

      await Promise.all(promises);
      fetchWardrobe();
      fetchAvailableClothes();
      addExistingModal.onClose();
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

  // Filter out items already in this wardrobe
  const itemsNotInWardrobe = availableClothes.filter(
    (item) =>
      !wardrobe?.Clothes.some((wardrobeItem) => wardrobeItem.id === item.id)
  );

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
            variant="flat"
            startContent={<PencilIcon className="w-5 h-5" />}
            onPress={handleOpenEditWardrobe}
          >
            Edit Wardrobe
          </Button>
          <Button
            color="danger"
            variant="flat"
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
          color="primary"
          startContent={<PlusIcon className="w-5 h-5" />}
          onPress={handleOpenAddNew}
        >
          Add New Item
        </Button>
        <Button
          color="secondary"
          variant="flat"
          onPress={handleOpenAddExisting}
        >
          Add Existing Items
        </Button>
      </div>

      {/* Clothes Grid */}
      {wardrobe.Clothes.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-lg text-gray-500 mb-4">
              No items in this wardrobe yet
            </p>
            <div className="flex gap-3 justify-center">
              <Button color="primary" onPress={handleOpenAddNew}>
                Add New Item
              </Button>
              <Button
                color="secondary"
                variant="flat"
                onPress={handleOpenAddExisting}
              >
                Add Existing Items
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wardrobe.Clothes.map((item) => (
            <Card key={item.id} className="w-full">
              <CardBody className="p-0 overflow-hidden">
                <div className="w-full h-64 relative">
                  <Image
                    alt={item.name}
                    className="w-full h-full object-cover"
                    classNames={{
                      img: "w-full h-full object-cover",
                    }}
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
                  {item.colors.map((color) => (
                    <Chip key={color} size="sm" variant="flat">
                      {color}
                    </Chip>
                  ))}
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <Button
                    className="flex-1"
                    color="primary"
                    size="sm"
                    variant="flat"
                    onPress={() => handleOpenEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    className="flex-1"
                    color="warning"
                    size="sm"
                    variant="flat"
                    onPress={() => handleRemoveFromWardrobe(item.id)}
                  >
                    Remove
                  </Button>
                  <Button
                    className="flex-1"
                    color="danger"
                    size="sm"
                    variant="flat"
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

      {/* Add/Edit Item Modal */}
      <Modal isOpen={itemModal.isOpen} size="2xl" onClose={itemModal.onClose}>
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Item" : "Add New Item"}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                label="Name"
                placeholder="e.g., Blue Denim Jacket"
                value={itemFormData.name}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, name: e.target.value })
                }
              />
              <Select
                isRequired
                label="Category"
                placeholder="Select category"
                selectedKeys={
                  itemFormData.category ? [itemFormData.category] : []
                }
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, category: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <SelectItem key={cat}>{cat}</SelectItem>
                ))}
              </Select>
              <Input
                label="Brand"
                placeholder="e.g., Nike, Zara"
                value={itemFormData.brand}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, brand: e.target.value })
                }
              />
              <Input
                label="Price"
                placeholder="29.99"
                type="number"
                value={itemFormData.price}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, price: e.target.value })
                }
              />
              <Select
                label="Colors"
                placeholder="Select colors"
                selectionMode="multiple"
                selectedKeys={new Set(itemFormData.colors || [])}
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys) as string[];
                  setItemFormData({ ...itemFormData, colors: selectedArray });
                }}
              >
                {colors.map((color) => (
                  <SelectItem key={color}>{color}</SelectItem>
                ))}
              </Select>
              <Select
                label="Season"
                placeholder="Select season"
                selectedKeys={itemFormData.season ? [itemFormData.season] : []}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, season: e.target.value })
                }
              >
                {seasons.map((season) => (
                  <SelectItem key={season}>{season}</SelectItem>
                ))}
              </Select>
              <Input
                label="Size"
                placeholder="e.g., M, L, 32"
                value={itemFormData.size}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, size: e.target.value })
                }
              />
              <Input
                label="Link"
                placeholder="https://..."
                value={itemFormData.link}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, link: e.target.value })
                }
              />
              <Input
                label="Image URL"
                placeholder="https://..."
                value={itemFormData.imageUrl}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, imageUrl: e.target.value })
                }
              />
              <Select
                label="Places to Wear"
                placeholder="Select places"
                selectionMode="multiple"
                selectedKeys={new Set(itemFormData.placesToWear || [])}
                onSelectionChange={(keys) => {
                  const selectedArray = Array.from(keys) as string[];
                  setItemFormData({
                    ...itemFormData,
                    placesToWear: selectedArray,
                  });
                }}
              >
                {occasions.map((occasion) => (
                  <SelectItem key={occasion}>{occasion}</SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={itemModal.onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmitItem}>
              {isEditing ? "Update" : "Add"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
            <Button variant="flat" onPress={wardrobeModal.onClose}>
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
        onClose={addExistingModal.onClose}
        scrollBehavior="inside"
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
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
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
            <Button variant="flat" onPress={addExistingModal.onClose}>
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
