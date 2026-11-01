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
      chip('cg', 296, 406, 100, 'infer $0.25') + chip('cf', 404, 406, 100, 'infer $0.30') +
      chip('cd', 520, 406, 108, 'train $0.50') + chip('ce', 640, 406, 108, 'train $0.60') +
      P('M118 118V386', { c: 'dash', k: 'read' }) +
      P('M164 70L546 66', { c: 'lnk', k: 'l1' }) + P('M122 246L350 262', { c: 'lnk', k: 'l2' }) +
      P('M122 232L308 158', { c: 'lnk', k: 'l3' }),
    p: { a: [164, 70], b: [122, 246], b2: [122, 232], d: [546, 66], dd: [590, 118], e: [628, 258], f: [392, 306], g: [340, 202],
      f2: [350, 262], g2: [308, 158], m: [355, 68], ra: [118, 392], ta: [118, 118], cd: [520, 394], ce: [640, 394], cf: [404, 394], cg: [296, 394] },
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
    chip('of', 360, 206, 188, 'offer: train $0.50/M') + chip('ev', 360, 206, 188, 'evidence hash') + chip('kk', 360, 206, 188, 'sealed key') + chip('rs', 360, 206, 188, 'signed result') + chip('no', 360, 206, 188, 'start window missed') + chip('rf', 360, 206, 188, 'evidence refused') +
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
      { say: 'When you finish, the seller settles the last voucher.', off: ['q'], text: { e: '$0.000820', ch: '$0.499180' }, fly: [['cs', 'sb', { s: 'coin' }]] },
      { say: 'The rest comes straight back.', text: { w: '$9.999180', ch: '$0.00' }, fly: [['cb', 'wb', { s: 'coin' }]], ms: 3400 }
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
      chip('of', 340, 294, 150, 'train $0.50/M') + chip('st', 170, 294, 110, 'stake') +
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

  return { net: net, market: market, job: job, pay: pay, host: host };
})();
