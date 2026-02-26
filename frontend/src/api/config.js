const LOCAL_BASE_URL = 'http://localhost:5000';
const RENDER_BASE_URL = 'https://marketmate-1.onrender.com';

const apiMode = import.meta.env.VITE_API_MODE;

const resolvedBaseUrl = (() => {
	if (apiMode === 'local') return LOCAL_BASE_URL;
	if (apiMode === 'render') return RENDER_BASE_URL;
	if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
	return import.meta.env.DEV ? LOCAL_BASE_URL : RENDER_BASE_URL;
})();

export const API_URL = `${resolvedBaseUrl.replace(/\/$/, '')}/api`;
