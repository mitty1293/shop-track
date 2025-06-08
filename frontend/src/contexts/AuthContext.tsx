import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { axiosInstance, loginUser, logoutUser, fetchUserProfile, LoginCredentials, User} from '../api/client';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean; // 初期ロード中やトークンリフレッシュ中の状態
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

// Context を作成
const AuthContext = createContext<AuthContextType>(null!);

// Context を簡単に利用するためのカスタムフック
export const useAuth = () => useContext(AuthContext);

// AuthProvider コンポーネント
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // 初期表示時はtrue
    const navigate = useNavigate();

    // アクセストークンの変更を監視し、axiosのデフォルトヘッダーを更新
    useEffect(() => {
        if (accessToken) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    }, [accessToken]);

    // ユーザー情報を取得してstateにセットする関数
    const fetchAndSetUser = useCallback(async () => {
        try {
            const userProfile = await fetchUserProfile();
            setUser(userProfile);
            console.log('User profile fetched successfully:', userProfile);
        } catch (error) {
            console.error('Failed to fetch user profile', error);
            // ユーザー情報が取得できなければトークンを無効化
            setAccessToken(null);
            setUser(null);
        }
    }, []);

    // ログアウト処理
    const logout = useCallback(async () => {
        console.log('Attempting to logout...');
        try {
            await logoutUser();
        } catch (error) {
            console.error('Failed to logout user', error);
        } finally {
            // API呼び出しの成否に関わらずフロントエンドの状態をクリア
            setUser(null);
            setAccessToken(null);
            console.log('User logged out from AuthContext.');
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // アプリケーション初期化時にサイレントリフレッシュを試みる
    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            try {
                const response = await axiosInstance.post<{ access: string }>('/api/auth/token/refresh/');
                const newAccessToken = response.data.access;
                if (newAccessToken) {
                    setAccessToken(newAccessToken);
                    await fetchAndSetUser();
                }
            } catch (error) {
                console.log('No active session or refresh failed.');
            } finally {
                setIsLoading(false); // 初期化処理の完了
            }
        };
        initializeAuth();
    }, [fetchAndSetUser]);

    // トークンがリフレッシュされたグローバルイベントをリッスン
    useEffect(() => {
        const handleTokenRefreshed = (event: Event) => {
            const { accessToken: newAccessToken } = (event as CustomEvent).detail;
            console.log("Token refreshed via interceptor, updating AuthContext.");
            setAccessToken(newAccessToken);
        };
        window.addEventListener('token-refreshed', handleTokenRefreshed);
        return () => {
            window.removeEventListener('token-refreshed', handleTokenRefreshed);
        };
    }, []);

    // 'auth-error' イベントをリッスンしてログアウトを実行
    useEffect(() => {
        const handleAuthErrorEvent = () => {
            console.log('Global auth-error event received. Logging out.');
            logout();
        };
        window.addEventListener('auth-error', handleAuthErrorEvent);
        return () => {
            window.removeEventListener('auth-error', handleAuthErrorEvent);
        };
    }, [logout]);

    // ログイン処理
    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const tokenData = await loginUser(credentials);
            const newAccessToken = tokenData.access;

            // 先にaxiosのヘッダーを直接更新する
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            // その後でReactのstateを更新
            setAccessToken(newAccessToken);
            // これで、次のAPI呼び出しはヘッダーが付与された状態で実行される
            await fetchAndSetUser(); // ログイン成功後、ユーザー情報を取得
        } catch (error) {
            setIsLoading(false);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        isAuthenticated: !!accessToken && !!user,
        user,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
