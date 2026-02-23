
import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Printer, RotateCcw, MessageSquare, Send, FileText, Layout, Info } from 'lucide-react';
import { AnalysisResult, UserInfo, ChatMessage } from '../types';
import { chatWithTuViExpert } from '../services/geminiService';

interface Props {
  result: AnalysisResult;
  userInfo: UserInfo;
  onReset: () => void;
  chartImage?: string | null;
}

const ResultView: React.FC<Props> = ({ result, userInfo, onReset, chartImage }) => {
  const [activeTab, setActiveTab] = useState<'extracted' | 'interpretation'>('interpretation');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('screen').matches) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatWithTuViExpert(chatHistory, userMsg, {
        extractedData: result.extractedData,
        interpretation: result.interpretation,
        userInfo
      });
      setChatHistory(prev => [...prev, { role: 'model', text: response || "Chuyên gia đang bấm độn, vui lòng đợi trong giây lát." }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const isEn = userInfo.language === 'en';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; color: #1a1a1a !important; padding: 0 !important; }
          .tu-vi-card { border: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          .chat-section { page-break-before: always; display: block !important; height: auto !important; overflow: visible !important; }
          .chat-bubble { 
            border: 1px solid #ddd !important; 
            padding: 15px !important; 
            margin-bottom: 20px !important; 
            page-break-inside: avoid; 
            display: block !important;
            width: 100% !important;
            background: white !important;
            border-radius: 8px !important;
          }
          .chat-bubble-user { border-left: 6px solid #8b4513 !important; background: #f9f9f9 !important; font-weight: bold; }
          .chat-bubble-model { border-left: 6px solid #b22222 !important; }
          .tab-content { display: block !important; }
          .tab-extracted-print { display: none !important; } 
        }
        .print-only { display: none; }
      `}</style>

      {/* Screen Header */}
      <div className="tu-vi-card p-6 rounded-xl shadow-lg border border-[#d4b38a] flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div>
          <p className="text-[#8b4513] font-bold text-xs tracking-widest uppercase mb-1">Sơn Cụ Entertainment</p>
          <h1 className="text-3xl font-bold text-[#8b4513]">{userInfo.fullName}</h1>
          <p className="text-sm text-gray-600 font-medium">
            {userInfo.gender} | {userInfo.birthDay}/{userInfo.birthMonth}/{userInfo.birthYear} | Hạn {userInfo.viewYear}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-[#8b4513] text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-[#6d3610] transition-all flex items-center gap-2">
            <Printer className="w-4 h-4" /> Xuất Luận Giải PDF
          </button>
          <button onClick={onReset} className="text-[#8b4513] border border-[#d4b38a] px-4 py-2 rounded-lg font-bold hover:bg-[#f0e6d6] flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Lập Lá Số Khác
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="print-only text-center mb-10 border-b-4 border-[#8b4513] pb-6">
        <h1 className="text-4xl font-serif font-bold text-[#8b4513] mb-2 uppercase tracking-[0.2em]">BÁO CÁO LUẬN GIẢI TỬ VI CHÂN CƠ</h1>
        <p className="text-xl font-bold text-gray-800">{userInfo.fullName} - {userInfo.gender} - Sinh ngày: {userInfo.birthDay}/{userInfo.birthMonth}/{userInfo.birthYear}</p>
        <p className="text-lg text-[#b22222] font-bold mt-2">VẬN TRÌNH CHI TIẾT NĂM {userInfo.viewYear}</p>
      </div>

      {chartImage && (
        <div className="tu-vi-card p-4 rounded-xl flex justify-center bg-white shadow-md mb-8 border-2 border-[#d4b38a]">
          <img src={chartImage} alt="Lá số" className="max-w-full h-auto object-contain" />
        </div>
      )}

      {/* Navigation Tabs - Fix: Strictly separation */}
      <div className="flex border-b-2 border-[#d4b38a] no-print">
        <button
          onClick={() => setActiveTab('interpretation')}
          className={`px-10 py-4 font-bold text-lg rounded-t-xl transition-all flex items-center gap-2 ${activeTab === 'interpretation' ? 'bg-[#8b4513] text-white' : 'bg-[#f0e6d6] text-[#8b4513] hover:bg-[#e6d9c4]'}`}
        >
          <FileText className="w-5 h-5" /> {isEn ? "Interpretation" : "Luận Giải Chuyên Sâu"}
        </button>
        <button
          onClick={() => setActiveTab('extracted')}
          className={`px-10 py-4 font-bold text-lg rounded-t-xl transition-all flex items-center gap-2 ${activeTab === 'extracted' ? 'bg-[#8b4513] text-white' : 'bg-[#f0e6d6] text-[#8b4513] hover:bg-[#e6d9c4]'}`}
        >
          <Layout className="w-5 h-5" /> {isEn ? "Chart Data" : "Dữ Liệu Lá Số"}
        </button>
      </div>

      {/* Content Area - Fix: Absolute separation */}
      <div className="bg-white p-8 rounded-b-xl shadow-2xl border-x border-b border-[#d4b38a] min-h-[400px]">
        {activeTab === 'interpretation' ? (
          <div className="prose prose-stone max-w-none markdown-body">
            <Markdown remarkPlugins={[remarkGfm]}>
              {result.interpretation}
            </Markdown>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-xl border-2 border-dashed border-[#d4b38a] no-print markdown-body">
            <h4 className="text-[#8b4513] font-bold mb-6 border-b pb-2 uppercase tracking-widest">Cấu trúc dữ liệu số hóa (OCR):</h4>
            <Markdown remarkPlugins={[remarkGfm]}>
              {result.extractedData}
            </Markdown>
          </div>
        )}
      </div>

      {/* Consultation Section - Printable as continuous text */}
      <div className={`tu-vi-card rounded-xl shadow-xl border-2 border-[#d4b38a] chat-section ${activeTab !== 'interpretation' ? 'no-print' : ''}`}>
        <div className="bg-[#8b4513] p-5 text-white font-bold flex justify-between items-center no-print">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> {isEn ? "Expert Consultation" : "Hỏi Đáp Chuyên Gia Sơn Cụ"}
          </span>
          <span className="text-xs font-normal opacity-80 italic flex items-center gap-1">
            <Info className="w-3 h-3" /> Đang bám sát tài liệu luận giải 51 trang
          </span>
        </div>
        
        <div className="print-only p-6 border-b-2 border-[#8b4513] mb-8 mt-16">
          <h2 className="text-2xl font-serif font-bold text-[#8b4513] uppercase tracking-widest">PHẦN HỎI ĐÁP & LÀM RÕ VẬN HẠN</h2>
        </div>

        <div className="p-8 space-y-8 bg-[#fff9f0]/20">
          {chatHistory.length === 0 && (
            <div className="bg-white p-6 rounded-xl border border-[#d4b38a] text-center shadow-sm no-print">
              <p className="text-[#8b4513] font-serif italic">"Bạn có thắc mắc gì về cung vị khí số, đường bay của Phi Hóa hay mốc thời gian bùng nổ của hạn năm nay không?"</p>
            </div>
          )}
          
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-6 rounded-xl text-sm max-w-[95%] shadow-md chat-bubble ${
                msg.role === 'user' 
                ? 'bg-[#8b4513] text-white chat-bubble-user ml-auto' 
                : 'bg-white text-gray-800 border-2 border-[#d4b38a] chat-bubble-model mr-auto'
              }`}>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3 print-only">
                  {msg.role === 'user' ? 'Câu hỏi của bạn:' : 'Chuyên gia giải đáp:'}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-base">{msg.text}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start no-print">
              <div className="bg-white p-4 rounded-xl text-sm italic text-gray-500 border border-[#d4b38a] animate-pulse flex items-center gap-2 shadow-sm">
                <span className="text-[#8b4513]">☯</span> Chuyên gia đang truy tìm nút thắt Phi Hóa...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form - No Print */}
        <form onSubmit={handleSendMessage} className="p-6 bg-[#fcfaf7] border-t-2 border-[#d4b38a] flex gap-3 no-print">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ví dụ: Cung Phu Thê có Hóa Kỵ bay vào Mệnh gốc nghĩa là gì?..."
            className="flex-1 p-4 border-2 border-[#d4b38a] rounded-xl focus:ring-4 focus:ring-[#8b4513]/20 outline-none text-base shadow-inner bg-white"
          />
          <button type="submit" disabled={isTyping} className="bg-[#8b4513] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#6d3610] disabled:bg-gray-400 shadow-lg transform active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2">
            Hỏi <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer Branding */}
      <div className="bg-[#fff9f0] p-12 rounded-2xl border-2 border-[#d4b38a] text-[#8b4513] text-center shadow-inner mt-16">
        <p className="font-serif italic mb-4 text-2xl">"Đức năng thắng số - Nhân quả là gốc rễ của mọi sự xoay vần."</p>
        <div className="flex justify-center items-center gap-10 text-[10px] font-bold uppercase tracking-[0.4em] mt-8 opacity-70">
          <span>SƠN CỤ ENTERTAINMENT</span>
          <span className="text-[#d4b38a] text-xl">|</span>
          <span>TỬ VI CHÂN CƠ ☯ 2026</span>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
