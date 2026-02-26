import axios from "axios";

const FONNTE_API_URL = "https://api.fonnte.com/send";

interface WhatsAppMessage {
  to: string;
  message: string;
}

export const sendWhatsAppMessage = async ({ to, message }: WhatsAppMessage) => {
  const token = process.env.FONNTE_TOKEN;

  if (!token) {
    console.warn("Warning: FONNTE_TOKEN is not set. Skipping message send.");
    console.log(`[MOCK FONNTE] To: ${to}, Message: ${message}`);
    return;
  }

  // Fonnte expects 'target' (comma separated for multiple), and 'message'
  // It handles formatting, but good to ensure 'to' is clean digits.
  // Fonnte usually handles 08xxx or 62xxx fine.

  try {
    const formData = new FormData();
    formData.append("target", to);
    formData.append("message", message);

    // Optional: Add more options if needed (delay, schedule, etc.)

    const response = await axios.post(FONNTE_API_URL, formData, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error sending WhatsApp message via Fonnte:",
      error.response?.data || error.message,
    );
    // Don't crash the app if notification fails
    return null;
  }
};
