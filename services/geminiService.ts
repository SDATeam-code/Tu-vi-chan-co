
import { GoogleGenAI, Type, Chat, Modality, ThinkingLevel } from "@google/genai";
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
  const model = 'gemini-3.1-pro-preview';
  
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
  const model = 'gemini-3.1-pro-preview';
  
  const extractionPrompt = `Bạn là chuyên gia Số Hóa Tử Vi cao cấp. Hãy trích xuất TUYỆT ĐỐI ĐẦY ĐỦ và phân loại chi tiết dữ liệu từ lá số này. KHÔNG ĐƯỢC BỎ SÓT BẤT KỲ THÔNG TIN NÀO dù là nhỏ nhất.

CẤU TRÚC DỮ LIỆU YÊU CẦU:

1. THÔNG TIN TỔNG QUÁT:
   - Họ tên, Giới tính.
   - Ngày, tháng, năm, giờ sinh (Dương lịch & Âm lịch).
   - Bản mệnh, Cục, Chủ Mệnh, Chủ Thân.

2. CHI TIẾT 12 CUNG VỊ (QUAN TRỌNG): Với mỗi cung trong 12 cung, hãy trích xuất:
   - Tên cung chức (ví dụ: Mệnh, Phụ mẫu...).
   - CAN CHI của cung: Ghi đầy đủ (ví dụ: G.Thìn -> Giáp Thìn, B.Ngọ -> Bính Ngọ...).
   - PHI HÓA TỰ CUNG: Từ Can của cung đó, xác định xem có Hóa Lộc hay Hóa Kỵ bay sang cung nào khác không (Lộc Xuất, Kỵ Xuất). Ví dụ: "Can Giáp khiến Liêm Trinh hóa Lộc tại cung Quan".
   - Đại vận: Khoảng tuổi ghi tại cung.
   - Trạng thái: Cung Đại Vận hiện tại, cung Tiểu Vận/Lưu Niên năm 2026.

3. HỆ THỐNG SAO TOÀN DIỆN (Tại mỗi cung):
   - CHÍNH TINH: Tên sao + Trạng thái (Miếu, Vượng, Đắc, Bình, Hãm).
   - PHỤ TINH: Liệt kê TẤT CẢ phụ tinh, không bỏ sót sao nào.
   - VÒNG SAO: Phân loại rõ các sao thuộc vòng Thái Tuế, Lộc Tồn, Tràng Sinh.
   - SAO LƯU: Các sao lưu năm 2026 (Lưu Thái Tuế, Lưu Lộc Tồn, Lưu Thiên Mã...).

4. BIẾN ĐỘNG & GHI CHÚ:
   - Vị trí các tháng (Lưu Nguyệt).
   - Vị trí TUẦN, TRIỆT (Tuần Trung Không Vong, Triệt Lộ Không Vong) và các cung bị ảnh hưởng.
   - Bất kỳ con số hoặc ký hiệu lạ nào khác trên lá số.

Lưu ý: Hiện tại là năm 2026 (Bính Ngọ). Hãy trình bày dữ liệu dưới dạng Markdown rành mạch, sử dụng bảng hoặc danh sách để đảm bảo tính hệ thống cao nhất.`;
  
  const imagePart = { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] || base64Image } };
  
  const extractionResponse = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: { parts: [imagePart, { text: extractionPrompt }] },
  });

  const extractedText = extractionResponse.text || "";

  const interpretationPrompt = `
BỐI CẢNH: NĂM 2026 (BÍNH NGỌ). ĐANG XEM HẠN NĂM ${userInfo.viewYear}.
NGÔN NGỮ TRẢ LỜI: ${userInfo.language === 'en' ? 'Tiếng Anh (English)' : 'Tiếng Việt'}.

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

${userInfo.language === 'en' ? `
SPECIAL INSTRUCTION FOR ENGLISH:
- Translate the entire interpretation into English.
- For technical terms (Stars, Palaces, Cycles, Transformations), use the English translation followed by the original Vietnamese name in parentheses.
- Examples: 
  * Emperor Star (Tử Vi)
  * Major Cycle (Đại Vận)
  * Minor Cycle (Tiểu Vận)
  * Life Palace (Cung Mệnh)
  * Wealth Palace (Cung Tài Bạch)
  * Transformation to Prosperity (Hóa Lộc)
  * Transformation to Annoyance (Hóa Kỵ)
` : 'Trả lời bằng tiếng Việt, trang trọng, chuyên sâu.'}
`;

  const interpretationResponse = await ai.models.generateContent({
    model,
    contents: interpretationPrompt,
    config: { 
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
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

  // Chuyển đổi lịch sử chat sang định dạng của Google GenAI SDK
  const geminiHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const chat = ai.chats.create({
    model,
    history: geminiHistory,
    config: {
      systemInstruction: `
VAI TRÒ: Chuyên gia Tử Vi Sơn Cụ.
THỜI GIAN HIỆN TẠI: Năm 2026 (Bính Ngọ).
NGÔN NGỮ TRẢ LỜI: ${context.userInfo.language === 'en' ? 'Tiếng Anh (English)' : 'Tiếng Việt'}.

NGUỒN DỮ LIỆU BẮT BUỘC (Theo thứ tự ưu tiên):
1. TÀI LIỆU KIẾN THỨC (QUAN TRỌNG NHẤT):
   ${context.userInfo.knowledgeBase ? "Sử dụng tài liệu người dùng đã tải lên." : "Sử dụng kiến thức mặc định (Tài liệu 51 trang)."}
   Nội dung: ${context.userInfo.knowledgeBase || PRELOADED_KNOWLEDGE}

2. DỮ LIỆU LÁ SỐ GỐC (QUÉT TỪ ẢNH):
   Bắt buộc bám sát thông tin các sao, cung vị trong dữ liệu này:
   ${context.extractedData}

3. LỊCH SỬ HỘI THOẠI:
   Ghi nhớ các câu hỏi và câu trả lời trước đó để đảm bảo mạch lạc.

QUY TẮC LUẬN GIẢI KHI CHAT:
- Trả lời đúng trọng tâm câu hỏi, sử dụng dữ liệu từ lá số gốc.
- Không bịa đặt sao hoặc vị trí cung nếu không có trong dữ liệu trích xuất.
- Tuân thủ quy tắc: Tiên Thiên quản Đại Vận, Đại Vận quản Lưu Niên.
- Kiểm tra trùng điệp cung vị (2 tầng/3 tầng) khi dự đoán hạn.
- Nam thuận Nữ nghịch (Nam Phái).
- Luôn lấy năm 2026 làm mốc hiện tại.
- Phong cách: Chuyên sâu, điềm đạm, dùng từ ngữ chuyên môn nhưng giải thích rõ ràng.

${context.userInfo.language === 'en' ? `
SPECIAL INSTRUCTION FOR ENGLISH:
- Respond entirely in English.
- For technical terms (Stars, Palaces, Cycles, Transformations), use the English translation followed by the original Vietnamese name in parentheses.
- Examples: 
  * Emperor Star (Tử Vi)
  * Major Cycle (Đại Vận)
  * Minor Cycle (Tiểu Vận)
  * Life Palace (Cung Mệnh)
  * Wealth Palace (Cung Tài Bạch)
  * Transformation to Prosperity (Hóa Lộc)
  * Transformation to Annoyance (Hóa Kỵ)
` : ''}
`,
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
