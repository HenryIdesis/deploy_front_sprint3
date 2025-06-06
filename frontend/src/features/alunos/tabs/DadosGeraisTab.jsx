import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAluno, updateAluno } from "../../../api/alunos";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StudentProfile } from "@/components/StudentProfile";
import { Button } from "@/components/ui/button";

const contatoSchema = z.object({
  nome: z.string().nonempty("Obrigatório"),
  fone: z.string().nonempty("Obrigatório"),
  email: z.string().email().optional(),
});

const schema = z.object({
  nome: z.string().nonempty(),
  sobrenome: z.string().nonempty(),
  dataNascimento: z.string().nonempty(),
  anoEscolar: z.string().nonempty(),
  endereco: z.string().optional().default(""),
  matricula: z.string().optional(),
  ra: z.string().optional(),
  cpf: z.string().optional(),
  enderecoCompleto: z.string().optional().default(""),
  contatosResponsaveis: z.array(contatoSchema).default([]),
  tagsAtencao: z.string().optional().default(""),
});

export default function DadosGeraisTab() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = React.useState(false);
  const location = useLocation();

  const { data: aluno, isLoading, isError, error } = useQuery({
    queryKey: ["aluno", id],
    queryFn: () => getAluno(id),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateAluno(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["aluno", id]);
      setEditMode(false);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: aluno?.nome || "",
      sobrenome: aluno?.sobrenome || "",
      dataNascimento: aluno?.dataNascimento || "",
      anoEscolar: aluno?.anoEscolar || "",
      endereco: aluno?.endereco || "",
      matricula: aluno?.matricula || "",
      ra: aluno?.ra || "",
      cpf: aluno?.cpf || "",
      enderecoCompleto: aluno?.dadosPessoais?.enderecoCompleto || "",
      contatosResponsaveis: aluno?.contatosResponsaveis || [],
      tagsAtencao: aluno?.tagsAtencao?.join(", ") || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contatosResponsaveis",
  });

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        tagsAtencao: data.tagsAtencao
          ? data.tagsAtencao.split(",").map((t) => t.trim())
          : [],
      });
    } catch (err) {
      console.error("Erro ao atualizar aluno:", err);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (isError) {
    return <div>Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <StudentProfile aluno={aluno} onEdit={() => setEditMode(true)} />
    </div>
  );
} 