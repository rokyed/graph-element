# graph-element

This project demonstrates a simple custom web component called `graph-element`.
It can be used to draw small graphs by supplying JSON data via the `data` attribute.

## Trace support

`graph-element` also supports a `trace` attribute which accepts either a
single JSON array of node IDs or an array of such arrays to represent
multiple traces through the graph. Edges that belong to any trace are
drawn in blue with arrowheads to indicate direction.

## Grid and Zoom

The canvas now displays a light grid and you can use the mouse wheel to
zoom in and out of the graph.

Open `index.html` in a browser to see the element in action.
