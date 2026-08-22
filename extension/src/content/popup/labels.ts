import type { SupportedLanguage } from '../../shared/analysisRequestTypes'

export type PopupLabels = {
  affordance: string
  title: string
  body: string
  understandButton: string
  closeButtonAriaLabel: string
  languageTablistAriaLabel: string
}

export const POPUP_LABELS: Record<SupportedLanguage, PopupLabels> = {
  en: {
    affordance: "Understand what you're agreeing to",
    title: 'Know before you agree',
    body: "Samjho can explain what this agreement means in plain language before you continue, including charges, renewals, and cancellation terms.",
    understandButton: 'Understand & See More',
    closeButtonAriaLabel: 'Close',
    languageTablistAriaLabel: 'Popup language',
  },
  kn: {
    affordance: 'ನೀವು ಒಪ್ಪುತ್ತಿರುವುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
    title: 'ಒಪ್ಪುವ ಮೊದಲು ತಿಳಿಯಿರಿ',
    body: 'ನೀವು ಮುಂದುವರಿಯುವ ಮೊದಲು ಈ ಒಪ್ಪಂದದ ಅರ್ಥವನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಸಮ್ಝೊ ವಿವರಿಸಬಲ್ಲದು, ಶುಲ್ಕಗಳು, ನವೀಕರಣಗಳು ಮತ್ತು ರದ್ದತಿ ನಿಯಮಗಳು ಸೇರಿದಂತೆ.',
    understandButton: 'ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ ಮತ್ತು ಹೆಚ್ಚು ನೋಡಿ',
    closeButtonAriaLabel: 'ಮುಚ್ಚಿ',
    languageTablistAriaLabel: 'ಪಾಪ್‌ಅಪ್ ಭಾಷೆ',
  },
  hi: {
    affordance: 'समझें आप किससे सहमत हो रहे हैं',
    title: 'सहमत होने से पहले समझें',
    body: 'आगे बढ़ने से पहले समझो इस समझौते का अर्थ सरल भाषा में समझा सकता है, जिसमें शुल्क, नवीनीकरण और रद्दीकरण की शर्तें शामिल हैं।',
    understandButton: 'समझें और अधिक देखें',
    closeButtonAriaLabel: 'बंद करें',
    languageTablistAriaLabel: 'पॉपअप भाषा',
  },
}
