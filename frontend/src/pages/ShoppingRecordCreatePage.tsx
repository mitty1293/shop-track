import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
    Product,
    Store,
    getProducts,
    getStores,
    createShoppingRecord,
    ShoppingRecordInput,
} from '../api/client';

const ShoppingRecordCreatePage: React.FC = () => {
    // --- State ---
    const [productId, setProductId] = useState<number | ''>('');
    const [storeId, setStoreId] = useState<number | ''>('');
    const [purchaseDate, setPurchaseDate] = useState<string>(''); // YYYY-MM-DD
    const [price, setPrice] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);

    // --- Hooks ---
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- データ取得 (ドロップダウン用) ---
    const { data: products, isLoading: isLoadingProducts } = useQuery<Product[], Error>({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    const { data: stores, isLoading: isLoadingStores } = useQuery<Store[], Error>({
        queryKey: ['stores'],
        queryFn: getStores,
    });

    // --- Mutation (データ作成) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: createShoppingRecord,
        onSuccess: (data) => {
            console.log('Shopping Record created:', data);
            queryClient.invalidateQueries({ queryKey: ['shoppingRecords'] });
            navigate('/shopping-records');
        },
        onError: (error) => {
            setFormError(error.message);
            console.error("Create Shopping Record error:", error);
        },
    });

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);

        // バリデーション (必須項目 + 型チェック)
        if (!productId || !storeId || !purchaseDate || price === '' || !quantity) {
            setFormError('All fields except price (can be 0) are required.');
            return;
        }
        if (isNaN(Number(price)) || Number(price) < 0) {
            setFormError('Price must be a non-negative number.');
            return;
        }
        // quantity のバリデーション (数値として有効か、など - API仕様に合わせる)
        if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
            setFormError('Quantity must be a positive number.');
            return;
        }


        const recordData: ShoppingRecordInput = {
            product_id: Number(productId),
            store_id: Number(storeId),
            purchase_date: purchaseDate,
            price: Number(price),
            quantity: quantity,
        };

        mutate(recordData);
    };

    // ローディングチェック
    const isLoading = isLoadingProducts || isLoadingStores;

    return (
        <div>
            <h1>Add New Shopping Record</h1>
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
                    {/* 選択された商品の単位を表示 */}
                    <span> {products?.find(p => p.id === productId)?.unit?.name ?? ''}</span>
                </div>


                {/* Error Display */}
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {mutationError && <div style={{ color: 'red' }}>{mutationError.message}</div>}

                {/* Buttons */}
                <button type="submit" disabled={isLoading || isPending}>
                    {isPending ? 'Saving...' : 'Save Record'}
                </button>
                <button type="button" onClick={() => navigate('/shopping-records')} disabled={isPending}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default ShoppingRecordCreatePage;
