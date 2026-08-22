export const POPUP_STYLES = `
:host {
  all: initial;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.samjho-affordance {
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #1a4d8f;
  background: #eaf2ff;
  border: 1px solid #b7d3ff;
  border-radius: 999px;
  cursor: pointer;
  line-height: 1.4;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
  white-space: nowrap;
}
.samjho-affordance:hover {
  background: #dcebff;
}
.samjho-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px;
  pointer-events: none;
}
.samjho-popup {
  pointer-events: auto;
  width: 340px;
  max-width: calc(100vw - 48px);
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.28);
  border: 1px solid #e2e8f0;
  padding: 16px;
  color: #0f172a;
}
.samjho-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.samjho-popup-languages {
  display: flex;
  gap: 6px;
}
.samjho-popup-language {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  cursor: pointer;
}
.samjho-popup-language--selected {
  background: #1a4d8f;
  border-color: #1a4d8f;
  color: #ffffff;
}
.samjho-popup-close {
  font-size: 18px;
  line-height: 1;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 2px 6px;
}
.samjho-popup-body {
  margin-top: 10px;
}
.samjho-popup-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 6px 0;
}
.samjho-popup-text {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  color: #334155;
}
.samjho-popup-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}
.samjho-popup-understand {
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #1a4d8f;
  color: #ffffff;
  cursor: pointer;
}
.samjho-popup-understand:hover {
  background: #163f73;
}
`
