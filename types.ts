
export interface UserInfo {
  fullName: string;
  gender: 'Nam' | 'Nữ';
  calendarType: 'Dương Lịch' | 'Âm Lịch';
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  viewYear: string;
  language: 'vi' | 'en';
  knowledgeBase?: string;
}

export interface AnalysisResult {
  extractedData: string;
  interpretation: string;
}

export enum AppStep {
  FORM = 'FORM',
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT'
}

export interface ExtractedBirthInfo {
  fullName?: string;
  gender?: 'Nam' | 'Nữ';
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  birthHour?: string;
  birthMinute?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
