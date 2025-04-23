const API_BASE_URL = 'https://shoptrack.fmitty.net';

interface Category {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  name: string;
}

interface Manufacturer {
    id: number;
    name: string;
}
interface Origin {
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

/**
 * 商品一覧を取得する API クライアント関数
 * @returns Product の配列を解決する Promise
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/api/products/`);

  if (!response.ok) {
    const errorData = await response.text();
    console.error("API Error Response:", errorData);
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();

  console.log(data);
  return data as Product[];
};

// ---- 他の API 関数 (将来追加) ----
// export const getCategories = async (): Promise<Category[]> => { ... };
// export const getUnits = async (): Promise<Unit[]> => { ... };