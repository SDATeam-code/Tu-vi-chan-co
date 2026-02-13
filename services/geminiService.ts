
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { UserInfo, ExtractedBirthInfo, ChatMessage } from "../types";

/**
 * TRI THỨC CỐT LÕI TRÍCH XUẤT TỪ TÀI LIỆU 51 TRANG
 * AI sẽ sử dụng bộ quy tắc này làm tiêu chuẩn ưu tiên cao nhất.
 */
export const PRELOADED_KNOWLEDGE = `
HỆ THỐNG LÝ LUẬN TỬ VI KẾT HỢP NAM PHÁI & TỨ HÓA (DỰA TRÊN TÀI LIỆU 51 TRANG):
QUY ƯỚC THỜI GIAN: HIỆN TẠI LÀ NĂM 2026 (BÍNH NGỌ). TUYỆT ĐỐI KHÔNG DÙNG NĂM 2024.

1. NGUYÊN TẮC QUẢN LÝ TẦNG THỨ: "TẦNG TRÊN QUẢN TẦNG DƯỚI"
   - Thứ tự tầng bậc: 
     Tầng 1: Tiên Thiên (Lá số gốc - Cái gốc)
     Tầng 2: Đại Vận (10 năm - Môi trường)
     Tầng 3: Lưu Niên (1 năm - Biến cố)
     Tầng 4: Lưu Nguyệt (Tháng - Chi tiết)
     Tầng 5: Lưu Vận (Ngày/Giờ/Thời điểm bùng nổ)
   - Logic quản lý: 
     * Tiên thiên quản Đại vận.
     * Đại vận quản Lưu niên.
     * Lưu niên quản Lưu nguyệt.
     * Lưu nguyệt quản Lưu vận.
   - Hiện tượng "Trùng điệp" (Cung vị chồng lấp):
     * Trùng 2 tầng (ví dụ: Lưu niên Mệnh trùng Mệnh Đại vận): Sự việc bùng nổ rõ ràng.
     * Trùng 3 tầng (ví dụ: Lưu niên Mệnh trùng Mệnh Đại vận trùng cung Tiên thiên): Độ chính xác cực kỳ cao, là định mệnh không thể tránh.

2. QUY TẮC TIỂU VẬN (NAM THUẬN NỮ NGHỊCH):
   - Khi tính toán vận hạn theo Nam Phái: 
     * Nam giới: Đi thuận chiều kim đồng hồ.
     * Nữ giới: Đi nghịch chiều kim đồng hồ.
     * AI phải kiểm tra kỹ giới tính đương số để xác định chiều đi của các sao lưu và tiểu vận.

3. PHÂN LOẠI CUNG VỊ KHÍ SỐ (QUAN TRỌNG):
   - NGÃ CUNG (Mệnh, Tài, Quan, Phúc, Điền, Tật): Kỵ nhập Ngã cung là "Chủ động/Tích sản".
   - THA CUNG (Phụ, Nô, Di, Tử, Phối, Huynh): Kỵ nhập Tha cung là "Bị động/Hao tổn/Xung đột".

4. LOGIC PHI HÓA CHUYÊN SÂU:
   - "Lộc là Nhân, Kỵ là Quả": Luôn tìm cung phi Hóa Lộc để biết nguyên nhân khởi điểm của rắc rối tại cung có Hóa Kỵ.
   - PHƯƠNG PHÁP HÓA GIẢI (Dùng Lộc giải Kỵ): Điều chỉnh tại cung có Lộc thay vì cố xử lý tại cung có Kỵ.

5. NĂM 2026 (BÍNH NGỌ):
   - Can Bính: Thiên Đồng hóa Lộc, Thiên Cơ hóa Quyền, Văn Xương hóa Khoa, Liêm Trinh hóa Kỵ.
   - Lưu Thái Tuế tại Ngọ.
   - Lưu Lộc Tồn tại Tỵ.
`;

