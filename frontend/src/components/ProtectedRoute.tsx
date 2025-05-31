import React, { JSX } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface ProtectedRouteProps {
    children: JSX.Element; // 保護したいコンポーネント
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const auth = useAuth();
    const location = useLocation(); // 現在のロケーション情報を取得

    // AuthContext の初期化中 (トークン確認中など) はローディング表示
    if (auth.isLoading) {
        return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
        );
    }

    // 認証されていない場合はログインページにリダイレクト
    // リダイレクト後、ログインに成功したら元のページに戻れるように、現在のパスを state として渡す
    if (!auth.isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 認証されていれば、子コンポーネント (保護対象のページ) を表示
    return children;
};

export default ProtectedRoute;
