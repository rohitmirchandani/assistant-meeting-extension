export function getFromStorage(key: string): Promise<any>;
export function setInStorage(key: string, value: any): Promise<void>;
export const STORAGE: {
    selectedOrgId: string;
    token: string;
};
