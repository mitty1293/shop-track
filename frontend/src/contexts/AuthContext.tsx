import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { loginUser, fetchUserProfile, LoginCredentials, User} from '../api/client';

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
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [isLoading, setIsLoading] = useState<boolean>(true); // 初期表示時はtrue
    const navigate = useNavigate();

    // リフレッシュトークンを保存する場所 (localStorage)
    const REFRESH_TOKEN_KEY = 'refreshToken';

    // アクセストークンを保存する場所 (メモリ上、または短期間ならlocalStorageも可)
    // メモリ上で管理し、ページリロード時はリフレッシュトークンから再取得する想定
    const ACCESS_TOKEN_KEY = 'accessToken'; // localStorageに保存する場合のキー

    // ユーザー情報を取得してstateにセットする関数
    const fetchAndSetUser = async () => {
        try {
            const userProfile = await fetchUserProfile();
            setUser(userProfile);
            console.log('User profile fetched successfully:', userProfile);
        } catch (error) {
            console.error('Failed to fetch user profile', error);
            throw error;
        }
    };

    // ログアウト処理
    const logout = useCallback(() => {
        console.log('Attempting to logout...');
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        console.log('User logged out from AuthContext.');
        navigate('/login', { replace: true });
    }, [navigate]);

    // アプリケーション初期化時にトークンを確認し、ユーザー情報を取得する
    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

            if (storedAccessToken) {
                setAccessToken(storedAccessToken);
                try {
                    await fetchAndSetUser();
                } catch (error) {
                    console.log("Access token might be expired, trying to refresh...");
                }
            }
            setIsLoading(false); // 初期化処理の完了
        };
        initializeAuth();
    }, []);

    // 'auth-error' イベントをリッスンしてログアウトを実行
    useEffect(() => {
        const handleAuthErrorEvent = (event: Event) => {
            console.log('Global auth-error event received in AuthContext. Logging out.', (event as CustomEvent).detail);
            logout();
            // ここでユーザーにセッション切れを通知するトーストなどを表示するのも良い
            // 強制的にログインページに遷移
            window.location.href = '/login';
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
            localStorage.setItem(ACCESS_TOKEN_KEY, tokenData.access);
            localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refresh);
            setAccessToken(tokenData.access);
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
