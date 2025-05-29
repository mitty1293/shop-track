import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    loginUser,
    refreshToken,
    LoginCredentials,
    TokenResponse,
    RefreshTokenResponse,
} from '../api/client';

interface User {
    id: number;
    username: string;
    email?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    isLoading: boolean; // 初期ロード中やトークンリフレッシュ中の状態
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

// Context を作成
const AuthContext = createContext<AuthContextType>(null!);

// Context を簡単に利用するためのカスタムフック
export const useAuth = () => {
    return useContext(AuthContext);
};

// AuthProvider コンポーネント
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // 初期表示時はtrue

    // リフレッシュトークンを保存する場所 (localStorage)
    const REFRESH_TOKEN_KEY = 'refreshToken';

    // アクセストークンを保存する場所 (メモリ上、または短期間ならlocalStorageも可)
    // メモリ上で管理し、ページリロード時はリフレッシュトークンから再取得する想定
    const ACCESS_TOKEN_KEY = 'accessToken'; // localStorageに保存する場合のキー

    // ユーザー情報を取得してstateにセットする関数 (仮)
    const fetchAndSetUser = async (token: string) => {
        setIsLoading(true);
        try {
            // const userProfile = await fetchUserProfile(token); // 仮のAPI呼び出し
            // setUser(userProfile);
            setUser({ id: 1, username: 'dummyUser' }); // 仮のユーザーデータ
            console.log('User profile fetched (dummy)');
        } catch (error) {
            console.error('Failed to fetch user profile', error);
            // トークンが無効になっている可能性があるのでログアウト処理
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    // アプリ初期化時、またはアクセストークンがない場合にリフレッシュを試みる関数
    const tryRefreshToken = async () => {
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (storedRefreshToken) {
            setIsLoading(true);
            try {
                const data = await refreshToken(storedRefreshToken);
                setAccessToken(data.access);
                if (data.access) {
                    localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
                }
                await fetchAndSetUser(data.access);
                return data.access;
            } catch (error) {
                console.error('Initial token refresh failed:', error);
                logout();
                return null;
            } finally {
                setIsLoading(false);
            }
        }
        return null;
    };

    // アプリケーション初期化時にトークンを確認し、ユーザー情報を取得する
    useEffect(() => {
        const initializeAuth = async () => {
            const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

            if (storedAccessToken) {
                setAccessToken(storedAccessToken);
                // TODO: storedAccessToken の有効性を確認するAPI呼び出し (例: /api/auth/token/verify/)
                // もし有効なら fetchAndSetUser(storedAccessToken)
                // 無効なら tryRefreshToken() を呼び出す
                // ここでは簡略化のため、一旦ユーザー情報を取得し、失敗したらリフレッシュを試みる
                try {
                    await fetchAndSetUser(storedAccessToken);
                } catch (error) {
                    // アクセストークンでのユーザー情報取得に失敗した場合、リフレッシュを試みる
                    console.log("Access token might be expired, trying to refresh...");
                    await tryRefreshToken();
                }
            } else {
                // アクセストークンがなければリフレッシュを試みる
                await tryRefreshToken();
            }
            setIsLoading(false); // 初期化処理の完了
        };
        initializeAuth();
    }, []);


    // ログイン処理
    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const tokenData = await loginUser(credentials);
            setAccessToken(tokenData.access);
            localStorage.setItem(ACCESS_TOKEN_KEY, tokenData.access);
            localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refresh);
            await fetchAndSetUser(tokenData.access); // ログイン成功後、ユーザー情報を取得
        } catch (error) {
            // エラーは LoginPage で処理するために再スロー
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ログアウト処理
    const logout = () => {
        // TODO: サーバーサイドのログアウトAPIを呼び出す (リフレッシュトークンを無効化する場合)
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY); // 保存していれば削除
        console.log('User logged out');
        // navigate('/login'); // ログアウト後にログインページに遷移させるのが一般的
    };


    const value = {
        isAuthenticated: !!accessToken && !!user,
        user,
        accessToken,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
