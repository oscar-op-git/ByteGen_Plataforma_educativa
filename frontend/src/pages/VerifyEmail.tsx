import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail } from "../services/authService";

export default function VerifyEmail() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verificando tu cuenta...");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (!token) {
      setState("error");
      setMessage("Token de verificación faltante.");
      return;
    }
    verifyEmail(token)
      .then(() => {
        setState("success");
        setMessage("¡Correo verificado! Ya puedes iniciar sesión.");
        setTimeout(() => navigate("/login"), 1500);
      })
      .catch((e: any) => {
        setState("error");
        setMessage(e?.message || "Token inválido o expirado.");
      });
  }, [search, navigate]);

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
      <h2>Verificación de correo</h2>
      <p style={{ marginTop: 12, color: state === "error" ? "#dc2626" : "#111827" }}>{message}</p>
      {state !== "loading" && (
        <button onClick={() => navigate("/login")} style={{ marginTop: 20 }}>
          Ir al login
        </button>
      )}
    </div>
  );
}
