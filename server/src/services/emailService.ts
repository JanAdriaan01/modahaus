// src/services/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env['RESEND_API_KEY'] || '');
const EMAIL_FROM = process.env['EMAIL_FROM'] || 'onboarding@resend.dev'; // Default from Resend

export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: subject,
      html: html,
      text: text || undefined, // Handle optional text parameter
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected error sending email:', error);
    return { success: false, error: error.message };
  }
};