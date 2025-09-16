import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";

// Cole sua VAPID Key pública abaixo (Cloud Messaging > Certificados push da Web)
const VAPID_KEY = "BI61lS7GZsKoOLXu33vneOx4KQ3BndGxzNGV7g9vfCZhmLoVXHAucE4HrfVy7OnQVhDB_aQfWjS-h-rHijyBhRw"; // VAPID Key pública do Firebase

export async function solicitarTokenFCM(userId: number) {
  try {
    console.log('Chamando solicitarTokenFCM para userId:', userId);
    if (!messaging) {
      console.error('Firebase messaging não está configurado.');
      return;
    }
    // Sempre tenta pedir permissão, mesmo se estiver bloqueada
    let permission = Notification.permission;
    if (permission !== 'granted') {
      try {
        permission = await Notification.requestPermission();
      } catch (e) {
        console.warn('Erro ao solicitar permissão de notificação:', e);
      }
    }
    if (permission !== 'granted') {
  alert('Para receber atualizações do seu pedido, promoções e avisos importantes, é necessário ativar as notificações do site nas configurações do navegador. Assim, você será avisado em tempo real sobre o status do seu pedido e novidades da Paivas Burguers!');
      return;
    }
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      console.log('FCM token gerado:', token);
      await fetch(`http://localhost:8000/clientes/${userId}/fcm_token`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcm_token: token }),
      });
      console.log('Token FCM enviado para o backend com sucesso.');
    } else {
      console.warn('FCM token não foi gerado. Verifique permissões de notificação no navegador.');
    }
  } catch (err) {
    console.error('Erro ao obter token FCM:', err);
  }
}
