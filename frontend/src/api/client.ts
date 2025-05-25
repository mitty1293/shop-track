const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (API_BASE_URL === undefined) {
    throw new Error("VITE_API_BASE_URL is not defined. Please check your .env file.");
}

/**
 * 汎用的な GET リクエスト関数
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

// === Category ===
export interface Category { id: number; name: string; }
// カテゴリ作成/更新(PUT)時に API へ送るデータの型
export interface CategoryInput { name: string; }
// カテゴリ部分更新(PATCH)時に API へ送るデータの型
export type PatchedCategoryInput = Partial<CategoryInput>;

// === API クライアント関数 (Category 関連) ===
export const getCategories = (): Promise<Category[]> => fetchList<Category>('/api/categories/');
export const getCategoryById = async (id: number): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}/`);
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (GET /api/categories/${id}/):`, errorData);
        throw new Error(`API request failed for GET /api/categories/${id}/ with status ${response.status}`);
    }
    return await response.json() as Category;
};
export const createCategory = async (categoryData: CategoryInput): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response (POST /api/categories/):", errorData);
        throw new Error(`API request failed for POST /api/categories/ with status ${response.status}`);
    }
    return await response.json() as Category;
};
export const updateCategory = async (id: number, categoryData: PatchedCategoryInput): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (PATCH /api/categories/${id}/):`, errorData);
        throw new Error(`API request failed for PATCH /api/categories/${id}/ with status ${response.status}`);
    }
    return await response.json() as Category;
};
export const deleteCategory = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (DELETE /api/categories/${id}/):`, errorData);
        throw new Error(`API request failed for DELETE /api/categories/${id}/ with status ${response.status}`);
    }
};

// === Unit ===
export interface Unit { id: number; name: string; }
export interface UnitInput { name: string; }
export type PatchedUnitInput = Partial<UnitInput>;
export const getUnits = (): Promise<Unit[]> => fetchList<Unit>('/api/units/');
export const getUnitById = async (id: number): Promise<Unit> => {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}/`); // Endpoint check
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json() as Unit;
};
export const createUnit = async (data: UnitInput): Promise<Unit> => {
    const response = await fetch(`${API_BASE_URL}/api/units/`, { // Endpoint check
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json() as Unit;
};
export const updateUnit = async (id: number, data: PatchedUnitInput): Promise<Unit> => {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}/`, { // Endpoint check
        method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json() as Unit;
};
export const deleteUnit = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/units/${id}/`, { method: 'DELETE' }); // Endpoint check
    if (!response.ok) throw new Error(`API error: ${response.status}`);
};

// === Manufacturer ===
export interface Manufacturer { id: number; name: string; }
export interface ManufacturerInput { name: string; }
export type PatchedManufacturerInput = Partial<ManufacturerInput>;
export const getManufacturers = (): Promise<Manufacturer[]> => fetchList<Manufacturer>('/api/manufacturers/');
export const getManufacturerById = async (id: number): Promise<Manufacturer> => {
    const response = await fetch(`${API_BASE_URL}/api/manufacturers/${id}/`); // Endpoint check
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json() as Manufacturer;
};
export const createManufacturer = async (data: ManufacturerInput): Promise<Manufacturer> => {
    const response = await fetch(`${API_BASE_URL}/api/manufacturers/`, { // Endpoint check
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json() as Manufacturer;
};
export const updateManufacturer = async (id: number, data: PatchedManufacturerInput): Promise<Manufacturer> => {
    const response = await fetch(`${API_BASE_URL}/api/manufacturers/${id}/`, { // Endpoint check
        method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json() as Manufacturer;
};
export const deleteManufacturer = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/manufacturers/${id}/`, { method: 'DELETE' }); // Endpoint check
    if (!response.ok) throw new Error(`API error: ${response.status}`);
};

// === Origin ===
export interface Origin { id: number; name: string; }
export interface OriginInput { name: string; }
export type PatchedOriginInput = Partial<OriginInput>;
export const getOrigins = (): Promise<Origin[]> => fetchList<Origin>('/api/origins/');
export const getOriginById = async (id: number): Promise<Origin> => {
    const response = await fetch(`${API_BASE_URL}/api/origins/${id}/`); // Endpoint check
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json() as Origin;
};
export const createOrigin = async (data: OriginInput): Promise<Origin> => {
    const response = await fetch(`${API_BASE_URL}/api/origins/`, { // Endpoint check
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json() as Origin;
};
export const updateOrigin = async (id: number, data: PatchedOriginInput): Promise<Origin> => {
    const response = await fetch(`${API_BASE_URL}/api/origins/${id}/`, { // Endpoint check
        method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json() as Origin;
};
export const deleteOrigin = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/origins/${id}/`, { method: 'DELETE' }); // Endpoint check
    if (!response.ok) throw new Error(`API error: ${response.status}`);
};

// === Store ===
export interface Store { id: number; name: string; location: string; }
// ストア作成/更新(PUT)時に API へ送るデータの型 (name と location が必須)
export interface StoreInput { name: string; location: string; }
// ストア部分更新(PATCH)時に API へ送るデータの型
export type PatchedStoreInput = Partial<StoreInput>;

// --- API クライアント関数 (Store 関連) ---
export const getStores = (): Promise<Store[]> => fetchList<Store>('/api/stores/');
export const getStoreById = async (id: number): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}/api/stores/${id}/`);
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (GET /api/stores/${id}/):`, errorData);
        throw new Error(`API request failed for GET /api/stores/${id}/ with status ${response.status}`);
    }
    return await response.json() as Store;
};
export const createStore = async (storeData: StoreInput): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}/api/stores/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response (POST /api/stores/):", errorData);
        throw new Error(`API request failed for POST /api/stores/ with status ${response.status}`);
    }
    return await response.json() as Store;
};
export const updateStore = async (id: number, storeData: PatchedStoreInput): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}/api/stores/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (PATCH /api/stores/${id}/):`, errorData);
        throw new Error(`API request failed for PATCH /api/stores/${id}/ with status ${response.status}`);
    }
    return await response.json() as Store;
};
export const deleteStore = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/stores/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (DELETE /api/stores/${id}/):`, errorData);
        throw new Error(`API request failed for DELETE /api/stores/${id}/ with status ${response.status}`);
    }
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

// --- Read ---
/** 商品一覧を取得 */
export const getProducts = (): Promise<Product[]> => fetchList<Product>('/api/products/');

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

