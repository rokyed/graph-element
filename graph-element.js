class GraphElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.canvas = document.createElement('canvas');
    this.canvas.width = 300;
    this.canvas.height = 300;
    this.ctx = this.canvas.getContext('2d');
  }

  static get observedAttributes() {
    return ['data', 'trace'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ((name === 'data' || name === 'trace') && oldValue !== newValue) {
      this.draw();
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

  parseTrace() {
    const traceAttr = this.getAttribute('trace');
    if (!traceAttr) return [];
    try {
      return JSON.parse(traceAttr);
    } catch (e) {
      console.error('graph-element: invalid trace attribute', e);
      return [];
    }
  }

  draw() {
    const data = this.parseData();
    const trace = this.parseTrace();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!data) {
      ctx.fillStyle = '#000';
      ctx.fillText('No data', 10, 20);
      return;
    }

    ctx.strokeStyle = '#000';
    data.edges.forEach(edge => {
      const from = data.nodes.find(n => n.id === edge.from);
      const to = data.nodes.find(n => n.id === edge.to);
      if (from && to) {
        const inTrace = trace.some((id, i) => {
          return trace[i + 1] && id === edge.from && trace[i + 1] === edge.to;
        });

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
        }
      </style>
    `;
    this.shadowRoot.appendChild(this.canvas);
    this.draw();
  }
}

customElements.define('graph-element', GraphElement);
