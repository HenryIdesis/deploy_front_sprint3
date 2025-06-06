import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../../api/http";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const schema = z.object({
  nome: z.string().nonempty("Nome obrigatório"),
  sobrenome: z.string().nonempty("Sobrenome obrigatório"),
  dataNascimento: z.string().nonempty("Data de nascimento obrigatória"),
  anoEscolar: z.string().nonempty("Ano escolar obrigatório"),
  periodo: z.enum(["Manhã", "Tarde", "Noite"], { errorMap: () => ({ message: "Período obrigatório" }) }),
  enderecoCompleto: z.string().optional(),
  contatosResponsaveis: z
    .array(
      z.object({
        nome: z.string().nonempty("Nome do responsável obrigatório"),
        fone: z.string().nonempty("Telefone obrigatório"),
        email: z.string().email("Email inválido").optional().or(z.literal('')),
      })
    )
    .default([]),
  tagsAtencao: z.string().optional(),
  matricula: z.string().optional(),
  ra: z.string().optional(),
  cpf: z.string().optional(),
});

export default function AlunoFormPage() {
  const navigate = useNavigate();
  const { id: alunoId } = useParams();
  const [isEditMode, setIsEditMode] = useState(!!alunoId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      dataNascimento: "",
      anoEscolar: "",
      periodo: "Manhã",
      enderecoCompleto: "",
      contatosResponsaveis: [{ nome: "", fone: "", email: "" }],
      tagsAtencao: "",
      matricula: "",
      ra: "",
      cpf: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contatosResponsaveis",
  });

  useEffect(() => {
    if (isEditMode && alunoId) {
      const fetchAluno = async () => {
        try {
          const response = await api.get(`/alunos/${alunoId}`);
          const aluno = response.data;
          const formattedData = {
            ...aluno,
            dataNascimento: aluno.dataNascimento ? aluno.dataNascimento.split("T")[0] : "",
            periodo: aluno.periodo || "Manhã",
            tagsAtencao: Array.isArray(aluno.tagsAtencao) ? aluno.tagsAtencao.join(", ") : "",
            enderecoCompleto: aluno.dadosPessoais?.enderecoCompleto || "",
            contatosResponsaveis: aluno.contatosResponsaveis && aluno.contatosResponsaveis.length > 0 
              ? aluno.contatosResponsaveis 
              : [{ nome: "", fone: "", email: "" }],
          };
          reset(formattedData);
        } catch (error) {
          console.error("Erro ao buscar dados do aluno:", error);
          alert("Não foi possível carregar os dados do aluno para edição.");
          navigate("/alunos");
        }
      };
      fetchAluno();
    } else {
      reset({ contatosResponsaveis: [{ nome: "", fone: "", email: "" }], periodo: "Manhã" });
    }
  }, [isEditMode, alunoId, reset, navigate]);

  const onSubmit = async (dados) => {
    try {
      const payload = {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        dataNascimento: dados.dataNascimento,
        anoEscolar: dados.anoEscolar,
        periodo: dados.periodo,
        dadosPessoais: { enderecoCompleto: dados.enderecoCompleto || "" },
        contatosResponsaveis: dados.contatosResponsaveis.filter(
          c => c.nome || c.fone || c.email
        ),
        tagsAtencao: dados.tagsAtencao ? dados.tagsAtencao.split(",").map((t) => t.trim()).filter(t => t) : [],
        matricula: dados.matricula,
        ra: dados.ra,
        cpf: dados.cpf,
      };

      if (isEditMode) {
        await api.put(`/alunos/${alunoId}`, payload);
        alert("Aluno atualizado com sucesso!");
      } else {
        await api.post("/alunos", payload);
        alert("Aluno cadastrado com sucesso!");
      }
      navigate("/alunos");
    } catch (err) {
      console.error(isEditMode ? "Erro ao atualizar aluno:" : "Erro ao criar aluno:", err.response?.data || err.message);
      alert( (isEditMode ? "Erro ao atualizar aluno: " : "Erro ao criar aluno: ") + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message) );
    }
  };

  const formatarTelefone = (valor) => {
    if (!valor) return "";
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 2) {
      return `(${numeros}`;
    }
    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }
    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isEditMode ? "Editar Aluno" : "Cadastrar Novo Aluno"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        {/* Dados Pessoais */}
        <div>
          <label className="block font-medium">Nome</label>
          <Input type="text" {...register("nome")} />
          {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Sobrenome</label>
          <Input type="text" {...register("sobrenome")} />
          {errors.sobrenome && <p className="text-red-500 text-sm">{errors.sobrenome.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Data de Nascimento</label>
          <Input type="date" {...register("dataNascimento")} />
          {errors.dataNascimento && <p className="text-red-500 text-sm">{errors.dataNascimento.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Ano Escolar</label>
          <Input type="text" {...register("anoEscolar")} placeholder="Insira Apenas o Número" />
          {errors.anoEscolar && <p className="text-red-500 text-sm">{errors.anoEscolar.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Período</label>
          <select
            {...register("periodo")}
            className="border rounded w-full p-2"
          >
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
          {errors.periodo && <p className="text-red-500 text-sm">{errors.periodo.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Endereço Completo</label>
          <textarea
            {...register("enderecoCompleto")}
            className="border rounded w-full p-2"
            rows={3}
          />
        </div>
        {/* Contatos dos Responsáveis */}
        <div className="border p-4 rounded space-y-3">
          <label className="block font-medium mb-2">Contatos dos Responsáveis</label>
          {fields.map((field, index) => (
            <div key={field.id} className="p-2 border rounded bg-slate-50 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-light">Nome do Contato</label>
                  <Input
                    placeholder="Nome do Contato"
                    {...register(`contatosResponsaveis.${index}.nome`)}
                  />
                   {errors.contatosResponsaveis?.[index]?.nome && <p className="text-red-500 text-sm">{errors.contatosResponsaveis[index].nome.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-light">Telefone</label>
                  <Input
                    placeholder="Telefone"
                    {...register(`contatosResponsaveis.${index}.fone`)}
                    onChange={(e) => {
                      const { value } = e.target;
                      e.target.value = formatarTelefone(value);
                    }}
                  />
                  {errors.contatosResponsaveis?.[index]?.fone && <p className="text-red-500 text-sm">{errors.contatosResponsaveis[index].fone.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-light">E-mail (opcional)</label>
                <Input
                    placeholder="E-mail"
                    type="email"
                    {...register(`contatosResponsaveis.${index}.email`)}
                  />
                {errors.contatosResponsaveis?.[index]?.email && <p className="text-red-500 text-sm">{errors.contatosResponsaveis[index].email.message}</p>}
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remover Contato
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ nome: "", fone: "", email: "" })}
          >
            + Adicionar Contato
          </Button>
        </div>
        {/* Outros Dados */}
        <div>
          <label className="block font-medium">Matrícula</label>
          <Input type="text" {...register("matricula")} />
        </div>
        <div>
          <label className="block font-medium">RA (Registro do Aluno)</label>
          <Input type="text" {...register("ra")} />
        </div>
        <div>
          <label className="block font-medium">CPF (opcional)</label>
          <Input type="text" {...register("cpf")} />
        </div>
        <div>
          <label className="block font-medium">Tags de Atenção (separadas por vírgula) <br/><span className="text-xs text-gray-500">Deixe em branco para um aluno regular</span></label>
          <Input type="text" {...register("tagsAtencao")} placeholder="Ex: Necessita Apoio, Alergia a Dipirona"/>
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-primary text-white hover:bg-primary/90">
            {isSubmitting ? (isEditMode ? "Salvando..." : "Cadastrando...") : (isEditMode ? "Salvar Alterações" : "Cadastrar Aluno")}
          </Button>
        </div>
      </form>
    </div>
  );
} 