// === ShoppingRecord ===
export interface ShoppingRecord {
    id: number;
    price: number;
    purchase_date: string;
    quantity: string;
    store: Store;
    product: Product;
}
  
// 購買記録 作成/更新(PUT)時に API へ送るデータの型
export interface ShoppingRecordInput {
    price: number;
    purchase_date: string; // Expects a string in YYYYY-MM-DD format
    quantity: string;
    store_id: number;
    product_id: number;
}

// 購買記録 部分更新(PATCH)時に API へ送るデータの型
export type PatchedShoppingRecordInput = Partial<ShoppingRecordInput>;


// --- API クライアント関数 (ShoppingRecord 関連) ---
/** 購買記録一覧を取得 */
export const getShoppingRecords = (): Promise<ShoppingRecord[]> => fetchList<ShoppingRecord>('/api/shopping-records/');

/** 指定された ID の購買記録詳細を取得する */
export const getShoppingRecordById = async (id: number): Promise<ShoppingRecord> => {
    const response = await fetch(`${API_BASE_URL}/api/shopping-records/${id}/`);
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (GET /api/shopping-records/${id}/):`, errorData);
        throw new Error(`API request failed for GET /api/shopping-records/${id}/ with status ${response.status}`);
    }
    return await response.json() as ShoppingRecord;
};

/** 新しい購買記録を作成する */
export const createShoppingRecord = async (recordData: ShoppingRecordInput): Promise<ShoppingRecord> => {
    const response = await fetch(`${API_BASE_URL}/api/shopping-records/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response (POST /api/shopping-records/):", errorData);
        // TODO: より詳細なエラーハンドリング (サーバーからのバリデーションエラー等)
        throw new Error(`API request failed for POST /api/shopping-records/ with status ${response.status}`);
    }
    return await response.json() as ShoppingRecord;
};

/** 指定された ID の購買記録を更新 (部分更新) する */
export const updateShoppingRecord = async (id: number, recordData: PatchedShoppingRecordInput): Promise<ShoppingRecord> => {
    const response = await fetch(`${API_BASE_URL}/api/shopping-records/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (PATCH /api/shopping-records/${id}/):`, errorData);
        // TODO: より詳細なエラーハンドリング
        throw new Error(`API request failed for PATCH /api/shopping-records/${id}/ with status ${response.status}`);
    }
    return await response.json() as ShoppingRecord;
};

/** 指定された ID の購買記録を削除する */
export const deleteShoppingRecord = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/shopping-records/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error Response (DELETE /api/shopping-records/${id}/):`, errorData);
        throw new Error(`API request failed for DELETE /api/shopping-records/${id}/ with status ${response.status}`);
    }
};
