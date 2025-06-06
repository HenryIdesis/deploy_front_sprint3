import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Comunicado = ({ aluno }) => {
  const [responsavelSelecionado, setResponsavelSelecionado] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [responsavelAtual, setResponsavelAtual] = useState(null);

  useEffect(() => {
    console.log('Dados do aluno recebidos:', aluno);
    console.log('Contatos dos responsáveis:', aluno?.contatosResponsaveis);
    if (responsavelSelecionado) {
      const responsavel = aluno?.contatosResponsaveis?.find(r => r.nome === responsavelSelecionado);
      setResponsavelAtual(responsavel);
    } else {
      setResponsavelAtual(null);
    }
  }, [aluno, responsavelSelecionado]);

  const handleEnviarWhatsapp = () => {
    console.log('Tentando enviar WhatsApp para responsável:', responsavelSelecionado);
    if (responsavelAtual && responsavelAtual.fone) {
      const numeroLimpo = responsavelAtual.fone.replace(/[^0-9]/g, '');
      console.log('Número do WhatsApp:', numeroLimpo);
      const mensagemCodificada = encodeURIComponent(mensagem);
      const url = `https://wa.me/${numeroLimpo}?text=${mensagemCodificada}`;
      console.log('URL do WhatsApp:', url);
      window.open(url, '_blank');
    } else {
      alert('Número de WhatsApp não encontrado para este responsável');
    }
  };

  const handleEnviarEmail = () => {
    console.log('Tentando enviar Email para responsável:', responsavelSelecionado);
    if (responsavelAtual && responsavelAtual.email) {
      const assunto = encodeURIComponent(`Comunicado Escolar - ${aluno.nome} ${aluno.sobrenome}`);
      const corpo = encodeURIComponent(mensagem);
      const url = `mailto:${responsavelAtual.email}?subject=${assunto}&body=${corpo}`;
      console.log('URL do Email:', url);
      window.open(url, '_blank');
    } else {
      alert('Email não encontrado para este responsável');
    }
  };

  if (!aluno || !aluno.contatosResponsaveis) {
    return <div className="p-4 text-red-500">Carregando dados do aluno...</div>;
  }

  const temResponsaveis = aluno.contatosResponsaveis.length > 0;
  const temResponsavelComContato = responsavelAtual && (responsavelAtual.fone || responsavelAtual.email);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Enviar Comunicado</h1>
      
      {!temResponsaveis ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Este aluno não possui responsáveis cadastrados.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o Responsável
            </label>
            <select
              value={responsavelSelecionado}
              onChange={(e) => setResponsavelSelecionado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione um responsável</option>
              {aluno.contatosResponsaveis.map((responsavel) => (
                <option key={responsavel.nome} value={responsavel.nome}>
                  {responsavel.nome} - {responsavel.fone || 'Sem telefone'} {responsavel.email ? `(${responsavel.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          {responsavelAtual && !temResponsavelComContato && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Este responsável não possui telefone ou email cadastrado.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md h-32"
              placeholder="Digite sua mensagem aqui..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleEnviarWhatsapp}
              disabled={!responsavelAtual?.fone || !mensagem}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!responsavelAtual?.fone ? "Este responsável não possui número de telefone cadastrado" : ""}
            >
              <FaWhatsapp /> Enviar por WhatsApp
            </button>

            <button
              onClick={handleEnviarEmail}
              disabled={!responsavelAtual?.email || !mensagem}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!responsavelAtual?.email ? "Este responsável não possui email cadastrado" : ""}
            >
              <FaEnvelope /> Enviar por Email
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Comunicado; 