
import React, { useState } from 'react';
import { Image as ImageIcon, X, ArrowLeft, Sparkles, UploadCloud } from 'lucide-react';

interface Props {
  onImageSelected: (base64: string) => void;
  onBack: () => void;
}

const ImageUploader: React.FC<Props> = ({ onImageSelected, onBack }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (preview) {
      onImageSelected(preview);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 tu-vi-card rounded-xl shadow-xl border-2 border-[#d4b38a]">
      <h2 className="text-3xl font-bold text-[#8b4513] mb-4 text-center">Tải Ảnh Lá Số</h2>
      <p className="text-gray-600 mb-6 text-center italic">
        Vui lòng chụp hoặc tải ảnh lá số từ <a href="https://tuvichanco.vn/" target="_blank" className="text-blue-600 underline">tuvichanco.vn</a> để chuyên gia phân tích.
      </p>

      <div className="border-4 border-dashed border-[#d4b38a] p-8 rounded-xl flex flex-col items-center justify-center bg-white/30 cursor-pointer hover:bg-white/50 transition-all relative overflow-hidden min-h-[300px]">
        {preview ? (
          <div className="relative w-full">
            <img src={preview} alt="Tu Vi Chart Preview" className="max-w-full rounded shadow-md mx-auto" />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow transition-transform hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-4 cursor-pointer w-full h-full py-10">
            <div className="p-6 bg-[#f0e6d6] rounded-full shadow-inner">
              <UploadCloud className="h-16 w-16 text-[#8b4513]" />
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-[#8b4513] block mb-1">Chọn ảnh lá số</span>
              <span className="text-sm text-gray-500">hoặc kéo thả vào đây</span>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-xl shadow transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Quay lại
        </button>
        <button
          onClick={handleContinue}
          disabled={!preview}
          className={`flex-1 font-bold py-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 ${
            preview ? 'bg-[#8b4513] hover:bg-[#6d3610] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Phân Tích & Luận Giải <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
