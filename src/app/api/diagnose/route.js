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
- 過去に失敗した施策は、同じ方法での再提案は避け、別のアプローチを提示してください

## 提案の判断基準（重要）
- 提案は「その事業・ターゲット・市況においてやった方がいいか」で判断してください
- スキルの有無で提案を削らないでください
- スキルがない施策でも、やるべきなら提案し、「外注」「学習」「代替手段」を併記してください
- 例：動画編集できないがYouTubeが有効 → 「YouTube発信（外注または編集なしの解説動画から開始）」として提案

## 事業情報
### 基本
- 事業内容: ${basics.business}
- ターゲット: ${basics.targetType} / ${basics.target || '未設定'}
- 単価帯: ${basics.priceRange || '未設定'}
- リソース: ${basics.resource || '未設定'}
- 目標: ${basics.goal || '未設定'}
- 時間軸: ${basics.timeline || '未設定'}
- 商品ラインナップ: ${basics.products || '未設定'}

### 現状の数字
- 現在の月間売上: ${basics.currentRevenue || '未回答'}
- 月間問い合わせ数: ${basics.monthlyInquiries || '未回答'}
- 成約率: ${basics.conversionRate || '未回答'}

### 強み・差別化
- 競合との差別化ポイント: ${basics.differentiation || '未回答'}
- 経験年数・実績: ${basics.experience || '未回答'}
- 得意な業界: ${basics.specializedIndustry || '未回答'}

### 課題
- 一番困っていること: ${basics.biggestProblem || '未回答'}
- 過去に失敗した施策: ${basics.failedStrategies || '未回答'}

### スキル
- 動画編集: ${basics.canEditVideo || '未回答'}
- ライティング: ${basics.canWrite || '未回答'}
- 営業・人前で話す: ${basics.canSpeakPublicly || '未回答'}

### 予算・競合
- マーケティング予算: ${basics.marketingBudget || '未回答'}
- 競合: ${basics.competitors || '未回答'}

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

5. **スキル情報の活用（提案の取捨選択には使わない）**: 
   - スキル情報は「実行方法」を補足するために使う
   - やるべき施策は提案し、スキルに応じた実行方法を併記
   - 例：動画編集できない → 「YouTube（編集不要のスライド解説 or 外注）」
   - 例：ライティング苦手 → 「note（音声入力→AI整形 or 外注ライター活用）」
   - 例：営業苦手 → 「紹介（既存顧客への依頼テンプレ作成から開始）」

6. **予算との整合性**: 広告は予算に応じた提案（予算少なければ少額テストから）

7. **過去の失敗を踏まえる**: 同じ方法での再提案は避け、別アプローチや改善案を提示

8. **ボトルネックの特定**: 
   - 問い合わせがあるのに成約しない → クロージング改善
   - そもそも問い合わせがない → 認知・導線改善
   - 現状売上ゼロ → まず最初の1件を取る施策

9. **差別化・強みの活用**: ヒアリングした強みを活かす提案を優先

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
      "howTo": "スキル・リソースを踏まえた具体的な実行方法（外注、ツール活用、簡易版から開始など）",
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
