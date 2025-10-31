"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
  useDisclosure,
} from "@heroui/react";

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

const categories = [
  "shirt",
  "pants",
  "dress",
  "shoes",
  "jacket",
  "accessories",
  "tank top",
  "denim",
  "underwear",
  "outerwear",
  "swimwear",
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
  "beach",
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

export default function ItemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);

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
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchClothingItem();
    }
  }, [status, router]);

  const fetchClothingItem = async () => {
    try {
      const response = await fetch("/api/clothes");

      if (response.ok) {
        const data = await response.json();

        setClothes(data);
      }
    } catch (error) {
      console.error("Error fetching clothes:", error);
    } finally {
      setLoading(false);
    }
  };
  return;
}
