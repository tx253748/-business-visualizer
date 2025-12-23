import React, { useState } from 'react';

const BusinessVisualizer = () => {
  const [phase, setPhase] = useState('basics'); // basics -> details -> funnel -> result
  const [funnelStep, setFunnelStep] = useState(0);
  const [basics, setBasics] = useState({
    // 基本情報
    business: '',
    target: '',
    targetType: '',
    priceRange: '',
    resource: '',
    goal: '',
    timeline: '',
    products: '',
    // 現状把握
    currentRevenue: '',
    monthlyInquiries: '',
    conversionRate: '',
    // 強み
    differentiation: '',
    experience: '',
    specializedIndustry: '',
    // 課題
    biggestProblem: '',
    failedStrategies: '',
    // スキル
    canEditVideo: '',
    canWrite: '',
    canSpeakPublicly: '',
    // 予算・競合
    marketingBudget: '',
    competitors: '',
  });
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [apiError, setApiError] = useState(null);

  // ファネル定義
  const funnel = [
    { id: 'awareness', label: '認知', question: 'お客さんはどこであなたを知りますか？', metricHint: '例：月間アクセス数、表示回数' },
    { id: 'interest', label: '興味', question: '興味を持った人は何を見ますか？', metricHint: '例：ページ閲覧数、滞在時間' },
    { id: 'action', label: '行動', question: 'どうやって問い合わせしますか？', metricHint: '例：月間問い合わせ数' },
    { id: 'purchase', label: '購買', question: '何が決め手で購入しますか？', metricHint: '例：月間成約数、成約率' },
    { id: 'follow', label: 'フォロー', question: '購入後、何をしていますか？', metricHint: '例：LINE登録数、口コミ数' },
    { id: 'repeat', label: '継続', question: 'リピート・紹介はどう起きていますか？', metricHint: '例：リピート率、紹介数' },
  ];

  // 診断軸
  const evaluationAxes = [
    { id: 'awareness_score', label: '認知力', description: '見込み客にどれだけ知られているか' },
    { id: 'interest_score', label: '興味喚起力', description: '興味を持たせるコンテンツがあるか' },
    { id: 'action_score', label: '行動誘導力', description: '問い合わせしやすい導線があるか' },
    { id: 'conversion_score', label: '成約力', description: '成約につながる仕組みがあるか' },
    { id: 'follow_score', label: '顧客対応力', description: '購入後のフォローができているか' },
    { id: 'repeat_score', label: 'リピート力', description: '継続・紹介の仕組みがあるか' },
  ];

  // 各段階の選択肢
  const options = {
    awareness: ['検索（Google）', 'MEO', 'Instagram', 'X', 'YouTube', 'TikTok', '広告', '紹介', '口コミサイト', 'ポータルサイト', 'チラシ', 'note', 'ウェビナー', 'その他'],
    interest: ['ホームページ', 'LP', 'SNS', '口コミ', '料金表', '事例・実績', 'ブログ', '動画', '資料請求', 'その他'],
    action: ['電話', 'メール', 'LINE', 'フォーム', '来店', 'DM', '予約サイト', 'Zoom相談', 'その他'],
    purchase: ['価格', '実績', '口コミ', '対応の速さ', '専門性', '人柄', '提案内容', '特典', 'その他'],
    follow: ['お礼連絡', 'アンケート', '口コミ依頼', 'LINE登録', '次回案内', 'メルマガ', 'SNSフォロー', '定期報告', '特になし'],
    repeat: ['LINE配信', 'メルマガ', 'クーポン', '会員制度', '紹介特典', 'SNS接点', '定期MTG', 'アップセル提案', '自然発生', '特に仕組みなし'],
  };

  // 業界標準スコア
  const getIndustryScores = () => {
    if (basics.targetType === 'toB' || basics.targetType === '両方') {
      return { awareness_score: 70, interest_score: 75, action_score: 65, conversion_score: 70, follow_score: 60, repeat_score: 55 };
    }
    return { awareness_score: 75, interest_score: 70, action_score: 70, conversion_score: 65, follow_score: 55, repeat_score: 50 };
  };

  // ユーザースコア計算
  const getUserScores = () => {
    const scores = {};
    
    // 認知力
    const awarenessCount = (answers.awareness?.selections || []).length;
    const awarenessFeeling = answers.awareness?.feeling;
    scores.awareness_score = Math.min(100, awarenessCount * 15 + (awarenessFeeling === 'good' ? 20 : awarenessFeeling === 'ok' ? 10 : 0));
    
    // 興味喚起力
    const interestCount = (answers.interest?.selections || []).length;
    const interestFeeling = answers.interest?.feeling;
    scores.interest_score = Math.min(100, interestCount * 15 + (interestFeeling === 'good' ? 20 : interestFeeling === 'ok' ? 10 : 0));
    
    // 行動誘導力
    const actionCount = (answers.action?.selections || []).length;
    const actionFeeling = answers.action?.feeling;
    scores.action_score = Math.min(100, actionCount * 20 + (actionFeeling === 'good' ? 20 : actionFeeling === 'ok' ? 10 : 0));
    
    // 成約力
    const purchaseCount = (answers.purchase?.selections || []).length;
    const purchaseFeeling = answers.purchase?.feeling;
    scores.conversion_score = Math.min(100, purchaseCount * 15 + (purchaseFeeling === 'good' ? 25 : purchaseFeeling === 'ok' ? 10 : 0));
    
    // 顧客対応力
    const followSelections = answers.follow?.selections || [];
    const followFeeling = answers.follow?.feeling;
    const hasNoFollow = followSelections.includes('特になし');
    scores.follow_score = hasNoFollow ? 10 : Math.min(100, followSelections.length * 15 + (followFeeling === 'good' ? 20 : followFeeling === 'ok' ? 10 : 0));
    
    // リピート力
    const repeatSelections = answers.repeat?.selections || [];
    const repeatFeeling = answers.repeat?.feeling;
    const hasNoRepeat = repeatSelections.includes('特に仕組みなし') || repeatSelections.includes('自然発生');
    scores.repeat_score = hasNoRepeat ? 15 : Math.min(100, repeatSelections.length * 15 + (repeatFeeling === 'good' ? 20 : repeatFeeling === 'ok' ? 10 : 0));
    
    return scores;
  };

  // AI診断生成
  const generateDiagnosis = () => {
    const userScores = getUserScores();
    const industryScores = getIndustryScores();
    const axisDiagnosis = [];

    evaluationAxes.forEach(axis => {
      const userScore = userScores[axis.id];
      const industryScore = industryScores[axis.id];
      const diff = userScore - industryScore;
      
      let status, comment;
      if (diff >= 10) {
        status = 'good';
        comment = '業界標準を上回っています。この強みを活かしましょう。';
      } else if (diff >= -10) {
        status = 'ok';
        comment = '業界標準レベルです。さらに強化する余地があります。';
      } else {
        status = 'weak';
        comment = '業界標準を下回っています。優先的に改善を検討しましょう。';
      }

      axisDiagnosis.push({
        ...axis,
        userScore,
        industryScore,
        diff,
        status,
        comment,
      });
    });

    return axisDiagnosis;
  };

  // おすすめ施策生成
  const generateRecommendations = () => {
    const recommendations = [];
    const awarenessSelections = answers.awareness?.selections || [];
    const actionSelections = answers.action?.selections || [];
    const repeatSelections = answers.repeat?.selections || [];

    // 認知施策
    if (!awarenessSelections.includes('YouTube') && !awarenessSelections.includes('note') && basics.targetType === 'toB') {
      recommendations.push({
        priority: 1,
        title: 'YouTube / note でコンテンツ発信',
        reason: 'toB向け高単価サービスでは専門性を示すコンテンツが有効。SEOより早く認知獲得できる可能性あり。',
        effort: '中',
        effect: '高',
        timeframe: '3〜6ヶ月',
      });
    }

    if (!awarenessSelections.includes('紹介') && basics.priceRange === '30万円以上') {
      recommendations.push({
        priority: 2,
        title: '紹介制度の構築',
        reason: '高単価サービスは紹介経由の成約率が高い。既存顧客からの紹介を仕組み化。',
        effort: '低',
        effect: '高',
        timeframe: '1〜2ヶ月',
      });
    }

    // 行動施策
    if (!actionSelections.includes('LINE') && !actionSelections.includes('Zoom相談')) {
      recommendations.push({
        priority: 3,
        title: 'LINE / Zoom相談の導線追加',
        reason: '問い合わせハードルを下げることで、接点数が増加する傾向あり。',
        effort: '低',
        effect: '中',
        timeframe: '2週間〜1ヶ月',
      });
    }

    // 継続施策
    if (repeatSelections.includes('特に仕組みなし') || repeatSelections.includes('自然発生') || repeatSelections.length === 0) {
      recommendations.push({
        priority: 4,
        title: 'リピート・紹介の仕組み化',
        reason: '自然発生に頼ると売上が安定しない。既存顧客への定期アプローチを仕組み化。',
        effort: '中',
        effect: '高',
        timeframe: '1〜3ヶ月',
      });
    }

    // リソース警告
    if (basics.resource === '一人' && awarenessSelections.length > 3) {
      recommendations.push({
        priority: 5,
        title: 'チャネルの絞り込み',
        reason: '一人で複数チャネルは中途半端になりがち。1〜2つに集中して成果を出してから拡大を。',
        effort: '低',
        effect: '中',
        timeframe: '即時',
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 3);
  };

  // レーダーチャート描画
  const RadarChart = ({ userScores, industryScores }) => {
    const size = 280;
    const center = size / 2;
    const radius = 100;
    const axes = evaluationAxes;
    
    const getPoint = (score, index) => {
      const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
      const r = (score / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    };

    const getUserPath = () => {
      return axes.map((axis, i) => {
        const point = getPoint(userScores[axis.id], i);
        return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      }).join(' ') + ' Z';
    };

    const getIndustryPath = () => {
      return axes.map((axis, i) => {
        const point = getPoint(industryScores[axis.id], i);
        return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      }).join(' ') + ' Z';
    };

    return (
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
        {/* グリッド */}
        {[20, 40, 60, 80, 100].map(level => (
          <polygon
            key={level}
            points={axes.map((_, i) => {
              const point = getPoint(level, i);
              return `${point.x},${point.y}`;
            }).join(' ')}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        
        {/* 軸線 */}
        {axes.map((_, i) => {
          const point = getPoint(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* 業界標準（薄い） */}
        <path
          d={getIndustryPath()}
          fill="rgba(148, 163, 184, 0.2)"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="4 2"
        />

        {/* ユーザー（濃い） */}
        <path
          d={getUserPath()}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3b82f6"
          strokeWidth="2.5"
        />

        {/* ラベル */}
        {axes.map((axis, i) => {
          const point = getPoint(120, i);
          return (
            <text
              key={axis.id}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill="#475569"
              fontWeight="600"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    );
  };

  const handleSelect = (funnelId, option) => {
    setAnswers(prev => {
      const current = prev[funnelId] || { selections: [], metric: '', feeling: null, note: '' };
      const selections = current.selections.includes(option)
        ? current.selections.filter(s => s !== option)
        : [...current.selections, option];
      return { ...prev, [funnelId]: { ...current, selections } };
    });
  };

  const handleMetric = (funnelId, value) => {
    setAnswers(prev => {
      const current = prev[funnelId] || { selections: [], metric: '', feeling: null, note: '' };
      return { ...prev, [funnelId]: { ...current, metric: value } };
    });
  };

  const handleFeeling = (funnelId, value) => {
    setAnswers(prev => {
      const current = prev[funnelId] || { selections: [], metric: '', feeling: null, note: '' };
      return { ...prev, [funnelId]: { ...current, feeling: value } };
    });
  };

  const handleNote = (funnelId, value) => {
    setAnswers(prev => {
      const current = prev[funnelId] || { selections: [], metric: '', feeling: null, note: '' };
      return { ...prev, [funnelId]: { ...current, note: value } };
    });
  };

  const getCurrentAnswer = (funnelId) => {
    return answers[funnelId] || { selections: [], metric: '', feeling: null, note: '' };
  };

  const getFeelingStyle = (feeling) => {
    switch (feeling) {
      case 'good': return { bg: '#dcfce7', color: '#166534', label: '◎' };
      case 'ok': return { bg: '#fef9c3', color: '#854d0e', label: '△' };
      case 'bad': return { bg: '#fee2e2', color: '#991b1b', label: '×' };
      default: return { bg: '#f1f5f9', color: '#64748b', label: '-' };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'good': return { bg: '#dcfce7', border: '#86efac', color: '#166534' };
      case 'ok': return { bg: '#fef9c3', border: '#fde047', color: '#854d0e' };
      case 'weak': return { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b' };
      default: return { bg: '#f1f5f9', border: '#e2e8f0', color: '#64748b' };
    }
  };

  // Phase: 基本情報入力
  if (phase === 'basics') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>事業の現状を可視化する</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>まず、あなたの事業について教えてください</p>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>事業内容</label>
              <input type="text" value={basics.business} onChange={(e) => setBasics({ ...basics, business: e.target.value })} placeholder="例：LINE公式アカウント構築代行" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>商品・サービスラインナップ</label>
              <textarea value={basics.products} onChange={(e) => setBasics({ ...basics, products: e.target.value })} placeholder="例：&#10;・初期構築プラン 30万円&#10;・運用代行プラン 月5万円&#10;・コンサルティング 月10万円" rows={4} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>ターゲット</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {['toB（法人）', 'toC（個人）', '両方'].map(opt => {
                  const value = opt.split('（')[0];
                  const isSelected = basics.targetType === value;
                  return (
                    <button key={opt} onClick={() => setBasics({ ...basics, targetType: value })} style={{ flex: 1, padding: '10px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px', background: isSelected ? '#dbeafe' : '#fff', color: isSelected ? '#1e40af' : '#475569', cursor: 'pointer', fontSize: '13px' }}>{opt}</button>
                  );
                })}
              </div>
              <input type="text" value={basics.target} onChange={(e) => setBasics({ ...basics, target: e.target.value })} placeholder="例：中小企業経営者、店舗オーナー" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>単価帯</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['〜5万円', '5〜30万円', '30万円以上', '継続課金'].map(opt => {
                  const isSelected = basics.priceRange === opt;
                  return (
                    <button key={opt} onClick={() => setBasics({ ...basics, priceRange: opt })} style={{ padding: '8px 16px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px', background: isSelected ? '#dbeafe' : '#fff', color: isSelected ? '#1e40af' : '#475569', cursor: 'pointer', fontSize: '13px' }}>{opt}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>リソース</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['一人', '少人数（2-5人）', 'チーム（6人以上）'].map(opt => {
                  const isSelected = basics.resource === opt;
                  return (
                    <button key={opt} onClick={() => setBasics({ ...basics, resource: opt })} style={{ flex: 1, padding: '10px 8px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px', background: isSelected ? '#dbeafe' : '#fff', color: isSelected ? '#1e40af' : '#475569', cursor: 'pointer', fontSize: '12px' }}>{opt}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>目標（月商など）</label>
              <input type="text" value={basics.goal} onChange={(e) => setBasics({ ...basics, goal: e.target.value })} placeholder="例：月商300万円" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>時間軸</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['急ぎ（3ヶ月以内）', '半年くらい', '1年かけて', 'じっくり'].map(opt => {
                  const isSelected = basics.timeline === opt;
                  return (
                    <button key={opt} onClick={() => setBasics({ ...basics, timeline: opt })} style={{ padding: '8px 14px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px', background: isSelected ? '#dbeafe' : '#fff', color: isSelected ? '#1e40af' : '#475569', cursor: 'pointer', fontSize: '13px' }}>{opt}</button>
                  );
                })}
              </div>
            </div>
          </div>

          <button onClick={() => setPhase('details')} disabled={!basics.business || !basics.targetType} style={{ marginTop: '24px', width: '100%', padding: '14px', border: 'none', borderRadius: '8px', background: basics.business && basics.targetType ? '#3b82f6' : '#cbd5e1', color: '#fff', cursor: basics.business && basics.targetType ? 'pointer' : 'not-allowed', fontSize: '15px', fontWeight: '600' }}>次へ</button>
        </div>
      </div>
    );
  }

  // Phase: 詳細情報入力
  if (phase === 'details') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>{basics.business}</p>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>もう少し詳しく教えてください</h1>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '24px' }}>わからない項目は空欄でOKです</p>

          {/* 現状把握 */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>📊 現状把握</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>現在の月間売上</label>
              <input type="text" value={basics.currentRevenue} onChange={(e) => setBasics({ ...basics, currentRevenue: e.target.value })} placeholder="例：50万円、0円（これから）" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>月間の問い合わせ数</label>
              <input type="text" value={basics.monthlyInquiries} onChange={(e) => setBasics({ ...basics, monthlyInquiries: e.target.value })} placeholder="例：5件、ほぼなし" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>成約率（問い合わせ→成約）</label>
              <input type="text" value={basics.conversionRate} onChange={(e) => setBasics({ ...basics, conversionRate: e.target.value })} placeholder="例：30%、わからない" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* 強み */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>💪 強み・差別化</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>競合との差別化ポイント</label>
              <textarea value={basics.differentiation} onChange={(e) => setBasics({ ...basics, differentiation: e.target.value })} placeholder="例：飲食店特化、スピード対応、運用サポート込み" rows={2} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>経験年数・実績</label>
              <input type="text" value={basics.experience} onChange={(e) => setBasics({ ...basics, experience: e.target.value })} placeholder="例：3年、50社以上" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>得意な業界・領域</label>
              <input type="text" value={basics.specializedIndustry} onChange={(e) => setBasics({ ...basics, specializedIndustry: e.target.value })} placeholder="例：美容室、飲食店、EC" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* 課題 */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>🔥 課題</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>今、一番困っていること</label>
              <textarea value={basics.biggestProblem} onChange={(e) => setBasics({ ...basics, biggestProblem: e.target.value })} placeholder="例：問い合わせがこない、単価が上げられない" rows={2} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>過去に試して失敗した施策</label>
              <textarea value={basics.failedStrategies} onChange={(e) => setBasics({ ...basics, failedStrategies: e.target.value })} placeholder="例：広告を出したが赤字、SNSが続かなかった" rows={2} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
          </div>

          {/* スキル */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>🛠 スキル・できること</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>動画編集</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['できる', '少しできる', 'できない'].map(opt => {
                  const isSelected = basics.canEditVideo === opt;
                  return (
                    <button key={opt} onClick={() => setBasics({ ...basics, canEditVideo: opt })} style={{ flex: 1, padding: '8px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px', background: isSelected ? '#dbeafe' : '#fff', color: isSelected ? '#1e40af' : '#475569', cursor: 'pointer', fontSize: '12px' }}>{opt}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>ライティング（ブログ・note等）</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['得意', '普通', '苦手'].map(opt => {
                  const isSelected = basics.canWrite === opt;
                  return (
                    <button key={opt} onClick={() => setBasics({ ...basics, canWrite: opt })} style={{ flex: 1, padding: '8px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px', background: isSelected ? '#dbeafe' : '#fff', color: isSelected ? '#1e40af' : '#475569', cursor: 'pointer', fontSize: '12px' }}>{opt}</button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>営業・人前で話す</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['得意', '普通', '苦手'].map(opt => {
                  const isSelected = basics.canSpeakPublicly === opt;
                  return (
                    <button key={opt} onClick={() => setBasics({ ...basics, canSpeakPublicly: opt })} style={{ flex: 1, padding: '8px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px', background: isSelected ? '#dbeafe' : '#fff', color: isSelected ? '#1e40af' : '#475569', cursor: 'pointer', fontSize: '12px' }}>{opt}</button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 予算・競合 */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>💰 予算・競合</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>マーケティング予算（月額）</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['0円', '〜3万円', '3〜10万円', '10万円以上'].map(opt => {
                  const isSelected = basics.marketingBudget === opt;
                  return (
                    <button key={opt} onClick={() => setBasics({ ...basics, marketingBudget: opt })} style={{ padding: '8px 14px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px', background: isSelected ? '#dbeafe' : '#fff', color: isSelected ? '#1e40af' : '#475569', cursor: 'pointer', fontSize: '12px' }}>{opt}</button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '6px' }}>競合・意識している同業者</label>
              <textarea value={basics.competitors} onChange={(e) => setBasics({ ...basics, competitors: e.target.value })} placeholder="例：○○社、個人で活動している△△さん" rows={2} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setPhase('basics')} style={{ flex: 1, padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', color: '#475569', cursor: 'pointer', fontSize: '15px' }}>戻る</button>
            <button onClick={() => setPhase('funnel')} style={{ flex: 2, padding: '14px', border: 'none', borderRadius: '8px', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}>次へ</button>
          </div>
        </div>
      </div>
    );
  }

  // Phase: ファネル入力
  if (phase === 'funnel') {
    const currentFunnel = funnel[funnelStep];
    const currentOptions = options[currentFunnel.id];
    const currentAnswer = getCurrentAnswer(currentFunnel.id);

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>{basics.business}</p>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>現状を教えてください</h1>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
            {funnel.map((f, i) => (
              <div key={f.id} style={{ flex: 1 }}>
                <div style={{ height: '4px', borderRadius: '2px', background: i <= funnelStep ? '#3b82f6' : '#e2e8f0' }} />
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6', marginBottom: '4px' }}>{currentFunnel.label}</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>{currentFunnel.question}</p>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>やっていること（複数選択可）</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentOptions.map(opt => {
                  const isSelected = currentAnswer.selections.includes(opt);
                  return (
                    <button key={opt} onClick={() => handleSelect(currentFunnel.id, opt)} style={{ padding: '8px 14px', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px', background: isSelected ? '#dbeafe' : '#fff', color: isSelected ? '#1e40af' : '#475569', cursor: 'pointer', fontSize: '12px', fontWeight: isSelected ? '600' : '400' }}>{opt}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>数字（分かる範囲で）</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>{currentFunnel.metricHint}</p>
              <input type="text" value={currentAnswer.metric} onChange={(e) => handleMetric(currentFunnel.id, e.target.value)} placeholder="分からなければ空欄でOK" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>手応え</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'good', label: '◎ いい感じ', bg: '#dcfce7', border: '#86efac', color: '#166534' },
                  { value: 'ok', label: '△ まあまあ', bg: '#fef9c3', border: '#fde047', color: '#854d0e' },
                  { value: 'bad', label: '× いまいち', bg: '#fee2e2', border: '#fca5a5', color: '#991b1b' },
                ].map(opt => {
                  const isSelected = currentAnswer.feeling === opt.value;
                  return (
                    <button key={opt.value} onClick={() => handleFeeling(currentFunnel.id, opt.value)} style={{ flex: 1, padding: '12px 8px', border: isSelected ? `2px solid ${opt.border}` : '1px solid #e2e8f0', borderRadius: '8px', background: isSelected ? opt.bg : '#fff', color: isSelected ? opt.color : '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: isSelected ? '600' : '400' }}>{opt.label}</button>
                  );
                })}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>備考・補足（任意）</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>課題に感じていること、試したこと、今後の計画など</p>
              <textarea 
                value={currentAnswer.note} 
                onChange={(e) => handleNote(currentFunnel.id, e.target.value)} 
                placeholder="例：InstagramはやっているがフォロワーがなかなかLinkedIn も試してみたい" 
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button onClick={() => funnelStep === 0 ? setPhase('basics') : setFunnelStep(funnelStep - 1)} style={{ padding: '12px 24px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', color: '#475569', cursor: 'pointer', fontSize: '14px' }}>戻る</button>
            <button onClick={async () => { 
              if (funnelStep < funnel.length - 1) { 
                setFunnelStep(funnelStep + 1); 
              } else { 
                setIsAnalyzing(true);
                setApiError(null);
                try {
                  const response = await fetch('/api/diagnose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ basics, answers, funnel }),
                  });
                  const data = await response.json();
                  if (data.error) {
                    setApiError(data.error);
                    setAiDiagnosis(null);
                  } else {
                    setAiDiagnosis(data);
                  }
                } catch (err) {
                  setApiError('診断中にエラーが発生しました');
                  setAiDiagnosis(null);
                }
                setIsAnalyzing(false);
                setPhase('result');
              } 
            }} style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{funnelStep < funnel.length - 1 ? '次へ' : '診断する'}</button>
          </div>
        </div>
      </div>
    );
  }

  // 分析中
  if (isAnalyzing) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontSize: '16px', color: '#1e293b', fontWeight: '600' }}>分析中...</p>
        </div>
      </div>
    );
  }

  // Phase: 結果画面
  if (phase === 'result') {
    // AI診断結果がある場合はそれを使用、なければダミー
    const useAi = aiDiagnosis && !apiError;
    
    // スコア計算
    let userScores, industryScores, axisDiagnosis, recommendations, industryStandard;
    
    if (useAi) {
      // AI診断結果から取得
      userScores = {
        awareness_score: aiDiagnosis.axisDiagnosis[0]?.score || 50,
        interest_score: aiDiagnosis.axisDiagnosis[1]?.score || 50,
        action_score: aiDiagnosis.axisDiagnosis[2]?.score || 50,
        conversion_score: aiDiagnosis.axisDiagnosis[3]?.score || 50,
        follow_score: aiDiagnosis.axisDiagnosis[4]?.score || 50,
        repeat_score: aiDiagnosis.axisDiagnosis[5]?.score || 50,
      };
      industryScores = { awareness_score: 70, interest_score: 70, action_score: 70, conversion_score: 70, follow_score: 70, repeat_score: 70 };
      axisDiagnosis = aiDiagnosis.axisDiagnosis.map((ax, idx) => ({
        id: evaluationAxes[idx].id,
        label: ax.axis,
        description: evaluationAxes[idx].description,
        userScore: ax.score,
        industryScore: 70,
        status: ax.status,
        comment: ax.comment,
      }));
      recommendations = aiDiagnosis.recommendations || [];
      industryStandard = aiDiagnosis.industryStandard || {};
    } else {
      // ダミー（従来ロジック）
      userScores = getUserScores();
      industryScores = getIndustryScores();
      axisDiagnosis = generateDiagnosis();
      recommendations = generateRecommendations();
      industryStandard = basics.targetType === 'toB' ? 
        { awareness: ['検索（Google）', '紹介', 'YouTube', 'note'], interest: ['ホームページ', '事例・実績', 'ブログ'], action: ['フォーム', 'LINE', 'Zoom相談'], purchase: ['実績', '専門性', '提案内容'], follow: ['定期報告', 'LINE登録'], repeat: ['定期MTG', 'アップセル提案', '紹介特典'] } :
        { awareness: ['検索（Google）', 'MEO', 'Instagram'], interest: ['ホームページ', 'SNS', '口コミ'], action: ['LINE', '電話', '予約サイト'], purchase: ['口コミ', '価格'], follow: ['LINE登録', '口コミ依頼'], repeat: ['LINE配信', 'クーポン', '紹介特典'] };
    }

    const totalUserScore = Math.round(Object.values(userScores).reduce((a, b) => a + b, 0) / 6);
    const totalIndustryScore = Math.round(Object.values(industryScores).reduce((a, b) => a + b, 0) / 6);

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>診断結果</h1>
          
          {/* APIエラー表示 */}
          {apiError && (
            <div style={{ background: '#fee2e2', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#991b1b', fontSize: '14px' }}>
              {apiError}（ダミーデータで表示しています）
            </div>
          )}
          
          {/* AI総合コメント */}
          {useAi && aiDiagnosis.overallComment && (
            <div style={{ background: '#dbeafe', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#1e40af', margin: 0, lineHeight: '1.6' }}>{aiDiagnosis.overallComment}</p>
            </div>
          )}

          {/* 1. AI診断 + おすすめ施策 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            
            {/* 総合スコア */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>総合評価</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '48px', fontWeight: '800', color: '#3b82f6', margin: 0 }}>{totalUserScore}</p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>あなた</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: '600', color: '#94a3b8', margin: 0 }}>{totalIndustryScore}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>業界標準</p>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <RadarChart userScores={userScores} industryScores={industryScores} />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div><span style={{ fontSize: '11px', color: '#64748b' }}>あなた</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: '#94a3b8', borderRadius: '2px', opacity: 0.5 }}></div><span style={{ fontSize: '11px', color: '#64748b' }}>業界標準</span></div>
                </div>
              </div>
            </div>

            {/* おすすめ施策 */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>おすすめ施策</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.map((rec, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px', borderLeft: '3px solid #3b82f6' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 6px 0' }}>{i + 1}. {rec.title}</p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px 0', lineHeight: '1.5' }}>{rec.reason}</p>
                    {rec.howTo && (
                      <p style={{ fontSize: '12px', color: '#1e40af', margin: '0 0 8px 0', lineHeight: '1.5', background: '#dbeafe', padding: '8px 10px', borderRadius: '4px' }}>
                        💡 {rec.howTo}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>労力: <strong>{rec.effort}</strong></span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>効果: <strong>{rec.effect}</strong></span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>期間: <strong>{rec.timeframe}</strong></span>
                    </div>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>現状のバランスが良好です。</p>
                )}
              </div>
            </div>
          </div>

          {/* 軸別診断 */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>軸別診断</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {axisDiagnosis.map((axis, idx) => {
                const style = getStatusStyle(axis.status);
                // 軸とファネルの対応
                const funnelMapping = ['awareness', 'interest', 'action', 'purchase', 'follow', 'repeat'];
                const funnelId = funnelMapping[idx];
                const funnelAnswer = getCurrentAnswer(funnelId);
                const funnelInfo = funnel[idx];
                return (
                  <div key={axis.id} style={{ background: style.bg, borderRadius: '8px', padding: '16px', border: `1px solid ${style.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: style.color, margin: 0 }}>{axis.label}</p>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: style.color }}>{axis.userScore}<span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>/ 100</span></span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px 0' }}>{axis.description}</p>
                    <p style={{ fontSize: '12px', color: style.color, margin: '0 0 8px 0', fontWeight: '500' }}>{axis.comment}</p>
                    
                    {/* やっていること */}
                    {funnelAnswer.selections.length > 0 && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px dashed ${style.border}` }}>
                        <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>実施中</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {funnelAnswer.selections.map((item, j) => (
                            <span key={j} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', color: '#475569' }}>{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 備考 */}
                    {funnelAnswer.note && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px dashed ${style.border}` }}>
                        <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>備考</p>
                        <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.5' }}>{funnelAnswer.note}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. ビジネス情報 */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>ビジネス情報</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div><p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px 0' }}>事業内容</p><p style={{ fontSize: '14px', color: '#1e293b', margin: 0, fontWeight: '600' }}>{basics.business}</p></div>
              <div><p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px 0' }}>ターゲット</p><p style={{ fontSize: '14px', color: '#1e293b', margin: 0 }}>{basics.targetType} / {basics.target || '未設定'}</p></div>
              <div><p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px 0' }}>単価帯</p><p style={{ fontSize: '14px', color: '#1e293b', margin: 0 }}>{basics.priceRange || '未設定'}</p></div>
              <div><p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px 0' }}>リソース</p><p style={{ fontSize: '14px', color: '#1e293b', margin: 0 }}>{basics.resource || '未設定'}</p></div>
              <div><p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px 0' }}>目標</p><p style={{ fontSize: '14px', color: '#1e293b', margin: 0 }}>{basics.goal || '未設定'}</p></div>
              <div><p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px 0' }}>時間軸</p><p style={{ fontSize: '14px', color: '#1e293b', margin: 0 }}>{basics.timeline || '未設定'}</p></div>
            </div>
          </div>

          {/* 3. 商品ラインナップ */}
          {basics.products && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>商品・サービスラインナップ</h2>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{basics.products}</p>
            </div>
          )}

          {/* 4. 現状マップ */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>現状マップ</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', width: '80px' }}>段階</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>あなたの現状</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', width: '80px' }}>数字</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', width: '60px' }}>手応え</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', background: '#f1f5f9' }}>業界標準</th>
                  </tr>
                </thead>
                <tbody>
                  {funnel.map((f, i) => {
                    const answer = getCurrentAnswer(f.id);
                    const yours = answer.selections;
                    const feelingStyle = getFeelingStyle(answer.feeling);
                    const standardItems = industryStandard[f.id] || [];
                    
                    return (
                      <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{f.label}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {yours.length > 0 ? yours.map((item, j) => (
                              <span key={j} style={{ background: '#dbeafe', color: '#1e40af', borderRadius: '4px', padding: '2px 8px', fontSize: '11px' }}>{item}</span>
                            )) : <span style={{ color: '#94a3b8' }}>（未入力）</span>}
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: answer.metric ? '#1e293b' : '#94a3b8' }}>{answer.metric || '?'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}><span style={{ background: feelingStyle.bg, color: feelingStyle.color, borderRadius: '4px', padding: '2px 8px', fontWeight: '700' }}>{feelingStyle.label}</span></td>
                        <td style={{ padding: '12px', background: '#f8fafc' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {standardItems.map((item, j) => (
                              <span key={j} style={{ background: yours.includes(item) ? '#dcfce7' : '#e2e8f0', color: yours.includes(item) ? '#166534' : '#94a3b8', borderRadius: '4px', padding: '2px 8px', fontSize: '11px' }}>{item}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <button onClick={() => { setPhase('basics'); setFunnelStep(0); setAnswers({}); setBasics({ business: '', target: '', targetType: '', priceRange: '', resource: '', goal: '', timeline: '', products: '', currentRevenue: '', monthlyInquiries: '', conversionRate: '', differentiation: '', experience: '', specializedIndustry: '', biggestProblem: '', failedStrategies: '', canEditVideo: '', canWrite: '', canSpeakPublicly: '', marketingBudget: '', competitors: '' }); setAiDiagnosis(null); setApiError(null); }} style={{ padding: '12px 24px', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>最初からやり直す</button>
        </div>
      </div>
    );
  }

  return null;
};

export default BusinessVisualizer;
