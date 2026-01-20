import nodemailer from 'nodemailer';

// Configuration du transporteur SMTP Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@langprogress.com';
const FROM_NAME = 'LangProgress';
const LINKEDIN_URL = process.env.LINKEDIN_URL || 'https://www.linkedin.com/in/votre-profil';

// Template de base pour les emails
const getEmailTemplate = (content: string, ctaText?: string, ctaUrl?: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LangProgress</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">LangProgress</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Plateforme e-learning automatisée</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
              
              ${ctaText && ctaUrl ? `
              <table role="presentation" style="width: 100%; margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0077B5 0%, #00A0DC 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6c757d; font-size: 14px;">
                © ${new Date().getFullYear()} LangProgress. Tous droits réservés.
              </p>
              <p style="margin: 10px 0 0; color: #6c757d; font-size: 12px;">
                Ceci est un email automatique, merci de ne pas y répondre directement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Email de bienvenue lors de l'inscription
export async function sendWelcomeEmail(email: string, username?: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  
  if (!smtpUser || !smtpPass) {
    console.log('[EMAIL] SMTP non configure - Email de bienvenue simule pour:', email);
    return { success: true, simulated: true };
  }

  const displayName = username || 'cher utilisateur';
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Bienvenue sur LangProgress !</h2>
    
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Bonjour ${displayName},
    </p>
    
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Nous sommes ravis de vous accueillir sur <strong>LangProgress</strong>, votre nouvelle plateforme e-learning automatisée !
    </p>
    
    <div style="background-color: #f0f7ff; border-left: 4px solid #0077B5; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #333; font-size: 14px;">
        <strong>Ce qui vous attend :</strong>
      </p>
      <ul style="margin: 10px 0 0; padding-left: 20px; color: #555;">
        <li>Un tableau de bord automatisé pour suivre votre progression</li>
        <li>Des leçons et quiz automatisés</li>
        <li>Envoi de devoirs automatique une fois toutes les leçons et le quiz du chapitre complétés</li>
        <li>Et bien plus encore !</li>
      </ul>
    </div>
    
    <p style="margin: 20px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
      Connectez-vous maintenant pour commencer votre apprentissage !
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Bienvenue sur LangProgress !',
      html: getEmailTemplate(content, 'Commencer maintenant', process.env.APP_URL || 'https://langprogress-s.vercel.app'),
    });

    console.log('[EMAIL] Email de bienvenue envoye a:', email);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email bienvenue:', error);
    return { success: false, error };
  }
}

// Email de reinitialisation de mot de passe
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  
  if (!smtpUser || !smtpPass) {
    console.log('[EMAIL] SMTP non configure - Email reset simule pour:', email);
    return { success: true, simulated: true };
  }

  const resetUrl = `${process.env.APP_URL || 'https://langprogress-s.vercel.app'}/reset-password?token=${resetToken}`;
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Réinitialisation de mot de passe</h2>
    
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Vous avez demandé la réinitialisation de votre mot de passe LangProgress.
    </p>
    
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
    </p>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>Ce lien expire dans 1 heure.</strong> Si vous n'avez pas fait cette demande, ignorez cet email.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe LangProgress',
      html: getEmailTemplate(content, 'Réinitialiser mon mot de passe', resetUrl),
    });

    console.log('[EMAIL] Email reset envoye a:', email);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email reset:', error);
    return { success: false, error };
  }
}

// Email de confirmation de paiement
export async function sendPaymentConfirmationEmail(email: string, planName: string, amount: number) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  
  if (!smtpUser || !smtpPass) {
    console.log('[EMAIL] SMTP non configure - Email paiement simule pour:', email);
    return { success: true, simulated: true };
  }

  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Confirmation de paiement</h2>
    
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Merci pour votre confiance ! Votre paiement a été traité avec succès.
    </p>
    
    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #155724; font-size: 16px;">
        <strong>Détails de votre achat :</strong>
      </p>
      <p style="margin: 10px 0 0; color: #155724; font-size: 14px;">
        Plan : <strong>${planName}</strong><br>
        Montant : <strong>${amount.toFixed(2)} EUR</strong>
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
      Vous pouvez maintenant accéder à l'intégralité de votre contenu !
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Confirmation de paiement - LangProgress',
      html: getEmailTemplate(content, 'Accéder à mon compte', process.env.APP_URL || 'https://langprogress-s.vercel.app'),
    });

    console.log('[EMAIL] Email paiement envoye a:', email);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email paiement:', error);
    return { success: false, error };
  }
}

// Email de notification de nouveau devoir
export async function sendHomeworkNotificationEmail(email: string, homeworkTitle: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  
  if (!smtpUser || !smtpPass) {
    console.log('[EMAIL] SMTP non configure - Email devoir simule pour:', email);
    return { success: true, simulated: true };
  }

  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Nouveau devoir disponible</h2>
    
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Un nouveau devoir vient d'être publié sur LangProgress !
    </p>
    
    <div style="background-color: #e7f3ff; border-left: 4px solid #0077B5; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #004085; font-size: 16px;">
        <strong>${homeworkTitle}</strong>
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
      Connectez-vous pour découvrir ce nouveau contenu et continuer votre progression !
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Nouveau devoir : ${homeworkTitle} - LangProgress`,
      html: getEmailTemplate(content, 'Voir le devoir', `${process.env.APP_URL || 'https://langprogress-s.vercel.app'}/homework`),
    });

    console.log('[EMAIL] Email devoir envoye a:', email);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email devoir:', error);
    return { success: false, error };
  }
}

