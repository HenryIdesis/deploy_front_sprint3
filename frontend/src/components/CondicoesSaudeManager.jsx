import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Plus, Edit2, Trash2, Save, X, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CondicoesSaudeManager({ condicoes = [], onChange }) {
  const { user } = useAuth();
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [novaCondicao, setNovaCondicao] = useState({
    nome: '',
    status: 'Ativo',
    descricao: '',
    dataDiagnostico: '',
    profissionalSaude: '',
    crm: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const podeEditar = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const handleAdicionarCondicao = (dadosFormulario) => {
    if (!dadosFormulario.nome.trim()) return;
    
    const condicaoParaAdicionar = {
      ...dadosFormulario,
      dataDiagnostico: dadosFormulario.dataDiagnostico ? new Date(dadosFormulario.dataDiagnostico).toISOString() : null
    };
    
    onChange([...condicoes, condicaoParaAdicionar]);
    setNovaCondicao({
      nome: '',
      status: 'Ativo',
      descricao: '',
      dataDiagnostico: '',
      profissionalSaude: '',
      crm: ''
    });
    setMostrarFormulario(false);
  };

  const handleEditarCondicao = (index, condicaoEditada) => {
    const novasCondicoes = [...condicoes];
    novasCondicoes[index] = {
      ...condicaoEditada,
      dataDiagnostico: condicaoEditada.dataDiagnostico ? new Date(condicaoEditada.dataDiagnostico).toISOString() : null
    };
    onChange(novasCondicoes);
    setEditandoIndex(null);
  };

  const handleRemoverCondicao = (index) => {
    if (window.confirm('Tem certeza que deseja remover esta condição de saúde?')) {
      const novasCondicoes = condicoes.filter((_, i) => i !== index);
      onChange(novasCondicoes);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    try {
      return new Date(dataString).toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  const formatarDataParaInput = (dataString) => {
    if (!dataString) return '';
    try {
      return new Date(dataString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Condições de Saúde
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de condições existentes */}
        {condicoes.length > 0 ? (
          <div className="space-y-3">
            {condicoes.map((condicao, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                {editandoIndex === index ? (
                  <CondicaoForm
                    condicao={condicao}
                    onSave={(condicaoEditada) => handleEditarCondicao(index, condicaoEditada)}
                    onCancel={() => setEditandoIndex(null)}
                  />
                ) : (
                  <CondicaoDisplay
                    condicao={condicao}
                    onEdit={() => podeEditar && setEditandoIndex(index)}
                    onRemove={() => handleRemoverCondicao(index)}
                    podeEditar={podeEditar}
                    formatarData={formatarData}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Nenhuma condição de saúde cadastrada
          </div>
        )}

        {/* Botão para adicionar nova condição */}
        {podeEditar && !mostrarFormulario && (
          <Button
            onClick={() => setMostrarFormulario(true)}
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Condição de Saúde
          </Button>
        )}

        {/* Formulário para nova condição */}
        {mostrarFormulario && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <CondicaoForm
              condicao={novaCondicao}
              onSave={handleAdicionarCondicao}
              onCancel={() => {
                setMostrarFormulario(false);
                setNovaCondicao({
                  nome: '',
                  status: 'Ativo',
                  descricao: '',
                  dataDiagnostico: '',
                  profissionalSaude: '',
                  crm: ''
                });
              }}
              isNew={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para exibir uma condição
function CondicaoDisplay({ condicao, onEdit, onRemove, podeEditar, formatarData }) {
  const { user } = useAuth();
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{condicao.nome}</h4>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs ${
              condicao.status === 'Ativo' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {condicao.status}
            </span>
            {condicao.dataDiagnostico && (
              <span>Diagnóstico: {formatarData(condicao.dataDiagnostico)}</span>
            )}
          </div>
        </div>
        {podeEditar && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            {user?.role === 'ADMIN' && (
              <Button size="sm" variant="outline" onClick={onRemove} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {condicao.descricao && (
        <p className="text-gray-700 text-sm">{condicao.descricao}</p>
      )}
      
      {(condicao.profissionalSaude || condicao.crm) && (
        <div className="text-sm text-gray-600">
          {condicao.profissionalSaude && (
            <span>Profissional: {condicao.profissionalSaude}</span>
          )}
          {condicao.crm && (
            <span className="ml-4">CRM: {condicao.crm}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Componente para formulário de condição
function CondicaoForm({ condicao, onSave, onCancel, isNew = false }) {
  const [formData, setFormData] = useState({
    nome: condicao.nome || '',
    status: condicao.status || 'Ativo',
    descricao: condicao.descricao || '',
    dataDiagnostico: condicao.dataDiagnostico ? new Date(condicao.dataDiagnostico).toISOString().split('T')[0] : '',
    profissionalSaude: condicao.profissionalSaude || '',
    crm: condicao.crm || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome da Condição *</label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Diabetes, Hipertensão..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="Ativo">Ativo</option>
            <option value="Controlado">Controlado</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Detalhes sobre a condição..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data do Diagnóstico</label>
          <Input
            type="date"
            value={formData.dataDiagnostico}
            onChange={(e) => setFormData({ ...formData, dataDiagnostico: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Profissional de Saúde</label>
          <Input
            value={formData.profissionalSaude}
            onChange={(e) => setFormData({ ...formData, profissionalSaude: e.target.value })}
            placeholder="Nome do médico/profissional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CRM</label>
          <Input
            value={formData.crm}
            onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
            placeholder="CRM do profissional"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm">
          <Save className="w-4 h-4 mr-2" />
          {isNew ? 'Adicionar' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
} 