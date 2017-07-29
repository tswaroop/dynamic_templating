# Creates G.js via ES6 modules
es6:
	npm install
	npm run build


DB_JS=	lib/jquery/dbapi.js

# List of files to include in G.min.js, in sequence
G_JS=	lib/canvas-to-blob.js \
	lib/start.js \
	lib/url.js \
	lib/csv.js \
	lib/style.js \
	lib/download.js \
	lib/wrap.js \
	lib/zoom.js \
	lib/jquery/start.js \
	lib/jquery/svgdom.js \
	lib/jquery/aspect.js \
	lib/jquery/dispatch.js \
	lib/jquery/urlfilter.js \
	lib/jquery/highlight.js \
	lib/jquery/panzoom.js \
	lib/jquery/reveal.js \
	lib/jquery/search.js \
	lib/jquery/template.js \
	lib/jquery/doodle.js \
	lib/jquery/end.js \
	lib/chart/unpack.js \
	lib/chart/map.js \
	lib/chart/network.js \
	lib/end.js

CSS= css/network.css \
	css/scroller.css \
	css/slider.css

all: hint dist/dbapi.min.js dist/G.min.js.gz dist/G.min.css

lint:
	eslint lib

# For size comparison: minified file
dist/G.min.js.gz: dist/G.min.js
	@gzip -1 --stdout $+ > $@
	chmod 644 $@

# The main target: the minified Javascript file
dist/G.min.js: test/lib/G.js
	@uglifyjs -m -o $@ $+
	chmod 644 $@

# Secondary target: the un-minified file
test/lib/G.js: $(G_JS)
	@cat $+ > tempfile
	@uglifyjs -b indent-level=2 -o $@ tempfile
	@rm tempfile
	chmod 644 $@

# The DB API minified Javascript file
dist/dbapi.min.js: $(DB_JS)
	@uglifyjs -m -o $@ $+
	chmod 644 $@

dist/G.min.css: $(CSS)
	cleancss -o $@ $+
