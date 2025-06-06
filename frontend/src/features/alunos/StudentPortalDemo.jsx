import { useState } from "react";
import StudentNavigation from "../../components/StudentNavigation";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { User, Edit, Phone, Mail, FileText, Calendar, Heart, MessageCircle, Clock } from "lucide-react";

export default function StudentPortalDemo() {
  const [activeTab, setActiveTab] = useState("dados-gerais");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dados-gerais" (
          <div className="grid grid-cols-1 lg-cols-2 gap-6">
            {/* Informações Acadêmicas */}
            <Card className="border-secondary">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg text-primary-dark">Informações Acadêmicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Matrícula:</span>
                  <Badge className="bg-blue-100 text-primary">648392-01</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">RA:</span>
                  <Badge className="bg-green-100 text-green-800">G256-84773L</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ano Escolar:</span>
                  <Badge className="bg-purple-100 text-purple-800">6° Ano</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Dados Pessoais */}
            <Card className="border-secondary">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg text-primary-dark">Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data de Nascimento:</span>
                  <span className="font-medium">01/02/2014 (11 anos)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CPF:</span>
                  <span className="font-medium">475.167.127-90</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "boletins" (
          <Card className="border-secondary">
            <CardHeader>
              <CardTitle className="text-primary-dark flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Boletins Escolares - 2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Conteúdo dos boletins virá aqui…</p>
            </CardContent>
          </Card>
        );
      case "frequencia" (
          <Card className="border-secondary">
            <CardHeader>
              <CardTitle className="text-primary-dark flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Frequência Escolar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Detalhes de frequência…</p>
            </CardContent>
          </Card>
        );
      case "saude" (
          <Card className="border-secondary">
            <CardHeader>
              <CardTitle className="text-primary-dark flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Saúde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Registros de saúde…</p>
            </CardContent>
          </Card>
        );
      case "atendimentos" (
          <Card className="border-secondary">
            <CardHeader>
              <CardTitle className="text-primary-dark flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Atendimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Histórico de atendimentos…</p>
            </CardContent>
          </Card>
        );
      case "contraturno" (
          <Card className="border-secondary">
            <CardHeader>
              <CardTitle className="text-primary-dark flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Contraturno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Projetos de contraturno…</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Robson Cebola</h1>
              <p className="text-white/80">6° Ano</p>
            </div>
          </div>
          <Button className="bg-white/20 hover-white/30 text-white flex items-center gap-2">
            <Edit className="w-4 h-4" /> Editar
          </Button>
        </div>
      </div>

      {/* Navegação */}
      <StudentNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">{renderTabContent()}</div>

      {/* Contatos */}
      <div className="max-w-6xl mx-auto p-6 pt-0">
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle className="text-primary-dark">Contatos dos Responsáveis</CardTitle>
          </CardHeader>
          <CardContent className="grid md-cols-2 gap-4">
            {[{ nome: "Roberto Cebola", fone: "(11)98765-5747", email: "roberto.cebola@gmail.com" }, { nome: "Cleide Cebola", fone: "(11)98577-4544", email: "cleidinhacbl@gmail.com" }].map((c) => (
              <div key={c.nome} className="bg-secondary p-4 rounded">
                <h4 className="font-semibold text-primary-dark mb-2">{c.nome}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-700"><Phone className="w-4 h-4" />{c.fone}</div>
                <div className="flex items-center gap-2 text-sm text-gray-700"><Mail className="w-4 h-4" />{c.email}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 