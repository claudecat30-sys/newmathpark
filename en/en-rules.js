/* 英文數學讀音規則（程式用對照表）
 * 依據：預錄/英文數學讀音規則.md。頁面與錄音程式共用這一份，改讀法只改這裡。
 * enSpeak(text) → { tokens, rules, flags }
 *   tokens：[{k:'t',s:'文字片段'} | {k:'n',n:數字} | {k:'o',n:序數} | {k:'d',n:分母,p:是否複數} | {k:'z',n:時間的分(01–09)}]
 *   rules ：這一句用到的規則代號
 *   flags ：程式無法確定、需要人看的原因
 */
(function (root) {
  const RULES = {
    PLUS: '+ 讀 plus', MINUS: '− 在兩數之間讀 minus', NEG: '− 在數字前讀 negative', TIMES: '× 讀 times', BY: '× 表示尺寸時讀 by',
    DIV: '÷ 讀 divided by', EQ: '= 讀 equals', WHAT: '= what? 讀 equals what', MONEY: '$5 讀 5 dollars', PERKM: '$5/km 讀 dollars per kilometer',
    PCT: '% 讀 percent', DEG: '° 讀 degrees', UNIT: '單位縮寫展開並分單複數', AREA: 'cm²、m² 讀 square …', VOL: 'cm³、m³ 讀 cubic …',
    FRAC: '分數 3/4 讀 three fourths', HALF: '分母 2 讀 half / halves', MIXED: '帶分數讀 … and …', SQ: '² 讀 squared', CUBE: '³ 讀 cubed',
    QTY: '括號讀 the quantity', COEF: '係數與變數相乘不讀 times', VAR: '單一字母讀字母名稱', RATIO: 'a : b 讀 a to b', TIME: '時間 3:15 讀 three fifteen',
    ORD: '2nd、3rd 讀序數', ELL: '… 用停頓', TRIG: 'sin、cos、tan 讀 sine、cosine、tangent', THETA: 'θ 讀 theta', ANGLE: '∠ 讀 angle，字母逐一讀',
    LETTERS: '大寫字母串逐一讀', DEC: '小數讀 point，逐位讀', BIGNUM: '一萬以上的數分段讀', NUMWORDS: '整句是英文數字單字', RANGE: '範圍 1–5 讀 to', DATE: '日期 3/5 讀 March 5th',
    PLNUM: '5s 讀 fives', ICON: '圖示讀出物品名稱', PROB: 'P(紅球) 讀 the probability of red', QMARK: '開頭的 ? 讀 the question mark', ARROW: '→ 讀 then', BLANK: '○ 讀 blank',
    CMPLIST: '>, <, = 並列時讀 greater than, less than, or equal to', GT: '> 讀 is greater than', LT: '< 讀 is less than', MARKS: '✔ ✘ ⟲ ⟳ 讀成按鈕名稱',
    OUTOF: '0 / 6 讀 0 out of 6', ROOT: '√ 讀 the square root of', PI: 'π 讀 pi', CMP2: '≤ ≥ ≠ ≈ 讀 is less than or equal to 等', SIGN: '單獨的 > < 讀 the greater-than sign / the less-than sign',
    SHAPES: '△ □ ○ 在圖形規律裡讀 triangle / square / circle', TRI: '△ABC 讀 triangle A B C', GEO: '≅ ~ ⊥ ∥ ∝ 讀 is congruent to / is similar to / is perpendicular to / is parallel to / is proportional to',
    POW: '上標指數讀 to the power of', SUB: '下標 a₁ 讀 a 1', PM: '± 讀 plus or minus', PER: 'km/h 讀 kilometers per hour', DECOR: '標題與按鈕前的裝飾圖示不讀', RUN: '連續重複的圖示讀成「數量＋名稱」', STEP: '①②③ 讀 number 1, number 2',
  };
  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const UNITS = { cm: ['centimeter', 'centimeters'], km: ['kilometer', 'kilometers'], kg: ['kilogram', 'kilograms'], mL: ['milliliter', 'milliliters'], mm: ['millimeter', 'millimeters'], m: ['meter', 'meters'], g: ['gram', 'grams'], L: ['liter', 'liters'], t: ['tonne', 'tonnes'] };
  // 圖示名稱：[單數, 複數]。名稱盡量沿用頁面程式裡已有的英文名稱。
  const NAME = { '🍩': ['donut', 'donuts'], '🧃': ['juice', 'juices'], '🍪': ['cookie', 'cookies'], '': ['lemonade', 'lemonades'], '📚': ['book', 'books'], '🧸': ['teddy bear', 'teddy bears'],
    '👕': ['T-shirt', 'T-shirts'], '🎁': ['gift', 'gifts'], '👟': ['shoe', 'shoes'], '🍎': ['apple', 'apples'], '🍓': ['strawberry', 'strawberries'], '🍊': ['orange', 'oranges'], '🍑': ['peach', 'peaches'], '🍐': ['pear', 'pears'],
    '🍌': ['banana', 'bananas'], '🍇': ['bunch of grapes', 'grapes'], '🍉': ['watermelon', 'watermelons'], '🍬': ['sweet', 'sweets'], '🥚': ['egg', 'eggs'], '🖍': ['crayon', 'crayons'], '🎈': ['balloon', 'balloons'],
    '⚽': ['football', 'footballs'], '🏀': ['basketball', 'basketballs'], '🚲': ['bicycle', 'bicycles'], '🎒': ['backpack', 'backpacks'], '🥁': ['drum', 'drums'], '🛒': ['toy cart', 'toy carts'], '📦': ['box', 'boxes'],
    '🐶': ['dog', 'dogs'], '🐱': ['cat', 'cats'], '🐼': ['panda', 'pandas'], '🐢': ['turtle', 'turtles'], '🐿': ['squirrel', 'squirrels'], '🦊': ['fox', 'foxes'], '🐵': ['monkey', 'monkeys'], '🐻': ['bear', 'bears'],
    '🐸': ['frog', 'frogs'], '🐰': ['bunny', 'bunnies'], '🐷': ['piglet', 'piglets'], '🏆': ['trophy', 'trophies'], '🗝': ['key', 'keys'], '🪙': ['coin', 'coins'], '👑': ['crown', 'crowns'], '🔺': ['triangle', 'triangles'],
    '🐟': ['fish', 'fish'], '🚗': ['car', 'cars'], '🚌': ['bus', 'buses'], '🥕': ['carrot', 'carrots'], '🦴': ['bone', 'bones'], '✏': ['pencil', 'pencils'], '🚄': ['train', 'trains'], '✈': ['plane', 'planes'],
    '🐘': ['elephant', 'elephants'], '🥫': ['can', 'cans'], '🎲': ['dice', 'dice'], '🧊': ['ice cube', 'ice cubes'], '🟥': ['red square', 'red squares'], '🟦': ['blue square', 'blue squares'], '🟨': ['yellow square', 'yellow squares'], '🔷': ['blue diamond', 'blue diamonds'],
    '❓': ['question mark', 'question marks'], '🔟': ['ten-dollar coin', 'ten-dollar coins'], '①': ['one-dollar coin', 'one-dollar coins'] };
  // 只是裝飾、不讀出來的圖示（標題、按鈕、提示前面的小圖）
  const DECOR = /[📊📖🤔📘🧪📕📈▶🔁✅❌💡🧠🎮🎬◀⏰🖨💰⏸🎉⏭💪🗑⏹🧩🕹📝⏱🚏⬆☰]\uFE0F?\s*(?=[A-Z0-9"])/gu;
  const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹', SUBD = '₀₁₂₃₄₅₆₇₈₉';
  const COLOR = { '🔴': 'red', '🔵': 'blue', '🟡': 'yellow', '🟢': 'green' };
  const FOOD = new Set(['🍎', '🍓', '🍊', '🍑', '🍐', '🍌', '🍇', '🍉', '🍬', '🍪', '🍩']);
  const M = (kind, a, b) => '\u0001' + kind + ':' + a + (b != null ? ':' + b : '') + '\u0002';   // 內部標記
  function words2num(s) {
    const w = s.toLowerCase().replace(/-/g, ' ').replace(/\band\b/g, ' ').split(/\s+/).filter(Boolean); if (!w.length) return null;
    let total = 0, cur = 0, seen = false;
    for (const x of w) {
      const o = ONES.indexOf(x), t = TENS.indexOf(x);
      if (o >= 0) { cur += o; seen = true; } else if (t >= 2) { cur += t * 10; seen = true; } else if (x === 'hundred') cur *= 100; else if (x === 'thousand') { total += cur * 1e3; cur = 0; } else if (x === 'million') { total += cur * 1e6; cur = 0; } else if (x === 'billion') { total += cur * 1e9; cur = 0; } else return null;
    }
    return seen ? total + cur : null;
  }
  // 一萬以上：分成 billion / million / thousand 幾段，每段是 0–999 的數字音檔加單位詞
  function bigNum(n) { let out = ''; for (const [v, w] of [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']]) { if (n >= v) { out += Math.floor(n / v) + ' ' + w + ' '; n %= v; } } return (out + (n ? n : '')).trim(); }

  function enSpeak(text) {
    const rules = new Set(), flags = new Set(); const R = r => rules.add(r);
    let s = String(text).replace(/️/g, '').replace(/\bml\b/g, 'mL');
    s = s.replace(/"?✔"?/g, () => { R('MARKS'); return 'the check mark'; }).replace(/"?✘"?/g, () => { R('MARKS'); return 'the cross'; }).replace(/"?⟲"?/g, () => { R('MARKS'); return 'the turn-back arrow'; }).replace(/"?⟳"?/g, () => { R('MARKS'); return 'the turn-forward arrow'; });
    // ---- 課程固定文字才有的寫法（2026-11-13 補）
    s = s.replace(/（/g, '(').replace(/）/g, ')').replace(/：/g, ': ').replace(/？/g, '?').replace(/\s*·\s*/g, ', ').replace(/([A-Za-z])–(?=[A-Za-z])/g, '$1 ').replace(/\s*[↓←☰]\s*/g, ' ').replace(/\s*→\s*$/, '');
    s = s.replace(DECOR, () => { R('DECOR'); return ''; });
    if (/🔟/u.test(s)) s = s.replace(/(🔟|①)\1*(\s*[:,.?!;])?/gu, (m, e, pu) => { const n = m.split(e).length - 1; R('RUN'); R('ICON'); return ' ' + (n > 1 ? n + ' ' + NAME[e][1] : 'the ' + NAME[e][0]) + (pu ? pu.trim() : ' '); }).replace(/(coins?)\s+(?=\d+ one-dollar)/, '$1 and ');
    s = s.replace(/([①②③④⑤⑥])\s*/g, (m, c) => { R('STEP'); return ', number ' + ('①②③④⑤⑥'.indexOf(c) + 1) + ', '; }).replace(/^\s*,\s*/, '');
    s = s.replace(/(\p{Extended_Pictographic}|[-])️?(?:\s?\1️?)+(\s*[:,.?!;])?/gu, (m, e, pu) => { if (!NAME[e]) return m; const n = m.split(e).length - 1; R('RUN'); R('ICON'); return ' ' + n + ' ' + NAME[e][1] + (pu ? pu.trim() : ' '); });
    s = s.replace(/\$\s*\([\s　]*\)/g, () => { R('BLANK'); R('MONEY'); return ' blank dollars'; }).replace(/\([\s　]*\)/g, () => { R('BLANK'); return ' blank '; }).replace(/[?]\s*%/g, () => { R('PCT'); return 'what percent'; });
    s = s.replace(/(\d)\s+\/\s+(?=\d)/g, (m, a) => { R('OUTOF'); return a + ' out of '; }).replace(/\bkm\/h\b/g, () => { R('PER'); return 'kilometers per hour'; }).replace(/\bm\/s\b/g, () => { R('PER'); return 'meters per second'; }).replace(/\bm\/min\b/g, () => { R('PER'); return 'meters per minute'; });
    s = s.replace(/\bpi\s*\(π\)/g, 'pi').replace(/(\d)\s*π/g, (m, a) => { R('PI'); return a + ' pi '; }).replace(/π/g, () => { R('PI'); return ' pi '; });
    s = s.replace(/√\s*\(([^()]+)\)/g, (m, x) => { R('ROOT'); return ' the square root of the quantity ' + x + ', '; }).replace(/√\s*(\d+(?:\.\d+)?|[a-z])/g, (m, x) => { R('ROOT'); return ' the square root of ' + x; });
    s = s.replace(/\s*≤\s*/g, () => { R('CMP2'); return ' is less than or equal to '; }).replace(/\s*≥\s*/g, () => { R('CMP2'); return ' is greater than or equal to '; }).replace(/\s*≠\s*/g, () => { R('CMP2'); return ' is not equal to '; }).replace(/\s*≈\s*/g, () => { R('CMP2'); return ' is approximately '; });
    s = s.replace(/△\s*(?=[A-Z]{3}\b)/g, () => { R('TRI'); return 'triangle '; });
    if (/[△□]/.test(s) && !/\d\s*□|□\s*=/.test(s)) { R('SHAPES'); s = s.replace(/△/g, ' triangle, ').replace(/□/g, ' square, ').replace(/○/g, ' circle, ').replace(/,\s*([:.?!])/g, '$1').replace(/,\s+(repeats|is|comes)/g, ' $1'); }
    s = s.replace(/\s*≅\s*/g, () => { R('GEO'); return ' is congruent to '; }).replace(/([A-Z])\s*~\s*(?=[A-Zt])/g, (m, a) => { R('GEO'); return a + ' is similar to '; }).replace(/\s*⊥\s*/g, () => { R('GEO'); return ' is perpendicular to '; }).replace(/\s*∥\s*/g, () => { R('GEO'); return ' is parallel to '; }).replace(/([A-Z])\s*\/\/\s*(?=[A-Z])/g, (m, a) => { R('GEO'); return a + ' is parallel to '; }).replace(/\s*∝\s*/g, () => { R('GEO'); return ' is proportional to '; }).replace(/([A-Z])↔(?=[A-Z])/g, (m, a) => { R('GEO'); return a + ' matches '; });
    s = s.replace(/([A-Za-z0-9)])(⁻?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (m, a, neg, d) => { if (!neg && (d === '²' || d === '³')) return m; R('POW'); return a + ' to the power of ' + (neg ? 'negative ' : '') + [...d].map(c => SUPD.indexOf(c)).join('') + ' '; }).replace(/([A-Za-z0-9)])ⁿ/g, (m, a) => { R('POW'); return a + ' to the power of n '; });
    s = s.replace(/([A-Za-z])([₀₁₂₃₄₅₆₇₈₉]+)/g, (m, a, d) => { R('SUB'); return a + ' ' + [...d].map(c => SUBD.indexOf(c)).join('') + ' '; }).replace(/([A-Za-z])ₙ/g, (m, a) => { R('SUB'); return a + ' n '; });
    s = s.replace(/\s*±\s*/g, () => { R('PM'); return ' plus-or-minus '; });
    s = s.replace(/\ba ✓/g, () => { R('MARKS'); return 'a check mark'; }).replace(/\s*✓/g, '').replace(/\b(the|The)\s*▼/g, (m, a) => { R('MARKS'); return a + ' arrow'; }).replace(/^\s*▼/, () => { R('MARKS'); return 'The arrow'; }).replace(/▼/g, () => { R('MARKS'); return ' the arrow '; });
    s = s.replace(/(\d|\b[a-z]\b|\))\s*<\s*(?=\d|−|\(|[a-z]\b| the square)/g, (m, a) => { R('LT'); return a + ' is less than '; }).replace(/(\d|\b[a-z]\b|\))\s*>\s*(?=\d|−|\(|[a-z]\b| the square)/g, (m, a) => { R('GT'); return a + ' is greater than '; });
    s = s.replace(/\$\s*(\d+)\s+(notes?|coins?|bills?)\b/g, (m, n, w) => { R('MONEY'); return n + ' dollar ' + w; });
    if (!/>\s*,\s*<\s*(,|or)\s*=/.test(s)) s = s.replace(/(^|\s)>(?=\s|[?.,;:]|$)/g, (m, a) => { R('SIGN'); return a + 'the greater-than sign'; }).replace(/(^|\s)<(?=\s|[?.,;:]|$)/g, (m, a) => { R('SIGN'); return a + 'the less-than sign'; });
    // ---- \u4f8b\u5916\u6e05\u55ae\u7b2c\u4e09\u6279\uff1a\u5b57\u6bcd\u6307\u6578\u3001\u76f4\u5f0f\u7684\u6a6b\u7dda\u3001\u7528 | \u5206\u9694\u7684\u6578\u5b57\u3001\u7b2c\u4e8c\u8f1b\u8eca
    { const SUPL = { '\u1d50': 'm', '\u207f': 'n', '\u207a': 'plus', '\u207b': 'minus', '\u02e3': 'times' };
      s = s.replace(/([A-Za-z0-9)])([\u1d50\u207f\u207a\u207b\u02e3]{2,}|\u1d50)(?![\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079])/g, (m, a, x) => { R('POW'); return a + ' to the power of ' + [...x].map(c => SUPL[c]).join(' ') + ' '; }); }
    s = s.replace(/\s*\u2500{3,}\s*/g, () => { R('EQ'); return ' equals '; }).replace(/(\d)\s+\|\s+(?=\d)/g, '$1, ').replace(/\ud83d\ude99/gu, () => { R('ICON'); return ' the second car '; });
    // ---- \u4f8b\u5916\u6e05\u55ae\u7b2c\u4e8c\u6279\uff082026-11-13\uff09\uff1a\u8ca0\u6578\u62ec\u865f\u3001\u65b9\u62ec\u865f\u3001\u7acb\u65b9\u3001\u7d55\u5c0d\u503c\u3001\u8a08\u7968\u7b26\u865f\u3001a/b\u3001\u25a1\u3001%\u3001\u53ea\u6709\u904b\u7b97\u7b26\u865f\u7684\u53e5\u5b50\u3001\u624b\u52e2\u8207\u4e26\u6392\u5716\u793a
    s = s.replace(/\b([fg])\(([^()]+)\)/g, (m, f, x) => { R('FUNC'); return f + ' of ' + x + ' '; });
    s = s.replace(/(?<![a-z])\(\s*\u2212\s*(\d+(?:\.\d+)?|[a-z])\s*\)(?![\u00b2\u00b3\u2070\u00b9\u2074-\u2079])/g, (m, x) => { R('NEG'); return ' negative ' + x + ' '; });
    s = s.replace(/\[/g, '(').replace(/\]/g, ')');
    s = s.replace(/\(([^()]+)\)\s*\u00b3/g, (m, x) => { R('QTY'); R('CUBE'); return ' the quantity ' + x + ', cubed '; });
    s = s.replace(/\|(\u2212?\d+(?:\.\d+)?|\u2212?[a-z])\|/g, (m, x) => { R('ABS'); return ' the absolute value of ' + x + ' '; });
    s = s.replace(/\|\|\|\|\//g, () => { R('TALLY'); return ' five tally marks, '; }).replace(/(^|\s)(\|{1,4})(?=\s|$|[.,?])/g, (m, a, b, i, str) => { if (!/\|\||tally marks/.test(str)) return m; R('TALLY'); return a + b.length + (b.length === 1 ? ' tally mark' : ' tally marks'); });
    s = s.replace(/(blank|\?)\s*\/\s*(?=\d)/g, (m, a) => { R('OVER'); return (a === '?' ? 'what' : 'blank') + ' over '; }).replace(/\b([A-Za-z]+)\/(\d+)\b/g, (m, a, b) => { R('OVER'); return a + ' over ' + b; }).replace(/([a-z])\s+\/\s+(?=[a-z])/g, '$1, ');
    s = s.replace(/🌙\s*/gu, () => { R('ICON'); return 'night, '; }).replace(/☀️?\s*/gu, () => { R('ICON'); return 'morning, '; });
    s = s.replace(/\b([A-Za-z]{2,})\/([A-Za-z]{2,})\b/g, '$1 or $2').replace(/\b(\d+|[a-z])\/([a-z])\b/g, (m, a, b) => { R('OVER'); return a + ' over ' + b; }).replace(/\)\s*\/\s*(?=[\da-z])/g, () => { R('OVER'); return ') over '; });
    s = s.replace(/(\d)\u25a1/g, (m, a) => { R('BOX'); return a + ' to the power of the box'; }).replace(/\u25a1(?=\s*=)/g, () => { R('BOX'); return 'the box '; });
    s = s.replace(/percentage\s*\(%\)/g, 'percentage').replace(/^\s*%/, 'Percent').replace(/blank\s*%/g, 'blank percent').replace(/%/g, () => { R('PCT'); return ' percent'; });
    if (!/\d/.test(s) && /[\u00d7\u00f7]/.test(s) && /[\u00d7\u00f7+\u2212]\s*(then|and|or|,)?\s*[\u00d7\u00f7+\u2212=]|[\u00d7\u00f7]\s*[.;,:]|[\u00d7\u00f7]\s*$|\b(for|with|and|then|review|number)\s+[\u00d7\u00f7]/.test(s)) { R('OPNAME'); s = s.replace(/\u00d7/g, ' multiplication ').replace(/\u00f7/g, ' division ').replace(/\+/g, ' addition ').replace(/\u2212/g, ' subtraction ').replace(/=/g, ' equals '); }
    s = s.replace(/\ud83d\udd90\uFE0F?\s*((?:\u261d\uFE0F?\s*)+)/gu, (m, f) => { const n = (f.match(/\u261d/gu) || []).length; R('ICON'); return ' an open hand and ' + n + (n === 1 ? ' finger' : ' fingers'); }).replace(/\ud83d\udd90\uFE0F?/gu, () => { R('ICON'); return 'an open hand'; }).replace(/\ud83d\udcd8(?=\s+side)/u, 'book');
    s = s.replace(/([a-z])?\s*((?:(?:\p{Extended_Pictographic}|[\ue000-\uf8ff])\uFE0F?\s?){2,})/gu, (m0, pw, m) => { const es = [...m].filter(c => c !== '\uFE0F' && c !== ' '); if (new Set(es).size < 2 || !es.every(e => NAME[e] || COLOR[e])) return m0; R('ICON'); return (pw ? pw + ':' : '') + ' ' + es.map(e => COLOR[e] ? COLOR[e] + ' circle' : NAME[e][0]).join(', ') + ', '; });
    s = s.replace(/^\s*(\p{Extended_Pictographic}|[\ue000-\uf8ff])\uFE0F?\s*(?=[A-Za-z0-9])/u, (m, e) => NAME[e] || COLOR[e] ? m : (R('DECOR'), ''));
    s = s.replace(/([a-z]{2,})\s+(\p{Extended_Pictographic}|[\ue000-\uf8ff])\uFE0F?(?=\s*(?:is\b|are\b|about\b|and\b|[.,;?!]|$))/gu, (m, w, e) => NAME[e] || COLOR[e] ? m : (R('DECOR'), w));
    if (/(?:\p{Extended_Pictographic}|[\ue000-\uf8ff])\uFE0F?\s?(?:\p{Extended_Pictographic}|[\ue000-\uf8ff])/u.test(s)) flags.add('連續多個不同圖示，需要人工判讀');
    // 「100s」讀 hundreds、「0.1s」讀 0 point ones（使用者 2026-11-13 同意 5s 讀 fives 這一類全部照錄）
    s = s.replace(/\b(100|1000)s\b/g, (m, n) => { R('PLNUM'); return n === '100' ? 'hundreds' : 'thousands'; }).replace(/\b(\d+)\.(\d)s\b/g, (m, a, d) => { R('PLNUM'); R('DEC'); const w = ONES[+d]; return a + ' point ' + (w === 'six' ? 'sixes' : w + 's'); });
    // 「= ? m」「= ? s」：問號後面接單位時讀 how many …（不能只讀 what? 再接一個字母）
    { const UW = { cm: 'centimeters', km: 'kilometers', kg: 'kilograms', mL: 'milliliters', ml: 'milliliters', mm: 'millimeters', m: 'meters', g: 'grams', L: 'liters', s: 'seconds', min: 'minutes', h: 'hours' };
      s = s.replace(/=\s*[?]\s*(cm|km|kg|mL|ml|mm|min|m|g|L|s|h)\b(?![a-z²³\/])/g, (m, u) => { R('WHAT'); R('UNIT'); return '= how many ' + UW[u]; });
      s = s.replace(/=\s*[?]\s*°/g, () => { R('WHAT'); R('DEG'); return '= how many degrees'; });
      s = s.replace(/=\s*[?]\s+(?=[a-z]{3,})/g, () => { R('WHAT'); return '= how many '; });
      s = s.replace(/(\d+(?:\.\d+)?)\s*min\b/g, (m, n) => { R('UNIT'); return n + (+n === 1 ? ' minute' : ' minutes'); }).replace(/(\d+(?:\.\d+)?)\s+s\b(?!')/g, (m, n) => { R('UNIT'); return n + (+n === 1 ? ' second' : ' seconds'); }).replace(/(\d+(?:\.\d+)?)\s+h\b/g, (m, n) => { R('UNIT'); return n + (+n === 1 ? ' hour' : ' hours'); }); }
    // 名詞後面的插圖（a can 🥫、a fan 🪭）：前面已經有名稱，圖示不讀
    s = s.replace(/(\b(?!the\b|with\b|than\b|more\b|and\b)[a-z]{3,})\s+(?:\p{Extended_Pictographic}|[-])️?(?=\s*([?.,;:)]|$|and\b|all\b|are\b|look\b|into\b|about\b|sha))/gu, (m, w) => { R('DECOR'); return w; });
    // ---- 圖示：當作詞用的讀出名稱，裝飾用的略過
    const E = '(\\p{Extended_Pictographic}|[\\ue000-\\uf8ff])';
    const nm = (e, pl) => { const x = NAME[e]; if (!x) return null; return pl ? x[1] : x[0]; };
    if (/\p{Extended_Pictographic}|[-]/u.test(s)) {
      s = s.replace(/(Where is)\s*💎/gu, (m, a) => { R('ICON'); return a + ' the gem'; });
      s = s.replace(/🧑‍🍳|[🔎📅💎🔊🍯🍋💧✂]/gu, ' ').replace(/👍/gu, () => { R('MARKS'); return 'thumbs up'; }).replace(/👎/gu, () => { R('MARKS'); return 'thumbs down'; });
      s = s.replace(/🎯\s*(?=[Tt]arget)/gu, ' ').replace(/🎯/gu, ' target ').replace(/🐷(?=\s*\d+\s*dollars|\s*\$)/gu, ', piggy bank ');
      s = s.replace(/→\s*🔺\s*\?/gu, () => { R('ICON'); return ', can they make a triangle?'; });
      s = s.replace(new RegExp('P\\(\\s*' + E + '\\s*\\)', 'gu'), (m, e) => COLOR[e] ? (R('ICON'), R('PROB'), 'the probability of ' + COLOR[e]) : m);
      s = s.replace(new RegExp(E + '\\s*×\\s*(\\d+)', 'gu'), (m, e, n) => nm(e) ? (R('ICON'), n + ' ' + nm(e, +n !== 1)) : m);
      s = s.replace(new RegExp('(\\d+)\\s*' + E, 'gu'), (m, n, e) => nm(e) ? (R('ICON'), n + ' ' + nm(e, +n !== 1)) : m);
      s = s.replace(new RegExp('\\b(One|one|a|an|each)\\s+' + E, 'gu'), (m, a, e) => nm(e) ? (R('ICON'), a + ' ' + nm(e)) : m);
      s = s.replace(new RegExp(E + '(?=\\s*\\d+\\s*kg each)', 'gu'), (m, e) => nm(e) ? (R('ICON'), nm(e, true)) : m);
      s = s.replace(new RegExp('(^|[;.=+]\\s*)' + E + '(?=\\s*([+=;]|$))', 'gu'), (m, a, e) => nm(e) ? (R('ICON'), a + '1 ' + nm(e)) : m);   // 算式裡單獨一個圖示：1 個
      s = s.replace(new RegExp('(^|[.!?]\\s+)' + E + '(?=\\s+[a-z])', 'gu'), (m, a, e) => nm(e) ? (R('ICON'), a + 'The ' + nm(e)) : m);       // 句首當主詞
      s = s.replace(new RegExp(E, 'gu'), (m, e) => COLOR[e] ? (R('ICON'), COLOR[e]) : !nm(e) ? m : (R('ICON'), FOOD.has(e) ? nm(e, true) : 'the ' + nm(e)));
      if (/\p{Extended_Pictographic}|[-]/u.test(s)) flags.add('有圖示沒有名稱：' + [...new Set(s.match(/\p{Extended_Pictographic}|[-]/gu))].join(' '));
    }
    // ---- 題目裡的問號與箭頭
    s = s.replace(/^\s*\??\s*=\s*how many degrees\?\s*$/i, () => { R('QMARK'); return 'The angle with the question mark is how many degrees?'; });
    s = s.replace(/^\s*\?\s*=/, () => { R('QMARK'); return 'the question mark ='; }).replace(/=\s*[?？]/g, '= what?').replace(/([,，]\s*)[?？](?=\s*$)/, '$1what?').replace(/\s*→\s*/g, () => { R('ARROW'); return ', then '; }).replace(/\s*○\s*/g, () => { R('BLANK'); return ' blank '; });
    // ---- 說明文字裡的符號
    s = s.replace(/>\s*,\s*<\s*(,|or)\s*=/g, () => { R('CMPLIST'); return 'greater than, less than, or equal to'; });
    s = s.replace(/(\d|\u0002)\s*>\s*(?=\d)/g, (m, a) => { R('GT'); return a + ' is greater than '; }).replace(/(\d|\u0002)\s*<\s*(?=\d)/g, (m, a) => { R('LT'); return a + ' is less than '; });
    s = s.replace(/\b(the|a|an) the\b/gi, '$1').replace(/(\S)\s+[?？]\s+(?=\S)/g, (m, a) => { R('BLANK'); return a + ' blank '; });
    s = s.replace(/[-]/g, ' ').replace(/[\p{Extended_Pictographic}‍]/gu, ' ').replace(/[，；]/g, m => m === '，' ? ', ' : '; ').replace(/。/g, '. ').replace(/[“”]/g, '"').replace(/\s*[—]\s*/g, ', ').replace(/\s+/g, ' ').trim();
    const raw0 = s;
    // 圖片被去掉後留下的空洞
    if (/\(\s*\)|(^|[\s(])[+×=÷]\s*[=+;.]|\b(One|Each|Which|The)\s+\?/.test(s)) flags.add('句中的圖示沒有文字，讀出來不完整');
    // 整句是英文數字單字
    if (/^[A-Za-z\- ]+$/.test(s)) { const n = words2num(s); if (n != null && n >= 20 && /(hundred|thousand|million|ty\b|ty-)/i.test(s)) { R('NUMWORDS'); if (n > 9999) R('BIGNUM'); s = n > 9999 ? bigNum(n) : String(n); } }
    s = s.replace(/(\d),(?=\d{3}\b)/g, '$1');
    // 日期（句子明顯在談日期時）
    if (/\d+\/\d+/.test(s) && /\b(days? later|in \d+ days|From \d+\/\d+ to|Today|date|month|week)\b/.test(s)) { s = s.replace(/\b(\d{1,2})\/(\d{1,2})\b/g, (m, a, b) => MONTHS[+a] ? (R('DATE'), MONTHS[+a] + ' ' + M('o', +b)) : m); }
    // 時間
    s = s.replace(/\b(\d{1,2}):(\d{2})\b/g, (m, h, mm) => { R('TIME'); return +mm === 0 ? h + " o'clock" : +mm < 10 ? h + ' ' + M('z', +mm) : h + ' ' + (+mm); });
    // 比
    s = s.replace(/(\S)\s+:\s+(?=\S)/g, (m, a) => { R('RATIO'); return a + ' to '; });
    // 範圍
    s = s.replace(/(\d)\s*[–~～]\s*(?=\d)/g, (m, a) => { R('RANGE'); return a + ' to '; });
    // 金額
    const dol = n => (+n === 1 ? 'dollar' : 'dollars');
    s = s.replace(/\$\s*(\d+(?:\.\d+)?)\s*\/\s*km/g, (m, n) => { R('MONEY'); R('PERKM'); return n + ' ' + dol(n) + ' per kilometer'; });
    s = s.replace(/\$\s*(\d+(?:\.\d+)?)/g, (m, n) => { R('MONEY'); return n + ' ' + dol(n); });
    s = s.replace(/(\d)\s*%/g, (m, a) => { R('PCT'); return a + ' percent'; });
    s = s.replace(/(\d+(?:\.\d+)?)\s*°/g, (m, n) => { R('DEG'); return n + (+n === 1 ? ' degree' : ' degrees'); }).replace(/°/g, () => { R('DEG'); return ' degrees'; });
    // 單位
    const unitWord = (u, n) => UNITS[u][n != null && +n === 1 ? 0 : 1];
    const den = (n, pl) => M('d', n, pl ? 1 : 0);
    // t 只有在「數字 t =」的句型才當作公噸，其餘視為變數
    s = s.replace(/^(\d+(?:\.\d+)?)\s*t(?=\s*=)/, (m, n) => { R('UNIT'); return n + ' ' + unitWord('t', n); });
    // 分數後面接單位：先處理，避免分母被當成一般數字
    s = s.replace(/(\d+)\s+(\d+)\/(\d+)\s*(cm|km|kg|mL|mm|m|g|L)\b(?![a-z²³])/g, (m, w, a, b, u) => { R('MIXED'); R(+b === 2 ? 'HALF' : 'FRAC'); R('UNIT'); return w + ' and ' + a + ' ' + den(+b, +a > 1) + ' ' + UNITS[u][1]; });
    s = s.replace(/(\d+)\/(\d+)\s*(cm|km|kg|mL|mm|m|g|L)\b(?![a-z²³])/g, (m, a, b, u) => { R(+b === 2 ? 'HALF' : 'FRAC'); R('UNIT'); return a + ' ' + den(+b, +a > 1) + ' of a ' + UNITS[u][0]; });
    s = s.replace(/(\d+(?:\.\d+)?)?\s*\b(cm|km|mm|m)([²³])/g, (m, n, u, e) => { R(e === '²' ? 'AREA' : 'VOL'); return (n != null ? n + ' ' : ' ') + (e === '²' ? 'square ' : 'cubic ') + unitWord(u, n); });
    // 尺寸的 ×
    s = s.replace(/(\d+)\s*×\s*(\d+)(?:\s*×\s*(\d+))?(?=\s*(cm|m|km|mm|box|grid|array|rectangle|tiles?)\b)/g, (m, a, b, c) => { R('BY'); return a + ' by ' + b + (c ? ' by ' + c : ''); });
    s = s.replace(/(\d+(?:\.\d+)?|\u0002)\s*(cm|km|kg|mL|mm|m|g|L)\b(?![a-z²³])/g, (m, n, u) => { R('UNIT'); return n + ' ' + unitWord(u, /\d/.test(n) ? n : null); });
    // 分數
    s = s.replace(/(\d+)\s+(\d+)\/(\d+)/g, (m, w, a, b) => { R('MIXED'); R(+b === 2 ? 'HALF' : 'FRAC'); return w + ' and ' + a + ' ' + den(+b, +a > 1); });
    s = s.replace(/(\d+)\/(\d+)/g, (m, a, b) => { R(+b === 2 ? 'HALF' : 'FRAC'); return a + ' ' + den(+b, +a > 1); });
    // 次方與括號
    s = s.replace(/\(([^()]+)\)\s*²/g, (m, x) => { R('QTY'); R('SQ'); return ' the quantity ' + x + ', squared '; });
    s = s.replace(/([A-Za-z0-9])²/g, (m, a) => { R('SQ'); return a + ' squared'; }).replace(/([A-Za-z0-9])³/g, (m, a) => { R('CUBE'); return a + ' cubed'; });
    s = s.replace(/(\d|\b[a-z])\(([^()]*[+−×÷-][^()]*)\)/g, (m, a, x) => { R('QTY'); return a + ' times the quantity ' + x + ','; });
    s = s.replace(/\s*\(([^()]*)\)/g, (m, x) => (/[+−×÷=]/.test(x) ? m : ', ' + x + ','));
    s = s.replace(/\(([^()]*[+−×÷-][^()]*)\)/g, (m, x) => { R('QTY'); return ' the quantity ' + x + ','; });
    // 負號與減號（頁面有時已把 − 換成 minus）
    s = s.replace(/(^|[,:=(]\s*|\b(?:times|plus|minus|by|quantity|and|or|is|are|to|than|of|from|between)\s+)(?:−|-|minus\s)\s*(?=[\dA-Za-z(])/g, (m, a) => { R('NEG'); return a + 'negative '; });
    s = s.replace(/\s*[−]\s*/g, () => { R('MINUS'); return ' minus '; }).replace(/(\d|\))\s+-\s+(?=\d|\()/g, (m, a) => { R('MINUS'); return a + ' minus '; });
    s = s.replace(/\s*\+\s*/g, () => { R('PLUS'); return ' plus '; }).replace(/\s*×\s*/g, () => { R('TIMES'); return ' times '; }).replace(/\s*÷\s*/g, () => { R('DIV'); return ' divided by '; });
    s = s.replace(/\s*=\s*what\?/gi, () => { R('EQ'); R('WHAT'); return ' equals what?'; }).replace(/\s*=\s*/g, () => { R('EQ'); return ' equals '; });
    // 序數
    s = s.replace(/\b(\d+)(st|nd|rd|th)\b/g, (m, n) => { R('ORD'); return M('o', +n); });
    // 三角、角
    s = s.replace(/\bsin\b/g, () => { R('TRIG'); return 'sine'; }).replace(/\bcos\b/g, () => { R('TRIG'); return 'cosine'; }).replace(/\btan\b/g, () => { R('TRIG'); return 'tangent'; }).replace(/θ/g, () => { R('THETA'); return ' theta'; });
    s = s.replace(/∠\s*([A-Z0-9]+)/g, (m, a) => { R('ANGLE'); return 'angle ' + a.split('').join(' '); });
    // 係數、變數、字母
    s = s.replace(/\b(\d{1,2})s\b/g, (m, n) => { const w = +n < 20 ? ONES[+n] : (+n % 10 ? null : TENS[+n / 10]); if (!w) return m; R('PLNUM'); return w === 'six' ? 'sixes' : w.replace(/y$/, 'ie') + 's'; });
    s = s.replace(/(\d)([a-rt-z])\b/g, (m, a, b) => { R('COEF'); R('VAR'); return a + ' ' + b; });
    s = s.replace(/\b(km|cm|kg|mL)\b(?=\s*[?.,!]|\s+of\b|$)/g, (m, u) => { R('UNIT'); return UNITS[u][1]; });
    s = s.replace(/\b([A-Z]{2,4})\b/g, (m, a) => (/^(AM|PM|OK|DINO|AI)$/.test(a) ? a : (R('LETTERS'), a.split('').join(' '))));
    if (/(?<!')\b[b-hj-z]\b(?!')/.test(s)) R('VAR');
    // 小數
    s = s.replace(/(\d+)\.(\d+)/g, (m, a, b) => { R('DEC'); return a + ' point ' + b.split('').join(' '); });
    // 一萬以上
    s = s.replace(/\b\d{5,}\b/g, m => { R('BIGNUM'); return bigNum(+m); });
    s = s.replace(/…+|\.{3,}/g, () => { R('ELL'); return ', '; });
    s = s.replace(/\s+,/g, ',').replace(/,\s*,/g, ',').replace(/,\s*;/g, ';').replace(/,(?=[A-Za-z])/g, ', ').replace(/,\s*([.?!])/g, '$1').replace(/\s+/g, ' ').trim();
    const left = s.replace(/[\u0001\u0002]/g, '').match(/[^A-Za-z0-9\s.,!?;:'"()\-]/g);
    if (left) flags.add('還有規則沒涵蓋的符號：' + [...new Set(left)].join(' '));
    if (!/[A-Za-z0-9]/.test(s.replace(/\u0001[^\u0002]*\u0002/g, '1'))) flags.add('沒有可讀的內容');
    // 切成片段
    const tokens = [];
    for (const part of s.split(/(\u0001[^\u0002]*\u0002|\d+)/)) {
      if (!part) continue;
      if (/^\d+$/.test(part)) { tokens.push({ k: 'n', n: +part }); continue; }
      const m = part.match(/^\u0001(\w):(\d+)(?::(\d))?\u0002$/);
      if (m) { tokens.push(m[1] === 'd' ? { k: 'd', n: +m[2], p: m[3] === '1' } : { k: m[1], n: +m[2] }); continue; }
      const t = part.replace(/\s+/g, ' ').trim(); if (t && /[A-Za-z]/.test(t)) tokens.push({ k: 't', s: t }); else if (t && tokens.length) tokens.push({ k: 'p', s: t });
    }
    return { tokens, rules: [...rules], flags: [...flags], raw: raw0 };
  }
  // 把片段還原成給語音引擎讀的文字（整句錄製或試聽用）
  const ordWord = n => { const sp = { 1: 'first', 2: 'second', 3: 'third', 5: 'fifth', 8: 'eighth', 9: 'ninth', 12: 'twelfth' }; if (sp[n]) return sp[n]; if (n < 20) return ONES[n] + 'th'; if (n < 100) { const t = Math.floor(n / 10), o = n % 10; return o ? TENS[t] + '-' + ordWord(o) : TENS[t].replace(/y$/, 'ieth'); } return n + 'th'; };
  const denWord = (n, p) => n === 2 ? (p ? 'halves' : 'half') : ordWord(n) + (p ? 's' : '');
  const tokenText = t => t.k === 't' || t.k === 'p' ? t.s : t.k === 'n' ? String(t.n) : t.k === 'o' ? ordWord(t.n) : t.k === 'd' ? denWord(t.n, t.p) : t.k === 'z' ? 'oh ' + t.n : '';
  const render = tokens => tokens.map(tokenText).join(' ').replace(/\s+([,.?!;:])/g, '$1').replace(/\s+/g, ' ').trim();
  /* ---- 查找與拼接：頁面播放與錄音程式共用 ----
   * 音檔索引的鍵：
   *   en|顯示句子      整句（固定文字）
   *   enf|片段         遊戲句切出來的文字片段（已依規則轉成要讀的文字）
   *   en|數字          0–9999
   *   eno|n            序數        end|n|s、end|n|p  分母（單、複數）        enz|n  時間的分（oh 5）
   * planKeys(text, has) → { keys: 可播放的鍵陣列（null 表示有缺）, need: 缺的鍵與要錄的文字 }
   *   keys 裡的 null 代表一小段停頓。
   */
  const norm = s => String(s).replace(/\s+/g, ' ').trim();
  function splitSent(s) {
    const ps = norm(s).split(/(?<=[.!?])\s+/).filter(Boolean); const m = [];
    for (const p of ps) { const last = m[m.length - 1]; if (m.length && (/^(\d+|[A-Za-z])\.$/.test(last) || !/[A-Za-z0-9]/.test(last))) m[m.length - 1] += ' ' + p; else m.push(p); }
    return m;
  }
  const PRE = ['Think: ', 'Score: '];
  function tokenKey(t) { return t.k === 't' ? 'enf|' + t.s : t.k === 'n' ? 'en|' + t.n : t.k === 'o' ? 'eno|' + t.n : t.k === 'd' ? 'end|' + t.n + '|' + (t.p ? 'p' : 's') : t.k === 'z' ? 'enz|' + t.n : null; }
  function planKeys(text, has) {
    const keys = [], need = [];
    let s = norm(String(text).replace(/。/g, '. '));
    for (const p of PRE) if (s.startsWith(p)) { const k = 'en|' + p.trim(); if (!has(k)) need.push({ key: k, say: p.trim() }); keys.push(k); s = s.slice(p.length); break; }
    if (s && has('en|' + s)) { keys.push('en|' + s); return { keys: need.length ? null : keys, need }; }
    for (const p of splitSent(s)) {
      if (!/[A-Za-z0-9]/.test(p)) continue;
      if (has('en|' + p)) { keys.push('en|' + p, null); continue; }
      const m = p.match(/^(\d+)\.\s+(.+)$/);     // 「27. Amazing!」這類：數字和後面的句子分開找
      if (m && has('en|' + m[1]) && has('en|' + m[2])) { keys.push('en|' + m[1], null, 'en|' + m[2], null); continue; }
      for (const t of enSpeak(p).tokens) {
        if (t.k === 'p') { keys.push(null); continue; }
        const k = tokenKey(t); if (!k) continue;
        if (!has(k)) need.push({ key: k, say: tokenText(t) });
        keys.push(k);
      }
      keys.push(null);
    }
    return { keys: need.length || !keys.some(Boolean) ? null : keys, need };
  }
  const api = { RULES, enSpeak, render, tokenText, ordWord, denWord, words2num, bigNum, splitSent, planKeys, tokenKey };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.EN_RULES = api;
})(typeof window !== 'undefined' ? window : globalThis);
