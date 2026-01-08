export const generateOutfitCollage = async (
  itemImageUrls: (string | undefined)[],
  outputSize = 800 // Default 800px square
): Promise<string> => {
  // Filter out undefined or empty URLs
  const validUrls = itemImageUrls.filter((url): url is string => !!url);

  if (validUrls.length === 0) return "";

  // 1. Setup Canvas
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  // Fill background white (optional, could be transparent)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outputSize, outputSize);

  // 2. Load all images concurrently
  const imagePromises = validUrls.map((url) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      // CRITICAL: This allows the canvas to export data even if images come from external domains.
      // Note: The external server (e.g., S3, Cloudinary) must send Access-Control-Allow-Origin headers.
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => resolve(img);
      // If an image fails to load, resolve with a placeholder or empty image to prevent breaking the whole collage
      img.onerror = () => {
        console.warn(`Failed to load image for collage: ${url}`);
        // Create a 1x1 transparent placeholder
        const placeholder = new Image();
        placeholder.src =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        resolve(placeholder);
      };
    });
  });

  const images = await Promise.all(imagePromises);

  // 3. Calculate Grid Layout based on number of successfully loaded images
  const count = images.length;
  if (count === 0) return "";

  const cols = Math.ceil(Math.sqrt(count));
  const cellWidth = outputSize / cols;
  const rows = Math.ceil(count / cols);
  const cellHeight = outputSize / rows;

  // 4. Draw Images onto the canvas grid
  images.forEach((img, index) => {
    if (img.width === 0 || img.height === 0) return; // Skip failed loads

    const colIndex = index % cols;
    const rowIndex = Math.floor(index / cols);

    const x = colIndex * cellWidth;
    const y = rowIndex * cellHeight;

    // Logic to simulate CSS "object-fit: cover" so images don't stretch weirdly
    const scale = Math.max(cellWidth / img.width, cellHeight / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const offsetX = (cellWidth - w) / 2;
    const offsetY = (cellHeight - h) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, cellWidth, cellHeight); // Define the cell area bounds
    ctx.clip(); // Clip drawing to within the bounds
    ctx.drawImage(img, x + offsetX, y + offsetY, w, h);
    ctx.restore();
  });

  // 5. Return Base64 Image using JPEG to save space (0.8 = 80% quality)
  // Using JPEG is crucial here because PNG Base64 strings are gigantic.
  return canvas.toDataURL("image/jpeg", 0.8);
};
