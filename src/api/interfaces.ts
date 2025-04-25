export interface Org {
    id: number;
    name: string;
    company_uname: string;
    mobile: string | null;
    email: string;
    feature_configuration_id: number;
    meta: string | null;
    created_at: string;
    updated_at: string;
    timezone: string;
    is_block: boolean;
    created_by: number;
    is_readable: boolean;
}

export interface User {
    id: number;
    name: string;
    mobile: string | null;
    email: string;
    client_id: number;
    meta: string | null;
    created_at: string;
    updated_at: string;
    is_block: boolean;
    feature_configuration_id: number;
    is_password_verified: number;
}

export interface UserDetails extends User {
    c_companies: [Org], 
    currentCompany: Org
}