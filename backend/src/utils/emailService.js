import nodemailer from 'nodemailer';
import { supabase } from '../config/supabaseClient.js';

// Configuração do transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Função para enviar e-mail
export const enviarEmail = async (destinatario, assunto, mensagem) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: assunto,
      text: mensagem
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail enviado com sucesso para: ${destinatario}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar e-mail para ${destinatario}:`, error);
    throw error;
  }
};

// Função para buscar usuários por papel
export const buscarUsuariosPorPapel = async (papel) => {
  try {
    const { data: usuarios, error } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', papel)
      .eq('active', true); // Apenas usuários ativos

    if (error) {
      console.error(`❌ Erro ao buscar usuários com papel ${papel}:`, error);
      return [];
    }

    return usuarios || [];
  } catch (error) {
    console.error(`❌ Erro ao buscar usuários com papel ${papel}:`, error);
    return [];
  }
};

// Função para enviar e-mail para múltiplos destinatários
export const enviarEmailMultiplos = async (destinatarios, assunto, mensagem) => {
  try {
    if (!destinatarios || destinatarios.length === 0) {
      console.log('⚠️ Nenhum destinatário encontrado para envio de e-mail');
      return;
    }

    const emails = destinatarios.map(u => u.email).filter(email => email);
    
    if (emails.length === 0) {
      console.log('⚠️ Nenhum e-mail válido encontrado nos destinatários');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails.join(', '),
      subject: assunto,
      text: mensagem
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail enviado com sucesso para ${emails.length} destinatários:`, emails);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail para múltiplos destinatários:', error);
    throw error;
  }
};

// Função para enviar e-mail para usuários por papel
export const enviarEmailPorPapel = async (papel, assunto, mensagem) => {
  try {
    const usuarios = await buscarUsuariosPorPapel(papel);
    await enviarEmailMultiplos(usuarios, assunto, mensagem);
  } catch (error) {
    console.error(`❌ Erro ao enviar e-mail para usuários com papel ${papel}:`, error);
    throw error;
  }
}; 