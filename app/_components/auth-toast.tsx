"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Swal from "sweetalert2";

export type AuthToastType = "login" | "logout";

const AUTH_TOAST_KEY = "paro_auth_toast";

export function setAuthToast(type: AuthToastType) {
  sessionStorage.setItem(AUTH_TOAST_KEY, type);
}

const AuthToast = () => {
  const pathname = usePathname();

  useEffect(() => {
    const type = sessionStorage.getItem(AUTH_TOAST_KEY);

    if (!type) return;

    const shouldShow =
      (type === "login" && pathname === "/home") ||
      (type === "logout" && pathname === "/login");

    if (!shouldShow) return;

    sessionStorage.removeItem(AUTH_TOAST_KEY);

    void Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: type === "login" ? "Bem-vindo ao Parô!" : "Até logo!",
      text:
        type === "login"
          ? "Login realizado com sucesso."
          : "Você saiu da sua conta.",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  }, [pathname]);

  return null;
};

export default AuthToast;
