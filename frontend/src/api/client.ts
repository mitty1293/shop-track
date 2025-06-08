import axios, { AxiosError, InternalAxiosRequestConfig} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (API_BASE_URL === undefined) {
    throw new Error("VITE_API_BASE_URL is not defined. Please check your .env file.");
}

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// レスポンスインターセプター: 401エラー時のトークンリフレッシュ処理
let isRefreshing = false; // トークンリフレッシュ中かどうかのフラグ
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = []; // リフレッシュ中に失敗したリクエストのキュー
const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
axiosInstance.interceptors.response.use(
    (response) => {
        return response; // 正常なレスポンスはそのまま返す
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 401エラーで、かつトークンリフレッシュエンドポイントへのリクエストでなければリフレッシュ処理
        if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/token/refresh/') && !originalRequest._retry) {
            if (isRefreshing) {
                // すでにリフレッシュ処理中なら、新しいPromiseを作ってキューに追加
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers) {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    }
                    return axiosInstance(originalRequest); // リフレッシュされたトークンで元のリクエストを再試行
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true; // 再試行フラグを立てる (無限ループ防止)
            isRefreshing = true;

            try {
                // リフレッシュAPIにはボディなしでリクエスト
                const refreshResponse = await axiosInstance.post<RefreshTokenResponse>(`/api/auth/token/refresh/`, {});
                const newAccessToken = refreshResponse.data.access;

                // 新しいトークンをAuthContextに通知するためのイベントを発行
                window.dispatchEvent(new CustomEvent('token-refreshed', { detail: { accessToken: newAccessToken } }));

                processQueue(null, newAccessToken); // キューに溜まったリクエストを処理
                isRefreshing = false;

                // 元のリクエストのヘッダーも更新して再試行
                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                }
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed in interceptor:', refreshError);
                processQueue(refreshError as AxiosError, null); // キューに溜まったリクエストをエラーで処理
                isRefreshing = false;
                // 認証エラーイベントを発行
                window.dispatchEvent(new CustomEvent('auth-error', { detail: { reason: 'refresh-failed' } }));
                return Promise.reject(refreshError);
            }
        }
        // 401以外のエラー、またはリフレッシュ対象外のエラーはそのまま返す
        return Promise.reject(error);
    }
);

// --- 認証関連のAPI関数 ---
export interface TokenResponse {
    access: string;
}
export interface LoginCredentials {
    username: string;
    password: string;
}
export interface RefreshTokenResponse {
    access: string;
}
export interface User {
    id: number;
    username: string;
    email?: string;
}

/** ユーザーログインを行い、アクセストークンとリフレッシュトークンを取得する */
export const loginUser = async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await axiosInstance.post<TokenResponse>('/api/auth/token/', credentials);
    return response.data;
};

// ログアウト
export const logoutUser = async (): Promise<void> => {
    await axiosInstance.post('/api/auth/logout/');
};

// ユーザープロファイルを取得する
export const fetchUserProfile = async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/api/auth/user/');
    return response.data;
};

// === Category ===
export interface Category { id: number; name: string; }
export interface CategoryInput { name: string; }
export type PatchedCategoryInput = Partial<CategoryInput>;

export const getCategories = async (): Promise<Category[]> => {
    const response = await axiosInstance.get<Category[]>('/api/categories/');
    return response.data;
};
export const getCategoryById = async (id: number): Promise<Category> => {
    const response = await axiosInstance.get<Category>(`/api/categories/${id}/`);
    return response.data;
};
export const createCategory = async (data: CategoryInput): Promise<Category> => {
    const response = await axiosInstance.post<Category>('/api/categories/', data);
    return response.data;
};
export const updateCategory = async (id: number, data: PatchedCategoryInput): Promise<Category> => {
    const response = await axiosInstance.patch<Category>(`/api/categories/${id}/`, data);
    return response.data;
};
export const deleteCategory = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/categories/${id}/`);
};

// === Unit ===
export interface Unit { id: number; name: string; }
export interface UnitInput { name: string; }
export type PatchedUnitInput = Partial<UnitInput>;

export const getUnits = async (): Promise<Unit[]> => {
    const response = await axiosInstance.get<Unit[]>('/api/units/');
    return response.data;
};
export const getUnitById = async (id: number): Promise<Unit> => {
    const response = await axiosInstance.get<Unit>(`/api/units/${id}/`);
    return response.data;
};
export const createUnit = async (data: UnitInput): Promise<Unit> => {
    const response = await axiosInstance.post<Unit>('/api/units/', data);
    return response.data;
};
export const updateUnit = async (id: number, data: PatchedUnitInput): Promise<Unit> => {
    const response = await axiosInstance.patch<Unit>(`/api/units/${id}/`, data);
    return response.data;
};
export const deleteUnit = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/units/${id}/`);
};

// === Manufacturer ===
export interface Manufacturer { id: number; name: string; }
export interface ManufacturerInput { name: string; }
export type PatchedManufacturerInput = Partial<ManufacturerInput>;

