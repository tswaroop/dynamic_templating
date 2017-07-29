let version = "0.0.10";

// Import JS modules
import * as url from "./lib/url.js"
export {csv} from "./lib/csv.js"
export {style, styles} from "./lib/style.js"
export {download} from "./lib/download.js"
export {wrap} from "./lib/wrap.js"
export {zoom} from "./lib/zoom.js"
import * as network from "./lib/chart/network.js"
export {version, url, network}
export {unpack} from './lib/chart/unpack.js'
export {map} from './lib/chart/map.js'

/*jQuery modules are imported here*/
import {dispatch} from "./lib/jquery/dispatch.js"
import {findall, notall, getSize} from './lib/jquery/start.js'
import {addClass, removeClass, toggleClass, hasClass} from './lib/jquery/svgdom.js'
import {aspect} from './lib/jquery/aspect.js'
import {urlfilter} from './lib/jquery/urlfilter.js'
import {search} from './lib/jquery/search.js'
import {highlight} from './lib/jquery/highlight.js'
import {panzoom} from './lib/jquery/panzoom.js'
import {reveal} from './lib/jquery/reveal.js'
import {template} from './lib/jquery/template.js'
import {doodle} from './lib/jquery/doodle.js'
if (typeof jQuery != 'undefined') {
    jQuery.extend(jQuery.fn, {
        dispatch: dispatch,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        hasClass: hasClass,
        findall: findall,
        notall: notall,
        getSize: getSize,
        aspect: aspect,
        urlfilter: urlfilter,
        search: search,
        highlight: highlight,
        panzoom: panzoom,
        reveal: reveal,
        template: template,
        doodle: doodle
    })
}
