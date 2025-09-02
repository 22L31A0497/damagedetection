export async function preprocessImage(file: File): Promise<Blob> {
  if (!file) throw new Error('No file provided');
  if (!file.type.startsWith('image/')) {
    throw new Error(`Invalid file type: ${file.type}. Only images are supported.`);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        if (img.width === 0 || img.height === 0) {
          throw new Error('Image failed to load properly');
        }

        // Resize
        canvas.width = 512;
        canvas.height = 512;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, 512, 512);

        // Adjust brightness + contrast
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        const brightness = 15;
        const contrast = 10;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * (data[i] - 128) + 128 + brightness;     // R
          data[i + 1] = factor * (data[i + 1] - 128) + 128 + brightness; // G
          data[i + 2] = factor * (data[i + 2] - 128) + 128 + brightness; // B
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert canvas to blob'));
        }, 'image/jpeg', 0.9);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    img.src = URL.createObjectURL(file);
  });
}
