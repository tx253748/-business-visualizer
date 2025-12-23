import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const { basics, answers, funnel } = await request.json();

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // プロンプト作成
    const prompt = `あなたは事業コンサルタントです。以下の事業情報と現状を分析し、診断結果を返してください。

## 事業情報
- 事業内容: ${basics.business}
- ターゲット: ${basics.targetType} / ${basics.target || '未設定'}
- 単価帯: ${basics.priceRange || '未設定'}
- リソース: ${basics.resource || '未設定'}
- 目標: ${basics.goal || '未設定'}
- 時間軸: ${basics.timeline || '未設定'}
- 商品ラインナップ: ${basics.products || '未設定'}

## 現状（ファネル別）
${funnel.map(f => {
  const answer = answers[f.id] || { selections: [], metric: '', feeling: null, note: '' };
  return `### ${f.label}
- 施策: ${answer.selections.length > 0 ? answer.selections.join(', ') : 'なし'}
- 数字: ${answer.metric || '不明'}
- 手応え: ${answer.feeling === 'good' ? '良い' : answer.feeling === 'ok' ? 'まあまあ' : answer.feeling === 'bad' ? 'いまいち' : '未回答'}
- 備考: ${answer.note || 'なし'}`;
}).join('\n\n')}

## 回答形式
以下のJSON形式で回答してください。日本語で記述してください。

{
  "overallComment": "全体的な診断コメント（2-3文）",
  "axisDiagnosis": [
    {
      "axis": "認知力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "この軸についての具体的なコメント（1-2文）"
    },
    {
      "axis": "興味喚起力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "この軸についての具体的なコメント（1-2文）"
    },
    {
      "axis": "行動誘導力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "この軸についての具体的なコメント（1-2文）"
    },
    {
      "axis": "成約力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "この軸についての具体的なコメント（1-2文）"
    },
    {
      "axis": "顧客対応力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "この軸についての具体的なコメント（1-2文）"
    },
    {
      "axis": "リピート力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "この軸についての具体的なコメント（1-2文）"
    }
  ],
  "recommendations": [
    {
      "title": "施策タイトル",
      "reason": "なぜこの施策が有効か（2-3文）",
      "effort": "低" または "中" または "高",
      "effect": "低" または "中" または "高",
      "timeframe": "期間の目安"
    }
  ],
  "industryStandard": {
    "awareness": ["業界で一般的な認知施策を3-5個"],
    "interest": ["業界で一般的な興味喚起施策を3-5個"],
    "action": ["業界で一般的な行動誘導施策を3-5個"],
    "purchase": ["業界で一般的な成約要因を3-5個"],
    "follow": ["業界で一般的なフォロー施策を3-5個"],
    "repeat": ["業界で一般的なリピート施策を3-5個"]
  }
}

重要：
- 事業内容、ターゲット、単価帯を考慮して現実的な診断をしてください
- recommendationsは優先度順に3つ提示してください
- scoreは入力内容から判断して適切な数値をつけてください
- industryStandardは同業種・同ターゲットで一般的に行われている施策を記載してください
- JSONのみ返してください。説明文は不要です。`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // レスポンスからJSONを抽出
    const content = message.content[0].text;
    let diagnosis;
    
    try {
      // JSONブロックを抽出（```json ... ``` があれば除去）
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      diagnosis = JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON parse error:', e);
      console.error('Raw content:', content);
      return Response.json({ error: 'AI応答の解析に失敗しました' }, { status: 500 });
    }

    return Response.json(diagnosis);

  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
