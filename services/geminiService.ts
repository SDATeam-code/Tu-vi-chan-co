
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { UserInfo, ExtractedBirthInfo, ChatMessage } from "../types";

/**
 * TRI THỨC CỐT LÕI TRÍCH XUẤT TỪ TÀI LIỆU 51 TRANG
 * AI sẽ sử dụng bộ quy tắc này làm tiêu chuẩn ưu tiên cao nhất.
 */
export const PRELOADED_KNOWLEDGE = `
HỆ THỐNG LÝ LUẬN TỬ VI KẾT HỢP NAM PHÁI & TỨ HÓA (DỰA TRÊN TÀI LIỆU 51 TRANG):
QUY ƯỚC THỜI GIAN: HIỆN TẠI LÀ NĂM 2026 (BÍNH NGỌ). TUYỆT ĐỐI KHÔNG SỬ DỤNG DỮ LIỆU NĂM khác nếu không hỏi đến

1. NGUYÊN TẮC QUẢN LÝ TẦNG THỨ: "TẦNG TRÊN QUẢN TẦNG DƯỚI"
   - Thứ tự tầng bậc: Tiên Thiên (Lá số gốc) -> Đại Vận (10 năm) -> Lưu Niên (1 năm) -> Lưu Nguyệt (Tháng) -> Lưu Vận (Ngày/Giờ).
   - Logic vận hành: 
     * Tiên thiên quản Đại vận (Gốc quy định môi trường).
     * Đại vận quản Lưu niên (Đại vận 10 năm quy định hạn năm).
     * Lưu niên quản Lưu nguyệt (Hạn năm quy định hạn tháng).
     * Lưu nguyệt quản Lưu vận (Hạn tháng quy định hạn ngày).
   - Hiện tượng "Trùng điệp" (Cung vị chồng lấp):
     * Trùng 2 tầng (ví dụ: Lưu niên Mệnh trùng Mệnh Đại vận): Biến cố rõ ràng.
     * Trùng 3 tầng (ví dụ: Lưu niên Mệnh trùng Mệnh Đại vận trùng cung Tiên thiên): Độ chính xác cực cao.

2. PHÂN LOẠI CUNG VỊ KHÍ SỐ (QUAN TRỌNG):
   - NGÃ CUNG (Mệnh, Tài, Quan, Phúc, Điền, Tật): Kỵ nhập Ngã cung là "Chủ động/Tích sản".
   - THA CUNG (Phụ, Nô, Di, Tử, Phối, Huynh): Kỵ nhập Tha cung là "Bị động/Hao tổn".

3. LOGIC PHI HÓA CHUYÊN SÂU:
   - "Lộc là Nhân, Kỵ là Quả": Luôn tìm cung phi Hóa Lộc để biết nguyên nhân khởi điểm của rắc rối tại cung có Hóa Kỵ.
   - PHƯƠNG PHÁP HÓA GIẢI (Dùng Lộc giải Kỵ): Điều chỉnh tại cung có Lộc thay vì cố xử lý tại cung có Kỵ.

4. PHÂN BIỆT BIẾN CỐ:
   - Hạn Kết Hôn: Đào Hồng Hỷ + Mệnh/Phối phi Lộc nhập nhau.
   - Hạn Công Việc: Phu Thê động nhưng có Mã, Khôi Việt, Quốc Ấn.
   - Hao tài: Tài/Quan phi Kỵ nhập Điền (Đầu tư); Nô/Tử phi Kỵ xung Mệnh (Lừa đảo).

5. NGUYỆT HẠN (THÁNG): 
   - Dùng Ngũ Hổ Độn tìm Can tháng. Phi Tứ Hóa tháng dựa trên quản lý của Lưu Niên 2026.
`;

