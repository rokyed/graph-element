# graph-element

This project demonstrates a simple custom web component called `graph-element`.
It can be used to draw small graphs by supplying JSON data via the `data` attribute.

## Trace support

`graph-element` also supports a `trace` attribute which accepts a JSON
array of node IDs representing the flow of data through the graph. Edges
that belong to the trace are drawn in blue with arrowheads to indicate
direction.

Open `index.html` in a browser to see the element in action.
