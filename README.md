[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/TUd5FCV3)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=19665548)


# Sistema de Acompanhamento Escolar – EMEF Gonzaguinha

Este projeto foi criado por alunos do curso de Ciência da Computação como uma proposta real para apoiar a **EMEF Gonzaguinha**, localizada na comunidade de Heliópolis (SP), no acompanhamento mais próximo dos seus alunos.

O objetivo do sistema é facilitar o controle e a visualização de informações importantes de estudantes que precisam de atenção especial por parte da coordenação, professores e demais profissionais da escola. Tudo isso com uma interface simples e acessível, feita sob medida para a realidade da escola pública.

---

## 🔧 Tecnologias Utilizadas

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Flask (Python) + MongoDB Atlas
- **Banco de dados**: MongoDB (na nuvem)
- **Hospedagem recomendada**: Vercel (frontend), Render ou Railway (backend)

---

## 🧩 Como rodar o projeto localmente

### Pré-requisitos

- Node.js instalado (versão 18 ou superior)
- Python 3.10+ instalado
- Conta gratuita no MongoDB Atlas
- Git instalado

---

## 📁 Estrutura do projeto

📦 projeto

├── frontend/
│ └── (código React)

├── backend/
│ └── (código Flask)
├── .env (você cria esse arquivo)


## 🚀 Instruções para rodar

### 1. Clonar o repositório do Backend

git clone https://github.com/insper-classroom/helio25-gonzaguinha-2.git
cd backend
python -m venv venv
source venv/bin/activate  # no Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
O backend estará disponível em: http://127.0.0.1:8000

### 2. Clonar o repositório do Frontend

git clone https://github.com/insper-classroom/helio02-gonzaguinha-2.git
cd frontend
npm install
npm install jwt-decode
npm run dev
O frontend estará disponível em: http://localhost:5174/

👥 Funcionalidades principais
Cadastro de alunos com dados básicos e de atenção

Cadastro de responsáveis (com telefone e e-mail)

Visualização e edição de informações dos alunos

Sistema pensado para facilitar o acompanhamento individual

Integração futura com relatórios e dashboards

🧠 Sobre o projeto
Este sistema foi feito com foco na realidade de uma escola pública. Ele funciona com ferramentas gratuitas e de código aberto, podendo ser mantido com baixo custo. A ideia é que a própria comunidade escolar possa usá-lo e, no futuro, até adaptá-lo para novas necessidades.

🤝 Colaboradores
Este projeto foi desenvolvido por alunos do terceiro semestre da graduação em Ciência da Computação, com foco em impacto social e apoio direto à EMEF Gonzaguinha.

