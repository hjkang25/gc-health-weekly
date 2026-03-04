import { NextRequest, NextResponse } from 'next/server';

const PROMPTS: Record<string, (kw: string) => string> = {
  '3040': (kw) =>
    `다음은 이번 주 건강 검색 TOP8 키워드입니다: ${kw}. 3040 직장인 시선으로 2~3문장 에디터 코멘트를 써줘. 번아웃, 업무 스트레스, 직장 생활 맥락으로. 구어체로.`,
  '20s': (kw) =>
    `다음은 이번 주 건강 검색 TOP8 키워드입니다: ${kw}. 20대 갓생 시선으로 2~3문장 에디터 코멘트를 써줘. 피부, 다이어트, 수면, 사회초년생 맥락으로. 구어체로.`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { keywords: string[]; target: '3040' | '20s' };
    const { keywords, target } = body;

    if (!Array.isArray(keywords) || !keywords.length || !PROMPTS[target]) {
      return NextResponse.json({ error: 'invalid input' }, { status: 400 });
    }

    const prompt = PROMPTS[target](keywords.join(', '));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error('Anthropic error:', res.status, await res.text());
      return NextResponse.json({ error: 'upstream error' }, { status: 502 });
    }

    const data = await res.json();
    const comment: string = data.content?.[0]?.text ?? '';
    return NextResponse.json({ comment });
  } catch (e) {
    console.error('generate-comment error:', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
