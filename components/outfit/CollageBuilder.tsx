"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import {
  Button,
  Slider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Divider,
  Switch,
} from "@heroui/react";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  ScissorsIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ViewfinderCircleIcon,
  MinusIcon,
  PlusIcon,
  ArrowsPointingInIcon,
  DocumentDuplicateIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon,
  Square2StackIcon,
  ArrowPathIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface ClothingItem {
  id: string;
  name?: string;
  imageUrl?: string;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasItem extends ClothingItem {
  uniqueId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  flipX: boolean;
  flipY: boolean;
  cropData?: CropData;
  naturalWidth: number;
  naturalHeight: number;
}

interface CollageBuilderProps {
  items: ClothingItem[];
  onSave: (file: File) => Promise<void>;
}

type ToolMode = "select" | "pan";

const CANVAS_PRESETS = [
  { name: "Portrait (3:4)", width: 600, height: 800 },
  { name: "Square (1:1)", width: 700, height: 700 },
  { name: "Landscape (4:3)", width: 800, height: 600 },
  { name: "Story (9:16)", width: 450, height: 800 },
  { name: "Wide (16:9)", width: 800, height: 450 },
];

export default function CollageBuilder({ items, onSave }: CollageBuilderProps) {
  // Canvas items state
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Tool mode
  const [toolMode, setToolMode] = useState<ToolMode>("select");

  // Canvas transform state (pan & zoom)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Canvas size
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const gridSize = 20;

  // History for undo/redo
  const [history, setHistory] = useState<CanvasItem[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const maxHistory = 30;

  // Crop modal state
  const cropModal = useDisclosure();
  const [cropTarget, setCropTarget] = useState<CanvasItem | null>(null);
  const [cropSelection, setCropSelection] = useState<CropData | null>(null);
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });
  const [cropDragType, setCropDragType] = useState<"move" | "resize" | null>(
    null,
  );
  const [cropResizeHandle, setCropResizeHandle] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  // Get selected item
  const selectedItem = canvasItems.find((item) => item.uniqueId === selectedId);

  // Save to history (debounced)
  const saveToHistory = useCallback(
    (newItems: CanvasItem[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newItems)));
        if (newHistory.length > maxHistory) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, maxHistory - 1));
    },
    [historyIndex],
  );

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setCanvasItems(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      setSelectedId(null);
    }
  }, [historyIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setCanvasItems(JSON.parse(JSON.stringify(history[historyIndex + 1])));
      setSelectedId(null);
    }
  }, [historyIndex, history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
      // Delete selected
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeItem(selectedId);
      }
      // Deselect: Escape
      if (e.key === "Escape") {
        setSelectedId(null);
        setToolMode("select");
      }
      // Toggle pan mode: Space (hold)
      if (e.key === " " && !e.repeat) {
        e.preventDefault();
        setToolMode("pan");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setToolMode("select");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [undo, redo, selectedId]);

  // Add item to canvas
  const addToCanvas = (item: ClothingItem) => {
    if (!item.imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = item.imageUrl;

    img.onload = () => {
      const baseWidth = 180;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const calculatedHeight = baseWidth / aspectRatio;

      // Position in center of visible canvas area
      const centerX = canvasSize.width / 2 - baseWidth / 2;
      const centerY = canvasSize.height / 2 - calculatedHeight / 2;

      const newItem: CanvasItem = {
        ...item,
        uniqueId: `${item.id}-${Date.now()}`,
        x: centerX,
        y: centerY,
        width: baseWidth,
        height: calculatedHeight,
        zIndex: canvasItems.length + 1,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        flipX: false,
        flipY: false,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      };

      const newItems = [...canvasItems, newItem];
      setCanvasItems(newItems);
      saveToHistory(newItems);
      setSelectedId(newItem.uniqueId);
    };
  };

  // Update item
  const updateItem = (
    uniqueId: string,
    data: Partial<CanvasItem>,
    saveHistory = true,
  ) => {
    const newItems = canvasItems.map((item) =>
      item.uniqueId === uniqueId ? { ...item, ...data } : item,
    );
    setCanvasItems(newItems);
    if (saveHistory) {
      saveToHistory(newItems);
    }
  };

  // Snap to grid helper
  const snapValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  // Bring to front
  const bringToFront = (uniqueId: string) => {
    setSelectedId(uniqueId);
    const maxZ = Math.max(...canvasItems.map((i) => i.zIndex), 0);
    updateItem(uniqueId, { zIndex: maxZ + 1 });
  };

  // Send to back
  const sendToBack = (uniqueId: string) => {
    const minZ = Math.min(...canvasItems.map((i) => i.zIndex), 0);
    updateItem(uniqueId, { zIndex: minZ - 1 });
  };

  // Move layer up/down
  const moveLayerUp = (uniqueId: string) => {
    const item = canvasItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;
    const higherItems = canvasItems.filter((i) => i.zIndex > item.zIndex);
    if (higherItems.length === 0) return;
    const nextItem = higherItems.reduce((a, b) =>
      a.zIndex < b.zIndex ? a : b,
    );
    const newItems = canvasItems.map((i) => {
      if (i.uniqueId === uniqueId) return { ...i, zIndex: nextItem.zIndex };
      if (i.uniqueId === nextItem.uniqueId)
        return { ...i, zIndex: item.zIndex };
      return i;
    });
    setCanvasItems(newItems);
    saveToHistory(newItems);
  };

  const moveLayerDown = (uniqueId: string) => {
    const item = canvasItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;
    const lowerItems = canvasItems.filter((i) => i.zIndex < item.zIndex);
    if (lowerItems.length === 0) return;
    const prevItem = lowerItems.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
    const newItems = canvasItems.map((i) => {
      if (i.uniqueId === uniqueId) return { ...i, zIndex: prevItem.zIndex };
      if (i.uniqueId === prevItem.uniqueId)
        return { ...i, zIndex: item.zIndex };
      return i;
    });
    setCanvasItems(newItems);
    saveToHistory(newItems);
  };

  // Duplicate item
  const duplicateItem = (uniqueId: string) => {
    const item = canvasItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;
    const newItem: CanvasItem = {
      ...item,
      uniqueId: `${item.id}-${Date.now()}`,
      x: item.x + 20,
      y: item.y + 20,
      zIndex: Math.max(...canvasItems.map((i) => i.zIndex)) + 1,
    };
    const newItems = [...canvasItems, newItem];
    setCanvasItems(newItems);
    saveToHistory(newItems);
    setSelectedId(newItem.uniqueId);
  };

  // Remove item
  const removeItem = (uniqueId: string) => {
    const newItems = canvasItems.filter((i) => i.uniqueId !== uniqueId);
    setCanvasItems(newItems);
    saveToHistory(newItems);
    setSelectedId(null);
  };

  // Clear canvas
  const clearCanvas = () => {
    if (canvasItems.length === 0) return;
    if (!confirm("Clear all items from canvas?")) return;
    setCanvasItems([]);
    saveToHistory([]);
    setSelectedId(null);
  };

  // Canvas pan handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (toolMode === "pan" || e.button === 1) {
      // Middle mouse button or pan mode
      setIsPanning(true);
      setPanStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y,
      });
      e.preventDefault();
    } else if (toolMode === "select") {
      // Click on empty canvas area to deselect
      if (
        e.target === canvasContainerRef.current ||
        e.target === canvasRef.current
      ) {
        setSelectedId(null);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setCanvasZoom((prev) => Math.min(Math.max(prev + delta, 0.25), 3));
    }
  };

  const resetView = () => {
    setCanvasOffset({ x: 0, y: 0 });
    setCanvasZoom(1);
  };

  const fitToView = () => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current.getBoundingClientRect();
    const scaleX = (container.width - 40) / canvasSize.width;
    const scaleY = (container.height - 40) / canvasSize.height;
    const scale = Math.min(scaleX, scaleY, 1);
    setCanvasZoom(scale);
    setCanvasOffset({ x: 0, y: 0 });
  };

  // --- CROP FUNCTIONALITY ---
  const openCropModal = (item: CanvasItem) => {
    setCropTarget(item);
    // Initialize crop selection to full image or existing crop
    if (item.cropData) {
      setCropSelection(item.cropData);
    } else {
      setCropSelection({
        x: 0,
        y: 0,
        width: item.naturalWidth,
        height: item.naturalHeight,
      });
    }
    cropModal.onOpen();
  };

  const handleCropMouseDown = (
    e: React.MouseEvent,
    type: "move" | "resize",
    handle?: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCropDragging(true);
    setCropDragType(type);
    setCropDragStart({ x: e.clientX, y: e.clientY });
    if (handle) setCropResizeHandle(handle);
  };

  const handleCropMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        !isCropDragging ||
        !cropSelection ||
        !cropTarget ||
        !cropImageRef.current
      )
        return;

      const rect = cropImageRef.current.getBoundingClientRect();
      const scaleX = cropTarget.naturalWidth / rect.width;
      const scaleY = cropTarget.naturalHeight / rect.height;

      const deltaX = (e.clientX - cropDragStart.x) * scaleX;
      const deltaY = (e.clientY - cropDragStart.y) * scaleY;

      if (cropDragType === "move") {
        const newX = Math.max(
          0,
          Math.min(
            cropSelection.x + deltaX,
            cropTarget.naturalWidth - cropSelection.width,
          ),
        );
        const newY = Math.max(
          0,
          Math.min(
            cropSelection.y + deltaY,
            cropTarget.naturalHeight - cropSelection.height,
          ),
        );
        setCropSelection((prev) =>
          prev ? { ...prev, x: newX, y: newY } : null,
        );
      } else if (cropDragType === "resize" && cropResizeHandle) {
        let newCrop = { ...cropSelection };
        const minSize = 50;

        switch (cropResizeHandle) {
          case "se":
            newCrop.width = Math.max(
              minSize,
              Math.min(
                cropSelection.width + deltaX,
                cropTarget.naturalWidth - cropSelection.x,
              ),
            );
            newCrop.height = Math.max(
              minSize,
              Math.min(
                cropSelection.height + deltaY,
                cropTarget.naturalHeight - cropSelection.y,
              ),
            );
            break;
          case "sw":
            const newWidthSW = Math.max(minSize, cropSelection.width - deltaX);
            const newXSW = cropSelection.x + (cropSelection.width - newWidthSW);
            if (newXSW >= 0) {
              newCrop.x = newXSW;
              newCrop.width = newWidthSW;
            }
            newCrop.height = Math.max(
              minSize,
              Math.min(
                cropSelection.height + deltaY,
                cropTarget.naturalHeight - cropSelection.y,
              ),
            );
            break;
          case "ne":
            newCrop.width = Math.max(
              minSize,
              Math.min(
                cropSelection.width + deltaX,
                cropTarget.naturalWidth - cropSelection.x,
              ),
            );
            const newHeightNE = Math.max(
              minSize,
              cropSelection.height - deltaY,
            );
            const newYNE =
              cropSelection.y + (cropSelection.height - newHeightNE);
            if (newYNE >= 0) {
              newCrop.y = newYNE;
              newCrop.height = newHeightNE;
            }
            break;
          case "nw":
            const newWidthNW = Math.max(minSize, cropSelection.width - deltaX);
            const newXNW = cropSelection.x + (cropSelection.width - newWidthNW);
            if (newXNW >= 0) {
              newCrop.x = newXNW;
              newCrop.width = newWidthNW;
            }
            const newHeightNW = Math.max(
              minSize,
              cropSelection.height - deltaY,
            );
            const newYNW =
              cropSelection.y + (cropSelection.height - newHeightNW);
            if (newYNW >= 0) {
              newCrop.y = newYNW;
              newCrop.height = newHeightNW;
            }
            break;
        }
        setCropSelection(newCrop);
      }

      setCropDragStart({ x: e.clientX, y: e.clientY });
    },
    [
      isCropDragging,
      cropSelection,
      cropTarget,
      cropDragStart,
      cropDragType,
      cropResizeHandle,
    ],
  );

  const handleCropMouseUp = useCallback(() => {
    setIsCropDragging(false);
    setCropDragType(null);
    setCropResizeHandle(null);
  }, []);

  useEffect(() => {
    if (isCropDragging) {
      window.addEventListener("mousemove", handleCropMouseMove);
      window.addEventListener("mouseup", handleCropMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleCropMouseMove);
        window.removeEventListener("mouseup", handleCropMouseUp);
      };
    }
  }, [isCropDragging, handleCropMouseMove, handleCropMouseUp]);

  const applyCrop = () => {
    if (!cropTarget || !cropSelection) return;

    // Calculate new dimensions maintaining aspect ratio of crop
    const cropAspect = cropSelection.width / cropSelection.height;
    const newHeight = cropTarget.width / cropAspect;

    updateItem(cropTarget.uniqueId, {
      cropData: cropSelection,
      height: newHeight,
    });

    cropModal.onClose();
    setCropTarget(null);
    setCropSelection(null);
  };

  const resetCrop = () => {
    if (!cropTarget) return;
    setCropSelection({
      x: 0,
      y: 0,
      width: cropTarget.naturalWidth,
      height: cropTarget.naturalHeight,
    });
  };

  const removeCrop = () => {
    if (!cropTarget) return;

    // Restore original aspect ratio
    const originalAspect = cropTarget.naturalWidth / cropTarget.naturalHeight;
    const newHeight = cropTarget.width / originalAspect;

    updateItem(cropTarget.uniqueId, {
      cropData: undefined,
      height: newHeight,
    });

    cropModal.onClose();
    setCropTarget(null);
    setCropSelection(null);
  };

  // Save collage
  const handleSave = async () => {
    if (!canvasRef.current || canvasItems.length === 0) return;
    setIsSaving(true);
    setSelectedId(null);

    // Wait for deselection to render
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        scale: 2,
        width: canvasSize.width,
        height: canvasSize.height,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "collage.png", { type: "image/png" });
          await onSave(file);
        }
      }, "image/png");
    } catch (err) {
      console.error("Collage failed", err);
      alert("Failed to generate. Ensure images allow CORS.");
    } finally {
      setIsSaving(false);
    }
  };

  // Get image style with crop
  const getImageStyle = (item: CanvasItem): React.CSSProperties => {
    if (!item.cropData) {
      return {
        width: "100%",
        height: "100%",
        objectFit: "fill" as const,
        transform:
          `${item.flipX ? "scaleX(-1)" : ""} ${item.flipY ? "scaleY(-1)" : ""}`.trim() ||
          undefined,
      };
    }

    const { cropData, naturalWidth, naturalHeight, width, height } = item;
    const scaleX = width / cropData.width;
    const scaleY = height / cropData.height;

    return {
      position: "absolute" as const,
      width: naturalWidth * scaleX,
      height: naturalHeight * scaleY,
      left: -cropData.x * scaleX,
      top: -cropData.y * scaleY,
      maxWidth: "none",
      transform:
        `${item.flipX ? "scaleX(-1)" : ""} ${item.flipY ? "scaleY(-1)" : ""}`.trim() ||
        undefined,
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* MAIN TOOLBAR */}
      <div className="flex justify-between items-center bg-default-50 px-3 py-2 border-b border-default-200 gap-2 flex-wrap">
        {/* Left: Tools */}
        <div className="flex items-center gap-1">
          <Tooltip content="Select (V)">
            <Button
              size="sm"
              variant={toolMode === "select" ? "solid" : "light"}
              color={toolMode === "select" ? "primary" : "default"}
              radius="none"
              isIconOnly
              onPress={() => setToolMode("select")}
            >
              <CursorArrowRaysIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Pan (Space / Middle Click)">
            <Button
              size="sm"
              variant={toolMode === "pan" ? "solid" : "light"}
              color={toolMode === "pan" ? "primary" : "default"}
              radius="none"
              isIconOnly
              onPress={() => setToolMode("pan")}
            >
              <HandRaisedIcon className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Divider orientation="vertical" className="h-6 mx-2" />

          <Tooltip content="Undo (Ctrl+Z)">
            <Button
              size="sm"
              variant="light"
              radius="none"
              isIconOnly
              isDisabled={historyIndex <= 0}
              onPress={undo}
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Redo (Ctrl+Y)">
            <Button
              size="sm"
              variant="light"
              radius="none"
              isIconOnly
              isDisabled={historyIndex >= history.length - 1}
              onPress={redo}
            >
              <ArrowUturnRightIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>

        {/* Center: Zoom */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="light"
            radius="none"
            isIconOnly
            onPress={() => setCanvasZoom((z) => Math.max(z - 0.1, 0.25))}
          >
            <MinusIcon className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono w-12 text-center">
            {Math.round(canvasZoom * 100)}%
          </span>
          <Button
            size="sm"
            variant="light"
            radius="none"
            isIconOnly
            onPress={() => setCanvasZoom((z) => Math.min(z + 0.1, 3))}
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
          <Tooltip content="Fit to View">
            <Button
              size="sm"
              variant="light"
              radius="none"
              isIconOnly
              onPress={fitToView}
            >
              <ArrowsPointingInIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Reset View">
            <Button
              size="sm"
              variant="light"
              radius="none"
              isIconOnly
              onPress={resetView}
            >
              <ViewfinderCircleIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Canvas Size Preset */}
          <Popover placement="bottom">
            <PopoverTrigger>
              <Button
                size="sm"
                variant="flat"
                radius="none"
                className="text-xs"
              >
                {canvasSize.width}×{canvasSize.height}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-2">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-default-500 pb-1">
                  Canvas Size
                </p>
                {CANVAS_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    size="sm"
                    variant="light"
                    radius="none"
                    className="w-full justify-start text-xs"
                    onPress={() =>
                      setCanvasSize({
                        width: preset.width,
                        height: preset.height,
                      })
                    }
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip content="Toggle Grid">
            <Button
              size="sm"
              variant={showGrid ? "flat" : "light"}
              radius="none"
              isIconOnly
              onPress={() => setShowGrid(!showGrid)}
            >
              <Square2StackIcon className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Clear Canvas">
            <Button
              size="sm"
              variant="light"
              color="danger"
              radius="none"
              isIconOnly
              isDisabled={canvasItems.length === 0}
              onPress={clearCanvas}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Button
            size="sm"
            color="primary"
            radius="none"
            className="uppercase font-bold tracking-widest text-[10px]"
            onPress={handleSave}
            isLoading={isSaving}
            isDisabled={canvasItems.length === 0}
            startContent={
              !isSaving && <ArrowDownTrayIcon className="w-4 h-4" />
            }
          >
            Save
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR: Available Items */}
        <div className="w-28 flex-shrink-0 overflow-y-auto border-r border-default-200 p-2 space-y-2 bg-default-50">
          <p className="text-[9px] text-center uppercase tracking-widest text-default-400 mb-2">
            Click to Add
          </p>
          {items.map((item) => (
            <Tooltip
              key={item.id}
              content={item.name || "Add to canvas"}
              placement="right"
            >
              <div
                className="aspect-square bg-white border border-default-200 cursor-pointer hover:border-primary hover:shadow-sm transition-all p-1"
                onClick={() => addToCanvas(item)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl || ""}
                  alt={item.name || "Item"}
                  className="w-full h-full object-contain"
                />
              </div>
            </Tooltip>
          ))}
        </div>

        {/* CANVAS AREA */}
        <div
          ref={canvasContainerRef}
          className={`flex-1 overflow-hidden bg-default-100 relative ${
            toolMode === "pan" || isPanning ? "cursor-grab" : "cursor-default"
          } ${isPanning ? "cursor-grabbing" : ""}`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleWheel}
        >
          {/* Canvas wrapper for transform */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            }}
          >
            {/* Actual canvas */}
            <div
              ref={canvasRef}
              className="relative bg-white shadow-xl"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                transform: `scale(${canvasZoom})`,
                transformOrigin: "center center",
                backgroundImage: showGrid
                  ? `linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)`
                  : undefined,
                backgroundSize: showGrid
                  ? `${gridSize}px ${gridSize}px`
                  : undefined,
              }}
            >
              {canvasItems.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-default-300 pointer-events-none">
                  <ArrowsPointingOutIcon className="w-16 h-16 mb-3 opacity-30" />
                  <span className="uppercase tracking-widest text-xs font-bold">
                    Click items to add
                  </span>
                </div>
              )}

              {canvasItems
                .filter((item) => item.visible)
                .map((item) => (
                  <Rnd
                    key={item.uniqueId}
                    size={{ width: item.width, height: item.height }}
                    position={{ x: item.x, y: item.y }}
                    onDragStop={(e, d) => {
                      updateItem(item.uniqueId, {
                        x: snapValue(d.x),
                        y: snapValue(d.y),
                      });
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      updateItem(item.uniqueId, {
                        width: snapValue(parseInt(ref.style.width)),
                        height: snapValue(parseInt(ref.style.height)),
                        x: snapValue(position.x),
                        y: snapValue(position.y),
                      });
                    }}
                    onMouseDown={(e) => {
                      if (toolMode === "select" && !item.locked) {
                        bringToFront(item.uniqueId);
                      }
                    }}
                    disableDragging={item.locked || toolMode !== "select"}
                    enableResizing={
                      selectedId === item.uniqueId && !item.locked
                        ? {
                            top: true,
                            right: true,
                            bottom: true,
                            left: true,
                            topRight: true,
                            bottomRight: true,
                            bottomLeft: true,
                            topLeft: true,
                          }
                        : false
                    }
                    style={{
                      zIndex: item.zIndex,
                      opacity: item.opacity,
                    }}
                    className={`${
                      selectedId === item.uniqueId
                        ? "ring-2 ring-primary ring-offset-1"
                        : ""
                    } ${item.locked ? "cursor-not-allowed" : ""}`}
                    lockAspectRatio={true}
                    bounds="parent"
                  >
                    <div
                      className="w-full h-full relative overflow-hidden"
                      style={{ transform: `rotate(${item.rotation}deg)` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt="collage-item"
                        style={getImageStyle(item)}
                        className="pointer-events-none"
                        crossOrigin="anonymous"
                      />

                      {/* Selection controls */}
                      {selectedId === item.uniqueId && !item.locked && (
                        <>
                          <button
                            className="absolute -top-3 -right-3 bg-danger text-white rounded-full p-1 shadow-md z-50 hover:scale-110 transition-transform"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              removeItem(item.uniqueId);
                            }}
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                          <button
                            className="absolute -top-3 -left-3 bg-primary text-white rounded-full p-1 shadow-md z-50 hover:scale-110 transition-transform"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              openCropModal(item);
                            }}
                          >
                            <ScissorsIcon className="w-3 h-3" />
                          </button>
                        </>
                      )}

                      {/* Lock indicator */}
                      {item.locked && (
                        <div className="absolute top-1 right-1 bg-black/50 text-white rounded p-0.5">
                          <LockClosedIcon className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </Rnd>
                ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Item Properties */}
        {selectedItem && (
          <div className="w-52 flex-shrink-0 overflow-y-auto border-l border-default-200 bg-default-50 p-3 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-default-400 mb-2">
                Selected Item
              </p>
              <p className="text-sm font-medium truncate">
                {selectedItem.name || "Unnamed"}
              </p>
            </div>

            <Divider />

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-default-400">
                Actions
              </p>
              <div className="grid grid-cols-4 gap-1">
                <Tooltip content="Crop">
                  <Button
                    size="sm"
                    variant="flat"
                    radius="none"
                    isIconOnly
                    onPress={() => openCropModal(selectedItem)}
                  >
                    <ScissorsIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Duplicate">
                  <Button
                    size="sm"
                    variant="flat"
                    radius="none"
                    isIconOnly
                    onPress={() => duplicateItem(selectedItem.uniqueId)}
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content={selectedItem.locked ? "Unlock" : "Lock"}>
                  <Button
                    size="sm"
                    variant={selectedItem.locked ? "solid" : "flat"}
                    color={selectedItem.locked ? "warning" : "default"}
                    radius="none"
                    isIconOnly
                    onPress={() =>
                      updateItem(selectedItem.uniqueId, {
                        locked: !selectedItem.locked,
                      })
                    }
                  >
                    {selectedItem.locked ? (
                      <LockClosedIcon className="w-4 h-4" />
                    ) : (
                      <LockOpenIcon className="w-4 h-4" />
                    )}
                  </Button>
                </Tooltip>
                <Tooltip content={selectedItem.visible ? "Hide" : "Show"}>
                  <Button
                    size="sm"
                    variant="flat"
                    radius="none"
                    isIconOnly
                    onPress={() =>
                      updateItem(selectedItem.uniqueId, {
                        visible: !selectedItem.visible,
                      })
                    }
                  >
                    {selectedItem.visible ? (
                      <EyeIcon className="w-4 h-4" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4" />
                    )}
                  </Button>
                </Tooltip>
              </div>
            </div>

            <Divider />

            {/* Layer Order */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-default-400">
                Layer
              </p>
              <div className="flex gap-1">
                <Tooltip content="Bring Forward">
                  <Button
                    size="sm"
                    variant="flat"
                    radius="none"
                    isIconOnly
                    onPress={() => moveLayerUp(selectedItem.uniqueId)}
                  >
                    <ChevronUpIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Send Backward">
                  <Button
                    size="sm"
                    variant="flat"
                    radius="none"
                    isIconOnly
                    onPress={() => moveLayerDown(selectedItem.uniqueId)}
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Bring to Front">
                  <Button
                    size="sm"
                    variant="flat"
                    radius="none"
                    isIconOnly
                    onPress={() => bringToFront(selectedItem.uniqueId)}
                  >
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Send to Back">
                  <Button
                    size="sm"
                    variant="flat"
                    radius="none"
                    isIconOnly
                    onPress={() => sendToBack(selectedItem.uniqueId)}
                  >
                    <ArrowsPointingInIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>

            <Divider />

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-[10px] uppercase tracking-widest text-default-400">
                  Opacity
                </p>
                <span className="text-[10px] text-default-500">
                  {Math.round(selectedItem.opacity * 100)}%
                </span>
              </div>
              <Slider
                size="sm"
                step={0.05}
                minValue={0.1}
                maxValue={1}
                value={selectedItem.opacity}
                onChange={(val) =>
                  updateItem(
                    selectedItem.uniqueId,
                    { opacity: val as number },
                    false,
                  )
                }
                onChangeEnd={(val) =>
                  updateItem(selectedItem.uniqueId, { opacity: val as number })
                }
                className="max-w-full"
              />
            </div>

            {/* Flip */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-default-400">
                Flip
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedItem.flipX ? "solid" : "flat"}
                  color={selectedItem.flipX ? "primary" : "default"}
                  radius="none"
                  className="flex-1 text-[10px]"
                  onPress={() =>
                    updateItem(selectedItem.uniqueId, {
                      flipX: !selectedItem.flipX,
                    })
                  }
                >
                  Horizontal
                </Button>
                <Button
                  size="sm"
                  variant={selectedItem.flipY ? "solid" : "flat"}
                  color={selectedItem.flipY ? "primary" : "default"}
                  radius="none"
                  className="flex-1 text-[10px]"
                  onPress={() =>
                    updateItem(selectedItem.uniqueId, {
                      flipY: !selectedItem.flipY,
                    })
                  }
                >
                  Vertical
                </Button>
              </div>
            </div>

            <Divider />

            {/* Delete */}
            <Button
              size="sm"
              color="danger"
              variant="flat"
              radius="none"
              fullWidth
              startContent={<TrashIcon className="w-4 h-4" />}
              onPress={() => removeItem(selectedItem.uniqueId)}
            >
              Remove
            </Button>
          </div>
        )}
      </div>

      {/* CROP MODAL */}
      <Modal
        isOpen={cropModal.isOpen}
        onClose={cropModal.onClose}
        size="3xl"
        radius="none"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="uppercase tracking-widest font-bold text-sm">
            Crop Image
          </ModalHeader>
          <ModalBody>
            {cropTarget && cropSelection && (
              <div className="relative bg-default-100 flex items-center justify-center p-4 min-h-[400px]">
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={cropImageRef}
                    src={cropTarget.imageUrl}
                    alt="Crop preview"
                    className="max-w-full max-h-[400px] object-contain"
                    crossOrigin="anonymous"
                    style={{ opacity: 0.5 }}
                  />

                  {/* Crop overlay */}
                  {cropImageRef.current && (
                    <div
                      className="absolute border-2 border-primary bg-transparent cursor-move"
                      style={{
                        left: `${(cropSelection.x / cropTarget.naturalWidth) * 100}%`,
                        top: `${(cropSelection.y / cropTarget.naturalHeight) * 100}%`,
                        width: `${(cropSelection.width / cropTarget.naturalWidth) * 100}%`,
                        height: `${(cropSelection.height / cropTarget.naturalHeight) * 100}%`,
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                      }}
                      onMouseDown={(e) => handleCropMouseDown(e, "move")}
                    >
                      {/* Resize handles */}
                      {["nw", "ne", "sw", "se"].map((handle) => (
                        <div
                          key={handle}
                          className={`absolute w-4 h-4 bg-white border-2 border-primary cursor-${
                            handle === "nw" || handle === "se" ? "nwse" : "nesw"
                          }-resize`}
                          style={{
                            top: handle.includes("n") ? -8 : "auto",
                            bottom: handle.includes("s") ? -8 : "auto",
                            left: handle.includes("w") ? -8 : "auto",
                            right: handle.includes("e") ? -8 : "auto",
                          }}
                          onMouseDown={(e) =>
                            handleCropMouseDown(e, "resize", handle)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-default-500">
                {cropSelection && (
                  <span>
                    {Math.round(cropSelection.width)} ×{" "}
                    {Math.round(cropSelection.height)} px
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  radius="none"
                  onPress={resetCrop}
                >
                  Reset
                </Button>
                {cropTarget?.cropData && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="warning"
                    radius="none"
                    onPress={removeCrop}
                  >
                    Remove Crop
                  </Button>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" radius="none" onPress={cropModal.onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              radius="none"
              onPress={applyCrop}
              startContent={<CheckIcon className="w-4 h-4" />}
            >
              Apply Crop
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
