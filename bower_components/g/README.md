Usage
=====

First, read the documentation at <https://learn.gramener.com/docs/g>

You can install via bower using:

    bower install https://code.gramener.com/s.anand/g.git

`G.min.js` is bundled with [Gramex 0.x](/s.anand/vis/). Add these lines to the
end of your code:

    <script src="{{ static_url('/js/jquery2.min.js') }}">
    <script src="{{ static_url('/js/G.min.js') }}">

NOTE: jQuery 2.0 or above is required to work with SVG elements.

You can also pick up the latest unminified version at
<https://learn.gramener.com/docs/g.test/lib/G.js>.

Testing
=======

Visit <https://learn.gramener.com/docs/g.test/mocha/> to run unit tests.
Or...

- Install [nodejs](http://nodejs.org/). Note: On Cygwin, re-save the npm .sh files with UNIX line-endings
- `npm install -g uglify-js mocha`
- Clone this repo and go to the `test` folder
- Run a web server, e.g. `python -mSimpleHTTPServer`
- Visit <http://127.0.0.1:8888/mocha/>

Selenium tests
--------------

The `test/ui` folder has UI test cases. To run them, go to the `test` folder
and run:

    python -mSimpleHTTPServer

Then open `ui/index.html` in Selenium IDE > File > Open Test Suite.


Interaction
-----------

1. [Click to filter](https://learn.gramener.com/docs/g#urlfilter)
    - TODO: Handle URL filtering for multiple values of the same key.
1. [Hover to highlight](https://learn.gramener.com/docs/g#highlight)
1. [Search as you type](https://learn.gramener.com/docs/g#search)
    - TODO: debounce to be implemented
    - TODO: search refresh event to be exposed
1. [Click to reveal](https://learn.gramener.com/docs/g#reveal)
1. [Pan & Zoom](https://learn.gramener.com/docs/g#panzoom)
    - TODO: smooth viewbox animation
    - TODO: pinch to zoom on touch devices
    - TODO: slide to pan on touch devices
    - TODO: mousewheel to increase / decrease level of zoom on desktops
    - TODO: hover to pan or drag to pan on desktops
    - TODO: click on control to toggle zoom behaviour
1. ZoomTo: Smoothly zoom to an element
1. Brush to filter. (This is a 2D slider. With custom draggable handles, one can mimic horizontal sliders, vertical sliders AND rectangle selections. This will interact in exactly the same way that a rectangle in PowerPoint interacts.)
1. Drag to re-position / re-size / rotate. Move / resize an element anywhere on the page, apply an arbitrary transformation, AND STORE IT
1. Formula-based refresh of content / attributes, like AngularJS / MoneyFlicks

Layouts
-------

1. [Preserve aspect ratio](https://learn.gramener.com/docs/g#panzoom) on resize
1. Equal height columns

Components
----------

1. Slider.
1. Timeline
1. Loading indicator
1. Dropdown
    - TODO: Search as you type
    - TODO: Multiselect
    - TODO: Hierarchy
    - TODO: Select all (clear all), Show selected (show all)
1. Gradient picker
1. Color picker

Common TODO
-----------

- If there is a clash, e.g. multiple highlights acting on the same element, how to resolve it?
- How should highlights be used as persistent filters across operations?
- Implement namespaces so that interactions can be toggled independently
- Events thrown by all of these
