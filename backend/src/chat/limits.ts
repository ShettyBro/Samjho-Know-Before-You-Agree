import { MAX_CONTENT_LENGTH } from '../analysis/limits.js'
import type { SupportedLanguage } from '../analysis/types.js'

export const MAX_QUESTION_LENGTH = 500
export const MAX_AGREEMENT_TEXT_LENGTH = MAX_CONTENT_LENGTH
export const MAX_HISTORY_MESSAGES = 8
export const MAX_HISTORY_MESSAGE_LENGTH = 1000
export const MAX_ANSWER_LENGTH = 2000
export const MAX_SOURCE_TEXT_LENGTH = 2000

export const CHAT_DISCLAIMERS: Record<SupportedLanguage, string> = {
  en: 'Samjho helps you understand agreements more easily. This is not legal advice; consult a qualified professional for legal decisions.',
  kn: 'ಒಪ್ಪಂದಗಳನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಮ್ಝೊ ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಇದು ಕಾನೂನು ಸಲಹೆಯಲ್ಲ; ಕಾನೂನು ನಿರ್ಧಾರಗಳಿಗಾಗಿ ಅರ್ಹ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  hi: 'समझो समझौतों को अधिक आसानी से समझने में मदद करता है। यह कानूनी सलाह नहीं है; कानूनी निर्णयों के लिए किसी योग्य पेशेवर से सलाह लें।',
}

export const UNVERIFIED_MESSAGES: Record<SupportedLanguage, string> = {
  en: "Samjho couldn't verify this answer against the agreement text.",
  kn: 'ಸಮ್ಝೊ ಈ ಉತ್ತರವನ್ನು ಒಪ್ಪಂದದ ಪಠ್ಯದೊಂದಿಗೆ ಪರಿಶೀಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
  hi: 'समझो इस उत्तर को समझौते के पाठ के विरुद्ध सत्यापित नहीं कर सका।',
}
