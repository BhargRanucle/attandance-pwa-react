import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Image, X, RotateCw } from "lucide-react";

interface ImageUploadProps {
  onImageChange: (base64Image: string | null) => void;
  isClear: any;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageChange,
  isClear,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);
      onImageChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    handleClearImage();
  }, [isClear]);

  const triggerFileSelection = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* Image Box - Clickable when empty */}
      <div
        className={`border border-app-purple/20 rounded-lg p-2 bg-white relative ${
          !previewUrl ? "cursor-pointer hover:bg-gray-50" : ""
        }`}
        onClick={!previewUrl ? triggerFileSelection : undefined}
      >
        <AspectRatio ratio={1 / 0.5} className="overflow-hidden bg-muted">
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Uploaded image"
                className="object-cover w-full h-full rounded"
              />
              {/* Buttons positioned at the bottom of the image */}
              <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white/80 hover:bg-white text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileSelection();
                  }}
                >
                  <RotateCw size={14} className="mr-1" />
                  Change
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white/80 hover:bg-white hover:text-red-600 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearImage();
                  }}
                >
                  <X size={14} className="mr-1" />
                  Clear
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-app-light">
              <Image size={48} className="text-app-purple/40" />
              <p className="mt-2 text-sm text-muted-foreground">Click Here To Upload Image</p>
            </div>
          )}
        </AspectRatio>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUpload;
