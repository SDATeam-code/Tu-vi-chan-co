
import React, { useState } from 'react';
import { UserInfo, AppStep, AnalysisResult } from './types';
import { analyzeTuViImage } from './services/geminiService';
import TuViForm from './components/TuViForm';
import ImageUploader from './components/ImageUploader';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.FORM);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    gender: 'Nam',
    calendarType: 'Dương Lịch',
    birthYear: '1988',
    birthMonth: '4',
    birthDay: '9',
    birthHour: '11',
    birthMinute: '0',
    viewYear: '2026', // Set default to 2026 as requested
    language: 'vi'
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleStartAnalysis = async (base64Image: string) => {
    setCapturedImage(base64Image);
    setStep(AppStep.PROCESSING);
    
    const isEn = userInfo.language === 'en';
    setLoadingMessage(isEn ? 'Analyzing chart structure...' : 'Đang phân tích cấu trúc lá số...');
    
    try {
      setLoadingMessage(isEn ? 'Decoding Four Transformations...' : 'Đang giải mã Tứ Hóa & Phi Tinh...');
      const result = await analyzeTuViImage(base64Image, userInfo);
      
      setLoadingMessage((isEn ? 'Synthesizing interpretation for ' : 'Đang tổng hợp vận hạn năm ') + userInfo.viewYear + '...');
      setAnalysisResult({
        extractedData: result.extractedText,
        interpretation: result.interpretation
      });
      setStep(AppStep.RESULT);
    } catch (error) {
      console.error(error);
      alert(isEn ? 'Deep analysis failed. Please check your image.' : 'Đã xảy ra lỗi trong quá trình phân tích chuyên sâu. Vui lòng kiểm tra lại hình ảnh.');
      setStep(AppStep.UPLOAD);
    }
  };

  const handleFormNext = () => {
    if (capturedImage) {
      handleStartAnalysis(capturedImage);
    } else {
      setStep(AppStep.UPLOAD);
    }
  };

  const renderContent = () => {
    const isEn = userInfo.language === 'en';
    switch (step) {
      case AppStep.FORM:
        return (
          <TuViForm 
            userInfo={userInfo} 
            setUserInfo={setUserInfo} 
            onNext={handleFormNext} 
            onImageCaptured={(img) => setCapturedImage(img)}
          />
        );
      case AppStep.UPLOAD:
        return <ImageUploader onBack={() => setStep(AppStep.FORM)} onImageSelected={handleStartAnalysis} />;
      case AppStep.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-[#d4b38a] border-t-[#8b4513] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-[#8b4513]">☯</div>
            </div>
            <p className="text-2xl font-serif italic text-[#8b4513] animate-pulse">
              {loadingMessage}
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {isEn 
                ? "Sơn Cụ Expert is combining Nam Phái and Tứ Hóa principles with your custom knowledge base."
                : "Chuyên gia Sơn Cụ đang kết hợp kiến thức Nam Phái và Tứ Hóa cùng tài liệu của bạn để luận giải."
              }
            </p>
          </div>
        );
      case AppStep.RESULT:
        return analysisResult ? (
          <ResultView 
            result={analysisResult} 
            userInfo={userInfo} 
            onReset={() => {
              setAnalysisResult(null);
              setCapturedImage(null);
              setStep(AppStep.FORM);
            }} 
            chartImage={capturedImage}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#fcfaf7]">
      <header className="bg-[#8b4513] text-white py-8 shadow-2xl mb-12 border-b-4 border-[#d4b38a] no-print">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#d4b38a] uppercase text-xs tracking-[0.5em] font-bold mb-2">Sơn Cụ Entertainment</p>
          <h1 className="text-5xl font-bold tracking-widest font-serif mb-3">TỬ VI CHÂN CƠ</h1>
          <p className="text-[#d4b38a] uppercase text-sm tracking-[0.4em] font-semibold">Nam Phái Nghiệm Lý • Tứ Hóa Phi Tinh</p>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {renderContent()}
      </main>

      <footer className="mt-20 py-12 border-t border-[#e2d1b9] text-center text-gray-500 bg-white/50 no-print">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-[#8b4513] font-bold tracking-widest mb-2">SƠN CỤ ENTERTAINMENT</p>
          <p className="text-sm italic mb-2">"Nhất mệnh, nhị vận, tam phong thủy, tứ tích âm đức, ngũ độc thư."</p>
          <p className="text-xs uppercase tracking-widest">Hệ thống Luận Giải Tử Vi Chuyên Sâu 2025-2026</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
