import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Plus, Edit2, Trash2, Save, X, Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MedicacoesManager({ medicacoes = [], onChange }) {
  const { user } = useAuth();
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [novaMedicacao, setNovaMedicacao] = useState({
    nome: '',
    dosagem: '',
    frequencia: '',
    observacoes: '',
    autorizadoPor: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const podeEditar = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const handleAdicionarMedicacao = (dadosFormulario) => {
    if (!dadosFormulario.nome.trim()) return;
    
    onChange([...medicacoes, dadosFormulario]);
    setNovaMedicacao({
      nome: '',
      dosagem: '',
      frequencia: '',
      observacoes: '',
      autorizadoPor: ''
    });
    setMostrarFormulario(false);
  };

  const handleEditarMedicacao = (index, medicacaoEditada) => {
    const novasMedicacoes = [...medicacoes];
    novasMedicacoes[index] = medicacaoEditada;
    onChange(novasMedicacoes);
    setEditandoIndex(null);
  };

  const handleRemoverMedicacao = (index) => {
    if (window.confirm('Tem certeza que deseja remover esta medicação?')) {
      const novasMedicacoes = medicacoes.filter((_, i) => i !== index);
      onChange(novasMedicacoes);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Pill className="w-5 h-5" />
          Medicações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de medicações existentes */}
        {medicacoes.length > 0 ? (
          <div className="space-y-3">
            {medicacoes.map((medicacao, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                {editandoIndex === index ? (
                  <MedicacaoForm
                    medicacao={medicacao}
                    onSave={(medicacaoEditada) => handleEditarMedicacao(index, medicacaoEditada)}
                    onCancel={() => setEditandoIndex(null)}
                  />
                ) : (
                  <MedicacaoDisplay
                    medicacao={medicacao}
                    onEdit={() => podeEditar && setEditandoIndex(index)}
                    onRemove={() => handleRemoverMedicacao(index)}
                    podeEditar={podeEditar}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Nenhuma medicação cadastrada
          </div>
        )}

        {/* Botão para adicionar nova medicação */}
        {podeEditar && !mostrarFormulario && (
          <Button
            onClick={() => setMostrarFormulario(true)}
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Medicação
          </Button>
        )}

        {/* Formulário para nova medicação */}
        {mostrarFormulario && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <MedicacaoForm
              medicacao={novaMedicacao}
              onSave={handleAdicionarMedicacao}
              onCancel={() => {
                setMostrarFormulario(false);
                setNovaMedicacao({
                  nome: '',
                  dosagem: '',
                  frequencia: '',
                  observacoes: '',
                  autorizadoPor: ''
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

// Componente para exibir uma medicação
function MedicacaoDisplay({ medicacao, onEdit, onRemove, podeEditar }) {
  const { user } = useAuth();
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{medicacao.nome}</h4>
          <div className="text-sm text-gray-600 mt-1 space-y-1">
            {medicacao.dosagem && (
              <div>Dosagem: {medicacao.dosagem}</div>
            )}
            {medicacao.frequencia && (
              <div>Frequência: {medicacao.frequencia}</div>
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
      
      {medicacao.observacoes && (
        <p className="text-gray-700 text-sm">{medicacao.observacoes}</p>
      )}
      
      {medicacao.autorizadoPor && (
        <div className="text-sm text-gray-600">
          Autorizado por: {medicacao.autorizadoPor}
        </div>
      )}
    </div>
  );
}

// Componente para formulário de medicação
function MedicacaoForm({ medicacao, onSave, onCancel, isNew = false }) {
  const [formData, setFormData] = useState({
    nome: medicacao.nome || '',
    dosagem: medicacao.dosagem || '',
    frequencia: medicacao.frequencia || '',
    observacoes: medicacao.observacoes || '',
    autorizadoPor: medicacao.autorizadoPor || ''
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
          <label className="block text-sm font-medium mb-1">Nome da Medicação *</label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Paracetamol, Dipirona..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dosagem</label>
          <Input
            value={formData.dosagem}
            onChange={(e) => setFormData({ ...formData, dosagem: e.target.value })}
            placeholder="Ex: 500mg, 2 comprimidos..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Frequência</label>
          <Input
            value={formData.frequencia}
            onChange={(e) => setFormData({ ...formData, frequencia: e.target.value })}
            placeholder="Ex: 3x ao dia, A cada 8 horas..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Autorizado por</label>
          <Input
            value={formData.autorizadoPor}
            onChange={(e) => setFormData({ ...formData, autorizadoPor: e.target.value })}
            placeholder="Nome do médico/responsável"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Observações</label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          placeholder="Instruções especiais, efeitos colaterais..."
          rows={3}
        />
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