import type { SupportedLanguage } from '../shared/analysisRequestTypes'

export type UiText = {
  tagline: string
  statusDetectingHeading: string
  statusDetectingBody: string
  statusPreparingHeading: string
  statusPreparingBody: string
  statusPrefetchingHeading: string
  statusPrefetchingBody: string
  statusNoAgreementHeading: string
  statusNoAgreementBody: string
  statusUnsupportedHeading: string
  statusUnsupportedBody: string
  statusErrorHeading: string
  retryButton: string
  analysisReadyStatus: string
  summaryHeading: string
  attentionItemsHeading: string
  sourceClauseLabel: string
  audioHeading: string
  askSamjhoHeading: string
  chatInputPlaceholder: string
  chatSendButton: string
  chatPendingText: string
  chatListenButton: string
  chatSuggestedQuestions: string[]
  closeButtonAriaLabel: string
  reconnectButton: string
  reconnectFailed: string
}

export const UI_TEXT: Record<SupportedLanguage, UiText> = {
  en: {
    tagline: 'Know Before You Agree',
    statusDetectingHeading: 'Looking at this page',
    statusDetectingBody: 'Checking whether an agreement is available here.',
    statusPreparingHeading: 'Preparing your agreement',
    statusPreparingBody: 'Getting the document ready for review.',
    statusPrefetchingHeading: 'Understanding the agreement',
    statusPrefetchingBody: 'This usually takes a few seconds.',
    statusNoAgreementHeading: 'No agreement detected yet',
    statusNoAgreementBody: 'Samjho hasn’t found a terms or privacy document on this page yet.',
    statusUnsupportedHeading: 'This page isn’t supported',
    statusUnsupportedBody: 'Samjho can’t run on this type of browser page. Try a regular website instead.',
    statusErrorHeading: 'We couldn’t analyze this agreement',
    retryButton: 'Try again',
    analysisReadyStatus: 'Analysis ready.',
    summaryHeading: 'Summary',
    attentionItemsHeading: 'Important things to know',
    sourceClauseLabel: 'Source clause',
    audioHeading: 'Listen',
    askSamjhoHeading: 'Ask Samjho',
    chatInputPlaceholder: 'Ask a question about this agreement',
    chatSendButton: 'Send',
    chatPendingText: 'Samjho is thinking…',
    chatListenButton: 'Listen (coming soon)',
    chatSuggestedQuestions: ['Will this renew automatically?', 'Can I cancel anytime?', 'What happens to my data?'],
    closeButtonAriaLabel: 'Close',
    reconnectButton: 'Reconnect this page',
    reconnectFailed: "Couldn't reconnect. Try reloading the page instead.",
  },
  kn: {
    tagline: 'ಒಪ್ಪುವ ಮೊದಲು ತಿಳಿಯಿರಿ',
    statusDetectingHeading: 'ಈ ಪುಟವನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ',
    statusDetectingBody: 'ಇಲ್ಲಿ ಒಪ್ಪಂದ ಲಭ್ಯವಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ.',
    statusPreparingHeading: 'ನಿಮ್ಮ ಒಪ್ಪಂದವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ',
    statusPreparingBody: 'ಪರಿಶೀಲನೆಗಾಗಿ ದಾಖಲೆಯನ್ನು ಸಿದ್ಧಗೊಳಿಸಲಾಗುತ್ತಿದೆ.',
    statusPrefetchingHeading: 'ಒಪ್ಪಂದವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ',
    statusPrefetchingBody: 'ಇದು ಸಾಮಾನ್ಯವಾಗಿ ಕೆಲವು ಸೆಕೆಂಡುಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.',
    statusNoAgreementHeading: 'ಇನ್ನೂ ಯಾವುದೇ ಒಪ್ಪಂದ ಪತ್ತೆಯಾಗಿಲ್ಲ',
    statusNoAgreementBody: 'ಈ ಪುಟದಲ್ಲಿ ಸಮ್ಝೊ ಇನ್ನೂ ನಿಯಮಗಳು ಅಥವಾ ಗೌಪ್ಯತಾ ದಾಖಲೆಯನ್ನು ಕಂಡುಕೊಂಡಿಲ್ಲ.',
    statusUnsupportedHeading: 'ಈ ಪುಟ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ',
    statusUnsupportedBody: 'ಈ ರೀತಿಯ ಬ್ರೌಸರ್ ಪುಟದಲ್ಲಿ ಸಮ್ಝೊ ಕಾರ್ಯನಿರ್ವಹಿಸುವುದಿಲ್ಲ. ಸಾಮಾನ್ಯ ವೆಬ್‌ಸೈಟ್ ಪ್ರಯತ್ನಿಸಿ.',
    statusErrorHeading: 'ಈ ಒಪ್ಪಂದವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    retryButton: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    analysisReadyStatus: 'ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧವಾಗಿದೆ.',
    summaryHeading: 'ಸಾರಾಂಶ',
    attentionItemsHeading: 'ತಿಳಿದುಕೊಳ್ಳಬೇಕಾದ ಮುಖ್ಯ ಅಂಶಗಳು',
    sourceClauseLabel: 'ಮೂಲ ವಾಕ್ಯ',
    audioHeading: 'ಆಲಿಸಿ',
    askSamjhoHeading: 'ಸಮ್ಝೊವನ್ನು ಕೇಳಿ',
    chatInputPlaceholder: 'ಈ ಒಪ್ಪಂದದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ',
    chatSendButton: 'ಕಳುಹಿಸಿ',
    chatPendingText: 'ಸಮ್ಝೊ ಯೋಚಿಸುತ್ತಿದೆ…',
    chatListenButton: 'ಆಲಿಸಿ (ಶೀಘ್ರದಲ್ಲಿ)',
    chatSuggestedQuestions: [
      'ಇದು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆಯೇ?',
      'ನಾನು ಯಾವಾಗ ಬೇಕಾದರೂ ರದ್ದುಗೊಳಿಸಬಹುದೇ?',
      'ನನ್ನ ಡೇಟಾಗೆ ಏನಾಗುತ್ತದೆ?',
    ],
    closeButtonAriaLabel: 'ಮುಚ್ಚಿ',
    reconnectButton: 'ಈ ಪುಟವನ್ನು ಮರುಸಂಪರ್ಕಿಸಿ',
    reconnectFailed: 'ಮರುಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಪುಟವನ್ನು ಮರುಲೋಡ್ ಮಾಡಿ ಪ್ರಯತ್ನಿಸಿ.',
  },
  hi: {
    tagline: 'सहमत होने से पहले समझें',
    statusDetectingHeading: 'इस पृष्ठ की जांच की जा रही है',
    statusDetectingBody: 'यहां कोई समझौता उपलब्ध है या नहीं यह जांचा जा रहा है।',
    statusPreparingHeading: 'आपका समझौता तैयार किया जा रहा है',
    statusPreparingBody: 'समीक्षा के लिए दस्तावेज़ तैयार किया जा रहा है।',
    statusPrefetchingHeading: 'समझौते को समझा जा रहा है',
    statusPrefetchingBody: 'इसमें आमतौर पर कुछ सेकंड लगते हैं।',
    statusNoAgreementHeading: 'अभी तक कोई समझौता नहीं मिला',
    statusNoAgreementBody: 'समझो को अभी तक इस पृष्ठ पर कोई नियम या गोपनीयता दस्तावेज़ नहीं मिला है।',
    statusUnsupportedHeading: 'यह पृष्ठ समर्थित नहीं है',
    statusUnsupportedBody: 'समझो इस प्रकार के ब्राउज़र पृष्ठ पर काम नहीं कर सकता। कृपया किसी सामान्य वेबसाइट पर प्रयास करें।',
    statusErrorHeading: 'इस समझौते का विश्लेषण नहीं हो सका',
    retryButton: 'पुनः प्रयास करें',
    analysisReadyStatus: 'विश्लेषण तैयार है।',
    summaryHeading: 'सारांश',
    attentionItemsHeading: 'जानने योग्य महत्वपूर्ण बातें',
    sourceClauseLabel: 'मूल वाक्य',
    audioHeading: 'सुनें',
    askSamjhoHeading: 'समझो से पूछें',
    chatInputPlaceholder: 'इस समझौते के बारे में एक प्रश्न पूछें',
    chatSendButton: 'भेजें',
    chatPendingText: 'समझो सोच रहा है…',
    chatListenButton: 'सुनें (जल्द आ रहा है)',
    chatSuggestedQuestions: [
      'क्या यह स्वतः नवीनीकृत होगा?',
      'क्या मैं कभी भी रद्द कर सकता हूँ?',
      'मेरे डेटा का क्या होगा?',
    ],
    closeButtonAriaLabel: 'बंद करें',
    reconnectButton: 'इस पृष्ठ को फिर से जोड़ें',
    reconnectFailed: 'फिर से जोड़ा नहीं जा सका। कृपया पृष्ठ को पुनः लोड करें।',
  },
}
