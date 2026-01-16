"use client";
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import { Button, Spinner } from "@heroui/react";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

interface ClothingItem {
  id: string;
  imageUrl?: string;
}

interface CanvasItem extends ClothingItem {
  uniqueId: string; // To allow adding the same item multiple times
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface CollageBuilderProps {
  items: ClothingItem[];
  onSave: (file: File) => Promise<void>;
}

export default function CollageBuilder({ items, onSave }: CollageBuilderProps) {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Add item to canvas (center it initially)
  const addToCanvas = (item: ClothingItem) => {
    if (!item.imageUrl) return;

    const newItem: CanvasItem = {
      ...item,
      uniqueId: `${item.id}-${Date.now()}`,
      x: 100, // Default position
      y: 100,
      width: 200, // Default size
      height: 200, // Keep aspect ratio logic in Rnd if needed
      zIndex: canvasItems.length + 1,
    };

    setCanvasItems([...canvasItems, newItem]);
    setSelectedId(newItem.uniqueId);
  };

  // Update item position/size
  const updateItem = (uniqueId: string, data: Partial<CanvasItem>) => {
    setCanvasItems((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId ? { ...item, ...data } : item
      )
    );
  };

  // Bring to front on click
  const bringToFront = (uniqueId: string) => {
    setSelectedId(uniqueId);
    setCanvasItems((prev) => {
      const maxZ = Math.max(...prev.map((i) => i.zIndex), 0);
      return prev.map((item) =>
        item.uniqueId === uniqueId ? { ...item, zIndex: maxZ + 1 } : item
      );
    });
  };

  const removeItem = (uniqueId: string) => {
    setCanvasItems((prev) => prev.filter((i) => i.uniqueId !== uniqueId));
    setSelectedId(null);
  };

  const handleSave = async () => {
    if (!canvasRef.current || canvasItems.length === 0) return;
    setIsSaving(true);
    setSelectedId(null); // Deselect to hide borders before screenshot

    // Wait for render to clear selection
    setTimeout(async () => {
      try {
        if (!canvasRef.current) return;

        const canvas = await html2canvas(canvasRef.current, {
          useCORS: true, // Crucial for external images
          backgroundColor: "#ffffff",
          scale: 2, // Higher quality
        });

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "collage.png", { type: "image/png" });
            await onSave(file);
          }
        });
      } catch (err) {
        console.error("Collage failed", err);
        alert("Failed to generate image. Ensure images allow CORS.");
      } finally {
        setIsSaving(false);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* TOOLBAR */}
      <div className="flex justify-between items-center bg-default-50 p-2 border border-default-200">
        <span className="text-xs font-bold uppercase tracking-widest text-default-400 pl-2">
          Canvas ({canvasItems.length} items)
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            color="danger"
            variant="light"
            radius="none"
            isDisabled={!selectedId}
            onPress={() => selectedId && removeItem(selectedId)}
            isIconOnly
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            color="primary"
            radius="none"
            className="uppercase font-bold tracking-widest text-[10px]"
            onPress={handleSave}
            isLoading={isSaving}
            startContent={
              !isSaving && <ArrowDownTrayIcon className="w-4 h-4" />
            }
          >
            Save Collage
          </Button>
        </div>
      </div>

      <div className="flex gap-4 h-[500px]">
        {/* SIDEBAR: AVAILABLE ITEMS */}
        <div className="w-32 flex-shrink-0 overflow-y-auto border border-default-200 p-2 space-y-2 bg-default-50">
          <p className="text-[10px] text-center uppercase tracking-widest text-default-400 mb-2">
            Drag or Click
          </p>
          {items.map((item) => (
            <div
              key={item.id}
              className="aspect-square bg-white border border-default-200 cursor-pointer hover:border-primary transition-colors p-1"
              onClick={() => addToCanvas(item)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl || ""}
                alt="Thumbnail"
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* CANVAS AREA */}
        <div
          className="flex-1 bg-white border border-dashed border-default-300 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
          ref={canvasRef}
        >
          {canvasItems.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-default-300 pointer-events-none">
              <ArrowsPointingOutIcon className="w-12 h-12 mb-2 opacity-50" />
              <span className="uppercase tracking-widest text-xs font-bold">
                Workspace Empty
              </span>
            </div>
          )}

          {canvasItems.map((item) => (
            <Rnd
              key={item.uniqueId}
              size={{ width: item.width, height: item.height }}
              position={{ x: item.x, y: item.y }}
              onDragStop={(e, d) => {
                updateItem(item.uniqueId, { x: d.x, y: d.y });
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateItem(item.uniqueId, {
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  ...position,
                });
              }}
              onMouseDown={() => bringToFront(item.uniqueId)}
              // Only show resize handles when selected
              enableResizing={selectedId === item.uniqueId}
              style={{ zIndex: item.zIndex }}
              className={
                selectedId === item.uniqueId
                  ? "border border-primary border-dashed"
                  : ""
              }
              lockAspectRatio={true} // Optional: keep garment shape
            >
              <div className="w-full h-full relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt="collage-item"
                  className="w-full h-full object-contain pointer-events-none"
                />
                {/* Delete Button (Visible only when selected) */}
                {selectedId === item.uniqueId && (
                  <button
                    className="absolute -top-3 -right-3 bg-danger text-white rounded-full p-1 shadow-md z-50 hover:scale-110 transition-transform"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      removeItem(item.uniqueId);
                    }}
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </Rnd>
          ))}
        </div>
      </div>
    </div>
  );
}
