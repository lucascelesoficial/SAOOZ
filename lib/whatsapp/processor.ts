/**
 * lib/whatsapp/processor.ts
 * Usa Gemini para interpretar mensagens de WhatsApp e extrair
 * lançamentos financeiros (despesa / receita / consulta).
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY!

export type WhatsAppAction =
  | { type: 'add_expense'; category: string; amount: number; description: string }
  | { type: 'add_income';  incomeType: string; name: string; amount: number; description: string }
  | { type: 'query';       question: string }
  | { type: 'unknown' }

const SYSTEM_PROMPT = `
Você é o assistente financeiro do SAOOZ via WhatsApp.
Analise a mensagem do usuário e retorne SOMENTE um JSON válido, sem markdown, sem explicação.

CATEGORIAS DE DESPESA VÁLIDAS:
moradia, alimentacao, transporte, saude, educacao, lazer, assinaturas, vestuario, beleza, pets, dividas, investimentos, familia, religiao, variaveis, outros

TIPOS DE RECEITA VÁLIDOS:
salario, freela, negocio, aluguel, investimento, pensao, outro

REGRAS:
- Se a mensagem registra um gasto/despesa → {"type":"add_expense","category":"categoria","amount":123.45,"description":"descrição curta"}
- Se a mensagem registra uma receita/entrada → {"type":"add_income","incomeType":"tipo","name":"nome da fonte","amount":123.45,"description":"descrição curta"}
- Se é uma pergunta sobre finanças → {"type":"query","question":"pergunta resumida"}
- Se não entendeu → {"type":"unknown"}

Exemplos:
"gastei 50 no mercado" → {"type":"add_expense","category":"alimentacao","amount":50,"description":"Mercado"}
"recebi 3000 de salário" → {"type":"add_income","incomeType":"salario","name":"Salário","amount":3000,"description":"Salário mensal"}
"quanto gastei esse mês?" → {"type":"query","question":"total de gastos do mês"}
`.trim()

export async function processWhatsAppMessage(text: string): Promise<WhatsAppAction> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nMensagem: ${text}` }] },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
        }),
      }
    )

    const data = await res.json()
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as WhatsAppAction
  } catch {
    return { type: 'unknown' }
  }
}
