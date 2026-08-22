import type { SupportedLanguage } from './api/types.js'

export type UiText = {
  tagline: string
  navPaste: string
  navPdf: string
  pasteLabel: string
  pastePlaceholder: string
  pasteCharacterCount: string
  pasteEmptyError: string
  pasteTooLongError: string
  analyzeButton: string
  pdfLabel: string
  pdfChooseButton: string
  pdfNoFileChosen: string
  pdfWrongTypeError: string
  pdfTooLargeError: string
  statusUploading: string
  statusExtracting: string
  statusPreparing: string
  statusPrefetching: string
  statusReady: string
  statusErrorHeading: string
  retryButton: string
  summaryHeading: string
  attentionItemsHeading: string
  sourceClauseLabel: string
  moreDetailHeading: string
  disclaimerFallback: string
  askSamjhoHeading: string
  chatInputPlaceholder: string
  chatSendButton: string
  chatPendingText: string
  chatSuggestedQuestions: string[]
  closeButtonAriaLabel: string
  authHeading: string
  loginTab: string
  registerTab: string
  emailLabel: string
  passwordLabel: string
  loginButton: string
  registerButton: string
  logoutButton: string
  loggedInAs: string
  authLoading: string
  guestNotice: string
  historyNavButton: string
  historyModalHeading: string
  historyTab: string
  savedTab: string
  historyEmpty: string
  savedEmpty: string
  openButton: string
  removeButton: string
  saveButton: string
  savedIndicator: string
  changedIndicator: string
  analyzedLabel: string
  savedAtLabel: string
  backButton: string
}

