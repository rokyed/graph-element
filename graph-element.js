class GraphElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.canvas = document.createElement('canvas');
    this.canvas.width = 300;
    this.canvas.height = 300;
    this.ctx = this.canvas.getContext('2d');

    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isPanning = false;
    this.startPanX = 0;
    this.startPanY = 0;
    this.startOffsetX = 0;
    this.startOffsetY = 0;
    this.canvas.addEventListener('wheel', e => this.onWheel(e));
    this.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());

    // Ensure the canvas always matches the element's size
    this.resizeObserver = new ResizeObserver(() => this.draw());
  }

  resizeCanvas() {
    this.canvas.width = this.clientWidth;
    this.canvas.height = this.clientHeight;
  }

  static get observedAttributes() {
    return ['data', 'trace', 'height'];
  }

  connectedCallback() {
    this.render();
    this.resizeObserver.observe(this);
    this.updateHeight();
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ((name === 'data' || name === 'trace') && oldValue !== newValue) {
      this.draw();
    }
    if (name === 'height' && oldValue !== newValue) {
      this.updateHeight();
    }
  }

  parseData() {
    const dataAttr = this.getAttribute('data');
    if (!dataAttr) return null;
    try {
      return JSON.parse(dataAttr);
    } catch (e) {
      console.error('graph-element: invalid data attribute', e);
      return null;
    }
  }

  parseTraces() {
    const traceAttr = this.getAttribute('trace');
    if (!traceAttr) return [];
    try {
      const parsed = JSON.parse(traceAttr);
      if (Array.isArray(parsed)) {
        // Support both single trace as an array and multiple traces as an array of arrays
        if (parsed.length === 0) {
          return [];
        }
        if (Array.isArray(parsed[0])) {
          return parsed;
        }
        return [parsed];
      }
      return [];
    } catch (e) {
      console.error('graph-element: invalid trace attribute', e);
      return [];
    }
  }

  updateHeight() {
    const heightAttr = this.getAttribute('height');
    if (heightAttr) {
      if (/^\d+$/.test(heightAttr)) {
        this.style.height = `${heightAttr}px`;
      } else {
        this.style.height = heightAttr;
      }
    } else {
      this.style.removeProperty('height');
    }
    this.draw();
  }

  onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    this.scale *= factor;
    this.draw();
  }

  onMouseDown(e) {
    e.preventDefault();
    this.isPanning = true;
    this.startPanX = e.clientX;
    this.startPanY = e.clientY;
    this.startOffsetX = this.offsetX;
    this.startOffsetY = this.offsetY;
  }

  onMouseMove(e) {
    if (!this.isPanning) return;
    e.preventDefault();
    const dx = (e.clientX - this.startPanX) / this.scale;
    const dy = (e.clientY - this.startPanY) / this.scale;
    this.offsetX = this.startOffsetX + dx;
    this.offsetY = this.startOffsetY + dy;
    this.draw();
  }

  onMouseUp() {
    this.isPanning = false;
  }

  draw() {
    this.resizeCanvas();
    const data = this.parseData();
    const traces = this.parseTraces();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.scale(this.scale, this.scale);
    this.drawGrid();
    ctx.translate(this.offsetX, this.offsetY);
    if (!data) {
      ctx.fillStyle = '#000';
      ctx.fillText('No data', 10, 20);
      ctx.restore();
      return;
    }

    ctx.strokeStyle = '#000';
    data.edges.forEach(edge => {
      const from = data.nodes.find(n => n.id === edge.from);
      const to = data.nodes.find(n => n.id === edge.to);
      if (from && to) {
        const inTrace = traces.some(trace =>
          trace.some((id, i) => trace[i + 1] && id === edge.from && trace[i + 1] === edge.to)
        );

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        if (inTrace) {
          ctx.strokeStyle = '#00f';
        } else {
          ctx.strokeStyle = '#000';
        }
        ctx.stroke();

        if (inTrace) {
          this.drawArrow(from, to);
        }
      }
    });

    data.nodes.forEach(node => {
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillText(node.id, node.x + 7, node.y + 3);
    });
    ctx.restore();
  }

  drawArrow(from, to) {
    const ctx = this.ctx;
    const headlen = 7; // length of head in pixels
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const tox = to.x;
    const toy = to.y;
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(tox, toy);
    ctx.fillStyle = '#00f';
    ctx.fill();
  }

  drawGrid() {
    const ctx = this.ctx;
    const spacing = 25;
    const width = this.canvas.width / this.scale;
    const height = this.canvas.height / this.scale;
    const startX = ((-this.offsetX % spacing) + spacing) % spacing;
    const startY = ((-this.offsetY % spacing) + spacing) % spacing;
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    for (let x = startX; x <= width; x += spacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY; y <= height; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1em;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        canvas {
          background: #fff;
          width: 100%;
          height: 100%;
        }
      </style>
    `;
    this.shadowRoot.appendChild(this.canvas);
    this.draw();
  }
}

customElements.define('graph-element', GraphElement);
