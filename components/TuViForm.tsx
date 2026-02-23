
import React, { useRef, useState } from 'react';
import { User, Calendar, Clock, BookOpen, Globe, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { UserInfo, ExtractedBirthInfo } from '../types';
import { extractBirthInfoFromImage, PRELOADED_KNOWLEDGE } from '../services/geminiService';

interface Props {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  onNext: () => void;
  onImageCaptured?: (base64: string) => void;
}

const TuViForm: React.FC<Props> = ({ userInfo, setUserInfo, onNext, onImageCaptured }) => {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    vi: {
      title: "Thông Tin Đương Số",
      fullName: "Họ và Tên",
      gender: "Giới tính",
      male: "Nam",
      female: "Nữ",
      calendar: "Loại lịch",
      solar: "Dương Lịch",
      lunar: "Âm Lịch",
      day: "Ngày",
      month: "Tháng",
      year: "Năm",
      hour: "Giờ sinh",
      minute: "phút",
      viewYear: "Năm xem hạn",
      autoFill: "Tải ảnh lá số tự điền",
      scanning: "Đang quét...",
      next: "Tiếp Theo: Tải Lên Lá Số →",
      confirm: "Xác Nhận & Luận Giải",
      knowledgeLabel: "Kiến thức Tử Vi chuyên sâu",
      knowledgeDesc: "Hệ thống sẽ ưu tiên các quy tắc này để luận giải.",
      useDefaultKnowledge: "Dùng Tài liệu 51 Trang (Mặc định)",
      visitChanco: "Lấy lá số tại tuvichanco.vn",
      lang: "English Version"
    },
    en: {
      title: "User Information",
      fullName: "Full Name",
      gender: "Gender",
      male: "Male",
      female: "Female",
      calendar: "Calendar Type",
      solar: "Solar",
      lunar: "Lunar",
      day: "Day",
      month: "Month",
      year: "Year",
      hour: "Birth Hour",
      minute: "min",
      viewYear: "View Year",
      autoFill: "Auto-fill from Chart",
      scanning: "Scanning...",
      next: "Next: Upload Chart Image →",
      confirm: "Confirm & Interpret",
      knowledgeLabel: "Custom Knowledge Base",
      knowledgeDesc: "Prioritize rules from your own documents.",
      useDefaultKnowledge: "Use 51-Page Document (Default)",
      visitChanco: "Get chart at tuvichanco.vn",
      lang: "Tiếng Việt"
    }
  }[userInfo.language];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleUseDefaultKnowledge = () => {
    setUserInfo({ ...userInfo, knowledgeBase: PRELOADED_KNOWLEDGE });
  };

  const handleKnowledgeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUserInfo({ ...userInfo, knowledgeBase: ev.target?.result as string });
    };
    reader.readAsText(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAutoFilling(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // Thông báo cho App component về ảnh mới tải lên
      if (onImageCaptured) onImageCaptured(base64);
      
      try {
        const info: ExtractedBirthInfo = await extractBirthInfoFromImage(base64);
        
        // Cập nhật state với dữ liệu đã trích xuất
        // Đảm bảo mapping chính xác các trường và giá trị mặc định
        setUserInfo({
          ...userInfo,
          fullName: info.fullName || userInfo.fullName,
          gender: (info.gender === 'Nam' || info.gender === 'Nữ') ? info.gender : userInfo.gender,
          birthDay: info.birthDay || userInfo.birthDay,
          birthMonth: info.birthMonth || userInfo.birthMonth,
          birthYear: info.birthYear || userInfo.birthYear,
          birthHour: info.birthHour || userInfo.birthHour,
          birthMinute: info.birthMinute || userInfo.birthMinute,
        });
      } catch (err) {
        console.error("TuViForm OCR Error:", err);
        alert(userInfo.language === 'vi' ? "Không thể tự động điền. Vui lòng kiểm tra lại ảnh lá số." : "Auto-fill failed. Please check your chart image.");
      } finally {
        setIsAutoFilling(false);
        // Reset file input để có thể chọn lại cùng 1 file nếu cần
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 tu-vi-card rounded-xl shadow-xl border-2 border-[#d4b38a]">
      <div className="mb-4 text-center">
        <a 
          href="https://tuvichanco.vn/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-[#8b4513] text-white px-4 py-2 rounded-full font-bold text-sm shadow hover:bg-[#6d3610] transition-all"
        >
          🌐 {t.visitChanco}
        </a>
      </div>

      <div className="flex justify-between items-center mb-6 border-b-2 border-[#d4b38a] pb-4">
        <h2 className="text-3xl font-bold text-[#8b4513] flex items-center gap-2">
          <User className="w-8 h-8" /> {t.title}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setUserInfo({...userInfo, language: userInfo.language === 'vi' ? 'en' : 'vi'})}
            className="text-xs font-bold border border-[#d4b38a] px-2 py-1 rounded bg-white text-[#8b4513]"
          >
            {t.lang}
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAutoFilling}
            className="text-xs bg-[#f0e6d6] hover:bg-[#e6d9c4] text-[#8b4513] px-3 py-2 rounded-lg border border-[#d4b38a] flex items-center gap-2 font-bold transition-all shadow-sm"
          >
            {isAutoFilling ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4 text-[#8b4513]" />
                {t.scanning}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" /> {t.autoFill}
              </span>
            )}
          </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.fullName}:</label>
          <input
            type="text"
            name="fullName"
            value={userInfo.fullName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b4513] outline-none"
            placeholder="Nguyen Van A"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white/50 rounded-lg border border-[#e2d1b9]">
            <span className="block text-sm font-semibold text-gray-700 mb-2">{t.gender}:</span>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input type="radio" checked={userInfo.gender === 'Nam'} onChange={() => setUserInfo({...userInfo, gender: 'Nam'})} className="w-4 h-4 accent-[#8b4513]" />
                <span>{t.male}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input type="radio" checked={userInfo.gender === 'Nữ'} onChange={() => setUserInfo({...userInfo, gender: 'Nữ'})} className="w-4 h-4 accent-[#8b4513]" />
                <span>{t.female}</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-white/50 rounded-lg border border-[#e2d1b9]">
            <span className="block text-sm font-semibold text-gray-700 mb-2">{t.calendar}:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input type="radio" checked={userInfo.calendarType === 'Dương Lịch'} onChange={() => setUserInfo({...userInfo, calendarType: 'Dương Lịch'})} className="w-4 h-4 accent-[#8b4513]" />
                <span>{t.solar}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input type="radio" checked={userInfo.calendarType === 'Âm Lịch'} onChange={() => setUserInfo({...userInfo, calendarType: 'Âm Lịch'})} className="w-4 h-4 accent-[#8b4513]" />
                <span>{t.lunar}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">{t.day}</label>
            <input type="number" name="birthDay" value={userInfo.birthDay} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded shadow-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">{t.month}</label>
            <input type="number" name="birthMonth" value={userInfo.birthMonth} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded shadow-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">{t.year}</label>
            <input type="number" name="birthYear" value={userInfo.birthYear} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded shadow-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">{t.hour}:</label>
            <div className="flex items-center gap-2">
              <input type="number" name="birthHour" value={userInfo.birthHour} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
              <span className="font-bold text-[#8b4513]">h</span>
              <input type="number" name="birthMinute" value={userInfo.birthMinute} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
              <span className="text-xs text-gray-500">{t.minute}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">{t.viewYear}:</label>
            <input
              type="number"
              name="viewYear"
              value={userInfo.viewYear}
              onChange={handleChange}
              className="w-full p-2 border-2 border-[#b22222]/30 rounded-lg font-bold text-[#b22222] bg-[#fff9f0] text-center text-lg"
            />
          </div>
        </div>

        <div className="p-5 bg-[#fff9f0] rounded-xl border-2 border-[#d4b38a] shadow-inner">
          <label className="block text-sm font-bold text-[#8b4513] mb-3 uppercase tracking-wider">☯ {t.knowledgeLabel}</label>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleUseDefaultKnowledge}
              className={`p-3 rounded-lg border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                userInfo.knowledgeBase === PRELOADED_KNOWLEDGE 
                ? 'bg-[#8b4513] text-white border-[#8b4513] shadow-md' 
                : 'bg-white text-[#8b4513] border-[#d4b38a] hover:bg-[#fcf8f2]'
              }`}
            >
              📜 {t.useDefaultKnowledge} {userInfo.knowledgeBase === PRELOADED_KNOWLEDGE && "✓"}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#d4b38a]"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#fff9f0] px-2 text-gray-500 font-bold">Hoặc tải file riêng</span></div>
            </div>

            <input 
              type="file" 
              accept=".txt" 
              onChange={handleKnowledgeFile} 
              className="text-xs w-full cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0e6d6] file:text-[#8b4513] hover:file:bg-[#e6d9c4]"
            />
          </div>
          {userInfo.knowledgeBase && userInfo.knowledgeBase !== PRELOADED_KNOWLEDGE && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-[10px] text-green-700 font-bold animate-pulse">
              ✓ ĐÃ TẢI KIẾN THỨC TỪ FILE RIÊNG
            </div>
          )}
        </div>

        <button
          onClick={onNext}
          className="w-full bg-[#8b4513] hover:bg-[#6d3610] text-white font-bold py-4 px-6 rounded-xl shadow-2xl transition-all mt-4 text-2xl transform active:scale-95 border-b-4 border-[#5d2e0d]"
        >
          {onImageCaptured ? t.confirm : t.next}
        </button>
      </div>
    </div>
  );
};

export default TuViForm;