export const UI_TEXT: Record<SupportedLanguage, UiText> = {
  en: {
    tagline: 'Know Before You Agree',
    navPaste: 'Paste text',
    navPdf: 'Upload PDF',
    pasteLabel: 'Paste the agreement text',
    pastePlaceholder: 'Paste a Terms of Service, Privacy Policy, or other consent agreement here',
    pasteCharacterCount: 'characters',
    pasteEmptyError: 'Please paste some agreement text first.',
    pasteTooLongError: 'This text is too long to analyze in full. Try pasting a shorter section.',
    analyzeButton: 'Analyze',
    pdfLabel: 'Upload a PDF agreement',
    pdfChooseButton: 'Choose PDF file',
    pdfNoFileChosen: 'No file chosen',
    pdfWrongTypeError: 'Only PDF files are supported.',
    pdfTooLargeError: 'This PDF file is too large.',
    statusUploading: 'Uploading your file…',
    statusExtracting: 'Reading the document…',
    statusPreparing: 'Preparing your agreement…',
    statusPrefetching: 'Understanding the agreement…',
    statusReady: 'Analysis ready.',
    statusErrorHeading: "We couldn't analyze this agreement",
    retryButton: 'Try again',
    summaryHeading: 'Summary',
    attentionItemsHeading: 'Important things to know',
    sourceClauseLabel: 'Source clause',
    moreDetailHeading: 'More detail',
    disclaimerFallback: 'Samjho helps you understand agreements more easily. This is not legal advice.',
    askSamjhoHeading: 'Ask Samjho',
    chatInputPlaceholder: 'Ask a question about this agreement',
    chatSendButton: 'Send',
    chatPendingText: 'Samjho is thinking…',
    chatSuggestedQuestions: ['Will this renew automatically?', 'Can I cancel anytime?', 'What happens to my data?'],
    closeButtonAriaLabel: 'Close',
    authHeading: 'Account',
    loginTab: 'Log in',
    registerTab: 'Create account',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Log in',
    registerButton: 'Create account',
    logoutButton: 'Log out',
    loggedInAs: 'Signed in as',
    authLoading: 'Please wait…',
    guestNotice: 'You can analyze agreements as a guest. Sign in only if you want an account.',
    historyNavButton: 'History',
    historyModalHeading: 'History & saved agreements',
    historyTab: 'History',
    savedTab: 'Saved',
    historyEmpty: 'No agreements analyzed yet.',
    savedEmpty: 'No saved agreements yet.',
    openButton: 'Open',
    removeButton: 'Remove',
    saveButton: 'Save',
    savedIndicator: 'Saved',
    changedIndicator: 'Agreement updated',
    analyzedLabel: 'Analyzed',
    savedAtLabel: 'Saved',
    backButton: 'Back',
  },
  kn: {
    tagline: 'ಒಪ್ಪುವ ಮೊದಲು ತಿಳಿಯಿರಿ',
    navPaste: 'ಪಠ್ಯ ಅಂಟಿಸಿ',
    navPdf: 'PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    pasteLabel: 'ಒಪ್ಪಂದದ ಪಠ್ಯವನ್ನು ಅಂಟಿಸಿ',
    pastePlaceholder: 'ನಿಯಮಗಳು, ಗೌಪ್ಯತಾ ನೀತಿ ಅಥವಾ ಇತರ ಒಪ್ಪಂದವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ',
    pasteCharacterCount: 'ಅಕ್ಷರಗಳು',
    pasteEmptyError: 'ದಯವಿಟ್ಟು ಮೊದಲು ಒಪ್ಪಂದದ ಪಠ್ಯವನ್ನು ಅಂಟಿಸಿ.',
    pasteTooLongError: 'ಈ ಪಠ್ಯ ಸಂಪೂರ್ಣವಾಗಿ ವಿಶ್ಲೇಷಿಸಲು ತುಂಬಾ ಉದ್ದವಾಗಿದೆ. ಸಣ್ಣ ವಿಭಾಗವನ್ನು ಅಂಟಿಸಲು ಪ್ರಯತ್ನಿಸಿ.',
    analyzeButton: 'ವಿಶ್ಲೇಷಿಸಿ',
    pdfLabel: 'PDF ಒಪ್ಪಂದವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    pdfChooseButton: 'PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ',
    pdfNoFileChosen: 'ಯಾವುದೇ ಫೈಲ್ ಆಯ್ಕೆಯಾಗಿಲ್ಲ',
    pdfWrongTypeError: 'PDF ಫೈಲ್‌ಗಳು ಮಾತ್ರ ಬೆಂಬಲಿತವಾಗಿವೆ.',
    pdfTooLargeError: 'ಈ PDF ಫೈಲ್ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ.',
    statusUploading: 'ನಿಮ್ಮ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
    statusExtracting: 'ದಾಖಲೆಯನ್ನು ಓದಲಾಗುತ್ತಿದೆ…',
    statusPreparing: 'ನಿಮ್ಮ ಒಪ್ಪಂದವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ…',
    statusPrefetching: 'ಒಪ್ಪಂದವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ…',
    statusReady: 'ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧವಾಗಿದೆ.',
    statusErrorHeading: 'ಈ ಒಪ್ಪಂದವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    retryButton: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    summaryHeading: 'ಸಾರಾಂಶ',
    attentionItemsHeading: 'ತಿಳಿದುಕೊಳ್ಳಬೇಕಾದ ಮುಖ್ಯ ಅಂಶಗಳು',
    sourceClauseLabel: 'ಮೂಲ ವಾಕ್ಯ',
    moreDetailHeading: 'ಹೆಚ್ಚಿನ ವಿವರ',
    disclaimerFallback: 'ಒಪ್ಪಂದಗಳನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಮ್ಝೊ ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಇದು ಕಾನೂನು ಸಲಹೆಯಲ್ಲ.',
    askSamjhoHeading: 'ಸಮ್ಝೊವನ್ನು ಕೇಳಿ',
    chatInputPlaceholder: 'ಈ ಒಪ್ಪಂದದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ',
    chatSendButton: 'ಕಳುಹಿಸಿ',
    chatPendingText: 'ಸಮ್ಝೊ ಯೋಚಿಸುತ್ತಿದೆ…',
    chatSuggestedQuestions: [
      'ಇದು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆಯೇ?',
      'ನಾನು ಯಾವಾಗ ಬೇಕಾದರೂ ರದ್ದುಗೊಳಿಸಬಹುದೇ?',
      'ನನ್ನ ಡೇಟಾಗೆ ಏನಾಗುತ್ತದೆ?',
    ],
    closeButtonAriaLabel: 'ಮುಚ್ಚಿ',
    authHeading: 'ಖಾತೆ',
    loginTab: 'ಲಾಗಿನ್ ಮಾಡಿ',
    registerTab: 'ಖಾತೆ ರಚಿಸಿ',
    emailLabel: 'ಇಮೇಲ್',
    passwordLabel: 'ಪಾಸ್‌ವರ್ಡ್',
    loginButton: 'ಲಾಗಿನ್ ಮಾಡಿ',
    registerButton: 'ಖಾತೆ ರಚಿಸಿ',
    logoutButton: 'ಲಾಗ್ ಔಟ್',
    loggedInAs: 'ಸೈನ್ ಇನ್ ಆಗಿದೆ',
    authLoading: 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ…',
    guestNotice: 'ನೀವು ಅತಿಥಿಯಾಗಿ ಒಪ್ಪಂದಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಬಹುದು. ಖಾತೆ ಬೇಕಾದರೆ ಮಾತ್ರ ಸೈನ್ ಇನ್ ಮಾಡಿ.',
    historyNavButton: 'ಇತಿಹಾಸ',
    historyModalHeading: 'ಇತಿಹಾಸ ಮತ್ತು ಉಳಿಸಿದ ಒಪ್ಪಂದಗಳು',
    historyTab: 'ಇತಿಹಾಸ',
    savedTab: 'ಉಳಿಸಲಾಗಿದೆ',
    historyEmpty: 'ಇನ್ನೂ ಯಾವುದೇ ಒಪ್ಪಂದವನ್ನು ವಿಶ್ಲೇಷಿಸಿಲ್ಲ.',
    savedEmpty: 'ಇನ್ನೂ ಯಾವುದೇ ಒಪ್ಪಂದವನ್ನು ಉಳಿಸಿಲ್ಲ.',
    openButton: 'ತೆರೆಯಿರಿ',
    removeButton: 'ತೆಗೆದುಹಾಕಿ',
    saveButton: 'ಉಳಿಸಿ',
    savedIndicator: 'ಉಳಿಸಲಾಗಿದೆ',
    changedIndicator: 'ಒಪ್ಪಂದ ನವೀಕರಿಸಲಾಗಿದೆ',
    analyzedLabel: 'ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ',
    savedAtLabel: 'ಉಳಿಸಲಾಗಿದೆ',
    backButton: 'ಹಿಂದೆ',
  },
  hi: {
    tagline: 'सहमत होने से पहले समझें',
    navPaste: 'पाठ चिपकाएं',
    navPdf: 'PDF अपलोड करें',
    pasteLabel: 'समझौते का पाठ चिपकाएं',
    pastePlaceholder: 'यहां नियम, गोपनीयता नीति, या अन्य सहमति समझौता चिपकाएं',
    pasteCharacterCount: 'अक्षर',
    pasteEmptyError: 'कृपया पहले समझौते का पाठ चिपकाएं।',
    pasteTooLongError: 'यह पाठ पूरी तरह विश्लेषण के लिए बहुत लंबा है। कृपया छोटा भाग चिपकाएं।',
    analyzeButton: 'विश्लेषण करें',
    pdfLabel: 'PDF समझौता अपलोड करें',
    pdfChooseButton: 'PDF फ़ाइल चुनें',
    pdfNoFileChosen: 'कोई फ़ाइल चयनित नहीं',
    pdfWrongTypeError: 'केवल PDF फ़ाइलें समर्थित हैं।',
    pdfTooLargeError: 'यह PDF फ़ाइल बहुत बड़ी है।',
    statusUploading: 'आपकी फ़ाइल अपलोड हो रही है…',
    statusExtracting: 'दस्तावेज़ पढ़ा जा रहा है…',
    statusPreparing: 'आपका समझौता तैयार किया जा रहा है…',
    statusPrefetching: 'समझौते को समझा जा रहा है…',
    statusReady: 'विश्लेषण तैयार है।',
    statusErrorHeading: 'इस समझौते का विश्लेषण नहीं हो सका',
    retryButton: 'पुनः प्रयास करें',
    summaryHeading: 'सारांश',
    attentionItemsHeading: 'जानने योग्य महत्वपूर्ण बातें',
    sourceClauseLabel: 'मूल वाक्य',
    moreDetailHeading: 'अधिक विवरण',
    disclaimerFallback: 'समझो समझौतों को अधिक आसानी से समझने में मदद करता है। यह कानूनी सलाह नहीं है।',
    askSamjhoHeading: 'समझो से पूछें',
    chatInputPlaceholder: 'इस समझौते के बारे में एक प्रश्न पूछें',
    chatSendButton: 'भेजें',
    chatPendingText: 'समझो सोच रहा है…',
    chatSuggestedQuestions: [
      'क्या यह स्वतः नवीनीकृत होगा?',
      'क्या मैं कभी भी रद्द कर सकता हूँ?',
      'मेरे डेटा का क्या होगा?',
    ],
    closeButtonAriaLabel: 'बंद करें',
    authHeading: 'खाता',
    loginTab: 'लॉग इन करें',
    registerTab: 'खाता बनाएं',
    emailLabel: 'ईमेल',
    passwordLabel: 'पासवर्ड',
    loginButton: 'लॉग इन करें',
    registerButton: 'खाता बनाएं',
    logoutButton: 'लॉग आउट',
    loggedInAs: 'साइन इन किया गया',
    authLoading: 'कृपया प्रतीक्षा करें…',
    guestNotice: 'आप अतिथि के रूप में समझौतों का विश्लेषण कर सकते हैं। खाता चाहिए तो ही साइन इन करें।',
    historyNavButton: 'इतिहास',
    historyModalHeading: 'इतिहास और सहेजे गए समझौते',
    historyTab: 'इतिहास',
    savedTab: 'सहेजे गए',
    historyEmpty: 'अभी तक कोई समझौता विश्लेषित नहीं किया गया।',
    savedEmpty: 'अभी तक कोई समझौता सहेजा नहीं गया।',
    openButton: 'खोलें',
    removeButton: 'हटाएं',
    saveButton: 'सहेजें',
    savedIndicator: 'सहेजा गया',
    changedIndicator: 'समझौता अपडेट हुआ',
    analyzedLabel: 'विश्लेषित',
    savedAtLabel: 'सहेजा गया',
    backButton: 'वापस',
  },
}
