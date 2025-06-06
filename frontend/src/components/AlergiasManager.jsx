import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, X, AlertTriangle, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AlergiasManager({ alergias = [], onChange }) {
  const { user } = useAuth();
  const [novaAlergia, setNovaAlergia] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [valorEdicao, setValorEdicao] = useState('');

  const podeEditar = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const handleAdicionarAlergia = () => {
    if (!novaAlergia.trim()) return;
    
    onChange([...alergias, novaAlergia.trim()]);
    setNovaAlergia('');
    setMostrarFormulario(false);
  };

  const handleRemoverAlergia = (index) => {
    if (window.confirm('Tem certeza que deseja remover esta alergia?')) {
      const novasAlergias = alergias.filter((_, i) => i !== index);
      onChange(novasAlergias);
    }
  };

  const handleIniciarEdicao = (index, alergia) => {
    setEditandoIndex(index);
    setValorEdicao(alergia);
  };

  const handleSalvarEdicao = (index) => {
    if (!valorEdicao.trim()) return;
    
    const novasAlergias = [...alergias];
    novasAlergias[index] = valorEdicao.trim();
    onChange(novasAlergias);
    setEditandoIndex(null);
    setValorEdicao('');
  };

  const handleCancelarEdicao = () => {
    setEditandoIndex(null);
    setValorEdicao('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdicionarAlergia();
    }
  };

  const handleKeyPressEdicao = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSalvarEdicao(index);
    } else if (e.key === 'Escape') {
      handleCancelarEdicao();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Alergias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de alergias existentes */}
        {alergias.length > 0 ? (
          <div className="space-y-2">
            {alergias.map((alergia, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  {editandoIndex === index ? (
                    <Input
                      value={valorEdicao}
                      onChange={(e) => setValorEdicao(e.target.value)}
                      onKeyDown={(e) => handleKeyPressEdicao(e, index)}
                      className="text-red-800 font-medium bg-white border-red-300 focus:border-red-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-red-800 font-medium">{alergia}</span>
                  )}
                </div>
                
                {podeEditar && (
                  <div className="flex gap-2 ml-2">
                    {editandoIndex === index ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSalvarEdicao(index)}
                          className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                          disabled={!valorEdicao.trim()}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelarEdicao}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleIniciarEdicao(index, alergia)}
                          className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {user?.role === 'ADMIN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoverAlergia(index)}
                            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Nenhuma alergia cadastrada
          </div>
        )}

        {/* Botão para adicionar nova alergia */}
        {podeEditar && !mostrarFormulario && editandoIndex === null && (
          <Button
            onClick={() => setMostrarFormulario(true)}
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Alergia
          </Button>
        )}

        {/* Formulário para nova alergia */}
        {mostrarFormulario && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nova Alergia</label>
                <Input
                  value={novaAlergia}
                  onChange={(e) => setNovaAlergia(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: Amendoim, Leite, Poeira..."
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdicionarAlergia} disabled={!novaAlergia.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNovaAlergia('');
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 