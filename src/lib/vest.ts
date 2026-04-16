export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function getVestResponse(
  prompt: string,
  history: ChatMessage[] = []
): Promise<string> {
  const res = await fetch('/api/merchant/vest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history }),
  });

  const data = await res.json();

  if (res.status === 429 || data.error === 'RATE_LIMIT') {
    throw new Error('RATE_LIMIT');
  }

  if (!res.ok || data.error) {
    throw new Error(data.error || `Server error ${res.status}`);
  }

  return data.reply as string;
}
