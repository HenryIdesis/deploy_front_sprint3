import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <p>Página não encontrada.</p>
      <Link className="text-accent underline" to="/alunos">
        Voltar para Alunos
      </Link>
    </div>
  );
} 