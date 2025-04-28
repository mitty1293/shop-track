import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import {
    ShoppingRecord,
    Product,
    Store,
    PatchedShoppingRecordInput,
    getShoppingRecordById,
    updateShoppingRecord,
    getProducts,
    getStores,
} from '../api/client';

const ShoppingRecordEditPage: React.FC = () => {
    // --- Hooks ---
    const { id } = useParams<{ id: string }>();
    const recordId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- State ---
    const [productId, setProductId] = useState<number | ''>('');
    const [storeId, setStoreId] = useState<number | ''>('');
    const [purchaseDate, setPurchaseDate] = useState<string>('');
    const [price, setPrice] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);

    // --- データ取得 ---
    // 1. 編集対象の購買記録データを取得
    const { data: recordData, isLoading: isLoadingRecord, isError, error } = useQuery<ShoppingRecord, Error>({
        queryKey: ['shoppingRecords', recordId],
        queryFn: () => getShoppingRecordById(recordId),
        enabled: !!recordId && !isNaN(recordId),
    });

    // 2. ドロップダウン用の商品・店舗リストを取得
    const { data: products, isLoading: isLoadingProducts } = useQuery<Product[], Error>({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    const { data: stores, isLoading: isLoadingStores } = useQuery<Store[], Error>({
        queryKey: ['stores'],
        queryFn: getStores,
    });

    // --- フォーム初期値の設定 (useEffect) ---
    // recordData の取得が完了したら、そのデータでフォーム state を更新
    useEffect(() => {
        if (recordData) {
            // 各 state を取得したデータで更新
            setProductId(recordData.product?.id ?? '');
            setStoreId(recordData.store?.id ?? '');
            setPurchaseDate(recordData.purchase_date ?? '');
            setPrice(recordData.price ?? '');
            setQuantity(recordData.quantity ?? '');
        }
    }, [recordData]);

    // --- Mutation (データ更新) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedShoppingRecordInput) => updateShoppingRecord(recordId, data),
        onSuccess: (updatedData) => {
            console.log('Shopping Record updated:', updatedData);
            // 関連するクエリキャッシュを無効化して、再取得を促す
            queryClient.invalidateQueries({ queryKey: ['shoppingRecords', recordId] });
            queryClient.invalidateQueries({ queryKey: ['shoppingRecords'] });
            navigate('/shopping-records');
        },
        onError: (error) => {
            setFormError(error.message);
            console.error("Update Shopping Record error:", error);
        },
    });

    // --- フォーム送信時の処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);

        if (!productId || !storeId || !purchaseDate || price === '' || !quantity) {
            setFormError('All fields except price (can be 0) are required.');
            return;
        }
        if (isNaN(Number(price)) || Number(price) < 0) {
            setFormError('Price must be a non-negative number.');
            return;
        }
        if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
            setFormError('Quantity must be a positive number.');
            return;
        }

        // PATCH 用のデータを作成 (現在のフォームの値から)
        const patchedData: PatchedShoppingRecordInput = {
            product_id: Number(productId),
            store_id: Number(storeId),
            purchase_date: purchaseDate,
            price: Number(price),
            quantity: quantity,
        };
        mutate(patchedData);
    };

    // --- ローディング / エラー表示 ---
    const isLoading = isLoadingRecord || isLoadingProducts || isLoadingStores;

    if (isLoading) {
        return <div>Loading data...</div>;
    }
    if (isError) {
        return <div>Error loading record: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    }
    if (!recordData) {
        return <div>Record not found (ID: {recordId}).</div>;
    }

    // --- JSX (フォーム) ---
    return (
        <div>
            <h1>Edit Shopping Record (ID: {recordId})</h1>
            <form onSubmit={handleSubmit}>
                {/* Product Select */}
                <div>
                    <label htmlFor="product">Product:</label>
                    <select
                        id="product"
                        value={productId}
                        onChange={e => setProductId(e.target.value ? Number(e.target.value) : '')}
                        required
                        disabled={isLoading || isPending}
                    >
                        <option value="">Select Product...</option>
                        {products?.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name} {product.unit ? `(${product.unit.name})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Store Select */}
                <div>
                    <label htmlFor="store">Store:</label>
                    <select
                        id="store"
                        value={storeId}
                        onChange={e => setStoreId(e.target.value ? Number(e.target.value) : '')}
                        required
                        disabled={isLoading || isPending}
                    >
                        <option value="">Select Store...</option>
                        {stores?.map(store => (
                            <option key={store.id} value={store.id}>
                                {store.name} {store.location ? `(${store.location})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Purchase Date */}
                <div>
                    <label htmlFor="purchaseDate">Purchase Date:</label>
                    <input
                        id="purchaseDate"
                        type="date"
                        value={purchaseDate}
                        onChange={e => setPurchaseDate(e.target.value)}
                        required
                        disabled={isPending}
                    />
                </div>

                {/* Price */}
                <div>
                    <label htmlFor="price">Price:</label>
                    <input
                        id="price"
                        type="number"
                        min="0"
                        step="1"
                        value={price}
                        onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                        required
                        disabled={isPending}
                    />
                </div>

                {/* Quantity */}
                <div>
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                        id="quantity"
                        type="number"
                        step="any"
                        min="0"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        required
                        disabled={isPending}
                    />
                    <span> {products?.find(p => p.id === productId)?.unit?.name ?? ''}</span>
                </div>

                {/* Error Display */}
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {mutationError && <div style={{ color: 'red' }}>{mutationError.message}</div>}

                {/* Buttons */}
                <button type="submit" disabled={isLoading || isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => navigate('/shopping-records')} disabled={isPending}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default ShoppingRecordEditPage;
