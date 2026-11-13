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
    '🐶': ['puppy', 'puppies'], '🐱': ['kitten', 'kittens'], '🐼': ['panda', 'pandas'], '🐢': ['turtle', 'turtles'], '🐿': ['squirrel', 'squirrels'], '🦊': ['fox', 'foxes'], '🐵': ['monkey', 'monkeys'], '🐻': ['bear', 'bears'],
    '🐸': ['frog', 'frogs'], '🐰': ['bunny', 'bunnies'], '🐷': ['piglet', 'piglets'], '🏆': ['trophy', 'trophies'], '🗝': ['key', 'keys'], '🪙': ['coin', 'coins'], '👑': ['crown', 'crowns'], '🔺': ['triangle', 'triangles'] };
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
    if (/\(\s*\)|(^|[\s(])[+×=÷]\s*[=+;.]|^\s*[×+=]|\b(One|Each|Which|The)\s+\?/.test(s)) flags.add('句中的圖示沒有文字，讀出來不完整');
    // 整句是英文數字單字
    if (/^[A-Za-z\- ]+$/.test(s)) { const n = words2num(s); if (n != null && n >= 20 && /(hundred|thousand|million|ty\b|ty-)/i.test(s)) { R('NUMWORDS'); if (n > 9999) R('BIGNUM'); s = n > 9999 ? bigNum(n) : String(n); } }
    s = s.replace(/(\d),(?=\d{3}\b)/g, '$1');
    // 日期（句子明顯在談日期時）
    if (/\d+\/\d+/.test(s) && /\b(days?|From|Today|date|month|week)\b/i.test(s)) { s = s.replace(/\b(\d{1,2})\/(\d{1,2})\b/g, (m, a, b) => MONTHS[+a] ? (R('DATE'), MONTHS[+a] + ' ' + M('o', +b)) : m); }
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
    s = s.replace(/(^|[,:=(]\s*|\b(?:times|plus|minus|by|quantity)\s+)(?:−|-|minus\s)\s*(?=[\dA-Za-z(])/g, (m, a) => { R('NEG'); return a + 'negative '; });
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
    s = s.replace(/\s+,/g, ',').replace(/,\s*,/g, ',').replace(/,\s*([.?!])/g, '$1').replace(/\s+/g, ' ').trim();
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
