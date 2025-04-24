import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  getCategories,
  getUnits,
  getManufacturers,
  getOrigins,
  createProduct,
  ProductInput,
} from '../api/client';

const ProductCreate: React.FC = () => {
    // --- 状態管理 ---
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>(''); // 初期値は空 or プレースホルダ値
    const [unitId, setUnitId] = useState<number | ''>('');
    const [manufacturerId, setManufacturerId] = useState<number | ''>(''); // 任意なので空を許容
    const [originId, setOriginId] = useState<number | ''>('');       // 任意なので空を許容
    const [formError, setFormError] = useState<string | null>(null); // フォーム送信時のエラーメッセージ用

    // --- React Router と Tanstack Query の準備 ---
    const navigate = useNavigate(); // ページ遷移用フック
    const queryClient = useQueryClient(); // Query Client インスタンス取得

    // --- 関連データの取得 (useQuery) ---
    // カテゴリ一覧
    const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    // 単位一覧
    const { data: units, isLoading: isLoadingUnits, isError: isErrorUnits } = useQuery({
        queryKey: ['units'],
        queryFn: getUnits,
    });

    // 製造者一覧
    const { data: manufacturers, isLoading: isLoadingManufacturers, isError: isErrorManufacturers } = useQuery({
        queryKey: ['manufacturers'],
        queryFn: getManufacturers,
    });

    // 原産国一覧
    const { data: origins, isLoading: isLoadingOrigins, isError: isErrorOrigins } = useQuery({
        queryKey: ['origins'],
        queryFn: getOrigins,
    });

    // --- 商品作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: createProduct, // Product作成関数
        onSuccess: (data) => {
            console.log('商品作成成功:', data);
            // 商品一覧のキャッシュを無効化して再取得をトリガー
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // 商品一覧ページに遷移
            navigate('/items'); // App.tsx で設定した一覧ページのパスに合わせる
        },
        onError: (error) => {
            console.error('商品作成エラー:', error);
            // エラーメッセージを状態にセットして表示するなどの処理
            setFormError(error instanceof Error ? error.message : '商品作成中にエラーが発生しました。');
        },
    });

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // デフォルトのフォーム送信を抑制
        setFormError(null); // エラーメッセージをリセット

        // 簡単なバリデーション
        if (!name || !categoryId || !unitId) {
        setFormError('商品名、カテゴリ、単位は必須です。');
        return;
        }

        // 送信するデータを作成 (ProductInput 型)
        const productData: ProductInput = {
        name,
        category_id: Number(categoryId), // number 型に変換
        unit_id: Number(unitId),         // number 型に変換
        // 選択されていれば number、されていなければ null を送信
        manufacturer_id: manufacturerId ? Number(manufacturerId) : null,
        origin_id: originId ? Number(originId) : null,
        };

        // useMutation の mutate 関数を実行して API に POST リクエスト
        mutate(productData);
    };

    // --- ローディング・エラー表示 ---
    const isLoadingDropdownData = isLoadingCategories || isLoadingUnits || isLoadingManufacturers || isLoadingOrigins;
    const isErrorDropdownData = isErrorCategories || isErrorUnits || isErrorManufacturers || isErrorOrigins;

    if (isLoadingDropdownData) {
        return <div>フォームデータを読み込み中...</div>;
    }

    if (isErrorDropdownData) {
        return <div>フォームデータの読み込み中にエラーが発生しました。</div>;
    }

    // --- JSX (フォームのレンダリング) ---
    return (
        <div>
        <h1>新しい商品を登録</h1>

        <form onSubmit={handleSubmit}>
            {/* 商品名 */}
            <div>
            <label htmlFor="name">商品名:</label>
            <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending} // 送信中は無効化
            />
            </div>

            {/* カテゴリ選択 */}
            <div>
            <label htmlFor="category">カテゴリ:</label>
            <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                required
                disabled={isPending}
            >
                <option value="">選択してください</option>
                {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
                ))}
            </select>
            </div>

            {/* 単位選択 */}
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
                <option key={unit.id} value={unit.id}>
                    {unit.name}
                </option>
                ))}
            </select>
            </div>

            {/* 製造者選択 (任意) */}
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
                <option key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                </option>
                ))}
            </select>
            </div>

            {/* 原産国選択 (任意) */}
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
                <option key={origin.id} value={origin.id}>
                    {origin.name}
                </option>
                ))}
            </select>
            </div>

            {/* エラーメッセージ表示 */}
            {formError && <div style={{ color: 'red' }}>エラー: {formError}</div>}
            {mutationError && <div style={{ color: 'red' }}>エラー: {mutationError.message}</div>}

            {/* 送信ボタン */}
            <button type="submit" disabled={isPending || isLoadingDropdownData}>
            {isPending ? '登録中...' : '登録する'}
            </button>
        </form>
        </div>
    );
};

export default ProductCreate;
