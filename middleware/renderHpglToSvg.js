const { parseHPGLToPaths } = require("./hpglToSvg");

function renderHpglToSvg({
  hpglCode,
  applyScaling = false,
  flipY = false,
  stroke = "#000",
  strokeWidth = 90,
  margin = 50,
  scale = 1,
}) {
  const { paths, bbox } = parseHPGLToPaths(hpglCode, { applyScaling });

  const vbRawWidth = Math.max(0, bbox.maxX - bbox.minX);
  const vbRawHeight = Math.max(0, bbox.maxY - bbox.minY);

  const vbWidth = vbRawWidth + margin * 2;
  const vbHeight = vbRawHeight + margin * 2;

  const translateX = margin - bbox.minX;
  const translateY = margin - bbox.minY;

  const flipTransform = flipY ? `scale(1,-1) translate(0,-${vbHeight})` : "";

  const pixelWidth = vbWidth * scale;
  const pixelHeight = vbHeight * scale;

  const pathsD = paths.map((p, i) => `<path d="${p.d}" />`).join("");

  return `
    <svg width="${pixelWidth}" height="${pixelHeight}" viewBox="0 0 ${vbWidth} ${vbHeight}" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="${stroke}" stroke-width="${strokeWidth}">
        <g transform="translate(${translateX},${translateY}) ${flipTransform}">
          ${pathsD}
        </g>
      </g>
    </svg>`.trim();
}

module.exports = { renderHpglToSvg };
