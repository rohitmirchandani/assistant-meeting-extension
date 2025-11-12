export function getFromStorage<T = unknown>(key: string): Promise<T | null>;
export function setInStorage<T>(key: string, value: T): Promise<void>;
export function removeFromStorage(key: string): Promise<void>;
export const STORAGE: {
    selectedOrgId: string;
    token: string;
    rememberAgentSelection: string;
};
export const CONSTANTS: {
    domain: string;
};
