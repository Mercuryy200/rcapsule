"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button, Tooltip } from "@heroui/react";
import {
  SparklesIcon,
  XMarkIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/contexts/UserContext";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "clothes" | "outfits" | "profile";
  label?: string;
  maxSize?: number;
  showRemoveBackground?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = "clothes",
  label = "Upload Image",
  maxSize = 5,
  showRemoveBackground = true,
}: ImageUploadProps) {
  const { isPremium } = useUser();
  const [uploading, setUploading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, WEBP, or GIF image");
      return;
    }

    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setCurrentFile(file);

    // Upload the file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(value);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!currentFile && !preview) return;

    setRemovingBg(true);
    setError("");

    try {
      const formData = new FormData();

      if (currentFile) {
        // Convert file to proper blob with correct type
        const arrayBuffer = await currentFile.arrayBuffer();

        // Determine content type
        let contentType = currentFile.type;
        if (!contentType || contentType === "application/octet-stream") {
          const nameLower = currentFile.name.toLowerCase();
          if (nameLower.endsWith(".png")) {
            contentType = "image/png";
          } else if (nameLower.endsWith(".webp")) {
            contentType = "image/webp";
          } else {
            contentType = "image/jpeg";
          }
        }

        const blob = new Blob([arrayBuffer], { type: contentType });
        const extension = contentType.split("/")[1] || "jpg";
        formData.append("file", blob, `image.${extension}`);
      } else if (preview) {
        // If preview is a URL (not base64)
        if (!preview.startsWith("data:")) {
          formData.append("imageUrl", preview);
        } else {
          // Convert base64 to blob
          const response = await fetch(preview);
          const blob = await response.blob();

          // Ensure correct content type
          const contentType = blob.type || "image/png";
          const extension = contentType.split("/")[1] || "png";
          const properBlob = new Blob([await blob.arrayBuffer()], {
            type: contentType,
          });
          formData.append("file", properBlob, `image.${extension}`);
        }
      }

      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Background removal failed");
      }

      const data = await response.json();

      // Update preview with processed image
      setPreview(data.image);

      // Convert base64 to file and upload
      const base64Response = await fetch(data.image);
      const blob = await base64Response.blob();
      const processedFile = new File([blob], "image-no-bg.png", {
        type: "image/png",
      });

      setCurrentFile(processedFile);

      // Upload the processed image
      await uploadFile(processedFile);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Background removal failed",
      );
    } finally {
      setRemovingBg(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    setCurrentFile(null);
    onChange("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>

      {preview ? (
        <div className="relative w-full h-64 overflow-hidden border-2 border-default-200 bg-[url('/images/transparent-grid.png')] bg-repeat">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
            unoptimized
          />

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            {/* Remove Background Button */}
            {showRemoveBackground && folder === "clothes" && (
              <Tooltip
                content={
                  isPremium
                    ? "Remove background"
                    : "Upgrade to Premium for Magic Edit"
                }
                placement="bottom"
              >
                <span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    radius="none"
                    className={`bg-background/90 backdrop-blur-sm ${
                      !isPremium ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onPress={isPremium ? handleRemoveBackground : undefined}
                    isDisabled={!isPremium || uploading || removingBg}
                    isLoading={removingBg}
                  >
                    <SparklesIcon className="w-4 h-4" />
                  </Button>
                </span>
              </Tooltip>
            )}

            {/* Remove Image Button */}
            <Button
              isIconOnly
              color="danger"
              size="sm"
              radius="none"
              className="bg-background/90 backdrop-blur-sm"
              onPress={handleRemove}
              isDisabled={uploading || removingBg}
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Premium Badge for non-premium users */}
          {showRemoveBackground && folder === "clothes" && !isPremium && (
            <div className="absolute bottom-2 left-2 z-10">
              <Tooltip content="Upgrade to remove backgrounds">
                <Button
                  size="sm"
                  radius="none"
                  variant="flat"
                  className="bg-background/90 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold"
                  startContent={<SparklesIcon className="w-3 h-3" />}
                  onPress={() => (window.location.href = "/pricing")}
                >
                  Magic Edit
                </Button>
              </Tooltip>
            </div>
          )}

          {/* Loading Overlay */}
          {(uploading || removingBg) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3" />
                <p className="text-xs text-default-600 uppercase tracking-widest font-bold">
                  {removingBg ? "Removing Background..." : "Uploading..."}
                </p>
                {removingBg && (
                  <p className="text-[10px] text-default-400 mt-1">
                    This may take a few seconds
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`w-full h-64 border-2 border-dashed flex flex-col items-center justify-center transition-all ${
            uploading
              ? "border-default-300 bg-default-100 cursor-not-allowed"
              : "border-default-300 bg-default-50 cursor-pointer hover:border-foreground hover:bg-default-100"
          }`}
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-default-600 font-medium">
                Uploading...
              </p>
            </div>
          ) : (
            <>
              <CloudArrowUpIcon className="w-12 h-12 text-default-400 mb-3" />
              <p className="text-sm text-default-600 font-bold uppercase tracking-widest">
                Click to upload
              </p>
              <p className="text-xs text-default-400 mt-2">
                PNG, JPG, WEBP, GIF up to {maxSize}MB
              </p>
              {isPremium && folder === "clothes" && (
                <div className="flex items-center gap-1 mt-3 text-[10px] text-default-500">
                  <SparklesIcon className="w-3 h-3" />
                  <span className="uppercase tracking-widest">
                    Magic Edit available
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