export const extractBirthInfoFromImage = async (base64Image: string): Promise<ExtractedBirthInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-flash-preview';
  const prompt = `Bạn là chuyên gia OCR Tử Vi. Hãy trích xuất thông tin sinh thần. TRÁNH NHẦM LẪN NĂM HIỆN TẠI, CHỈ TRÍCH XUẤT DỮ LIỆU TRÊN LÁ SỐ.`;
  const imagePart = { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] || base64Image } };
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            gender: { type: Type.STRING },
            birthDay: { type: Type.STRING },
            birthMonth: { type: Type.STRING },
            birthYear: { type: Type.STRING },
            birthHour: { type: Type.STRING },
            birthMinute: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {};
  }
};

export const analyzeTuViImage = async (base64Image: string, userInfo: UserInfo) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-pro-preview';
  const extractionPrompt = `Bạn là chuyên gia Số Hóa Tử Vi. Hãy trích xuất chi tiết 12 cung. LƯU Ý QUAN TRỌNG: Năm nay là năm 2026 (Bính Ngọ). Hãy trích xuất Can Cung và các sao phục vụ luận giải năm 2026.`;
  const imagePart = { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] || base64Image } };
  
  const extractionResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: extractionPrompt }] },
  });

  const extractedText = extractionResponse.text || "";
  const interpretationPrompt = `
LƯU Ý KHẨN CẤP: NĂM NAY LÀ NĂM 2026 (BÍNH NGỌ). TUYỆT ĐỐI BỎ QUA MỌI DỮ LIỆU VỀ NĂM khác nếu không hỏi đến
DỰA TRÊN TÀI LIỆU CƠ SỞ:
${userInfo.knowledgeBase || PRELOADED_KNOWLEDGE}

DỮ LIỆU LÁ SỐ:
${extractedText}

THÔNG TIN ĐƯƠNG SỐ: ${JSON.stringify(userInfo)}

YÊU CẦU LUẬN GIẢI CHUYÊN SÂU NĂM ${userInfo.viewYear} (Mặc định là 2026):
1. PHÂN TÍCH TẦNG THỨ: Tiên thiên -> Đại vận -> Lưu niên 2026 -> Lưu nguyệt. Chỉ rõ sự trùng điệp.
2. PHÂN TÍCH TỨ HÓA: Phi Tứ Hóa từ Can năm 2026 (Bính - Đồng Cơ Xương Liêm).
3. NAM PHÁI: Lưu Thái Tuế tại Ngọ, Lưu Lộc Tồn tại Tỵ, Lưu Kình Đà tại Mùi/Thìn cho năm 2026.
4. GIẢI PHÁP: Dùng Lộc giải Kỵ.

Trả lời tiếng Việt, uyên bác.
`;

  const interpretationResponse = await ai.models.generateContent({
    model,
    contents: interpretationPrompt,
    config: { 
      thinkingConfig: { thinkingBudget: 15000 },
      systemInstruction: "Bạn là bậc thầy Tử Vi. Hiện tại là năm 2026 (Bính Ngọ). Bạn phải khẳng định và sử dụng năm 2026 làm mốc thời gian 'năm nay'. Không được nhắc đến năm khác nếu không hỏi đến."
    }
  });

  return { extractedText, interpretation: interpretationResponse.text || "" };
};

export const chatWithTuViExpert = async (
  history: ChatMessage[],
  message: string,
  context: { extractedData: string; interpretation: string; userInfo: UserInfo }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-flash-preview';
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `
Bạn là chuyên gia Tử Vi Sơn Cụ. 
XÁC NHẬN THỜI GIAN: HÔM NAY/NĂM NAY LÀ NĂM 2026 (BÍNH NGỌ). 
Mọi câu hỏi về "năm nay", "hiện tại" đều phải căn cứ vào năm 2026.
Tri thức: ${context.userInfo.knowledgeBase || PRELOADED_KNOWLEDGE}
Lá số: ${context.extractedData}
Luận giải: ${context.interpretation}

QUY TẮC:
- Tầng trên quản tầng dưới (Tiên thiên -> Đại vận -> Lưu niên 2026 -> Lưu nguyệt).
- Trùng 2 tầng: Rõ ràng. Trùng 3 tầng: Cực kỳ chính xác.
- Phi Hóa Lộc/Kỵ năm 2026 (Bính Ngọ).
- Trả lời tiếng Việt.
`,
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
