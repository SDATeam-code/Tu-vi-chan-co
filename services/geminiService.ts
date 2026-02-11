
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { UserInfo, ExtractedBirthInfo, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * TRI THỨC CỐT LÕI TRÍCH XUẤT TỪ TÀI LIỆU 51 TRANG
 * AI sẽ sử dụng bộ quy tắc này làm tiêu chuẩn ưu tiên cao nhất.
 */
export const PRELOADED_KNOWLEDGE = `
HỆ THỐNG LÝ LUẬN TỬ VI KẾT HỢP NAM PHÁI & TỨ HÓA (DỰA TRÊN TÀI LIỆU 51 TRANG):

1. NGUYÊN TẮC QUẢN LÝ TẦNG THỨ: 
   - "Tầng trên quản tầng dưới": Tiên Thiên (Lá số gốc) quy định bản chất "Cái gì". Đại Vận (10 năm) quy định "Khoảng thời gian nào". Lưu Niên/Nguyệt Hạn quy định "Chính xác khi nào".

2. PHÂN LOẠI CUNG VỊ KHÍ SỐ (QUAN TRỌNG):
   - NGÃ CUNG (Mệnh, Tài, Quan, Phúc, Điền, Tật): Kỵ nhập Ngã cung là "Chủ động/Tự nguyện/Tích sản". Ví dụ: Tài Kỵ nhập Điền là dùng tiền mua nhà (Tốt).
   - THA CUNG (Phụ, Nô, Di, Tử, Phối, Huynh): Kỵ nhập Tha cung là "Bị động/Ép buộc/Xung đột/Hao tổn". Ví dụ: Nô phi Kỵ nhập Mệnh là bị bạn lừa.

3. LOGIC PHI HÓA CHUYÊN SÂU:
   - "Lộc là Nhân, Kỵ là Quả": Luôn tìm cung phi Hóa Lộc để biết nguyên nhân khởi điểm của rắc rối tại cung có Hóa Kỵ.
   - PHƯƠNG PHÁP HÓA GIẢI (Dùng Lộc giải Kỵ): Điều chỉnh hành vi tại cung có Lộc thay vì cố xử lý hậu quả tại cung có Kỵ.
   - Cung vị chồng lấp: Nếu Lưu Niên Mệnh trùng Mệnh Đại Vận và trùng Tài Tiên Thiên thì năm đó Tài Lộc là trọng tâm.
   - Cung vị ẩn: Phu Thê là Thiên di của Quan Lộc. Điền Trạch là Tật của Tật (nơi dưỡng bệnh). Huynh Đệ là Tật của Quan.

4. PHÂN BIỆT BIẾN CỐ:
   - Hạn Kết Hôn: Ưu tiên Đào Hồng Hỷ (Nam Phái) + Mệnh/Phối phi Lộc nhập nhau (Tứ Hóa). 
   - Hạn Công Việc: Phu Thê động nhưng không có sao tình cảm mà có Mã, Khôi Việt, Quốc Ấn.
   - Hao tài Đầu tư: Tài/Quan phi Kỵ nhập Điền. 
   - Hao tài Lừa đảo: Nô/Tử phi Kỵ xung Mệnh/Tài.

5. NGUYỆT HẠN (THÁNG): 
   - Sử dụng Ngũ Hổ Độn để tìm Can tháng. Phi Tứ Hóa tháng để tìm điểm rơi sự kiện.
`;

export const extractBirthInfoFromImage = async (base64Image: string): Promise<ExtractedBirthInfo> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Bạn là chuyên gia OCR Tử Vi. Hãy trích xuất thông tin từ hình ảnh lá số và trả về đúng định dạng JSON sau:
  {
    "fullName": "Họ tên đương số",
    "gender": "Nam" hoặc "Nữ",
    "birthDay": "Ngày sinh (số)",
    "birthMonth": "Tháng sinh (số)",
    "birthYear": "Năm sinh (số)",
    "birthHour": "Giờ sinh (số)",
    "birthMinute": "Phút sinh (số)"
  }
  Lưu ý: Chỉ trả về JSON, không kèm văn bản nào khác. Nếu không thấy thông tin, để trống giá trị.`;
  
  const imagePart = { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] || base64Image } };
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: { 
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) return {};
    
    // Xử lý làm sạch chuỗi JSON nếu model trả về có kèm markdown
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("OCR Error:", e);
    return {};
  }
};

export const analyzeTuViImage = async (base64Image: string, userInfo: UserInfo) => {
  const model = 'gemini-3-pro-preview';
  const extractionPrompt = `Bạn là chuyên gia Số Hóa Tử Vi. Hãy trích xuất chi tiết 12 cung (bao gồm: Tên cung, Can Cung, các Chính tinh và Phụ tinh quan trọng, các mốc Đại vận và Lưu niên có ghi trên cung) dưới dạng Markdown để phục vụ luận giải chuyên sâu.`;
  const imagePart = { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] || base64Image } };
  
  const extractionResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: extractionPrompt }] },
  });

  const extractedText = extractionResponse.text || "";

  const interpretationPrompt = `
DỰA TRÊN TÀI LIỆU CƠ SỞ ƯU TIÊN:
${userInfo.knowledgeBase || PRELOADED_KNOWLEDGE}

DỮ LIỆU LÁ SỐ:
${extractedText}

THÔNG TIN ĐƯƠNG SỐ: ${JSON.stringify(userInfo)}

YÊU CẦU LUẬN GIẢI CHUYÊN SÂU NĂM ${userInfo.viewYear}:
1. PHÂN TÍCH TỨ HÓA PHI TINH: Xác định Can cung Đại vận và Can năm ${userInfo.viewYear}. Chỉ rõ Lộc/Kỵ bay vào Ngã Cung hay Tha Cung.
2. TRUY TÌM NGUYÊN NHÂN: Nếu có biến cố xấu (Kỵ), hãy dùng quy tắc "Lộc là Nhân" để tìm cung khởi điểm.
3. KẾT HỢP NAM PHÁI: Luận về bộ sao lưu (Thái Tuế, Kình Đà, Mã...) tại các cung quan trọng.
4. GIẢI PHÁP HÓA GIẢI: Đưa ra lời khuyên "Ứng số" và "Dùng Lộc giải Kỵ" cụ thể cho năm nay.

Trả lời bằng tiếng Việt, phong cách uyên bác, trang trọng.
`;

  const interpretationResponse = await ai.models.generateContent({
    model,
    contents: interpretationPrompt,
    config: { thinkingConfig: { thinkingBudget: 15000 } }
  });

  return { extractedText, interpretation: interpretationResponse.text || "" };
};

export const chatWithTuViExpert = async (
  history: ChatMessage[],
  message: string,
  context: { extractedData: string; interpretation: string; userInfo: UserInfo }
) => {
  const model = 'gemini-3-flash-preview';
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `
Bạn là chuyên gia Tử Vi Sơn Cụ. Bạn trả lời dựa trên:
1. Tri thức tài liệu 51 trang: ${context.userInfo.knowledgeBase || PRELOADED_KNOWLEDGE}
2. Dữ liệu lá số trích xuất: ${context.extractedData}
3. Nội dung đã luận giải: ${context.interpretation}

QUY TẮC:
- Luôn kiểm tra đường bay Phi Hóa Lộc/Kỵ để giải thích bản chất rắc rối.
- Phân biệt Ngã/Tha cung để xác định đó là biến cố chủ động hay bị động.
- Đề xuất hóa giải theo nguyên tắc "Dùng Lộc giải Kỵ".
- Trả lời bằng tiếng Việt, súc tích và chính xác.
`,
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
