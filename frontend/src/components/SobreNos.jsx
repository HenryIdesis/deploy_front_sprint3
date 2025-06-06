import React from 'react';
import nathanImg from '../assets/team/nathan.jpeg';
import henryImg from '../assets/team/henry.jpeg';
import pedroImg from '../assets/team/pedro.jpg';
import matheusImg from '../assets/team/matheus.jpeg';
import kauaImg from '../assets/team/kaua.jpeg';
import enzoImg from '../assets/team/enzo.jpeg';
import brunoImg from '../assets/team/bruno.jpeg';
import insperCD from '../assets/team/insperCD.png';
import unas from '../assets/team/unas.png';
import insperLG from '../assets/team/insperLG.png';

const teamMembers = [
  { name: 'Nathan Benaion', img: nathanImg, linkedin: 'www.linkedin.com/in/nathan-benaion-326358302' },
  { name: 'Kauã Makiyama', img: kauaImg, linkedin: 'www.linkedin.com/in/kau%C3%A3-bernardo-correia-makiyama-166b752ba' },
  { name: 'Matheus Lemos', img: matheusImg, linkedin: 'www.linkedin.com/in/matheus-lemos-546358302' },
  { name: 'Bruno Oberhuber', img: brunoImg, linkedin: 'www.linkedin.com/in/bruno-oberhuber' },
  { name: 'Pedro Mourão', img: pedroImg, linkedin: 'www.linkedin.com/in/pedro-mour%C3%A3o-a81225306' },
  { name: 'Henry Idesis', img: henryImg, linkedin: 'www.linkedin.com/in/henry-idesis-140356302' },
  { name: "Enzo Dell'Oso", img: enzoImg, linkedin: 'www.linkedin.com/in/enzo-dell-oso-7b7359302' }
];

function getLinkedinUrl(url) {
  if (!url) return '#';
  if (url.startsWith('http')) return url;
  return 'https://' + url;
}

export default function SobreNos() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '48px 8vw', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#d13a3a', marginBottom: 40, textAlign: 'center', fontSize: 48, fontWeight: 700, letterSpacing: 1 }}>
        Sobre nós
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginBottom: 32 }}>
        {teamMembers.map((member, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <a
              href={getLinkedinUrl(member.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', cursor: member.linkedin ? 'pointer' : 'default' }}
            >
              <img
                src={member.img}
                alt={member.name}
                style={{ width: 120, height: 120, borderRadius: '50%', background: '#e0f7fa', objectFit: 'cover', border: '4px solid #000', transition: 'box-shadow 0.2s', boxShadow: member.linkedin ? '0 0 0 2px #0077b5' : 'none' }}
              />
            </a>
            <span style={{ marginTop: 14, fontWeight: 600, color: '#444', fontSize: 22, textAlign: 'center', display: 'block', width: '100%' }}>{member.name}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', margin: '40px 0 24px 0', fontSize: 30, color: '#4a4a4a', fontWeight: 500 }}>
        
      </div>
      <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto', color: '#444', fontSize: 26, lineHeight: 1.5 }}>
        Este projeto nasceu de uma parceria da UNAS e o Centro de Estudos das Cidades Arq.Futuro do Insper.<br /><br />
        O projeto foi desenvolvido ao longo do Sprint de Inovação Social do 3º semestre do curso de Ciências da Computação.
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 64, marginTop: 64 }}>
        <img src={insperCD} alt="Insper" style={{ height: 80 }} />
        <img src={unas} alt="UNAS" style={{ height: 80, background: '#fff', padding: 6, borderRadius: 10 }} />
        <img src={insperLG} alt="Insper" style={{ height: 80 }} />
      </div>
    </div>
  );
} 