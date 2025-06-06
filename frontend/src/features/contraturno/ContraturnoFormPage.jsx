import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarContraturnos, criarContraturno, getContraturno, atualizarContraturno } from "../../api/contraturno";
import { listarAlunos } from "../../api/alunos";
import { listarColaboradores } from "../../api/colaboradores";
import { Card, CardContent, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

// Schema de validação
const schema = z.object({
  titulo: z.string().nonempty("Título obrigatório"),
  descricao: z.string().optional(),
  professor: z.string().optional(),
  horario: z.string().optional(),
  vagas: z.number().min(0, "Vagas deve ser >=0").default(0),
  categoria: z.string().optional(),
  status: z.enum(["Ativo", "Inativo"]).default("Ativo"),
  alunosInscritos: z.array(z.string()).default([]),
});

export default function ContraturnoFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { titulo: "", descricao: "", professor: "", horario: "", vagas: 0, categoria: "", status: "Ativo", alunosInscritos: [] },
  });

  const { data: alunos = [] } = useQuery({ queryKey: ["alunos"], queryFn: listarAlunos });
  const { data: colaboradores = [] } = useQuery({ queryKey: ["colaboradores"], queryFn: listarColaboradores });

  // Se editando, carrega dados existentes e preenche o formulário
  const {
    data: projetoData,
    isLoading: isLoadingProjeto,
  } = useQuery({
    queryKey: ["contraturno", id],
    queryFn: () => getContraturno(id),
    enabled: !!id
  });

  useEffect(() => {
    if (projetoData) {
      reset({
        titulo: projetoData.titulo,
        descricao: projetoData.descricao || "",
        professor: projetoData.professor_id || "",
        horario: projetoData.horario || "",
        vagas: projetoData.vagas || 0,
        categoria: projetoData.categoria || "",
        status: projetoData.status || "Ativo",
        alunosInscritos: projetoData.alunosInscritos,
      });
    }
  }, [projetoData, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      return id ? atualizarContraturno(id, data) : criarContraturno(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contraturno"]);
      navigate("/contraturno");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const inscritos = watch("alunosInscritos");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Editar Projeto de Contraturno" : "Novo Projeto de Contraturno"}
      </h1>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-medium">Título</label>
              <Input type="text" {...register("titulo")} />
              {errors.titulo && <p className="text-red-500 text-sm">{errors.titulo.message}</p>}
            </div>

            <div>
              <label className="block font-medium">Descrição</label>
              <textarea {...register("descricao")} className="border rounded w-full p-2" />
            </div>

            <div>
              <label className="block font-medium">Professor</label>
              <select {...register("professor")} className="border rounded w-full p-2">
                <option value="">Selecione responsável</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium">Horário</label>
              <Input type="text" {...register("horario")} />
            </div>

            <div>
              <label className="block font-medium">Vagas</label>
              <Input type="number" {...register("vagas", { valueAsNumber: true })} />
            </div>

            <div>
              <label className="block font-medium">Categoria</label>
              <Input type="text" {...register("categoria")} />
            </div>

            <div>
              <label className="block font-medium">Status</label>
              <select {...register("status")} className="border rounded w-full p-2">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            <div className="border p-4 rounded">
              <label className="block font-medium mb-2">Alunos Inscritos</label>
              {alunos.map((a) => (
                <div key={a.id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    value={a.id}
                    {...register("alunosInscritos")}
                    className="mr-2"
                  />
                  <span>{a.nome} {a.sobrenome}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" type="button" onClick={() => navigate("/contraturno")}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">
                {isSubmitting ? "Salvando..." : id ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 