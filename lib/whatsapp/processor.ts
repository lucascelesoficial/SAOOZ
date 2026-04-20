/**
 * lib/whatsapp/processor.ts
 * Usa Gemini para interpretar mensagens e extrair lançamentos financeiros.
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY!

export type WhatsAppAction =
  | { type: 'add_expense'; category: string; amount: number; description: string }
  | { type: 'add_income';  incomeType: string; name: string; amount: number }
  | { type: 'unknown' }

const PROMPT = `
Você é o assistente financeiro do SAOOZ via WhatsApp.
Analise a mensagem e retorne SOMENTE um JSON válido, sem markdown.

CATEGORIAS DE DESPESA:
moradia, alimentacao, transporte, saude, educacao, lazer, assinaturas, vestuario, beleza, pets, dividas, investimentos, familia, religiao, variaveis, outros

TIPOS DE RECEITA:
salario, freela, negocio, aluguel, investimento, pensao, outro

REGRAS:
- Gasto/despesa → {"type":"add_expense","category":"...","amount":0.00,"description":"..."}
- Receita/entrada → {"type":"add_income","incomeType":"...","name":"...","amount":0.00}
- Não entendeu → {"type":"unknown"}

Exemplos:
"gastei 50 no mercado" → {"type":"add_expense","category":"alimentacao","amount":50,"description":"Mercado"}
"paguei 1200 de aluguel" → {"type":"add_expense","category":"moradia","amount":1200,"description":"Aluguel"}
"recebi 3000 de salário" → {"type":"add_income","incomeType":"salario","name":"Salário","amount":3000}
"freela de 800" → {"type":"add_income","incomeType":"freela","name":"Freela","amount":800}
`.trim()

export async function processMessage(text: string): Promise<WhatsAppAction> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${PROMPT}\n\nMensagem: ${text}` }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 150 },
        }),
      }
    )
    const data = await res.json()
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return JSON.parse(raw.replace(/```json|```/g, '').trim()) as WhatsAppAction
  } catch {
    return { type: 'unknown' }
  }
}
