import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Edit2, Trash2, Save, X, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ContatosEmergenciaManager({ contatos = [], onChange }) {
  const { user } = useAuth();
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [novoContato, setNovoContato] = useState({
    nome: '',
    telefone: '',
    relacao: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const podeEditar = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const handleAdicionarContato = () => {
    if (!novoContato.nome.trim() || !novoContato.telefone.trim()) return;
    
    onChange([...contatos, novoContato]);
    setNovoContato({
      nome: '',
      telefone: '',
      relacao: ''
    });
    setMostrarFormulario(false);
  };

  const handleEditarContato = (index, contatoEditado) => {
    const novosContatos = [...contatos];
    novosContatos[index] = contatoEditado;
    onChange(novosContatos);
    setEditandoIndex(null);
  };

  const handleRemoverContato = (index) => {
    if (window.confirm('Tem certeza que deseja remover este contato de emergência?')) {
      const novosContatos = contatos.filter((_, i) => i !== index);
      onChange(novosContatos);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contatos de Emergência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de contatos existentes */}
        {contatos.length > 0 ? (
          <div className="space-y-3">
            {contatos.map((contato, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                {editandoIndex === index ? (
                  <ContatoForm
                    contato={contato}
                    onSave={(contatoEditado) => handleEditarContato(index, contatoEditado)}
                    onCancel={() => setEditandoIndex(null)}
                  />
                ) : (
                  <ContatoDisplay
                    contato={contato}
                    onEdit={() => podeEditar && setEditandoIndex(index)}
                    onRemove={() => handleRemoverContato(index)}
                    podeEditar={podeEditar}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Nenhum contato de emergência cadastrado
          </div>
        )}

        {/* Botão para adicionar novo contato */}
        {podeEditar && !mostrarFormulario && (
          <Button
            onClick={() => setMostrarFormulario(true)}
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Contato de Emergência
          </Button>
        )}

        {/* Formulário para novo contato */}
        {mostrarFormulario && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <ContatoForm
              contato={novoContato}
              onSave={handleAdicionarContato}
              onCancel={() => {
                setMostrarFormulario(false);
                setNovoContato({
                  nome: '',
                  telefone: '',
                  relacao: ''
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

// Componente para exibir um contato
function ContatoDisplay({ contato, onEdit, onRemove, podeEditar }) {
  const { user } = useAuth();
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{contato.nome}</h4>
          <div className="text-sm text-gray-600 mt-1 space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{contato.telefone}</span>
            </div>
            {contato.relacao && (
              <div>Relação: {contato.relacao}</div>
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
    </div>
  );
}

// Componente para formulário de contato
function ContatoForm({ contato, onSave, onCancel, isNew = false }) {
  const [formData, setFormData] = useState({
    nome: contato.nome || '',
    telefone: contato.telefone || '',
    relacao: contato.relacao || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.telefone.trim()) return;
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Nome completo do contato"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone *</label>
          <Input
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            placeholder="(11) 99999-9999"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Relação</label>
        <Input
          value={formData.relacao}
          onChange={(e) => setFormData({ ...formData, relacao: e.target.value })}
          placeholder="Ex: Mãe, Pai, Avó, Tio..."
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