// Email de notification admin (nouveau utilisateur, paiement, etc.)
export async function sendAdminNotificationEmail(subject: string, message: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || smtpUser;
  
  if (!smtpUser || !smtpPass || !adminEmail) {
    console.log('[EMAIL] SMTP non configure - Email admin simule');
    return { success: true, simulated: true };
  }

  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Notification Admin</h2>
    
    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
        ${message}
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #6c757d; font-size: 14px;">
      Date : ${new Date().toLocaleString('fr-FR')}
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `[Admin] ${subject}`,
      html: getEmailTemplate(content),
    });

    console.log('[EMAIL] Email admin envoye');
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email admin:', error);
    return { success: false, error };
  }
}

// Email de contact (depuis le formulaire de contact)
export async function sendContactEmail(name: string, email: string, message: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || smtpUser;
  
  if (!smtpUser || !smtpPass || !adminEmail) {
    console.log('[EMAIL] SMTP non configure - Email contact simule');
    return { success: true, simulated: true };
  }

  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Nouveau message de contact</h2>
    
    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0 0 10px; color: #333; font-size: 14px;">
        <strong>De :</strong> ${name} (${email})
      </p>
      <hr style="border: none; border-top: 1px solid #dee2e6; margin: 15px 0;">
      <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
        ${message}
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: adminEmail,
      replyTo: email,
      subject: `[Contact] Message de ${name}`,
      html: getEmailTemplate(content),
    });

    console.log('[EMAIL] Email contact envoye de:', email);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email contact:', error);
    return { success: false, error };
  }
}

