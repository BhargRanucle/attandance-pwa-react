import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import getCroppedImg, { Crop } from "@/utils/cropImage";
import { Button } from "@/components/ui/button";
import { Area } from "react-easy-crop";

export interface CropperModalProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}


const CropperModal = ({ image, onCropComplete, onCancel }: CropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Crop | null>(null);

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    onCropComplete(croppedImage);
    onCancel();
  };

  return (
    <div className="top-spacing fixed inset-0 mt-0 z-50 bg-black/85 flex place-items-center items-center justify-center">
      <div className="flex flex-col place-items-center justify-center bg-white rounded-lg py-3 w-[95%] max-w-md">
        <div className="img-crop-box relative w-full bg-white">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <Button onClick={onCancel} variant="outline" className="text-white font-bold bg-gradient-to-t from-app-red to-app-red-dark py-3 w-24">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="outline" className="text-white font-bold bg-gradient-to-b from-app-blue to-app-purple-dark py-3 w-24">Crop</Button>
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
