/* =====================================================
   AI Bee Pollination Agent - script.js
   Plain vanilla JS. No libraries.

   WHERE TO EDIT:
   - TERMS   : tooltip text for every English term chip
   - PHASES  : the content of the 8 phases
   - STRATS / FLOWERS / OBST : the scripted demo (routes, flowers, obstacles)
   - Team member names: in index.html, search for "الأعضاء: ........"
   ===================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noHover = function () { return window.matchMedia && window.matchMedia('(hover: none)').matches; };
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* =====================================================
     1) DATA  (EDIT HERE)
     ===================================================== */

  // One-line Egyptian Arabic explanation for each term chip.
  var TERMS = {
    'Agent': 'الكيان اللي بياخد القرارات ويتحرك في البيئة. هنا هو النحلة.',
    'Environment': 'العالم اللي الـ Agent عايش فيه. هنا هو الجنينة بكل اللي فيها.',
    'State': 'وصف للموقف الحالي: النحلة فين، طاقتها كام، وإيه الورود اللي اتزارت.',
    'Action': 'أي حاجة الـ Agent يقدر يعملها، زي حركة لخانة جنبه أو اختيار الوردة الجاية.',
    'Reward': 'الرقم اللي بيقول للـ Agent عمل كويس ولا وحش. هنا النكتار ناقص تكلفة المشي.',
    'Cost': 'التمن اللي بندفعه عشان نعمل حركة. هنا هو الطاقة المصروفة.',
    'Grid': 'خريطة على شكل مربعات (صفوف وأعمدة). الجنينة بتتمثل بيها.',
    'Garden Simulation': 'المحاكاة نفسها: الجنينة والخلية والورود والعوائق والنحلة وهي بتتحرك.',
    'Graph': 'نقط (Nodes) موصلة بخطوط (Edges). كل خانة في الـ Grid هي Node.',
    'State Space': 'كل الحالات الممكنة اللي المشكلة ممكن تمر بيها.',
    'Energy Model': 'القاعدة اللي بتحدد الطاقة بتنقص إزاي مع كل حركة.',
    'Search': 'إننا ندوّر على مسار أو حل من بين حلول كتيرة.',
    'Optimization': 'إننا ندوّر على أحسن حل ممكن حسب معيار معين (هنا أكبر نكتار).',
    'Reinforcement Learning': 'تعلم بالتجربة: الـ Agent بيجرب وياخد مكافأة أو عقاب لحد ما يتحسن.',
    'UCS': 'Uniform Cost Search: بحث بيوسّع دايمًا أرخص مسار لحد دلوقتي، وبيضمن أقل تكلفة من غير تخمين.',
    'A*': 'زي UCS بس بيستخدم تقدير للمسافة المتبقية (Heuristic) فبيوصل أسرع.',
    'Heuristic': 'تخمين ذكي لتكلفة الباقي لحد الهدف.',
    'Admissible heuristic': 'تخمين عمره ما بيبالغ في التكلفة الحقيقية، وده اللي بيضمن إن A* يطلّع أحسن مسار.',
    'Manhattan distance': 'المسافة بالعد: فرق الصفوف + فرق الأعمدة، من غير حركة قُطرية.',
    'Priority Queue': 'طابور بيطلّع العنصر الأقل تكلفة الأول.',
    'Frontier': 'الخانات اللي اكتشفناها ولسه ما زرناهاش.',
    'Explored set': 'الخانات اللي خلصنا منها عشان منرجعلهاش تاني.',
    'Expanded Nodes': 'عدد العقد اللي الخوارزمية فتحتها. كل ما يقل، البحث أذكى.',
    'Graph Search': 'بحث على Graph مع تتبع اللي اتزار عشان منلفش في دايرة.',
    'Distance Matrix': 'جدول فيه المسافة الحقيقية بين كل نقطتين (الخلية والورود). بيتحسب مرة ويتستخدم كتير.',
    'Greedy': 'كل مرة بتاخد أحسن اختيار قدامك دلوقتي من غير تفكير في الصورة الكبيرة.',
    'Metrics': 'المقاييس اللي بنقيس بيها الأداء ونقارن بيها.',
    'Q-Learning': 'خوارزمية Reinforcement Learning بتحفظ قيمة كل Action في كل State جوه جدول.',
    'Q-Table': 'جدول بيخزن قيمة كل Action في كل State، وبيتحدّث مع التدريب.',
    'Episode': 'محاولة كاملة من أول الخلية لحد ما تخلص (رجوع أو نفاد الطاقة).',
    'Epsilon-Greedy': 'غالبًا نختار أحسن Action معروف، وأحيانًا نجرب حاجة عشوائية عشان نكتشف.',
    'MDP': 'Markov Decision Process: الإطار الرياضي لمشاكل التعلم بالتجربة (State, Action, Reward).',
    'Bellman equation': 'المعادلة اللي بتحدّث قيمة الـ Action: المكافأة دلوقتي + قيمة أحسن حاجة جاية.',
    'alpha': 'Learning rate: سرعة التعلم. كبير = بيصدق التجربة الجديدة بسرعة، صغير = بيتعلم بالراحة.',
    'gamma': 'Discount factor: بيحدد أهمية المكافآت المستقبلية مقارنة بالمكافأة الحالية.',
    'Exploration vs Exploitation': 'نجرب حاجة جديدة (Exploration) ولا نستغل أحسن حاجة عارفينها (Exploitation).',
    'Cumulative Reward': 'مجموع الـ Reward اللي النحلة خدته في Episode كامل.',
    'Learning Curve': 'رسم بيوضح الأداء بيتحسن إزاي مع التدريب.',
    'Learning Curves': 'رسومات بتوضح الأداء بيتحسن إزاي مع التدريب (غالبًا Cumulative Reward لكل Episode).',
    'Moving Average': 'متوسط آخر كام قيمة. بيهدّي الدوشة في الرسم ويبيّن الاتجاه العام.',
    'Genetic Algorithm': 'خوارزمية مستوحاة من الوراثة: حلول بتتزاوج وتتحور والأقوى بيكمل.',
    'Hill Climbing': 'نبدأ بحل ونحسّنه بتغييرات صغيرة طول ما فيه تحسن.',
    'Local Search': 'بحث بيتحرك من حل لحل قريب منه بدل ما يدوّر على كل الحلول.',
    'Neighbor': 'حل شبه الحل الحالي بتغيير بسيط (زي تبديل وردتين).',
    'Local Optimum': 'حل أحسن من كل جيرانه، بس مش بالضرورة أحسن حل في الدنيا.',
    'Population': 'مجموعة الحلول اللي الـ Genetic Algorithm شغال عليها في نفس الوقت.',
    'Chromosome': 'تمثيل حل واحد. هنا ترتيب زيارة الورود.',
    'Fitness': 'درجة جودة الحل. هنا إجمالي النكتار مع احترام حد الطاقة.',
    'Selection': 'اختيار الحلول الأحسن عشان تبقى الأبوين للجيل الجاي.',
    'Crossover': 'دمج جزء من حل مع جزء من حل تاني عشان نطلّع حل جديد.',
    'Order Crossover': 'نوع Crossover مناسب للترتيبات، بيحافظ إن كل وردة تظهر مرة واحدة بس.',
    'Mutation': 'تغيير عشوائي بسيط في الحل، زي تبديل وردتين، عشان نكتشف حلول جديدة.',
    'Elitism': 'أحسن حلول في الجيل بتعدي للجيل الجاي زي ما هي عشان منخسرهاش.',
    'Search-Based': 'الاستراتيجية اللي بتعتمد على البحث (UCS و A*) وقرار Greedy فوقهم.',
    'Learning-Based': 'الاستراتيجية اللي النحلة بتتعلمها بالتجربة (Q-Learning).',
    'Optimized': 'الاستراتيجية اللي بتدوّر على أحسن ترتيب للورود (GA أو Hill Climbing).',
    'Strategy Comparison': 'نقارن العقول التلاتة على نفس الخرائط والظروف.',
    'Evaluation': 'قياس الأداء بمقاييس واضحة عشان نعرف مين الأحسن.',
    'Visualization': 'عرض مرئي لحركة النحلة والمسارات والطاقة والرسومات.',
    'Total Nectar Collected': 'إجمالي النكتار اللي النحلة جمعته.',
    'Travel Distance': 'عدد الخطوات اللي النحلة مشيتها.',
    'Energy Consumption': 'الطاقة اللي اتصرفت (خطوة = 1 طاقة).',
    'Successful Hive Returns': 'عدد المرات اللي النحلة رجعت فيها للخلية قبل ما الطاقة تخلص.',
    'Execution Time': 'الوقت اللي الخوارزمية أخدته عشان تشتغل.',
    'Seed': 'رقم ثابت للـ random، بيخلّينا نجيب نفس الخريطة ونكرر نفس التجربة.',
    'Debugging': 'البحث عن الأخطاء في الكود وتصليحها.',
    'Code Freeze': 'وقت بنوقف فيه إضافة ميزات جديدة ونركز على التجميع والاختبار.',
    'Git': 'نظام بيحفظ نسخ الكود ويخلّي الفريق يشتغل مع بعض من غير ما يمسح شغل بعض.',
    'venv': 'بيئة Python معزولة بمكتباتها، عشان الفريق كله يشتغل بنفس الإصدارات.',
    'OOP': 'البرمجة الكائنية: نقسّم الكود لـ classes زي Garden و Flower و Bee.',
    'heapq': 'مكتبة Python جاهزة بتعمل Priority Queue.',
    'numpy': 'مكتبة Python للمصفوفات والحسابات السريعة.',
    'pandas': 'مكتبة Python للجداول والتحليل، مناسبة لجدول المقارنة.',
    'Pygame': 'مكتبة Python لعمل ألعاب ومحاكاة بحركة.',
    'Matplotlib': 'مكتبة Python لرسم الرسومات البيانية.',
    'Streamlit': 'مكتبة Python بتعمل واجهة ويب تفاعلية بكود قليل.',
    'time.perf_counter': 'دالة Python بتقيس الوقت بدقة عالية.'
  };

  // The 8 phases. Use [[Term]] to make a term chip. Edit the text freely.
  var PHASES = [
    {
      title: 'Setup والتخطيط', label: 'Setup',
      todo: 'Repo على GitHub، بيئة Python، هيكل مجلدات، ونتفق على قواعد الجنينة وتوزيع المهام.',
      theory: ['يعني إيه [[Agent]] و [[Environment]] و [[State]] و [[Action]] و [[Cost]]'],
      code: ['[[Git]]/GitHub basics', 'Python virtual environment ([[venv]])', 'تقسيم الكود لـ modules', 'أساسيات [[OOP]]'],
      out: 'Repo جاهز + قواعد متكتوبة + مهام متوزعة.',
      dep: 'مفيش، دي البداية.'
    },
    {
      title: 'بناء البيئة (Garden Environment)', label: 'Environment',
      todo: 'الجنينة نفسها بالقواعد المتفق عليها.',
      theory: ['الـ [[Grid]] كـ [[Graph]]', '[[State Space]]', '[[Energy Model]]'],
      code: ['classes: Garden, Flower, Bee', 'قوائم 2D أو [[numpy]]', 'Random generation مع [[Seed|seed]]', 'طباعة الخريطة', 'دوال get_neighbors و step_cost'],
      out: 'خريطة بتتطبع وتشتغل + دوال جاهزة للباقي.',
      dep: 'Phase 0. وكل الباقي بيعتمد عليها، فنطلّع نسخة v1 بسيطة بسرعة (3-4 أيام) وبعدين نحسنها.'
    },
    {
      title: 'UCS و A*', label: 'UCS + A*',
      todo: 'هنبني خوارزميتي [[UCS]] و [[A*]] وبعدين نبني بيهم الـ [[Distance Matrix]].',
      theory: ['[[Graph Search]]', '[[Frontier]] / [[Explored set]]', '[[Priority Queue]]', '[[UCS]]', '[[Heuristic]] ([[Manhattan distance]])', '[[Admissible heuristic]]', 'f = g + h'],
      code: ['[[heapq]]', 'حفظ الـ parent لاسترجاع المسار', 'عد العقد اللي اتزارت ([[Expanded Nodes]]) للمقارنة بين [[UCS]] و [[A*]]', 'بناء [[Distance Matrix]]'],
      out: 'دالة بترجع (path, cost) بين أي نقطتين.',
      dep: 'Phase 1.'
    },
    {
      title: 'Search-Based Strategy (الـ Baseline)', label: 'Baseline',
      todo: 'أول استراتيجية كاملة: النحلة تختار الوردة الجاية بأسلوب [[Greedy]] وتتأكد إن الطاقة تكفي للرجوع.',
      theory: ['[[Greedy]] approach (أقرب وردة أو أعلى نكتار نسبة للتكلفة)', 'شرط إن الطاقة تكفي للرجوع للخلية'],
      code: ['لوب القرار', 'فحص "أقدر أروح وأرجع؟"', 'تجميع الـ [[Metrics]]'],
      out: 'أول استراتيجية كاملة + نظام تسجيل Metrics هنستخدمه مع الباقي.',
      dep: 'Phase 2.'
    },
    {
      title: 'Optimization (Genetic Algorithm أو Hill Climbing)', label: 'Optimization',
      todo: 'ندوّر على أحسن ترتيب لزيارة الورود، أحسن من الـ [[Greedy]].',
      theory: [
        '[[Hill Climbing]]: [[Local Search]], [[Neighbor]], [[Local Optimum]]',
        '[[Genetic Algorithm]]: [[Population]], [[Chromosome]] (ترتيب الورود), [[Fitness]], [[Selection]], [[Crossover]] (مناسب للترتيب زي [[Order Crossover]]), [[Mutation]] (Swap), [[Elitism]]',
        'التعامل مع الحلول اللي بتعدي حد الطاقة'
      ],
      code: ['random و Permutations', 'Fitness function بتستخدم [[Distance Matrix]]', 'رسم تقارب الحل عبر الأجيال'],
      out: 'ترتيب زيارة أحسن من الـ Greedy.',
      dep: 'Phase 2 (ممكن نبدأ بمسافة Manhattan مؤقتة ونوصل Distance Matrix لما يجهز).'
    },
    {
      title: 'Q-Learning', label: 'Q-Learning',
      todo: 'ندرّب النحلة بـ [[Q-Learning]] تختار الوردة الجاية حسب النكتار وتكلفة المشي والطاقة الباقية.',
      theory: ['[[MDP]]', '[[State]] / [[Action]] / [[Reward]]', '[[Q-Table]]', '[[Bellman equation]]', '[[Epsilon-Greedy]]', 'Learning rate ([[alpha]])', 'Discount factor ([[gamma]])', '[[Exploration vs Exploitation]]'],
      code: ['[[Q-Table]] (dict أو [[numpy]])', 'Training loop', 'تصميم الـ State (مثلا: الوردة الحالية + الطاقة تقريبًا + الورود اللي اتزارت)', 'تصميم الـ Reward', 'تسجيل الـ Reward لكل [[Episode]] و[[Moving Average|متوسط متحرك]]'],
      out: 'نحلة متدربة + [[Learning Curve]].',
      dep: 'Phase 1 (والـ Distance Matrix لو هنستخدمه في التكلفة).',
      warn: 'تنبيه: دي أصعب مرحلة من ناحية التصميم (إزاي نعرّف الـ State والـ Reward). غلطة هنا بتخلي النحلة متتعلمش، فلازم ناخد وقت كفاية.'
    },
    {
      title: 'Visualization والواجهة', label: 'Visualization',
      todo: 'نعمل المحاكاة التفاعلية اللي بتعرض الجنينة والنحلة والمسارات والطاقة.',
      theory: ['مفيش تقريبًا.'],
      code: ['[[Pygame]] أو [[Matplotlib]] أو [[Streamlit]] (الفريق يتفق على واحدة)', 'رسم الـ Grid', 'حركة النحلة', 'رسم المسارات', 'شريط الطاقة', 'رسم Learning Curve'],
      out: 'محاكاة تفاعلية.',
      dep: 'Phase 1 كبداية، وبعدين بتوصل بالباقي. تتعمل بالتوازي مع 2 و 5.'
    },
    {
      title: 'التقييم والمقارنة والتسليم', label: 'Evaluation',
      todo: 'نقارن العقول التلاتة على نفس الخرائط ونجهز التقرير وبروفة الديمو.',
      theory: ['تصميم التجربة: كذا Run على كذا خريطة بـ seeds مختلفة', 'المتوسط والانحراف المعياري'],
      code: ['[[time.perf_counter]] لقياس [[Execution Time]]', '[[pandas]] لجدول المقارنة', 'رسوم المقارنة'],
      out: 'جدول ورسوم مقارنة + تقرير + بروفة الديمو.',
      dep: 'كل المراحل (بس كود الـ Metrics والمقارنة نجهزه بدري).'
    }
  ];

  // Dependency map nodes (vertical layout, mirrored for RTL). cx = center x, y = top.
  var DEP_NODES = [
    { p: 0, cx: 180, y: 8 },
    { p: 1, cx: 180, y: 82 },
    { p: 2, cx: 298, y: 170 },
    { p: 5, cx: 180, y: 170 },
    { p: 6, cx: 62, y: 170 },
    { p: 3, cx: 298, y: 252 },
    { p: 4, cx: 298, y: 334 },
    { p: 7, cx: 180, y: 436 }
  ];
  var DEP_EDGES = [[0, 1], [1, 2], [1, 5], [1, 6], [2, 3], [3, 4], [4, 7], [5, 7], [6, 7]];

  /* ---------- Scripted demo data ---------- */
  var GRID = 10;
  var HIVE = [0, 9];                       // [col, row]
  var OBST = [[3, 2], [3, 3], [3, 4], [4, 4], [6, 6], [6, 7], [7, 6], [2, 7], [5, 1], [8, 3], [1, 6]];
  var FLOWERS = [
    { id: 1, c: 2, r: 5, t: 's', v: 5 },
    { id: 2, c: 5, r: 8, t: 'm', v: 10 },
    { id: 3, c: 8, r: 8, t: 'l', v: 20 },
    { id: 4, c: 6, r: 3, t: 'm', v: 10 },
    { id: 5, c: 9, r: 1, t: 'l', v: 20 },
    { id: 6, c: 1, r: 2, t: 's', v: 5 }
  ];
  // "order" = the scripted visiting order (flower ids). The route between them is drawn around obstacles.
  var STRATS = [
    { name: 'Search-Based', order: [1, 6, 4, 5], time: '0.03 s', returns: '10/10',
      desc: 'الـ [[Greedy]] فوق [[A*]]: كل مرة بتروح لأقرب وردة وتتأكد إن الطاقة تكفي للرجوع. سريع، بس مش بالضرورة أحسن ترتيب.' },
    { name: 'Learning-Based', order: [1, 2, 3, 5], time: '14.8 s', returns: '9/10',
      desc: 'النحلة اتعلمت بالتجربة بعد آلاف الـ [[Episode|Episodes]] ([[Q-Learning]]). ترتيبها أحسن من الـ Greedy، بس التدريب خد وقت وساعات بتغلط.' },
    { name: 'Optimized', order: [2, 3, 5, 4], time: '1.9 s', returns: '10/10',
      desc: 'الـ [[Genetic Algorithm]] أو [[Hill Climbing]] جرّب ترتيبات كتير ودوّر على أحسن واحد. غالبًا بيطلّع أكبر نكتار بأقل مسافة.' }
  ];
  var SPEEDS = { slow: 700, normal: 400, fast: 140 };

  /* =====================================================
     2) TERM CHIPS (markup + tooltip)
     ===================================================== */

  // Turn [[Term]] or [[Term|label]] into a chip. Input is trusted HTML.
  function rich(str) {
    return String(str).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, key, label) {
      return '<span class="term" data-term="' + key + '">' + (label || key) + '</span>';
    });
  }

  // Replace [[...]] found in static page text with chips (text nodes only, safe for SVG).
  function richText(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return n.nodeValue.indexOf('[[') !== -1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var holder = document.createElement('div');
      holder.textContent = n.nodeValue;                 // escape first
      var tpl = document.createElement('template');
      tpl.innerHTML = rich(holder.innerHTML);
      n.parentNode.replaceChild(tpl.content, n);
    });
  }

  // Attach tooltip text (and keyboard access) to chips that have an entry in TERMS.
  function enhanceTerms(root) {
    $$('.term:not([data-ready])', root).forEach(function (el) {
      el.setAttribute('data-ready', '1');
      var key = (el.getAttribute('data-term') || el.textContent).trim();
      var tip = TERMS[key];
      if (tip) {
        el.setAttribute('data-tip', tip);
        el.setAttribute('data-term', key);
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
      } else {
        el.classList.add('no-tip');
      }
    });
  }

  function setupTooltip() {
    var tip = $('#tip');
    var active = null;

    function show(chip) {
      var text = chip.getAttribute('data-tip');
      if (!text) return;
      active = chip;
      tip.textContent = '';
      var k = document.createElement('span');
      k.className = 'tip-k';
      k.textContent = chip.getAttribute('data-term') || chip.textContent;
      tip.appendChild(k);
      tip.appendChild(document.createTextNode(text));
      chip.setAttribute('aria-describedby', 'tip');
      // measure then position (tip is visibility:hidden but laid out)
      var r = chip.getBoundingClientRect();
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var left = r.left + r.width / 2 - tw / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
      var top = r.top - th - 10;
      if (top < 64) top = r.bottom + 10;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      tip.classList.add('show');
    }
    function hide() {
      tip.classList.remove('show');
      if (active) active.removeAttribute('aria-describedby');
      active = null;
    }

    document.addEventListener('mouseover', function (e) {
      var c = e.target.closest && e.target.closest('.term[data-tip]');
      if (c && !noHover()) show(c);
    });
    document.addEventListener('mouseout', function (e) {
      var c = e.target.closest && e.target.closest('.term[data-tip]');
      if (c && c === active && document.activeElement !== c) hide();
    });
    document.addEventListener('focusin', function (e) {
      var c = e.target.closest && e.target.closest('.term[data-tip]');
      if (c) show(c);
    });
    document.addEventListener('focusout', function (e) {
      var c = e.target.closest && e.target.closest('.term[data-tip]');
      if (c === active) hide();
    });
    document.addEventListener('click', function (e) {
      var c = e.target.closest && e.target.closest('.term[data-tip]');
      if (c) {
        // chips inside a label/link/button must not trigger the parent
        if (c.closest('label, a, button')) e.preventDefault();
        if (active === c && noHover()) hide(); else show(c);
      } else {
        hide();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { hide(); return; }
      var c = e.target.closest && e.target.closest('.term[data-tip]');
      if (c && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        show(c);
      }
    });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
  }

  /* =====================================================
     3) PAGE BEHAVIOUR (nav, reveal, accordions, tabs)
     ===================================================== */

  function setupNav() {
    var sections = $$('main > section[data-nav]');
    var links = $$('#navLinks a');
    var lastKey = null;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.innerHeight * 0.3;
      var cur = sections[0];
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= y) cur = s; });
      var key = cur.getAttribute('data-nav');
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + key;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        if (on && key !== lastKey && a.scrollIntoView) a.scrollIntoView({ block: 'nearest', inline: 'center' });
      });
      lastKey = key;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function setupReveal() {
    // stagger children of grids
    $$('.stagger').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (ch, i) {
        ch.classList.add('reveal');
        ch.style.setProperty('--i', i);
      });
    });
    var items = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  function setupAccordions() {
    $$('.acc').forEach(function (acc) {
      var btn = $('.acc-btn', acc);
      btn.addEventListener('click', function () {
        var open = acc.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  // Generic ARIA tabs with keyboard support (arrows, Home, End).
  function setupTabs(list, onSelect) {
    var tabs = $$('[role="tab"]', list);
    function select(i, focus, fromUser) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-selected', j === i ? 'true' : 'false');
        t.tabIndex = j === i ? 0 : -1;
      });
      if (focus) tabs[i].focus();
      onSelect(i, fromUser);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false, true); });
      t.addEventListener('keydown', function (e) {
        var n = null, k = e.key, len = tabs.length;
        if (k === 'ArrowLeft' || k === 'ArrowDown') n = (i + 1) % len;
        else if (k === 'ArrowRight' || k === 'ArrowUp') n = (i - 1 + len) % len;
        else if (k === 'Home') n = 0;
        else if (k === 'End') n = len - 1;
        if (n !== null) { e.preventDefault(); select(n, true, false); }
      });
    });
    return { select: select, tabs: tabs };
  }

  /* =====================================================
     4) PHASES (stepper + panel + dependency map)
     ===================================================== */
  var phaseApi = null;

  function listHtml(items) {
    return '<ul>' + items.map(function (i) { return '<li>' + rich(i) + '</li>'; }).join('') + '</ul>';
  }

  function renderPhase(i) {
    var p = PHASES[i];
    var panel = $('#phasePanel');
    var html =
      '<div class="ph-head"><span class="big" aria-hidden="true">' + i + '</span><h3>Phase ' + i + ': ' + rich(p.title) + '</h3></div>' +
      '<div class="pgrid">' +
      '<div class="pbox"><h4>هنعمل إيه</h4><p>' + rich(p.todo) + '</p></div>' +
      '<div class="pbox"><h4>نذاكر إيه: نظري</h4>' + listHtml(p.theory) + '</div>' +
      '<div class="pbox"><h4>نذاكر إيه: كود</h4>' + listHtml(p.code) + '</div>' +
      '<div class="pbox out"><h4>المخرج</h4><p>' + rich(p.out) + '</p></div>' +
      '<div class="pbox dep"><h4>بتعتمد على</h4><p>' + rich(p.dep) + '</p></div>' +
      '</div>';
    if (p.warn) {
      html += '<div class="warn" role="note"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.1"/></svg><p>' + rich(p.warn) + '</p></div>';
    }
    panel.innerHTML = html;
    panel.setAttribute('aria-labelledby', 'tab-' + i);
    enhanceTerms(panel);
    panel.classList.remove('swap');
    void panel.offsetWidth;                 // restart the animation
    panel.classList.add('swap');
    $$('.dnode').forEach(function (n) { n.classList.toggle('active', +n.getAttribute('data-p') === i); });
  }

  function setupPhases() {
    var stepper = $('#stepper');
    stepper.innerHTML = PHASES.map(function (p, i) {
      return '<button type="button" class="step" role="tab" id="tab-' + i + '" aria-controls="phasePanel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
        '<span class="num">' + i + '</span><span class="lbl">' + p.label + '</span></button>';
    }).join('');

    phaseApi = setupTabs(stepper, function (i, fromUser) {
      renderPhase(i);
      // on phones the stepper is a tall vertical list, so bring the panel into view
      if (fromUser && window.matchMedia('(max-width: 760px)').matches) {
        $('#phasePanel').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
    renderPhase(0);
    buildDepMap();

    // phase badges inside team cards
    $$('.pbadge').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openPhase(+a.getAttribute('data-phase'));
      });
    });
  }

  function openPhase(i) {
    phaseApi.select(i, false, false);
    var target = window.matchMedia('(max-width: 760px)').matches ? $('#phasePanel') : $('#stepper');
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function svgEl(name, attrs, parent) {
    var e = document.createElementNS(SVGNS, name);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function buildDepMap() {
    var host = $('#depmap');
    var W = 106, H = 46;
    var svg = svgEl('svg', { viewBox: '0 0 360 490', role: 'group', 'aria-label': 'خريطة اعتماد المراحل على بعض. اضغطوا على أي مرحلة لفتحها.', lang: 'en' });
    var defs = svgEl('defs', {}, svg);
    var mk = svgEl('marker', { id: 'arr', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
    svgEl('path', { d: 'M0 0L10 5L0 10z', fill: '#8b5e3c' }, mk);

    var byP = {};
    DEP_NODES.forEach(function (n) { byP[n.p] = n; });
    DEP_EDGES.forEach(function (e) {
      var a = byP[e[0]], b = byP[e[1]];
      var x1 = a.cx, y1 = a.y + H, x2 = b.cx, y2 = b.y - 2;
      var my = (y1 + y2) / 2;
      svgEl('path', { class: 'dedge', d: 'M' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + my + ', ' + x2 + ' ' + my + ', ' + x2 + ' ' + y2, 'marker-end': 'url(#arr)' }, svg);
    });

    DEP_NODES.forEach(function (n) {
      var g = svgEl('g', { class: 'dnode', 'data-p': n.p, tabindex: '0', role: 'button', 'aria-label': 'Phase ' + n.p + ': ' + PHASES[n.p].label }, svg);
      svgEl('rect', { x: n.cx - W / 2, y: n.y, width: W, height: H, rx: 12 }, g);
      var t1 = svgEl('text', { class: 't1', x: n.cx, y: n.y + 17, 'text-anchor': 'middle' }, g);
      t1.textContent = 'Phase ' + n.p;
      var t2 = svgEl('text', { class: 't2', x: n.cx, y: n.y + 35, 'text-anchor': 'middle' }, g);
      t2.textContent = PHASES[n.p].label;
      g.addEventListener('click', function () { openPhase(n.p); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhase(n.p); }
      });
    });
    host.appendChild(svg);
    $$('.dnode', host).forEach(function (n) { n.classList.toggle('active', +n.getAttribute('data-p') === 0); });
  }

  /* =====================================================
     5) DEMO (scripted garden animation - NOT a real algorithm)
     ===================================================== */
  var demo = {
    board: null, routes: [], si: 0, idx: 0, next: 0, nectar: 0, playing: false, done: false, timer: null,
    route: null, els: {}
  };

  // Tiny BFS used only to DRAW a route around the obstacles between two scripted stops.
  function bfs(from, to, blocked) {
    var key = function (c, r) { return c + ',' + r; };
    var prev = {}, queue = [from], seen = {};
    seen[key(from[0], from[1])] = true;
    var dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    while (queue.length) {
      var cur = queue.shift();
      if (cur[0] === to[0] && cur[1] === to[1]) break;
      for (var d = 0; d < dirs.length; d++) {
        var nc = cur[0] + dirs[d][0], nr = cur[1] + dirs[d][1];
        if (nc < 0 || nr < 0 || nc >= GRID || nr >= GRID) continue;
        var k = key(nc, nr);
        if (seen[k] || blocked[k]) continue;
        seen[k] = true;
        prev[k] = cur;
        queue.push([nc, nr]);
      }
    }
    var path = [to], p = to;
    while (!(p[0] === from[0] && p[1] === from[1])) {
      p = prev[key(p[0], p[1])];
      if (!p) return [from, to];                    // safety: should not happen
      path.unshift(p);
    }
    return path;
  }

  function flowerById(id) { return FLOWERS.filter(function (f) { return f.id === id; })[0]; }

  function buildRoute(strat) {
    var blocked = {};
    OBST.forEach(function (o) { blocked[o[0] + ',' + o[1]] = true; });
    var cells = [HIVE.slice()], wp = [], cur = HIVE, nectar = 0;
    strat.order.forEach(function (id) {
      var f = flowerById(id);
      var seg = bfs(cur, [f.c, f.r], blocked);
      for (var i = 1; i < seg.length; i++) cells.push(seg[i]);
      wp.push(cells.length - 1);
      nectar += f.v;
      cur = [f.c, f.r];
    });
    var back = bfs(cur, HIVE, blocked);
    for (var j = 1; j < back.length; j++) cells.push(back[j]);
    return { cells: cells, wp: wp, order: strat.order, nectar: nectar, steps: cells.length - 1 };
  }

  function buildBoard() {
    var b = $('#board');
    demo.board = b;
    var e = demo.els;
    for (var r = 0; r < GRID; r++) {
      for (var c = 0; c < GRID; c++) {
        svgEl('rect', { x: c * 10, y: r * 10, width: 10, height: 10, class: (r + c) % 2 ? 'cell-a' : 'cell-b' }, b);
      }
    }
    e.route = svgEl('polyline', { class: 'route' }, b);
    e.trail = svgEl('polyline', { class: 'trail' }, b);
    OBST.forEach(function (o, i) {
      svgEl('use', { href: i % 2 ? '#bush' : '#rock', x: o[0] * 10, y: o[1] * 10, width: 10, height: 10 }, b);
    });
    svgEl('use', { href: '#hive', x: HIVE[0] * 10, y: HIVE[1] * 10, width: 10, height: 10 }, b);

    e.flowers = {};
    FLOWERS.forEach(function (f) {
      var g = svgEl('g', { class: 'fl', id: 'fl-' + f.id }, b);
      var x = f.c * 10, y = f.r * 10;
      var ring = svgEl('circle', { class: 'ring', cx: x + 5, cy: y + 5, r: 5.4 }, g);
      svgEl('use', { href: '#flower-' + f.t, x: x, y: y, width: 10, height: 10 }, g);
      var v = svgEl('text', { class: 'val', x: x + 5, y: y + 9.6 }, g);
      v.textContent = f.v;
      var bd = svgEl('g', { class: 'bdg' }, g);
      svgEl('circle', { cx: x + 8.2, cy: y + 1.9, r: 2.1 }, bd);
      var n = svgEl('text', { x: x + 8.2, y: y + 1.9 }, bd);
      n.textContent = f.id;
      e.flowers[f.id] = { g: g, ring: ring, f: f };
    });

    e.bee = svgEl('g', { class: 'bee-g' }, b);
    e.flip = svgEl('g', { class: 'bee-flip' }, e.bee);
    svgEl('use', { class: 'bee-use', href: '#bee', width: 10, height: 10 }, e.flip);
  }

  function moveBee(c, r, instant) {
    var bee = demo.els.bee;
    if (instant) bee.style.transition = 'none';
    bee.style.transform = 'translate(' + (c * 10) + 'px,' + (r * 10) + 'px)';
    if (instant) { void bee.getBoundingClientRect(); bee.style.transition = ''; }
  }

  function setStatus(txt) { $('#status').textContent = txt; }

  function updatePanel() {
    var rt = demo.route;
    var energy = Math.max(0, 100 - demo.idx);
    $('#energyNum').textContent = energy;
    var fill = $('#energyFill');
    fill.style.width = energy + '%';
    fill.className = energy > 50 ? '' : (energy > 25 ? 'mid' : 'low');
    $('#energyBar').setAttribute('aria-valuenow', energy);
    $('#nectarNum').textContent = demo.nectar;
    $('#stepsNum').textContent = demo.idx;
    $('#flowersNum').textContent = demo.next + '/' + rt.order.length;
  }

  function setTarget() {
    var fl = demo.els.flowers;
    Object.keys(fl).forEach(function (id) { fl[id].ring.classList.remove('on'); });
    if (demo.next < demo.route.order.length) fl[demo.route.order[demo.next]].ring.classList.add('on');
  }

  function targetText() { return 'النحلة متجهة للوردة ' + demo.route.order[demo.next]; }

  function popValue(f) {
    var t = svgEl('text', { class: 'pop', x: f.c * 10 + 5, y: f.r * 10 + 3 }, demo.board);
    t.textContent = '+' + f.v;
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 1000);
  }

  function loadStrategy(i) {
    pause();
    demo.si = i;
    demo.route = demo.routes[i];
    demo.idx = 0; demo.next = 0; demo.nectar = 0; demo.done = false;
    var pts = demo.route.cells.map(function (c) { return (c[0] * 10 + 5) + ',' + (c[1] * 10 + 5); });
    demo.els.route.setAttribute('points', pts.join(' '));
    demo.els.trail.setAttribute('points', pts[0]);
    Object.keys(demo.els.flowers).forEach(function (id) {
      demo.els.flowers[id].g.classList.remove('empty');
      var inRoute = demo.route.order.indexOf(+id) !== -1;
      demo.els.flowers[id].g.style.opacity = '';
      demo.els.flowers[id].g.setAttribute('data-planned', inRoute ? '1' : '0');
    });
    demo.els.flip.style.transform = 'scaleX(1)';
    moveBee(HIVE[0], HIVE[1], true);
    setTarget();
    updatePanel();
    setStatus('النحلة جاهزة في الخلية. اضغطوا تشغيل.');
    $('#stratDesc').innerHTML = rich(STRATS[i].desc);
    enhanceTerms($('#stratDesc'));
    $('#demoPanel').setAttribute('aria-labelledby', 'stab-' + i);
    $$('#cmpTable [data-s]').forEach(function (x) { x.classList.toggle('on', +x.getAttribute('data-s') === i); });
    setPlayButtons();
  }

  function setPlayButtons() {
    $('#btnPlay').classList.toggle('is-on', demo.playing);
    $('#btnPause').classList.toggle('is-on', !demo.playing && demo.idx > 0 && !demo.done);
    $('#btnPlay').setAttribute('aria-pressed', demo.playing ? 'true' : 'false');
    demo.board.classList.toggle('playing', demo.playing);
  }

  function stepOnce() {
    var rt = demo.route;
    var prev = rt.cells[demo.idx];
    demo.idx++;
    var cell = rt.cells[demo.idx];
    if (cell[0] < prev[0]) demo.els.flip.style.transform = 'scaleX(-1)';
    else if (cell[0] > prev[0]) demo.els.flip.style.transform = 'scaleX(1)';
    moveBee(cell[0], cell[1], false);
    var pts = demo.els.trail.getAttribute('points');
    demo.els.trail.setAttribute('points', pts + ' ' + (cell[0] * 10 + 5) + ',' + (cell[1] * 10 + 5));

    var collected = null;
    if (demo.next < rt.order.length && rt.wp[demo.next] === demo.idx) {
      var f = flowerById(rt.order[demo.next]);
      collected = f;
      demo.nectar += f.v;
      demo.els.flowers[f.id].g.classList.add('empty');
      popValue(f);
      demo.next++;
      setTarget();
      var st = $('#nectarNum').parentNode;
      st.classList.remove('bump'); void st.offsetWidth; st.classList.add('bump');
    }
    updatePanel();

    if (demo.idx >= rt.cells.length - 1) {
      demo.done = true;
      setStatus('تم الرجوع للخلية بنجاح');
      return;
    }
    if (collected) setStatus('تم جمع +' + collected.v + ' نكتار من الوردة ' + collected.id);
    else if (demo.next < rt.order.length) setStatus(targetText());
    else setStatus('كل الورود المخططة اتجمعت، النحلة في طريق العودة للخلية');
  }

  function tick() {
    if (!demo.playing) return;
    if (demo.done) { finish(); return; }
    stepOnce();
    if (demo.done) { finish(); return; }
    demo.timer = setTimeout(tick, SPEEDS[$('#speed').value]);
  }

  function updateStepDuration() {
    demo.board.style.setProperty('--step', (SPEEDS[$('#speed').value] * 0.9 / 1000) + 's');
  }

  function play() {
    if (demo.playing) return;
    if (demo.done) loadStrategy(demo.si);
    demo.playing = true;
    updateStepDuration();
    if (demo.idx === 0) setStatus(targetText());
    setPlayButtons();
    clearTimeout(demo.timer);
    demo.timer = setTimeout(tick, 250);
  }

  function pause() {
    clearTimeout(demo.timer);
    demo.playing = false;
    if (demo.board) setPlayButtons();
  }

  function finish() {
    clearTimeout(demo.timer);
    demo.playing = false;
    setPlayButtons();
  }

  function renderTable() {
    var rows = [
      ['Total Nectar Collected', function (r) { return r.nectar; }, 'Nectar'],
      ['Travel Distance', function (r) { return r.steps + ' خطوة'; }, 'Distance'],
      ['Energy Consumption', function (r) { return r.steps + ' / 100'; }, 'Energy'],
      ['Successful Hive Returns', function (r, s) { return s.returns; }, 'Returns'],
      ['Execution Time', function (r, s) { return s.time; }, 'Time']
    ];
    var h = '<table class="cmp"><caption class="sr">مقارنة توضيحية بين الاستراتيجيات التلاتة</caption><thead><tr><th scope="col">المقياس</th>';
    STRATS.forEach(function (s, i) { h += '<th scope="col" data-s="' + i + '">' + s.name + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.forEach(function (row) {
      h += '<tr><th scope="row">[[' + row[0] + ']]</th>';
      STRATS.forEach(function (s, i) {
        h += '<td data-s="' + i + '" data-l="' + s.name + '">' + row[1](demo.routes[i], s) + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table>';
    var host = $('#cmpTable');
    host.innerHTML = rich(h);
    enhanceTerms(host);
  }

  function setupDemo() {
    buildBoard();
    demo.routes = STRATS.map(buildRoute);
    renderTable();

    var tabs = setupTabs($('#strategyTabs'), function (i) { loadStrategy(i); });
    loadStrategy(0);

    $('#btnPlay').addEventListener('click', play);
    $('#btnPause').addEventListener('click', function () { pause(); });
    $('#btnReset').addEventListener('click', function () { loadStrategy(demo.si); });
    $('#speed').addEventListener('change', updateStepDuration);
    updateStepDuration();

    // Pause when the demo leaves the screen or the tab is hidden
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting && demo.playing) pause();
      }, { threshold: 0 }).observe($('#demoPanel'));
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden && demo.playing) pause(); });
    return tabs;
  }

  /* =====================================================
     6) ILLUSTRATIVE LEARNING CURVE
     ===================================================== */
  function drawCurve() {
    var svg = $('#curve');
    var W = 600, H = 300, L = 50, R = 14, T = 14, B = 44;
    var N = 100;
    // deterministic pseudo-random so the curve looks the same for everyone
    var s = 7;
    function rnd() { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    var raw = [], avg = [];
    for (var i = 0; i < N; i++) {
      var base = -20 + 100 * (1 - Math.exp(-i / 26));
      var amp = 55 * Math.exp(-i / 45) + 12;
      raw.push(base + (rnd() - 0.5) * amp);
    }
    for (var j = 0; j < N; j++) {
      var a = Math.max(0, j - 7), sum = 0;
      for (var k = a; k <= j; k++) sum += raw[k];
      avg.push(sum / (j - a + 1));
    }
    var yMin = -40, yMax = 100;
    function X(i) { return L + (i / (N - 1)) * (W - L - R); }
    function Y(v) { return T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B); }
    function pts(arr) { return arr.map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' '); }

    [-40, -10, 20, 50, 80].forEach(function (v) {
      svgEl('line', { class: 'grid', x1: L, x2: W - R, y1: Y(v), y2: Y(v) }, svg);
      var t = svgEl('text', { x: L - 8, y: Y(v) + 4, 'text-anchor': 'end' }, svg);
      t.textContent = v;
    });
    [0, 20, 40, 60, 80, 100].forEach(function (e) {
      var x = X(Math.min(e, N - 1));
      var t = svgEl('text', { x: x, y: H - B + 18, 'text-anchor': 'middle' }, svg);
      t.textContent = e;
    });
    svgEl('line', { class: 'axis', x1: L, x2: L, y1: T, y2: H - B }, svg);
    svgEl('line', { class: 'axis', x1: L, x2: W - R, y1: H - B, y2: H - B }, svg);
    var xl = svgEl('text', { x: (L + W - R) / 2, y: H - 6, 'text-anchor': 'middle' }, svg);
    xl.textContent = 'Episodes';
    var yl = svgEl('text', { x: 14, y: (T + H - B) / 2, 'text-anchor': 'middle', transform: 'rotate(-90 14 ' + ((T + H - B) / 2) + ')' }, svg);
    yl.textContent = 'Cumulative Reward';
    svgEl('polyline', { class: 'raw', points: pts(raw) }, svg);
    var line = svgEl('polyline', { class: 'avg', points: pts(avg), pathLength: '1' }, svg);

    if (!reduceMotion) {
      line.style.strokeDasharray = '1';
      line.style.strokeDashoffset = '1';
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) { svg.classList.add('draw'); io.disconnect(); }
        }, { threshold: 0.4 });
        io.observe(svg);
      } else {
        svg.classList.add('draw');
      }
    }
  }

  /* =====================================================
     7) INIT
     ===================================================== */
  function init() {
    // 1) turn [[Term]] markers in static HTML into chips (before anything attaches listeners)
    richText($('main'));
    richText($('.footer'));

    // 2) build dynamic parts
    setupPhases();
    setupDemo();
    drawCurve();

    // 3) chips -> tooltips
    enhanceTerms(document);
    setupTooltip();

    // 4) page behaviour
    setupAccordions();
    setupNav();
    setupReveal();

    $('#toTop').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    // hero bee: no motion for people who prefer reduced motion
    if (reduceMotion) {
      $$('animateMotion').forEach(function (a) {
        a.parentNode.setAttribute('transform', 'translate(215 160)');   // park the bee on a flower
        a.parentNode.removeChild(a);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();