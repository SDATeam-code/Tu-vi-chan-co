
import React, { useState } from 'react';

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
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-3 cursor-pointer w-full h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#8b4513]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-lg font-medium text-[#8b4513]">Chọn ảnh lá số hoặc Kéo thả vào đây</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg shadow transition-colors"
        >
          Quay lại
        </button>
        <button
          onClick={handleContinue}
          disabled={!preview}
          className={`flex-1 font-bold py-3 rounded-lg shadow transition-colors ${
            preview ? 'bg-[#8b4513] hover:bg-[#6d3610] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Phân Tích & Luận Giải
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
