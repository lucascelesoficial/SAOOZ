/**
 * lib/whatsapp/sender.ts
 * Envia mensagens WhatsApp via Infobip REST API.
 */

const API_KEY = process.env.INFOBIP_API_KEY!
const BASE    = process.env.INFOBIP_BASE_URL!
const SENDER  = process.env.INFOBIP_WHATSAPP_SENDER!

export async function sendWhatsApp(to: string, text: string): Promise<void> {
  const res = await fetch(`${BASE}/whatsapp/1/message/text`, {
    method: 'POST',
    headers: {
      Authorization: `App ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: SENDER,
      to,
      content: { text },
    }),
  })

  if (!res.ok) {
    console.error('[Infobip] Falha ao enviar:', await res.text())
  }
}
