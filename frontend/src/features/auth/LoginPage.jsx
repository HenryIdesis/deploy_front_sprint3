import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login as apiLogin } from "../../api/auth";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
  user: z.string().min(3, "Usuário obrigatório"),
  passw: z.string().min(3, "Senha obrigatória"),
});

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ 
    resolver: zodResolver(schema),
    defaultValues: {
      user: "",
      passw: ""
    }
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isAuthenticated } = useAuth();
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setErrorMsg(null);
    setIsLoading(true);
    
    try {
      const credentials = { user: data.user, passw: data.passw };
      const res = await apiLogin(credentials);
      
      loginUser(res.token);
      
      if (res.studentId) {
        localStorage.setItem("studentId", res.studentId);
      }
      
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo);
    } catch (err) {
      console.error("Erro no login:", err);
      const detailError = err.response?.data?.detail || "Credenciais inválidas ou erro no servidor.";
      setErrorMsg(detailError);
      
      reset({
        user: "",
        passw: ""
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-primary-dk">
          Login
        </h2>
        <div className="mb-4">
          <label className="block text-primary-dk text-sm font-bold mb-2">
            Usuário
          </label>
          <input
            {...register("user")}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Usuário"
            disabled={isLoading}
          />
          {errors.user && (
            <p className="text-red-500 text-xs italic">{errors.user.message}</p>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-primary-dk text-sm font-bold mb-2">
            Senha
          </label>
          <input
            {...register("passw")}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            type="password"
            placeholder="********"
            disabled={isLoading}
          />
          {errors.passw && (
            <p className="text-red-500 text-xs italic">{errors.passw.message}</p>
          )}
        </div>
        {errorMsg && <p className="text-red-500 text-xs italic mb-4">{errorMsg}</p>}
        <div className="flex items-center justify-between">
          <button
            className="bg-primary hover:bg-primary-dk text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
} 