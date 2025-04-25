const API_BASE_URL = 'https://shoptrack.fmitty.net';

export interface Category {
    id: number;
    name: string;
}

export interface Unit {
    id: number;
    name: string;
}

export interface Manufacturer {
    id: number;
    name: string;
}

export interface Origin {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    category: Category;
    unit: Unit;
    manufacturer: Manufacturer | null;
    origin: Origin | null;
}

// 商品作成時に API へ送るデータの型 (IDは不要、関連データはIDのみ送信)
export interface ProductInput {
    name: string;
    category_id: number;
    unit_id: number;
    manufacturer_id?: number | null;
    origin_id?: number | null;
}

// 商品更新 (PATCH) 時に API へ送るデータの型 (部分更新のため全てオプショナル)
export type PatchedProductInput = Partial<ProductInput>;

/**
 * 汎用的な GET リクエスト関数 (オプション)
 * @param endpoint APIエンドポイントのパス (例: '/api/categories/')
 * @returns レスポンスの JSON データ
 */
const fetchList = async <T>(endpoint: string): Promise<T[]> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (${endpoint}):`, errorData);
        throw new Error(`API request failed for ${endpoint} with status ${response.status}`);
    }
    const data = await response.json();
    return data as T[];
}

// --- Read ---
/** 商品一覧を取得 */
export const getProducts = (): Promise<Product[]> => fetchList<Product>('/api/products/');

/** カテゴリ一覧を取得 */
export const getCategories = (): Promise<Category[]> => fetchList<Category>('/api/categories/');

/** 単位一覧を取得 */
export const getUnits = (): Promise<Unit[]> => fetchList<Unit>('/api/units/');

/** 製造者一覧を取得 */
export const getManufacturers = (): Promise<Manufacturer[]> => fetchList<Manufacturer>('/api/manufacturers/');

/** 原産国一覧を取得 */
export const getOrigins = (): Promise<Origin[]> => fetchList<Origin>('/api/origins/');

/**
 * 指定された ID の商品詳細を取得する
 * @param id 取得する商品の ID
 * @returns Product データ
 */
export const getProductById = async (id: number): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/`);
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (GET /api/products/${id}/):`, errorData);
        throw new Error(`API request failed for GET /api/products/${id}/ with status ${response.status}`);
    }
    const data = await response.json();
    return data as Product;
};

// --- Create ---
/**
 * 新しい商品を作成する
 * @param productData ProductInput 型の商品データ
 * @returns 作成された Product データ
 */
export const createProduct = async (productData: ProductInput): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/api/products/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });
  
    if (!response.ok) {
        let errorDetails = await response.text();
        try {
            const errorJson = JSON.parse(errorDetails);
            errorDetails = JSON.stringify(errorJson, null, 2);
        } catch (e) {
            // JSON でなければそのままテキストで表示
        }
        console.error("API Error Response (POST /api/products/):", errorDetails);
        throw new Error(`API request failed for POST /api/products/ with status ${response.status}`);
    }
  
    const createdProduct = await response.json();
    return createdProduct as Product;
};

// --- Update ---
/**
 * 指定された ID の商品を更新 (部分更新) する
 */
export const updateProduct = async (id: number, productData: PatchedProductInput): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (PATCH /api/products/${id}/):`, errorData);
        throw new Error(`API request failed for PATCH /api/products/${id}/ with status ${response.status}`);
    }
    const updatedProduct = await response.json();
    return updatedProduct as Product;
};
  
// --- Delete ---
/**
 * 指定された ID の商品を削除する
 * @param id 削除する商品の ID
 * @returns Promise<void> (成功時は通常レスポンスボディがないため)
 */
export const deleteProduct = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/`, {
        method: 'DELETE',
    });
  
    // 多くの DELETE リクエストは成功時に 204 No Content を返す
    // response.ok は 200-299 の範囲のステータスコードで true になる
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (DELETE /api/products/${id}/):`, errorData);
        throw new Error(`API request failed for DELETE /api/products/${id}/ with status ${response.status}`);
    }
    // 成功時は何も返さない (void)
};
