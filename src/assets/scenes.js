/* The animated diagrams. Each scene is a set of SVG parts plus a list of steps.
   A step says one short line, turns parts on or off, and flies small marks between
   named points. Figures are real parameters from the protocol, or marked examples. */
window.SCENES = (function () {
  function T(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" class="' + (o.c || 't') + (o.k ? ' k' : '') + '"' +
      (o.k ? ' data-k="' + o.k + '"' : '') + (o.t ? ' data-t="' + o.t + '"' : '') + ' text-anchor="' + (o.a || 'middle') + '">' + s + '</text>';
  }
  function B(x, y, w, h, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" class="' + (o.c || 'n') +
      (o.k ? ' k' : '') + '"' + (o.k ? ' data-k="' + o.k + '"' : '') + '/>';
  }
  function P(d, o) {
    o = o || {};
    return '<path d="' + d + '" class="' + (o.c || 'w') + (o.k ? ' k' : '') + '"' + (o.k ? ' data-k="' + o.k + '"' : '') + '/>';
  }
  function G(k, inner) { return '<g class="k" data-k="' + k + '">' + inner + '</g>'; }
  function chip(k, x, y, w, s) {
    return G(k, B(x - w / 2, y - 12, w, 24, { c: 'chip' }) + T(x, y + 4, s, { c: 'tc' }));
  }
  function server(x, y, s, t) {
    return B(x - 42, y - 25, 84, 50) + P('M' + (x - 30) + ' ' + (y - 9) + 'h44M' + (x - 30) + ' ' + y + 'h44M' + (x - 30) + ' ' + (y + 9) + 'h44', { c: 'd' }) +
      '<circle class="pip" cx="' + (x + 28) + '" cy="' + (y - 9) + '" r="2"/>' + T(x, y + 43, s, { t: t });
  }
  function laptop(x, y, s, t) {
    return B(x - 34, y - 24, 68, 42) + P('M' + (x - 44) + ' ' + (y + 24) + 'h88', { c: 'w' }) + T(x, y + 43, s, { t: t });
  }
  function rail(y, w) {
    return B(20, y, w - 40, 40, { c: 'rail' }) + T(34, y + 25, 'Solana', { c: 'tl', a: 'start' }) +
      '<path class="blocks" d="M100 ' + (y + 6) + 'H' + (w - 28) + '"/>';
  }

  function lock(x, y) {
    return P('M' + (x + 3) + ' ' + y + 'v-3a4 4 0 0 1 8 0v3M' + x + ' ' + y + 'h14v10h-' + 14 + 'z', { c: 'gold' });
  }

  var net = {
    box: [720, 440],
    label: 'GPU servers join a network and post prices on Solana. Buyers connect to them directly.',
    svg: rail(386, 720) +
      G('d', server(590, 66, 'GPU server')) + G('e', server(628, 206, 'GPU server')) +
      G('f', server(392, 262, 'GPU server')) + G('g', server(350, 150, 'Small GPU')) +
      G('a', laptop(118, 72, 'Mac')) + G('b', laptop(76, 246, 'Laptop')) +
      chip('cg', 300, 406, 84, 'infer $1') + chip('cf', 400, 406, 84, 'infer $2') +
      chip('cd', 512, 406, 92, 'train $20') + chip('ce', 628, 406, 92, 'train $30') +
      P('M118 118V386', { c: 'dash', k: 'read' }) +
      P('M164 70L546 66', { c: 'lnk', k: 'l1' }) + P('M122 246L350 262', { c: 'lnk', k: 'l2' }) +
      P('M122 232L308 158', { c: 'lnk', k: 'l3' }),
    p: { a: [164, 70], b: [122, 246], b2: [122, 232], d: [546, 66], dd: [590, 118], e: [628, 258], f: [392, 306], g: [340, 202],
      f2: [350, 262], g2: [308, 158], m: [355, 68], ra: [118, 392], ta: [118, 118], cd: [512, 394], ce: [628, 394], cf: [400, 394], cg: [300, 394] },
    steps: [
      { say: 'GPU servers join the network.', on: ['d', 'e', 'f', 'g'] },
      { say: 'Each seller posts its price on Solana.', on: ['cd', 'ce', 'cf', 'cg'], fly: [['dd', 'cd'], ['e', 'ce', { d: 120 }], ['f', 'cf', { d: 240 }], ['g', 'cg', { d: 360 }]] },
      { say: 'A buyer reads the offers and picks one.', on: ['a', 'b', 'read'], hot: ['cd'], fly: [['ra', 'ta', { s: 'pale' }]] },
      { say: 'Both sides leave sealed addresses on chain.', off: ['read'], fly: [['ta', 'ra', { s: 'seal' }], ['dd', 'cd', { s: 'seal' }]] },
      { say: 'They dial each other at the same moment.', fly: [['a', 'm'], ['d', 'm']], ms: 2000 },
      { say: 'The link is direct. Nothing sits in between.', on: ['l1'], fly: [['a', 'd', { s: 'frame', n: 4 }], ['d', 'a', { s: 'frame', n: 4, d: 180 }]], ms: 3400 },
      { say: 'Every job gets its own link.', on: ['l2', 'l3'], cool: ['cd'], fly: [['a', 'd', { s: 'frame', n: 3 }], ['b', 'f2', { s: 'frame', n: 3, d: 200 }], ['g2', 'b2', { s: 'frame', n: 3, d: 400 }]], ms: 3600 }
    ]
  };

  var routeSvg =
    G('you', laptop(120, 138, 'Your machine')) +
    G('s1', server(590, 62, 'Training seller')) +
    G('s2', server(590, 214, 'Inference seller')) +
    P('M168 126L544 66', { c: 'lnk', k: 'l1' }) + P('M168 150L544 210', { c: 'lnk', k: 'l2' }) +
    chip('ad', 120, 216, 92, 'adapter') + chip('lc', 120, 252, 150, 'runs here · $0') + chip('rm', 590, 288, 150, 'paid per token');
  var route = {
    box: [720, 310],
    label: 'A machine that can run a model trains remotely and runs at home. A machine that cannot sends both jobs to sellers.',
    svg: routeSvg,
    p: { y: [168, 126], y2: [168, 150], s1: [544, 66], s2: [544, 210], h: [120, 196] },
    tabs: [
      { name: 'Can run the model', steps: [
        { say: 'Your machine runs the model, but cannot train it.', on: ['you'] },
        { say: 'Training goes to a GPU seller.', on: ['s1', 'l1'], fly: [['y', 's1', { s: 'seal' }]] },
        { say: 'The adapter comes home, sealed.', on: ['ad'], fly: [['s1', 'y', { s: 'seal' }]] },
        { say: 'The same model name now answers locally, for free.', on: ['lc'], off: ['l1'], ms: 3000 }
      ] },
      { name: 'Cannot run it', steps: [
        { say: 'Your machine cannot run the model.', on: ['you'] },
        { say: 'Training goes to a GPU seller.', on: ['s1', 'l1'], fly: [['y', 's1', { s: 'seal' }]] },
        { say: 'The adapter comes back, sealed.', on: ['ad'], fly: [['s1', 'y', { s: 'seal' }]] },
        { say: 'You seal it again for an inference seller.', on: ['s2', 'l2'], off: ['l1'], fly: [['y2', 's2', { s: 'seal' }]] },
        { say: 'Same model name, same API. Paid per token.', on: ['rm'], fly: [['y2', 's2', { s: 'frame', n: 4 }], ['s2', 'y2', { s: 'frame', n: 4, d: 180 }]], ms: 3400 }
      ] }
    ]
  };

  function book(buyer, esc, bond, seller) {
    return { tb: buyer, te: esc, to: bond, ts: seller };
  }
  var marketSvg =
    B(40, 92, 150, 118) + T(115, 120, 'Buyer', { c: 'tl' }) + '<text x="115" y="162" class="num" data-t="tb" text-anchor="middle">$10.00</text>' +
    B(530, 92, 150, 118) + T(605, 120, 'Seller', { c: 'tl' }) + '<text x="605" y="162" class="num" data-t="ts" text-anchor="middle">$0.00</text>' +
    T(605, 188, 'earned', { c: 't' }) + T(115, 188, 'wallet', { c: 't' }) +
    B(258, 70, 204, 162, { c: 'vault' }) + T(360, 96, 'Beetle program', { c: 'tl' }) +
    T(296, 142, 'Escrow', { c: 't' }) + '<text x="296" y="172" class="num" data-t="te" text-anchor="middle">$0.00</text>' +
    T(424, 142, 'Bond', { c: 't' }) + '<text x="424" y="172" class="num" data-t="to" text-anchor="middle">$0.00</text>' +
    chip('of', 360, 206, 188, 'offer: train $20/M') + chip('ev', 360, 206, 188, 'evidence hash') + chip('kk', 360, 206, 188, 'sealed key') + chip('rs', 360, 206, 188, 'signed result') + chip('no', 360, 206, 188, 'start window missed') + chip('rf', 360, 206, 188, 'evidence refused') +
    P('M190 40H530', { c: 'lnk', k: 'p2p' }) + T(360, 30, 'direct link', { c: 't', k: 'p2pl' }) +
    P('M115 92V40H190M605 92V40H530', { c: 'lnk', k: 'p2pe' }) +
    rail(286, 720);
  var mp = { b: [190, 150], s: [530, 150], ve: [296, 150], vo: [424, 150], vc: [360, 196], bt: [115, 40], st: [605, 40] };
  function opening() {
    return [
      { say: 'The seller stakes and posts an offer.', on: ['of'], text: book('$10.00', '$0.00', '$0.00', '$0.00'), fly: [['s', 'vc', { s: 'coin' }]] },
      { say: 'The buyer takes it. $1.00 goes into escrow and $0.50 of bond locks.', text: book('$9.00', '$1.00', '$0.50', '$0.00'), fly: [['b', 've', { s: 'coin' }], ['s', 'vo', { s: 'coin', d: 300 }]], ms: 3000 }
    ];
  }
  var market = {
    box: [720, 340],
    label: 'The buyer escrows payment, the seller locks a bond, and the program pays out on objective facts.',
    svg: marketSvg,
    p: mp,
    tabs: [
      { name: 'Delivered', steps: opening().concat([
        { say: 'The seller starts and commits its evidence.', off: ['of'], on: ['ev'], fly: [['s', 'vc', { s: 'seal' }]] },
        { say: 'The buyer checks it, then releases the key.', off: ['ev'], on: ['kk'], fly: [['b', 'vc', { s: 'key' }]] },
        { say: 'The sealed result arrives over the direct link.', off: ['kk'], on: ['rs', 'p2p', 'p2pe', 'p2pl'], fly: [['st', 'bt', { s: 'seal', t: 1300 }], ['s', 'vc', { s: 'seal', d: 500 }]] },
        { say: 'The buyer accepts. The seller is paid and the bond unlocks.', off: ['p2p', 'p2pe', 'p2pl', 'rs'], text: book('$9.00', '$0.00', '$0.00', '$1.00'), fly: [['ve', 's', { s: 'coin' }], ['vo', 's', { s: 'coin', d: 250 }]], ms: 3400 }
      ]) },
      { name: 'Seller no-show', steps: opening().concat([
        { say: 'The seller misses the start window.', off: ['of'], on: ['no'] },
        { say: 'Anyone can call the timeout.', hot: ['no'] },
        { say: 'Full refund, plus $0.10 from the bond.', text: book('$10.10', '$0.00', '$0.00', '$0.00'), fly: [['ve', 'b', { s: 'coin' }], ['vo', 'b', { s: 'coin', d: 250 }]], ms: 3400 }
      ]) },
      { name: 'Evidence refused', steps: opening().concat([
        { say: 'The seller starts, but its evidence misses your floor.', off: ['of'], on: ['rf'], fly: [['s', 'vc', { s: 'seal' }]] },
        { say: 'The buyer refuses. The key never leaves.', hot: ['rf'] },
        { say: 'The seller gets $0.01. The rest comes back, and the data stays sealed.', text: book('$9.99', '$0.00', '$0.00', '$0.01'), fly: [['ve', 'b', { s: 'coin' }], ['ve', 's', { s: 'coin', d: 250 }]], ms: 3400 }
      ]) }
    ]
  };

  var job = {
    box: [720, 400],
    label: 'A job is sealed on the buyer machine, opened inside the sandbox, trained, scored on hidden questions and returned sealed.',
    svg:
      T(30, 30, 'Your machine', { c: 'tl', a: 'start' }) +
      G('t1', B(30, 46, 170, 58, { c: 'tile' }) + T(44, 70, 'Recipe', { c: 'tl', a: 'start' }) + T(44, 90, 'memory · rank 16', { a: 'start' })) +
      G('t2', B(30, 114, 170, 44, { c: 'tile' }) + T(44, 141, 'Data', { c: 'tl', a: 'start' })) +
      G('t3', B(30, 168, 170, 44, { c: 'tile' }) + T(44, 195, 'Hidden test', { c: 'tl', a: 'start' })) +
      G('lock', lock(172, 72) + lock(172, 133) + lock(172, 187)) +
      B(292, 46, 398, 266, { c: 'vault' }) + T(310, 72, 'Sandbox', { c: 'tl', a: 'start' }) + T(672, 72, 'no network interface', { a: 'end' }) +
      G('open', T(310, 108, 'opened with your key', { a: 'start', c: 'tg' })) +
      G('p1', B(310, 130, 110, 56, { c: 'tile' }) + T(365, 163, 'Baseline', { c: 'tl' })) +
      G('p2', B(436, 130, 110, 56, { c: 'tile' }) + T(491, 163, 'Train', { c: 'tl' })) +
      G('p3', B(562, 130, 110, 56, { c: 'tile' }) + T(617, 163, 'Score', { c: 'tl' })) +
      P('M420 158h16M546 158h16', { c: 'w', k: 'pa' }) +
      T(491, 248, 'hidden test', { k: 'scl' }) + T(491, 276, 'passed', { c: 'tg', k: 'sc' }) +
      chip('ad', 430, 352, 150, 'sealed adapter') + chip('rp', 600, 352, 150, 'private report') +
      T(30, 352, 'Result, sealed to you', { a: 'start', k: 'res' }) +
      P('M200 160H292', { c: 'dash' }) + T(246, 150, 'ciphertext', {}),
    p: { a: [200, 160], b: [292, 160], k1: [120, 300], kin: [292, 110], sb: [491, 312], ad: [430, 340], rp: [600, 340] },
    steps: [
      { say: 'A job is a recipe, your data and a hidden test.', on: ['t1', 't2', 't3'] },
      { say: 'Everything is sealed on your machine.', on: ['lock'] },
      { say: 'On the wire, only ciphertext.', fly: [['a', 'b', { s: 'seal', n: 3 }]] },
      { say: 'Your key opens it inside the sandbox.', on: ['open'], fly: [['a', 'kin', { s: 'key' }]] },
      { say: 'First, a baseline.', on: ['p1'], hot: ['p1'] },
      { say: 'Then training.', on: ['p2', 'pa'], cool: ['p1'], hot: ['p2'] },
      { say: 'Then scoring, on a test the training never saw.', on: ['p3', 'sc', 'scl'], cool: ['p2'], hot: ['p3'] },
      { say: 'The adapter and the scores come back sealed.', on: ['ad', 'rp', 'res'], cool: ['p3'], fly: [['sb', 'ad', { s: 'seal' }], ['sb', 'rp', { s: 'seal', d: 200 }]], ms: 3400 }
    ]
  };

  var cols = [['T0', 'Your machine', 'c0', 'only you'], ['T3-C', 'Ordinary GPU', 'c1', 'owner can read']];
  var tierSvg = T(360, 30, 'Your key', { c: 'tl' }) + B(322, 42, 76, 36, { c: 'tile' }) + P('M348 60a6 6 0 1 1 12 0a6 6 0 1 1 -12 0M360 60h14M370 60v6', { c: 'gold' });
  cols.forEach(function (c, i) {
    var x = 190 + i * 340;
    tierSvg += '<g data-col="' + c[2] + '">' + B(x - 74, 150, 148, 96, { c: 'tile' }) + T(x, 182, c[0], { c: 'num2' }) + T(x, 208, c[1]) +
      T(x, 230, c[3], { c: 'ts' }) + '</g>';
  });
  tierSvg += G('c1o', P('M464 240H596', { c: 'gold' })) + G('c1x', T(530, 270, 'no key', { c: 'tb' })) + G('c1y', T(530, 270, 'key released', { c: 'tg' })) +
    P('M360 78V112H530V150', { c: 'dash', k: 'c1l' });
  var tp = { k: [360, 78], c1: [530, 150] };
  // The key goes to a T3-C seller, or it stays home.
  function floorTab(name, pass, say, end) {
    return { name: name, dim: pass ? [] : ['c1'], steps: [
      { say: say, on: ['c1l'] },
      { say: 'Evidence decides the tier. No evidence means T3-C.', on: ['c1o'], ms: 2200 },
      pass ? { say: 'Only sellers at your floor or above can get the key.', off: ['c1o'], on: ['c1y'], fly: [['k', 'c1', { s: 'key', t: 1000 }]], ms: 3400 }
        : { say: end, off: ['c1o', 'c1l'], on: ['c1x'], ms: 3400 }
    ] };
  }
  var tiers = {
    box: [720, 290],
    label: 'A buyer sets a privacy floor. The key goes only to sellers that meet it.',
    svg: tierSvg,
    p: tp,
    tabs: [
      floorTab('Floor: public', true, 'Public or synthetic data can go to any seller.'),
      floorTab('Floor: personal', false, 'Personal data has a higher floor.', 'T3-C does not meet it, so the key stays on your machine.')
    ]
  };

  var pay = {
    box: [720, 340],
    label: 'A buyer deposits a budget, signs vouchers off chain as tokens arrive, and gets the unused balance back.',
    svg:
      B(40, 70, 150, 118) + T(115, 98, 'Buyer', { c: 'tl' }) + '<text x="115" y="140" class="num" data-t="w" text-anchor="middle">$10.00</text>' + T(115, 166, 'wallet') +
      B(530, 70, 150, 118) + T(605, 98, 'Seller', { c: 'tl' }) + '<text x="605" y="140" class="num" data-t="e" text-anchor="middle">$0.000000</text>' + T(605, 166, 'earned') +
      P('M190 128H530', { c: 'lnk' }) + T(360, 112, 'direct link, off chain') +
      G('stm', T(360, 156, 'tokens', {}) + '<text x="360" y="184" class="num" data-t="tok" text-anchor="middle">0</text>') +
      B(20, 244, 680, 66, { c: 'rail' }) + T(34, 269, 'Solana', { c: 'tl', a: 'start' }) + T(34, 292, 'payment channel', { a: 'start' }) +
      T(360, 269, 'Channel balance') + '<text x="360" y="294" class="num" data-t="ch" text-anchor="middle">$0.00</text>' +
      G('q', T(600, 282, 'no transactions', { c: 'ts' })),
    p: { b: [190, 128], s: [530, 128], wb: [115, 188], cb: [330, 244], cs: [420, 244], sb: [605, 188] },
    steps: [
      { say: 'Set a budget. $0.50 goes into a payment channel.', text: { w: '$9.50', ch: '$0.50', tok: '0', e: '$0.000000' }, fly: [['wb', 'cb', { s: 'coin' }]] },
      { say: 'Tokens arrive. You sign a small voucher as they do.', on: ['stm', 'q'], text: { tok: '512' }, fly: [['s', 'b', { s: 'frame', n: 5 }], ['b', 's', { s: 'pale', n: 2, d: 500 }]], ms: 3400 },
      { say: 'Vouchers stay off chain, so the meter runs without fees.', text: { tok: '1,024' }, fly: [['s', 'b', { s: 'frame', n: 4 }], ['b', 's', { s: 'pale', n: 2, d: 500 }]], ms: 3000 },
      { say: 'When you finish, the seller settles the last voucher.', off: ['q'], text: { e: '$0.000406', ch: '$0.499594' }, fly: [['cs', 'sb', { s: 'coin' }]] },
      { say: 'The rest comes straight back.', text: { w: '$9.999594', ch: '$0.00' }, fly: [['cb', 'wb', { s: 'coin' }]], ms: 3400 }
    ]
  };

  // A recipe is a few plain settings. The JSON on the right fills in as they are chosen.
  function blk(k, y, a, b) {
    return G(k, B(30, y, 230, 42, { c: 'tile' }) + T(44, y + 26, a, { c: 'tl', a: 'start' }) + T(246, y + 26, b, { a: 'end' }));
  }
  var recipeSvg =
    T(30, 26, 'Choose', { c: 'tl', a: 'start' }) +
    blk('r1', 40, 'Method', 'memory') + blk('r2', 92, 'Base model', 'qwen3.5-2b') + blk('r3', 144, 'LoRA', 'rank 16') +
    blk('r4', 196, 'Training', '4 epochs') + blk('r5', 248, 'Acceptance', 'hidden test') +
    B(330, 40, 360, 250, { c: 'vault' }) + T(346, 66, 'Recipe', { c: 'tl', a: 'start' }) +
    T(346, 104, '"method": "memory"', { a: 'start', k: 'j1' }) + T(346, 132, '"base": "qwen3.5-2b"', { a: 'start', k: 'j2' }) +
    T(346, 160, '"lora": { "rank": 16, "alpha": 32 }', { a: 'start', k: 'j3' }) +
    T(346, 188, '"optim": { "lr": 0.002, "epochs": 4 }', { a: 'start', k: 'j4' }) +
    T(346, 216, '"acceptance": { "min_gain": 0.5 }', { a: 'start', k: 'j5' }) +
    G('rs', lock(660, 62) + T(346, 262, 'sealed with your data', { c: 'tg', a: 'start' }));
  var recipe = {
    box: [720, 310],
    label: 'A recipe is a short list of settings.',
    svg: recipeSvg,
    p: { a: [260, 61], b: [260, 113], c: [260, 165], d: [260, 217], e: [260, 269], j: [346, 150] },
    steps: [
    { say: 'Pick what the model should learn.', on: ['r1', 'j1'], hot: ['r1'], fly: [['a', 'j', { s: 'pale' }]], ms: 1900 },
    { say: 'Pick a base model. The sandbox checks its hash.', on: ['r2', 'j2'], fly: [['b', 'j', { s: 'pale' }]], ms: 1900 },
    { say: 'Set how the adapter is built.', on: ['r3', 'j3'], fly: [['c', 'j', { s: 'pale' }]], ms: 1900 },
    { say: 'Set how long it trains.', on: ['r4', 'j4'], fly: [['d', 'j', { s: 'pale' }]], ms: 1900 },
    { say: 'Decide what counts as a pass.', on: ['r5', 'j5'], fly: [['e', 'j', { s: 'pale' }]], ms: 1900 },
    { say: 'The recipe travels sealed, with your data.', on: ['rs'], ms: 3000 }
    ]
  };

  // What the chain keeps and what never reaches it.
  function bin(k, x, y, s, good) { return G(k, B(x, y, 200, 34, { c: good ? 'tile' : 'off' }) + T(x + 100, y + 22, s, { c: good ? 'tc' : 't' })); }
  var chain = {
    box: [720, 300],
    label: 'Escrow, bonds, offers, sealed keys and result hashes go on chain. Data, weights, scores and tokens never do.',
    svg: T(170, 26, 'On chain', { c: 'tl' }) + T(550, 26, 'Never on chain', { c: 'tl' }) + P('M360 14V286', { c: 'dash' }) +
      bin('o1', 70, 44, 'Offers and prices', 1) + bin('o2', 70, 90, 'Escrow and bonds', 1) + bin('o3', 70, 136, 'Sealed addresses', 1) + bin('o4', 70, 182, 'Sealed data key', 1) + bin('o5', 70, 228, 'Result hash', 1) +
      bin('x1', 450, 44, 'Your data', 0) + bin('x2', 450, 90, 'Model weights', 0) + bin('x3', 450, 136, 'Scores and logs', 0) + bin('x4', 450, 182, 'Prompts and tokens', 0) + bin('x5', 450, 228, 'Hardware evidence', 0),
    p: {},
    steps: [
      { say: 'The chain holds money and commitments.', on: ['o1', 'o2'] },
      { say: 'Addresses and keys go on it only in sealed form.', on: ['o3', 'o4'] },
      { say: 'A result leaves just a hash.', on: ['o5'] },
      { say: 'Your data, weights and scores never touch it.', on: ['x1', 'x2', 'x3'] },
      { say: 'Prompts stay between the two machines. Evidence is checked on yours.', on: ['x4', 'x5'], ms: 3400 }
    ]
  };

  // A seller, from install to payout.
  var host = {
    box: [720, 330],
    label: 'A seller installs the node, checks the machine, posts an offer, runs sealed jobs and collects earnings.',
    svg: rail(274, 720) +
      G('m', server(150, 110, 'Your GPU server')) +
      chip('i0', 150, 34, 136, 'beetle host') +
      G('ck', T(290, 82, 'GPU  ready', { a: 'start', c: 'tg' }) + T(290, 106, 'Docker  ready', { a: 'start', c: 'tg' }) + T(290, 130, 'Sandbox  built', { a: 'start', c: 'tg' })) +
      chip('of', 340, 294, 150, 'train $20/M') + chip('st', 170, 294, 110, 'stake') +
      G('b', laptop(590, 96, 'Buyer')) + P('M192 110L546 96', { c: 'lnk', k: 'ln' }) +
      G('earn', T(150, 218, 'earned', {}) + '<text x="150" y="244" class="num" data-t="er" text-anchor="middle">$0.00</text>'),
    p: { m: [150, 150], st: [170, 282], of: [340, 282], s: [192, 110], b: [546, 96], v: [340, 282], e: [150, 196] },
    steps: [
      { say: 'Set up the node on an NVIDIA GPU server.', on: ['m', 'i0'] },
      { say: 'Check what this machine can sell.', on: ['ck'] },
      { say: 'Stake, then post your price on chain.', on: ['st', 'of'], off: ['ck'], fly: [['m', 'st', { s: 'coin' }], ['m', 'of', { s: 'pale', d: 300 }]] },
      { say: 'A buyer takes the offer and connects directly.', on: ['b', 'ln'], hot: ['of'] },
      { say: 'Jobs arrive sealed and run in a sandbox with no network.', cool: ['of'], fly: [['b', 's', { s: 'seal', n: 3 }]], ms: 3200 },
      { say: 'You collect what you earned.', on: ['earn'], text: { er: '$1.00' }, fly: [['v', 'e', { s: 'coin' }]], ms: 3200 }
    ]
  };

  // One picture, many uses: the same machines, a different path through them.
  var uses = {
    box: [720, 376],
    label: 'One network, many uses: use a bigger model, train and keep the result, sell a GPU.',
    svg: rail(326, 720) +
      '<g class="idle">' + server(600, 52, 'GPU seller') + server(600, 256, 'GPU seller') + '</g>' +
      G('you', laptop(120, 150, 'Your Mac', 'un')) + G('s', server(600, 146, 'GPU seller', 'sn')) +
      P('M158 146H558', { c: 'lnk', k: 'l' }) +
      chip('big', 120, 92, 176, 'too big for this Mac') + chip('pub', 120, 92, 176, 'public or synthetic') +
      chip('ad', 120, 226, 92, 'adapter') + chip('lc', 120, 262, 150, 'runs here · $0') +
      chip('of', 430, 346, 134, 'infer $1 / $3') + chip('tr', 430, 346, 134, 'train $20/M') + chip('mine', 430, 346, 134, 'your price') +
      chip('tk', 356, 186, 130, 'paid per token') + chip('ern', 356, 186, 130, 'paid in USDC'),
    p: { y: [158, 146], s: [558, 146], sd: [560, 170], of: [430, 334] },
    tabs: [
      { name: 'Use a bigger model', group: 'Running on devnet', steps: [
        { say: 'This model is too big for your Mac.', on: ['you', 'big'] },
        { say: 'A GPU seller lists it, priced per token.', on: ['s', 'of'], fly: [['sd', 'of', { s: 'pale' }]] },
        { say: 'Your Mac connects to it directly.', on: ['l'], fly: [['y', 's', { s: 'seal' }]] },
        { say: 'Tokens come back as you pay for them.', on: ['tk'], fly: [['s', 'y', { s: 'frame', n: 4 }], ['y', 's', { s: 'pale', n: 2, d: 500 }]], ms: 3400 }
      ] },
      { name: 'Train and keep it', steps: [
        { say: 'Public or synthetic data, sealed on your Mac.', on: ['you', 'pub'] },
        { say: 'A GPU seller trains on it.', on: ['s', 'l', 'tr'], fly: [['y', 's', { s: 'seal' }]] },
        { say: 'The adapter comes home, sealed.', on: ['ad'], fly: [['s', 'y', { s: 'seal' }]] },
        { say: 'It now runs on your Mac, under the same model name, for $0.', on: ['lc'], off: ['l'], ms: 3000 }
      ] },
      { name: 'Sell your GPU', steps: [
        { say: 'Your GPU server joins the network.', on: ['s'], text: { sn: 'Your GPU server', un: 'A buyer' } },
        { say: 'Stake, then post your price on chain.', on: ['mine'], fly: [['sd', 'of', { s: 'coin' }]] },
        { say: 'A buyer connects directly.', on: ['you', 'l'], fly: [['y', 's', { s: 'seal' }]] },
        { say: 'You run the job, then collect on chain.', on: ['ern'], fly: [['s', 'y', { s: 'frame', n: 3 }], ['of', 'sd', { s: 'coin', d: 700 }]], ms: 3400 }
      ] }
    ]
  };

  return { uses: uses, net: net, route: route, market: market, chain: chain, recipe: recipe, job: job, tiers: tiers, pay: pay, host: host };
})();
