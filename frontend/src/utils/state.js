import { atom } from 'recoil';

export const activeViewState = atom({
  key: 'activeViewState',
  default: 'home',
});

// Simplified: only holds context when a specific log is selected for chat
export const chatLogState = atom({
  key: 'chatLogState',
  default: null, // null when no log is selected, or { id, message } when set
});

// Legacy alias — kept for backward compatibility during migration
export const userState = atom({
  key: 'userState',
  default: { id: 0, text: "", sender: "user", logMessage: "" },
})