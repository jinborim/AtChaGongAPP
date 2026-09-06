import { clearAuthTokensForRecovery, getAuthTokens } from "@/src/api";
import { getMe, type Me } from "@/src/features/user";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthStatus = "loading" | "signedOut" | "guest" | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: Me | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  continueAsGuest: () => Promise<void>;
  setAuthenticatedUser: (user: Me) => void;
  updateCurrentUser: (patch: Partial<Me>) => void;
  setSignedOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      const tokens = await getAuthTokens();

      if (!tokens) {
        if (isActive) setStatus("signedOut");
        return;
      }

      try {
        const me = await getMe();
        if (!isActive) return;

        setUser(me);
        setStatus("authenticated");
      } catch (error) {
        console.warn("저장된 로그인 세션 복구 실패:", error);
        await clearAuthTokensForRecovery();

        if (!isActive) return;
        setUser(null);
        setStatus("signedOut");
      }
    };

    restoreSession().catch((error) => {
      console.warn("로그인 상태 확인 실패:", error);
      if (isActive) setStatus("signedOut");
    });

    return () => {
      isActive = false;
    };
  }, []);

  const continueAsGuest = useCallback(async () => {
    await clearAuthTokensForRecovery();
    setUser(null);
    setStatus("guest");
  }, []);

  const setAuthenticatedUser = useCallback((nextUser: Me) => {
    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const updateCurrentUser = useCallback((patch: Partial<Me>) => {
    setUser((currentUser) =>
      currentUser ? { ...currentUser, ...patch } : currentUser,
    );
  }, []);

  const setSignedOut = useCallback(() => {
    setUser(null);
    setStatus("signedOut");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isGuest: status === "guest",
      isAuthenticated: status === "authenticated",
      isAdmin: status === "authenticated" && user?.userRole === "ADMIN",
      continueAsGuest,
      setAuthenticatedUser,
      updateCurrentUser,
      setSignedOut,
    }),
    [
      continueAsGuest,
      setAuthenticatedUser,
      setSignedOut,
      status,
      updateCurrentUser,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return value;
}