export const getManufacturers = async (): Promise<Manufacturer[]> => {
    const response = await axiosInstance.get<Manufacturer[]>('/api/manufacturers/');
    return response.data;
};
export const getManufacturerById = async (id: number): Promise<Manufacturer> => {
    const response = await axiosInstance.get<Manufacturer>(`/api/manufacturers/${id}/`);
    return response.data;
};
export const createManufacturer = async (data: ManufacturerInput): Promise<Manufacturer> => {
    const response = await axiosInstance.post<Manufacturer>('/api/manufacturers/', data);
    return response.data;
};
export const updateManufacturer = async (id: number, data: PatchedManufacturerInput): Promise<Manufacturer> => {
    const response = await axiosInstance.patch<Manufacturer>(`/api/manufacturers/${id}/`, data);
    return response.data;
};
export const deleteManufacturer = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/manufacturers/${id}/`);
};

// === Origin ===
export interface Origin { id: number; name: string; }
export interface OriginInput { name: string; }
export type PatchedOriginInput = Partial<OriginInput>;

export const getOrigins = async (): Promise<Origin[]> => {
    const response = await axiosInstance.get<Origin[]>('/api/origins/');
    return response.data;
};
export const getOriginById = async (id: number): Promise<Origin> => {
    const response = await axiosInstance.get<Origin>(`/api/origins/${id}/`);
    return response.data;
};
export const createOrigin = async (data: OriginInput): Promise<Origin> => {
    const response = await axiosInstance.post<Origin>('/api/origins/', data);
    return response.data;
};
export const updateOrigin = async (id: number, data: PatchedOriginInput): Promise<Origin> => {
    const response = await axiosInstance.patch<Origin>(`/api/origins/${id}/`, data);
    return response.data;
};
export const deleteOrigin = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/origins/${id}/`);
};

// === Store ===
export interface Store { id: number; name: string; location: string; }
export interface StoreInput { name: string; location: string; }
export type PatchedStoreInput = Partial<StoreInput>;

export const getStores = async (): Promise<Store[]> => {
    const response = await axiosInstance.get<Store[]>('/api/stores/');
    return response.data;
};
export const getStoreById = async (id: number): Promise<Store> => {
    const response = await axiosInstance.get<Store>(`/api/stores/${id}/`);
    return response.data;
};
export const createStore = async (data: StoreInput): Promise<Store> => {
    const response = await axiosInstance.post<Store>('/api/stores/', data);
    return response.data;
};
export const updateStore = async (id: number, data: PatchedStoreInput): Promise<Store> => {
    const response = await axiosInstance.patch<Store>(`/api/stores/${id}/`, data);
    return response.data;
};
export const deleteStore = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/stores/${id}/`);
};

// === Product ===
export interface Product {
    id: number;
    name: string;
    category: Category;
    unit: Unit;
    manufacturer: Manufacturer | null;
    origin: Origin | null;
}
export interface ProductInput {
    name: string;
    category_id: number;
    unit_id: number;
    manufacturer_id?: number | null;
    origin_id?: number | null;
}
export type PatchedProductInput = Partial<ProductInput>;

export const getProducts = async (): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>('/api/products/');
    return response.data;
};
export const getProductById = async (id: number): Promise<Product> => {
    const response = await axiosInstance.get<Product>(`/api/products/${id}/`);
    return response.data;
};
export const createProduct = async (data: ProductInput): Promise<Product> => {
    const response = await axiosInstance.post<Product>('/api/products/', data);
    return response.data;
};
export const updateProduct = async (id: number, data: PatchedProductInput): Promise<Product> => {
    const response = await axiosInstance.patch<Product>(`/api/products/${id}/`, data);
    return response.data;
};
export const deleteProduct = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/products/${id}/`);
};

// === ShoppingRecord ===
export interface ShoppingRecord {
    id: number;
    price: number;
    purchase_date: string;
    quantity: string;
    store: Store;
    product: Product;
}
export interface ShoppingRecordInput {
    price: number;
    purchase_date: string; // Expects a string in YYYYY-MM-DD format
    quantity: string;
    store_id: number;
    product_id: number;
}
export type PatchedShoppingRecordInput = Partial<ShoppingRecordInput>;

export const getShoppingRecords = async (): Promise<ShoppingRecord[]> => {
    const response = await axiosInstance.get<ShoppingRecord[]>('/api/shopping-records/');
    return response.data;
};
export const getShoppingRecordById = async (id: number): Promise<ShoppingRecord> => {
    const response = await axiosInstance.get<ShoppingRecord>(`/api/shopping-records/${id}/`);
    return response.data;
};
export const createShoppingRecord = async (data: ShoppingRecordInput): Promise<ShoppingRecord> => {
    const response = await axiosInstance.post<ShoppingRecord>('/api/shopping-records/', data);
    return response.data;
};
export const updateShoppingRecord = async (id: number, data: PatchedShoppingRecordInput): Promise<ShoppingRecord> => {
    const response = await axiosInstance.patch<ShoppingRecord>(`/api/shopping-records/${id}/`, data);
    return response.data;
};
export const deleteShoppingRecord = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/shopping-records/${id}/`);
};
