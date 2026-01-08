const NUM_RE = /[-+]?\d*\.?\d+/g;

function transformPoint(x, y, st) {
  if (!st.ip || !st.sc || !st.applyScaling) return [x, y];

  const { x1, y1, x2, y2 } = st.ip;
  const { xmin, xmax, ymin, ymax } = st.sc;

  const t = (val, a0, a1, b0, b1) => b0 + ((val - a0) / (a1 - a0)) * (b1 - b0);
  const tx = t(x, xmin, xmax, x1, x2);
  const ty = t(y, ymin, ymax, y1, y2);
  return [tx, ty];
}

function parseHPGLToPaths(hpgl, options = { applyScaling: false }) {
  const st = {
    pos: [0, 0],
    penDown: false,
    current: null,
    ip: undefined,
    sc: undefined,
    applyScaling: !!options.applyScaling,
  };

  const paths = [];
  const points = [];

  function pushCurrentPath() {
    if (st.current && st.current.length >= 2) {
      const pts = st.current;
      const dParts = [`M ${pts[0][0]} ${pts[0][1]}`];
      for (let i = 1; i < pts.length; i++) {
        dParts.push(`L ${pts[i][0]} ${pts[i][1]}`);
      }
      paths.push({ d: dParts.join(" ") });
    }
    st.current = null;
  }

  let i = 0;
  const n = hpgl.length;

  while (i < n) {
    while (i < n && /\s/.test(hpgl[i])) i++;
    if (
      i + 1 >= n ||
      !/[A-Za-z]/.test(hpgl[i]) ||
      !/[A-Za-z]/.test(hpgl[i + 1])
    ) {
      i++;
      continue;
    }

    const cmd = hpgl.slice(i, i + 2);
    i += 2;

    let payload = "";
    if (cmd === "LB") {
      while (i < n && hpgl[i] !== "\x03") i++;
      if (i < n && hpgl[i] === "\x03") i++;
      continue;
    } else {
      const start = i;
      while (i < n && hpgl[i] !== ";") i++;
      payload = hpgl.slice(start, i);
      if (i < n && hpgl[i] === ";") i++;
    }

    switch (cmd) {
      case "IN":
        pushCurrentPath();
        st.pos = [0, 0];
        st.penDown = false;
        break;

      case "IP": {
        const nums = (payload.match(NUM_RE) || []).map(Number);
        if (nums.length >= 4) {
          st.ip = { x1: nums[0], y1: nums[1], x2: nums[2], y2: nums[3] };
        }
        break;
      }

      case "SC": {
        const nums = (payload.match(NUM_RE) || []).map(Number);
        if (nums.length >= 4) {
          st.sc = {
            xmin: nums[0],
            xmax: nums[1],
            ymin: nums[2],
            ymax: nums[3],
          };
        }
        break;
      }

      case "PU": {
        const nums = (payload.match(NUM_RE) || []).map(Number);
        pushCurrentPath();
        for (let j = 0; j + 1 < nums.length; j += 2) {
          let x = nums[j],
            y = nums[j + 1];
          [x, y] = transformPoint(x, y, st);
          st.pos = [x, y];
          st.penDown = false;
          points.push([x, y]);
        }
        break;
      }

      case "PD": {
        const nums = (payload.match(NUM_RE) || []).map(Number);
        if (!st.current) {
          st.current = [[st.pos[0], st.pos[1]]];
        }
        for (let j = 0; j + 1 < nums.length; j += 2) {
          let x = nums[j],
            y = nums[j + 1];
          [x, y] = transformPoint(x, y, st);
          st.current.push([x, y]);
          st.pos = [x, y];
          st.penDown = true;
          points.push([x, y]);
        }
        break;
      }

      default:
        break;
    }
  }

  pushCurrentPath();

  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 100;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 100;

  return { paths, bbox: { minX, minY, maxX, maxY } };
}

module.exports = { parseHPGLToPaths };
