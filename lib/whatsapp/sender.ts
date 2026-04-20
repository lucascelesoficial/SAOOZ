/**
 * lib/whatsapp/sender.ts
 * Envia mensagens de WhatsApp via Twilio REST API (sem SDK extra).
 */

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN!
const FROM        = process.env.TWILIO_WHATSAPP_FROM! // whatsapp:+18777804236

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  // `to` já vem no formato "whatsapp:+5511999999999" do webhook do Twilio
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: FROM, To: to, Body: body }).toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[WhatsApp] Falha ao enviar:', err)
  }
}
