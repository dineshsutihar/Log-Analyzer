export const content = [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
];
export const theme = {
    extend: {},
};
import scrollbarHide from 'tailwind-scrollbar-hide';

export const plugins = [
    scrollbarHide,
];