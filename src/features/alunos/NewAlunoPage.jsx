import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../../api/http";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";

// Schema de validação para novo aluno
const schema = z.object({
  nome: z.string().nonempty("Nome obrigatório"),
  sobrenome: z.string().nonempty("Sobrenome obrigatório"),
  dataNascimento: z.string().nonempty("Data de nascimento obrigatória"),
  anoEscolar: z.string().nonempty("Ano escolar obrigatório"),
  endereco: z.string().optional(),
  contatosResponsaveis: z
    .array(
      z.object({
        nome: z.string().nonempty("Nome do responsável obrigatório"),
        fone: z.string().nonempty("Telefone obrigatório"),
        email: z.string().email("Email inválido").optional(),
      })
    )
    .default([]),
  tagsAtencao: z.string().optional(),
  matricula: z.string().optional(),
  ra: z.string().optional(),
  cpf: z.string().optional(),
});

export default function NewAlunoPage() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { contatosResponsaveis: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "contatosResponsaveis",
  });

  // Envia dados para o backend
  const onSubmit = async (dados) => {
    try {
      // Monta payload compatível com backend
      const payload = {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        dataNascimento: new Date(dados.dataNascimento).toISOString(), // <-- aqui!
        anoEscolar: dados.anoEscolar,
        endereco: dados.endereco || "",
        contatosResponsaveis: dados.contatosResponsaveis,
        tagsAtencao: dados.tagsAtencao ? dados.tagsAtencao.split(",").map((t) => t.trim()) : [],
        matricula: dados.matricula,
        ra: dados.ra,
        cpf: dados.cpf,
      };

      await api.post("/alunos", payload);
      navigate("/alunos");
    } catch (err) {
      console.error("Erro ao criar aluno:", err);
      alert("Erro ao criar aluno: " + JSON.stringify(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="container max-w-4xl py-8 px-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">Cadastrar Novo Aluno</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <Card className="p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <Input 
                  type="text" 
                  {...register("nome")} 
                  className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                  placeholder="Digite o nome"
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                <Input 
                  type="text" 
                  {...register("sobrenome")} 
                  className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                  placeholder="Digite o sobrenome"
                />
                {errors.sobrenome && <p className="text-red-500 text-sm mt-1">{errors.sobrenome.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <Input 
                  type="date" 
                  {...register("dataNascimento")} 
                  className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                />
                {errors.dataNascimento && <p className="text-red-500 text-sm mt-1">{errors.dataNascimento.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano Escolar</label>
                <Input 
                  type="text" 
                  {...register("anoEscolar")} 
                  className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                  placeholder="Ex: 5º ano"
                />
                {errors.anoEscolar && <p className="text-red-500 text-sm mt-1">{errors.anoEscolar.message}</p>}
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
              <textarea
                {...register("endereco")}
                className="w-full min-h-[100px] bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm p-3"
                placeholder="Digite o endereço completo..."
              />
            </div>
          </Card>

          {/* Contatos dos Responsáveis */}
          <Card className="p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Contatos dos Responsáveis</h2>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <Input
                        placeholder="Nome do responsável"
                        {...register(`contatosResponsaveis.${index}.nome`)}
                        className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...register(`contatosResponsaveis.${index}.fone`)}
                        className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                      <Input
                        placeholder="email@exemplo.com"
                        {...register(`contatosResponsaveis.${index}.email`)}
                        className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                      className="text-sm bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Remover Contato
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ nome: "", fone: "", email: "" })}
                className="w-full mt-2 border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                + Adicionar Novo Contato
              </Button>
            </div>
          </Card>

          {/* Documentação */}
          <Card className="p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Documentação</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                <Input 
                  type="text" 
                  {...register("matricula")} 
                  className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                  placeholder="Nº da matrícula"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RA</label>
                <Input 
                  type="text" 
                  {...register("ra")} 
                  className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                  placeholder="Registro do Aluno"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <Input 
                  type="text" 
                  {...register("cpf")} 
                  className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </Card>

          {/* Informações Adicionais */}
          <Card className="p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Informações Adicionais</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags de Atenção</label>
              <Input 
                type="text" 
                {...register("tagsAtencao")} 
                className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                placeholder="Digite as tags separadas por vírgula (ex: alergia, medicação)"
              />
            </div>
          </Card>

          <div className="flex gap-4 justify-end pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/alunos")}
              className="px-6 border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar Aluno"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 