// ============================================================
// Starfield
// ============================================================
function createStarfield(section) {
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0';
  section.insertBefore(canvas, section.firstChild);

  var ctx = canvas.getContext('2d');
  var stars = [];
  var animId;

  function resize() {
    canvas.width = section.offsetWidth;
    canvas.height = section.scrollHeight;
    generate();
  }

  function generate() {
    stars = [];
    var count = Math.floor(canvas.width * canvas.height / 4000);
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.3,
        baseAlpha: Math.random() * 0.7 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.02,
        twinkle: Math.random() > 0.7
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var s = 0; s < stars.length; s++) {
      var star = stars[s];
      var alpha = star.baseAlpha;
      if (star.twinkle) {
        alpha *= 0.5 + 0.5 * Math.sin(time * star.speed + star.phase);
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180, 210, 255, ' + alpha + ')';
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw(0);

  return function cleanup() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
}

// ============================================================
// Nomai-inspired symbol definitions
// ============================================================
var NOMAI_SYMBOLS = [
  // 0: Circle
  function(svg, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    el.setAttribute('cx', '0');
    el.setAttribute('cy', '0');
    el.setAttribute('r', '6');
    parent.appendChild(el);
    return [el];
  },
  // 1: Diamond
  function(svg, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', 'M 0,-7 L 6,0 L 0,7 L -6,0 Z');
    parent.appendChild(el);
    return [el];
  },
  // 2: Triangle
  function(svg, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', 'M -6,5 L 0,-7 L 6,5 Z');
    parent.appendChild(el);
    return [el];
  },
  // 3: Eye
  function(svg, parent) {
    var outer = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outer.setAttribute('d', 'M -7,0 C -7,-5 7,-5 7,0 C 7,5 -7,5 -7,0');
    parent.appendChild(outer);
    var inner = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    inner.setAttribute('d', 'M -3,0 L 3,0');
    inner.setAttribute('stroke-width', '1');
    parent.appendChild(inner);
    return [outer, inner];
  },
  // 4: Cross
  function(svg, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', 'M -5,-5 L 5,5 M -5,5 L 5,-5');
    parent.appendChild(el);
    return [el];
  },
  // 5: V with line
  function(svg, parent) {
    var v = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    v.setAttribute('d', 'M -6,5 L 0,-6 L 6,5');
    parent.appendChild(v);
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', 'M 0,-6 L 0,8');
    line.setAttribute('stroke-width', '1');
    parent.appendChild(line);
    // Dot at tip
    var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', '0');
    dot.setAttribute('cy', '-8');
    dot.setAttribute('r', '2');
    parent.appendChild(dot);
    return [v, line, dot];
  },
  // 6: Zigzag
  function(svg, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', 'M -7,-4 L -3,4 L 1,-4 L 5,4');
    parent.appendChild(el);
    return [el];
  },
  // 7: Spiral curve
  function(svg, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', 'M -5,0 C -5,-6 5,-6 5,0 C 5,5 -3,5 -3,0 C -3,-2 2,-2 2,0');
    parent.appendChild(el);
    return [el];
  },
  // 8: Three dots triangle
  function(svg, parent) {
    var dots = [];
    var positions = [[0,-5],[-4,3],[4,3]];
    for (var i = 0; i < positions.length; i++) {
      var d = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      d.setAttribute('cx', positions[i][0].toString());
      d.setAttribute('cy', positions[i][1].toString());
      d.setAttribute('r', '2');
      parent.appendChild(d);
      dots.push(d);
    }
    return dots;
  },
  // 9: Arrow
  function(svg, parent) {
    var shaft = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shaft.setAttribute('d', 'M 0,-8 L 0,6');
    shaft.setAttribute('stroke-width', '1.5');
    parent.appendChild(shaft);
    var head = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    head.setAttribute('d', 'M -5,2 L 0,8 L 5,2');
    parent.appendChild(head);
    return [shaft, head];
  }
];

// ============================================================
// Timeline SVG path with Nomai symbols
// ============================================================
function createTimelinePath(wrapper) {
  var dots = wrapper.querySelectorAll('.tl-dot');
  if (dots.length < 2) return;

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:1;overflow:visible';
  wrapper.appendChild(svg);

  // Glow path (thick, semi-transparent)
  var glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  glowPath.setAttribute('fill', 'none');
  glowPath.setAttribute('stroke', '#4299e1');
  glowPath.setAttribute('stroke-width', '8');
  glowPath.setAttribute('stroke-linecap', 'round');
  glowPath.setAttribute('opacity', '0.2');
  svg.appendChild(glowPath);

  // Core path (thin, bright)
  var corePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  corePath.setAttribute('fill', 'none');
  corePath.setAttribute('stroke', '#63b3ed');
  corePath.setAttribute('stroke-width', '2');
  corePath.setAttribute('stroke-linecap', 'round');
  svg.appendChild(corePath);

  // Second glow layer for extra bloom
  var bloomPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  bloomPath.setAttribute('fill', 'none');
  bloomPath.setAttribute('stroke', '#4fc3f7');
  bloomPath.setAttribute('stroke-width', '4');
  bloomPath.setAttribute('stroke-linecap', 'round');
  bloomPath.setAttribute('opacity', '0.35');
  svg.appendChild(bloomPath);

  var pathLen = 0;
  var symbolData = [];

  // Get tangent angle at a point along the path
  function getTangent(path, dist) {
    var step = 2;
    try {
      var p1 = path.getPointAtLength(Math.max(0, dist - step));
      var p2 = path.getPointAtLength(Math.min(pathLen, dist + step));
      return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    } catch (e) {
      return 0;
    }
  }

  // Build the path from timeline dot positions
  function build() {
    var wrapperRect = wrapper.getBoundingClientRect();
    var isMobile = window.innerWidth <= 768;
    var offset = isMobile ? 20 : 80;

    // Reset any inline dot positioning from previous peak changes
    for (var i = 0; i < dots.length; i++) {
      dots[i].style.left = '';
    }

    var pts = [];
    for (var i = 0; i < dots.length; i++) {
      var r = dots[i].getBoundingClientRect();
      pts.push({
        x: r.left + r.width / 2 - wrapperRect.left,
        y: r.top + r.height / 2 - wrapperRect.top,
        isLeft: i % 2 === 0
      });
    }

    var d = '';
    for (var i = 0; i < pts.length; i++) {
      if (i === 0) {
        d += 'M ' + pts[i].x + ' ' + pts[i].y;
        continue;
      }
      var prev = pts[i - 1];
      var curr = pts[i];
      var midY = (prev.y + curr.y) / 2;
      var dir1 = prev.isLeft ? -1 : 1;
      var dir2 = curr.isLeft ? -1 : 1;

      var cp1x = prev.x + dir1 * offset * 0.7;
      var cp1y = prev.y + (midY - prev.y) * 0.3;
      var cp2x = curr.x + dir2 * offset * 0.7;
      var cp2y = curr.y + (midY - curr.y) * 0.3;

      d += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + curr.x + ' ' + curr.y;
    }

    glowPath.setAttribute('d', d);
    corePath.setAttribute('d', d);
    bloomPath.setAttribute('d', d);

    var w = wrapper.offsetWidth || wrapperRect.width;
    var h = wrapper.scrollHeight;
    svg.style.width = w + 'px';
    svg.style.height = h + 'px';
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

    try {
      pathLen = corePath.getTotalLength();
    } catch (e) {
      pathLen = 0;
    }
    corePath.style.strokeDasharray = pathLen;
    corePath.style.strokeDashoffset = pathLen;
    glowPath.style.strokeDasharray = pathLen;
    glowPath.style.strokeDashoffset = pathLen;
    bloomPath.style.strokeDasharray = pathLen;
    bloomPath.style.strokeDashoffset = pathLen;

    // Place Nomai symbols along the path
    placeSymbols();
  }

  // Place Nomai-like symbols along the path
  function placeSymbols() {
    // Remove old symbols
    for (var s = 0; s < symbolData.length; s++) {
      var sd = symbolData[s];
      for (var e = 0; e < sd.elements.length; e++) {
        sd.elements[e].remove();
      }
    }
    symbolData = [];

    if (pathLen <= 0) return;

    // Dense random placement along the path
    var dist = 6 + Math.random() * 8; // start with random offset

    while (dist < pathLen - 4) {
      var pt = corePath.getPointAtLength(dist);
      var angle = getTangent(corePath, dist);

      // Random perpendicular offset (stagger above/below path center)
      var rad = angle * Math.PI / 180;
      var perpX = Math.cos(rad + Math.PI / 2);
      var perpY = Math.sin(rad + Math.PI / 2);
      var perpOffset = (Math.random() - 0.5) * 12;
      var finalX = pt.x + perpX * perpOffset;
      var finalY = pt.y + perpY * perpOffset;

      // Random rotation variation
      var randomAngle = (Math.random() - 0.5) * 35;

      // Random size variation
      var scale = 0.7 + Math.random() * 0.7;

      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      var xf = 'translate(' + finalX + ', ' + finalY + ') rotate(' + (angle + randomAngle) + ') scale(' + scale + ')';
      g.setAttribute('transform', xf);
      g.style.opacity = '0';
      g.style.transition = 'opacity 0.25s ease';
      svg.appendChild(g);

      var symIdx = Math.floor(Math.random() * NOMAI_SYMBOLS.length);
      var elements = NOMAI_SYMBOLS[symIdx](svg, g);
      for (var e = 0; e < elements.length; e++) {
        if (!elements[e].getAttribute('stroke') && elements[e].tagName !== 'circle') {
          elements[e].setAttribute('stroke', '#63b3ed');
          elements[e].setAttribute('fill', 'none');
          elements[e].setAttribute('stroke-width', '1.5');
          elements[e].setAttribute('stroke-linecap', 'round');
          elements[e].setAttribute('stroke-linejoin', 'round');
        } else if (elements[e].tagName === 'circle') {
          if (!elements[e].getAttribute('fill')) {
            elements[e].setAttribute('fill', '#63b3ed');
          }
          if (!elements[e].getAttribute('stroke')) {
            elements[e].setAttribute('stroke', 'none');
          }
        }
      }

      symbolData.push({ elements: elements, dist: dist, group: g });

      // Variable tight spacing: next symbol 6-18px ahead
      dist += 6 + Math.random() * 12;
    }
  }

  build();

  // Rebuild on resize (debounced)
  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(build, 200);
  });

  var section = wrapper.closest('.timeline-section');
  var items = wrapper.querySelectorAll('.tl-item');
  function onScroll() {
    if (pathLen <= 0) return;

    var wh = window.innerHeight;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var docEl = document.documentElement;
    var maxScroll = (docEl.scrollHeight || document.body.scrollHeight) - wh;
    var sectionTop = section.offsetTop;
    var scrollStart = sectionTop - wh;
    var scrollRange = maxScroll - scrollStart;
    var progress = scrollRange > 0
      ? Math.max(0, Math.min(1, (scrollY - scrollStart) / scrollRange))
      : 0;

    // Draw the line
    var drawn = pathLen * progress;
    corePath.style.strokeDashoffset = pathLen - drawn;
    glowPath.style.strokeDashoffset = pathLen - drawn;
    bloomPath.style.strokeDashoffset = pathLen - drawn;

    // Reveal items evenly based on index
    var itemCount = items.length;
    for (var i = 0; i < itemCount; i++) {
      if (progress >= (i + 1) / itemCount - 0.04) {
        items[i].classList.add('visible');
      }
    }

    // Reveal Nomai symbols as the line passes them
    for (var s = 0; s < symbolData.length; s++) {
      var symProgress = symbolData[s].dist / pathLen;
      if (progress >= symProgress) {
        symbolData[s].group.style.opacity = '1';
      } else {
        symbolData[s].group.style.opacity = '0';
      }
    }
  }

  window.addEventListener('scroll', onScroll);
  onScroll();

  var resizeObserver = new ResizeObserver(function () {
    onScroll();
  });
  resizeObserver.observe(wrapper);
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  var section = document.querySelector('.timeline-section');
  var wrapper = document.querySelector('.tl-wrapper');

  if (section) createStarfield(section);
  if (wrapper) createTimelinePath(wrapper);
});
