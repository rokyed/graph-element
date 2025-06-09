class GraphElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
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
      </style>
      <div>Graph element placeholder</div>
    `;
  }
}

customElements.define('graph-element', GraphElement);
