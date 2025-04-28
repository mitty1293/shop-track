import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Product,
    Category,
    Unit,
    Manufacturer,
    Origin,
    PatchedProductInput,
    getProductById,
    updateProduct,
    getCategories,
    getUnits,
    getManufacturers,
    getOrigins,
} from '../api/client';

const ProductEditPage: React.FC = () => {
    // --- Hooks の初期化 ---
    const { id } = useParams<{ id: string }>(); // URL パラメータから ':id' を文字列として取得
    const productId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- フォーム入力値を管理する State ---
    // 初期値は空文字。API からデータ取得後に useEffect で設定される
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [unitId, setUnitId] = useState<number | ''>('');
    const [manufacturerId, setManufacturerId] = useState<number | ''>('');
    const [originId, setOriginId] = useState<number | ''>('');
    const [formError, setFormError] = useState<string | null>(null);

    // --- データ取得 (Tanstack Query: useQuery) ---

    // 1. 編集対象の商品データを取得
    const {
        data: productData, // 取得したデータ (Product | undefined)
        isLoading: isLoadingProduct, // ローディング中か (boolean)
        isError: isErrorProduct, // エラーが発生したか (boolean)
        error: productError, // エラーオブジェクト
    } = useQuery({
        queryKey: ['products', productId],
        queryFn: () => getProductById(productId),
        enabled: !!productId && !isNaN(productId), // productId が有効な数値の場合のみ実行
    });

    // 2. ドロップダウン用の関連データを取得 (カテゴリ、単位など)
    const { data: categories, isLoading: isLoadingCategories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
    const { data: units, isLoading: isLoadingUnits } = useQuery({ queryKey: ['units'], queryFn: getUnits });
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: getManufacturers });
    const { data: origins, isLoading: isLoadingOrigins } = useQuery({ queryKey: ['origins'], queryFn: getOrigins });

    // --- フォームの初期値を設定 (React: useEffect) ---
    // productData の取得が完了（または変更）されたら実行される副作用
    useEffect(() => {
        // productData が存在する場合 (取得成功時)
        if (productData) {
            // 各 state を取得したデータで更新
            setName(productData.name);
            setCategoryId(productData.category.id);
            setUnitId(productData.unit.id);
            // 関連データが null の可能性もあるため、null 合体演算子(??)で空文字にフォールバック
            setManufacturerId(productData.manufacturer?.id ?? '');
            setOriginId(productData.origin?.id ?? '');
        }
        // 依存配列に productData を指定。productData が変わるたびにこの effect が再実行される
    }, [productData]);

    // --- 商品更新処理 (Tanstack Query: useMutation) ---
    const {
        mutate, // この関数を実行すると mutationFn が呼び出される
        isPending, // Mutation が実行中か (boolean)
        error: mutationError // Mutation で発生したエラーオブジェクト
    } = useMutation({
            // 実行される非同期関数。更新用 API クライアント関数を呼び出す
            mutationFn: (data: PatchedProductInput) => updateProduct(productId, data),
            // Mutation 成功時のコールバック
            onSuccess: (updatedData) => { // updatedData は updateProduct が返した値
                console.log('商品更新成功:', updatedData);
                // 関連するクエリキャッシュを無効化して、再取得を促す
                queryClient.invalidateQueries({ queryKey: ['products', productId] }); // この商品の詳細キャッシュ
                queryClient.invalidateQueries({ queryKey: ['products'] });          // 商品一覧のキャッシュ
                // 一覧ページに遷移
                navigate('/products'); // パスは App.tsx の設定に合わせる
            },
            // Mutation 失敗時のコールバック
            onError: (error) => {
                console.error('商品更新エラー:', error);
                // エラーメッセージを state にセットしてユーザーに表示
                setFormError(error instanceof Error ? error.message : '商品更新中にエラーが発生しました。');
            },
        });

    // --- フォーム送信時の処理 ---
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // HTML 標準のフォーム送信動作を抑制
        setFormError(null); // 既存のエラーメッセージをクリア

        // 簡単なバリデーション (必須項目チェック)
        if (!name || !categoryId || !unitId) {
        setFormError('商品名、カテゴリ、単位は必須です。');
        return;
        }

        // API (PATCH /api/products/{id}/) に送信するデータ (PatchedProductInput 型) を作成
        const updatedProductData: PatchedProductInput = {
            name: name,
            category_id: Number(categoryId),
            unit_id: Number(unitId),
            manufacturer_id: manufacturerId ? Number(manufacturerId) : null,
            origin_id: originId ? Number(originId) : null,
        };
        mutate(updatedProductData);
    };

    // --- レンダリング前のローディング・エラーチェック ---
    // ドロップダウンデータ全体のローディング状態
    const isLoadingDropdownData = isLoadingCategories || isLoadingUnits || isLoadingManufacturers || isLoadingOrigins;

    // 商品データ、またはドロップダウンデータのいずれかがローディング中ならローディング表示
    if (isLoadingProduct || isLoadingDropdownData) {
        return <div>データを読み込み中...</div>;
    }

    // 商品データの取得でエラーが発生した場合
    if (isErrorProduct) {
        return <div>商品データの読み込み中にエラーが発生しました: {productError?.message}</div>;
    }

    // 商品データが存在しない場合 (ID が不正、削除済みなど)
    if (!productData) {
        return <div>指定された商品が見つかりません。ID: {productId}</div>
    }

    // --- JSX によるフォームのレンダリング ---
    return (
        <div>
            <h1>商品を編集 (ID: {productId})</h1>
            <button onClick={() => navigate('/products')}>商品一覧に戻る</button>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">商品名:</label>
                    <input
                        type="text"
                        id="name"
                        value={name} // state の値が表示される (useEffect で初期化済み)
                        onChange={(e) => setName(e.target.value)} // 入力で state を更新
                        required
                        disabled={isPending} // 更新処理中は無効化
                    />
                </div>

                <div>
                    <label htmlFor="category">カテゴリ:</label>
                    <select
                        id="category"
                        value={categoryId} // state の値が選択される
                        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                        required
                        disabled={isPending}
                    >
                        <option value="">選択してください</option>
                        {categories?.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="unit">単位:</label>
                    <select
                        id="unit"
                        value={unitId}
                        onChange={(e) => setUnitId(e.target.value ? Number(e.target.value) : '')}
                        required
                        disabled={isPending}
                    >
                        <option value="">選択してください</option>
                        {units?.map((unit) => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="manufacturer">製造者:</label>
                    <select
                        id="manufacturer"
                        value={manufacturerId}
                        onChange={(e) => setManufacturerId(e.target.value ? Number(e.target.value) : '')}
                        disabled={isPending}
                    >
                        <option value="">(指定しない)</option>
                        {manufacturers?.map((manufacturer) => (
                            <option key={manufacturer.id} value={manufacturer.id}>{manufacturer.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="origin">原産国:</label>
                    <select
                        id="origin"
                        value={originId}
                        onChange={(e) => setOriginId(e.target.value ? Number(e.target.value) : '')}
                        disabled={isPending}
                    >
                        <option value="">(指定しない)</option>
                        {origins?.map((origin) => (
                            <option key={origin.id} value={origin.id}>{origin.name}</option>
                        ))}
                    </select>
                </div>

                {/* エラーメッセージ表示エリア */}
                {formError && <div style={{ color: 'red' }}>エラー: {formError}</div>}
                {mutationError && <div style={{ color: 'red' }}>更新エラー: {mutationError.message}</div>}

                {/* 送信ボタンとキャンセルボタン */}
                <button type="submit" disabled={isPending || isLoadingProduct || isLoadingDropdownData}>
                    {isPending ? '更新中...' : '更新する'}
                </button>
                <button type="button" onClick={() => navigate('/products')} disabled={isPending}>
                    キャンセル
                </button>
            </form>
        </div>
    );
};

export default ProductEditPage;