// Test de configuration email
export async function testEmailConfiguration() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  
  if (!smtpUser || !smtpPass) {
    return { 
      configured: false, 
      message: 'SMTP non configure (SMTP_USER ou SMTP_PASSWORD/GMAIL_APP_PASSWORD manquant)' 
    };
  }

  try {
    await transporter.verify();
    return { configured: true, message: 'Configuration SMTP valide' };
  } catch (error) {
    return { 
      configured: false, 
      message: `Erreur de configuration SMTP: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    };
  }
}

// Email de notification nouveau visiteur
export async function sendNewVisitorEmail(visitorData: {
  ipAddress?: string;
  userAgent?: string | null;
  source?: string | null;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  region?: string | null;
  timezone?: string | null;
  deviceType?: string | null;
  deviceBrand?: string | null;
  deviceModel?: string | null;
  osName?: string | null;
  osVersion?: string | null;
  browserName?: string | null;
  browserVersion?: string | null;
  isp?: string | null;
  visitedAtFrance?: string | null;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || smtpUser;
  
  if (!smtpUser || !smtpPass || !adminEmail) {
    console.log('[EMAIL] SMTP non configure - Email visiteur simule');
    return { success: true, simulated: true };
  }

  const sourceLabel = visitorData.source === 'demo' ? 'Connexion rapide' : (visitorData.source || 'Visiteur');
  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">${sourceLabel} - Détails de localisation</h2>
    
    <div style="background-color: #e7f3ff; border-left: 4px solid #0077B5; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>IP :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.ipAddress || 'Inconnue'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Pays :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.country || 'Inconnu'} (${visitorData.countryCode || '-'})</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Région :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.region || 'Inconnue'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Ville :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.city || 'Inconnue'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Fuseau horaire :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.timezone || 'Inconnu'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>FAI :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.isp || 'Inconnu'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Appareil :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.deviceType || 'Inconnu'} - ${visitorData.deviceBrand || 'Inconnue'} ${visitorData.deviceModel || ''}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>OS :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.osName || 'Inconnu'} ${visitorData.osVersion || ''}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Navigateur :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.browserName || 'Inconnu'} ${visitorData.browserVersion || ''}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Source :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.source || 'Direct'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Date (France) :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${visitorData.visitedAtFrance || new Date().toLocaleString('fr-FR')}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>User-Agent :</strong></td><td style="padding: 8px 0; color: #333; font-size: 12px;">${visitorData.userAgent || 'Inconnu'}</td></tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `[${sourceLabel}] ${visitorData.country || 'Inconnu'} - ${visitorData.city || 'Inconnue'}`,
      html: getEmailTemplate(content),
    });

    console.log('[EMAIL] Email visiteur envoye');
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email visiteur:', error);
    return { success: false, error };
  }
}

// Email de notification d'inscription (pour admin)
export async function sendNewRegistrationEmail(userData: {
  email: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string | null;
  selectedModule?: string | null;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  region?: string | null;
  timezone?: string | null;
  deviceType?: string | null;
  deviceBrand?: string | null;
  deviceModel?: string | null;
  osName?: string | null;
  osVersion?: string | null;
  browserName?: string | null;
  browserVersion?: string | null;
  isp?: string | null;
  registeredAtFrance?: string | null;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || smtpUser;
  
  if (!smtpUser || !smtpPass || !adminEmail) {
    console.log('[EMAIL] SMTP non configure - Email inscription simule');
    return { success: true, simulated: true };
  }

  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Nouvelle inscription - Localisation complète</h2>
    
    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px; color: #155724; font-size: 16px;">
        <strong>Détails de l'inscription :</strong>
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Email :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.email}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Nom d'utilisateur :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.username || 'Non renseigné'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Module :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.selectedModule || 'Non renseigné'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>IP :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.ipAddress || 'Inconnue'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Pays :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.country || 'Inconnu'} (${userData.countryCode || '-'})</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Région :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.region || 'Inconnue'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Ville :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.city || 'Inconnue'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Fuseau horaire :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.timezone || 'Inconnu'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>FAI :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.isp || 'Inconnu'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Appareil :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.deviceType || 'Inconnu'} - ${userData.deviceBrand || 'Inconnue'} ${userData.deviceModel || ''}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>OS :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.osName || 'Inconnu'} ${userData.osVersion || ''}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Navigateur :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.browserName || 'Inconnu'} ${userData.browserVersion || ''}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Date (France) :</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px;">${userData.registeredAtFrance || new Date().toLocaleString('fr-FR')}</td></tr>
        <tr><td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>User-Agent :</strong></td><td style="padding: 8px 0; color: #333; font-size: 12px;">${userData.userAgent || 'Inconnu'}</td></tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `[Inscription] Nouvel utilisateur : ${userData.email}`,
      html: getEmailTemplate(content),
    });

    console.log('[EMAIL] Email inscription admin envoye');
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email inscription:', error);
    return { success: false, error };
  }
}

// Email de notification de devoir de chapitre termine
export async function sendChapterHomeworkEmail(email: string, chapterNumber: number, homeworkTitle: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  
  if (!smtpUser || !smtpPass) {
    console.log('[EMAIL] SMTP non configure - Email devoir chapitre simule pour:', email);
    return { success: true, simulated: true };
  }

  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Félicitations ! Chapitre ${chapterNumber} terminé</h2>
    
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Vous avez terminé le chapitre ${chapterNumber} avec succès ! Un nouveau devoir est disponible.
    </p>
    
    <div style="background-color: #e7f3ff; border-left: 4px solid #0077B5; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #004085; font-size: 16px;">
        <strong>${homeworkTitle}</strong>
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
      Rendez-vous sur votre espace devoirs pour le consulter et le soumettre.
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Chapitre ${chapterNumber} terminé - Nouveau devoir disponible`,
      html: getEmailTemplate(content, 'Voir mes devoirs', `${process.env.APP_URL || 'https://langprogress-s.vercel.app'}/homework`),
    });

    console.log('[EMAIL] Email devoir chapitre envoye a:', email);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email devoir chapitre:', error);
    return { success: false, error };
  }
}

// Email de contact support
export async function sendSupportEmail(fromEmail: string, message: string, username?: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  const to = process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'admin@sandbox.com';

  const content = `
    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Nouveau message au support</h2>
    <p style="margin: 0 0 8px; color: #555; font-size: 16px;">De: <strong>${username || ''}</strong> (${fromEmail || 'inconnu'})</p>
    <div style="background-color: #f8f9fa; border-left: 4px solid #6c757d; padding: 15px; margin: 12px 0; border-radius: 4px;">
      <pre style="white-space: pre-wrap; font-family: inherit; color: #333;">${(message || '').slice(0, 5000)}</pre>
    </div>
  `;

  if (!smtpUser || !smtpPass) {
    console.log('[EMAIL] SMTP non configuré - Message support simulé from:', fromEmail);
    console.log('[EMAIL] Destinataire:', to);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: 'Support - Nouveau message utilisateur',
      html: getEmailTemplate(content),
    });
    console.log('[EMAIL] Email support envoyé à:', to);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi email support:', error);
    return { success: false, error };
  }
}
