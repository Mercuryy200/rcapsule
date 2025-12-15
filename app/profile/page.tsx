"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Avatar,
  Button,
  Image,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Switch,
  useDisclosure,
} from "@heroui/react";
import {
  LockClosedIcon,
  GlobeAltIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface Wardrobe {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  clothesCount: number;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
  const [totalClothes, setTotalClothes] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newWardrobe, setNewWardrobe] = useState({
    title: "",
    description: "",
    isPublic: false,
    coverImage: "",
  });
  const { user, refreshUser } = useUser();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      refreshUser();
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  //fetches the current wardrobes
  const fetchProfile = async () => {
    try {
      const [wardrobesRes, clothesRes] = await Promise.all([
        fetch("/api/wardrobes"),
        fetch("/api/clothes"),
      ]);
      if (wardrobesRes.ok && clothesRes.ok) {
        const wardrobesData = await wardrobesRes.json();
        const clothesData = await clothesRes.json();
        setWardrobes(wardrobesData);
        setTotalClothes(clothesData.length);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWardrobe = async () => {
    try {
      const response = await fetch("/api/wardrobes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWardrobe),
      });

      if (response.ok) {
        fetchProfile();
        onClose();
        setNewWardrobe({
          title: "",
          description: "",
          isPublic: false,
          coverImage: "",
        });
      }
    } catch (error) {
      console.error("Error creating wardrobe:", error);
    }
  };

  const toggleWardrobeVisibility = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/wardrobes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !currentStatus }),
      });

      if (response.ok) {
        fetchProfile();
      }
    } catch (error) {
      console.error("Error updating wardrobe:", error);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <Avatar
          src={user?.image || undefined}
          className="w-24 h-24"
          name={user?.name || "User"}
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
          <p className="text-gray-500 mb-4">{user?.email}</p>
          <div className="flex gap-4">
            <div>
              <p className="text-2xl font-bold">{totalClothes}</p>
              <p className="text-sm text-gray-500">Total Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{wardrobes.length}</p>
              <p className="text-sm text-gray-500">Wardrobes</p>
            </div>
          </div>
          <Button
            color="primary"
            variant="solid"
            className="mt-4"
            onPress={() => router.push("/settings")}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Wardrobes Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Wardrobes</h2>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-5 h-5" />}
          onPress={onOpen}
        >
          Create Wardrobe
        </Button>
      </div>

      {wardrobes.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-lg text-gray-500 mb-4">No wardrobes yet</p>
            <Button color="primary" onPress={onOpen}>
              Create Your First Wardrobe
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wardrobes.map((wardrobe) => (
            <Card
              key={wardrobe.id}
              isPressable
              onPress={() => router.push(`/wardrobe/${wardrobe.id}`)}
              className="hover:scale-105 transition-transform"
            >
              <CardHeader className="flex justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{wardrobe.title}</h3>
                  <p className="text-sm text-gray-500">
                    {wardrobe.clothesCount} items
                  </p>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWardrobeVisibility(wardrobe.id, wardrobe.isPublic);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      toggleWardrobeVisibility(wardrobe.id, wardrobe.isPublic);
                    }
                  }}
                >
                  <Button as="div" isIconOnly size="sm" variant="light">
                    {wardrobe.isPublic ? (
                      <GlobeAltIcon className="w-5 h-5 text-success" />
                    ) : (
                      <LockClosedIcon className="w-5 h-5 text-warning" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <Image
                  src={wardrobe.coverImage}
                  className=" h-48 w-96 object-cover"
                />

                {wardrobe.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {wardrobe.description}
                  </p>
                )}
                <Chip
                  size="sm"
                  variant="solid"
                  color={wardrobe.isPublic ? "success" : "warning"}
                >
                  {wardrobe.isPublic ? "Public" : "Private"}
                </Chip>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create New Wardrobe</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                label="Title"
                placeholder="e.g., Summer Wardrobe, Bali Trip"
                value={newWardrobe.title}
                onChange={(e) =>
                  setNewWardrobe({ ...newWardrobe, title: e.target.value })
                }
              />
              <Input
                label="Description"
                placeholder="Optional description"
                value={newWardrobe.description}
                onChange={(e) =>
                  setNewWardrobe({
                    ...newWardrobe,
                    description: e.target.value,
                  })
                }
              />
              <Input
                label="Image Link"
                placeholder="Optional Cover Image"
                value={newWardrobe.coverImage}
                onChange={(e) =>
                  setNewWardrobe({
                    ...newWardrobe,
                    coverImage: e.target.value,
                  })
                }
              />
              <Switch
                isSelected={newWardrobe.isPublic}
                onValueChange={(value) =>
                  setNewWardrobe({ ...newWardrobe, isPublic: value })
                }
              >
                Make this wardrobe public
              </Switch>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="solid" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateWardrobe}
              isDisabled={!newWardrobe.title}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
