import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const { basics, answers, funnel } = await request.json();

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // プロンプト作成
    const prompt = `あなたは日本市場に精通した事業コンサルタントです。以下の事業情報と現状を分析し、診断結果を返してください。

## 重要な前提
- 日本市場の実情を踏まえた現実的な診断をしてください
- LinkedInは日本では普及率が低く、toBでも効果が限定的です
- Xは情報収集には使われますが、toBサービスの問い合わせ導線としては弱いです
- toBの高単価サービスは「紹介」「ウェビナー」「note/YouTube（専門性アピール）」が有効です
- SEOは効果が出るまで6ヶ月〜1年かかります。時間軸が短い場合は優先度を下げてください
- 一人運営の場合、複数チャネルの同時運用は現実的ではありません

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

## 診断の観点
1. **チャネルの適切性**: この事業・ターゲットにそのチャネルは本当に有効か？
   - 例：LINE構築代行を探す経営者はどこで情報収集するか？（X? note? 紹介?）
   - 例：高単価toBサービスにInstagramは有効か？

2. **市況の考慮**: 2024-2025年の日本市場で何が有効か？
   - SEOは競争激化、即効性なし
   - note/YouTubeでの専門性発信が信頼構築に有効
   - 広告は費用対効果を要検討

3. **リソースとの整合性**: 一人でできる施策か？チームが必要か？

4. **時間軸との整合性**: 急ぎならSEOは後回し、紹介やウェビナーを優先

## 回答形式
以下のJSON形式で回答してください。日本語で記述してください。

{
  "overallComment": "全体的な診断コメント（事業特性と市況を踏まえた具体的なコメント、3-4文）",
  "axisDiagnosis": [
    {
      "axis": "認知力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "この事業・ターゲットに対して現在の認知施策が適切かどうかの具体的コメント"
    },
    {
      "axis": "興味喚起力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "具体的なコメント"
    },
    {
      "axis": "行動誘導力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "具体的なコメント"
    },
    {
      "axis": "成約力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "具体的なコメント"
    },
    {
      "axis": "顧客対応力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "具体的なコメント"
    },
    {
      "axis": "リピート力",
      "score": 0-100の数値,
      "status": "good" または "ok" または "weak",
      "comment": "具体的なコメント"
    }
  ],
  "recommendations": [
    {
      "title": "施策タイトル",
      "reason": "なぜこの事業・ターゲット・市況でこの施策が有効か（具体的に2-3文）",
      "effort": "低" または "中" または "高",
      "effect": "低" または "中" または "高",
      "timeframe": "期間の目安"
    }
  ],
  "industryStandard": {
    "awareness": ["この事業・ターゲットで実際に有効な認知施策を3-5個（日本市場で現実的なもの）"],
    "interest": ["実際に有効な興味喚起施策を3-5個"],
    "action": ["実際に有効な行動誘導施策を3-5個"],
    "purchase": ["実際に有効な成約要因を3-5個"],
    "follow": ["実際に有効なフォロー施策を3-5個"],
    "repeat": ["実際に有効なリピート施策を3-5個"]
  }
}

重要：
- 「一般的なマーケティング施策」ではなく「この事業で実際に効くこと」を提案してください
- LinkedInやXをtoBで安易に勧めないでください（日本では効果が限定的）
- recommendationsは優先度順に3つ、リソースと時間軸を考慮して提示
- industryStandardは「同業種で成功している事業者が実際にやっていること」を記載
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