export const extractBirthInfoFromImage = async (base64Image: string): Promise<ExtractedBirthInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Bạn là chuyên gia OCR Tử Vi. Hãy trích xuất thông tin sinh thần từ hình ảnh lá số. 
  Yêu cầu trả về đúng định dạng JSON. Không được nhầm lẫn thông tin. 
  Nếu không thấy thông tin nào đó hãy để trống.`;
  
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
            fullName: { type: Type.STRING, description: "Họ và tên" },
            gender: { type: Type.STRING, description: "Nam hoặc Nữ" },
            birthDay: { type: Type.STRING, description: "Ngày sinh (chỉ lấy số)" },
            birthMonth: { type: Type.STRING, description: "Tháng sinh (chỉ lấy số)" },
            birthYear: { type: Type.STRING, description: "Năm sinh (chỉ lấy số)" },
            birthHour: { type: Type.STRING, description: "Giờ sinh (chỉ lấy số)" },
            birthMinute: { type: Type.STRING, description: "Phút sinh (chỉ lấy số)" }
          },
          required: ["fullName", "gender", "birthDay", "birthMonth", "birthYear", "birthHour", "birthMinute"]
        }
      }
    });
    
    const text = response.text;
    if (!text) return {};
    return JSON.parse(text);
  } catch (e) {
    console.error("OCR Error:", e);
    return {};
  }
};

export const analyzeTuViImage = async (base64Image: string, userInfo: UserInfo) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-pro-preview';
  
  const extractionPrompt = `Bạn là chuyên gia Số Hóa Tử Vi. Hãy trích xuất chi tiết 12 cung từ lá số này. 
  Lưu ý hiện tại là năm 2026 (Bính Ngọ). Trích xuất Can Cung, Chính Tinh, Phụ Tinh và các mốc Đại vận/Lưu niên hiện có trên hình.`;
  
  const imagePart = { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] || base64Image } };
  
  const extractionResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: extractionPrompt }] },
  });

  const extractedText = extractionResponse.text || "";

  const interpretationPrompt = `
BỐI CẢNH: NĂM 2026 (BÍNH NGỌ). ĐANG XEM HẠN NĂM ${userInfo.viewYear}.
DỰA TRÊN TÀI LIỆU CƠ SỞ ƯU TIÊN:
${userInfo.knowledgeBase || PRELOADED_KNOWLEDGE}

DỮ LIỆU LÁ SỐ TRÍCH XUẤT:
${extractedText}

THÔNG TIN ĐƯƠNG SỐ: ${JSON.stringify(userInfo)}

YÊU CẦU LUẬN GIẢI:
1. LUẬN THEO TẦNG THỨ: Tuân thủ "Tầng trên quản tầng dưới" (Tiên Thiên -> Đại Vận -> Lưu Niên -> Lưu Nguyệt). Xác định các điểm TRÙNG ĐIỆP (2 tầng hoặc 3 tầng).
2. LUẬN THEO GIỚI TÍNH: Áp dụng quy tắc Nam thuận Nữ nghịch khi xét Tiểu vận/Lưu niên của Nam Phái.
3. PHI HÓA TỨ HÓA: Dùng Can năm 2026 (Bính) để phi Tứ Hóa. Phân tích Ngã cung/Tha cung.
4. TÌM NGUYÊN NHÂN & HÓA GIẢI: "Lộc là Nhân, Kỵ là Quả". Dùng Lộc giải Kỵ.

Trả lời tiếng Việt, trang trọng, chuyên sâu.
`;

  const interpretationResponse = await ai.models.generateContent({
    model,
    contents: interpretationPrompt,
    config: { 
      thinkingConfig: { thinkingBudget: 15000 },
      systemInstruction: "Bạn là một bậc thầy Tử Vi cao cấp. Bạn hiểu rõ quy tắc Tầng trên quản tầng dưới, trùng điệp cung vị và quy tắc Nam thuận Nữ nghịch. Bạn luôn lấy năm 2026 làm mốc hiện tại."
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
Bạn là chuyên gia Tử Vi Sơn Cụ. Hiện tại là năm 2026.
Bạn trả lời dựa trên:
1. Tri thức 51 trang: ${context.userInfo.knowledgeBase || PRELOADED_KNOWLEDGE}
2. Dữ liệu lá số: ${context.extractedData}
3. Nội dung đã luận giải: ${context.interpretation}

QUY TẮC CỐT LÕI:
- Tầng trên quản tầng dưới.
- Trùng 2 tầng: Biến cố rõ ràng. Trùng 3 tầng: Cực kỳ chính xác.
- Nam thuận Nữ nghịch khi xét vận hạn Nam Phái.
- Năm nay là 2026 (Bính Ngọ). Can Bính: Đồng Cơ Xương Liêm.
- Trả lời tiếng Việt, súc tích.
`,
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
