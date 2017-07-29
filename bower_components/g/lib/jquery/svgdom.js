/*
  The problem with jQuery's class functions is that they use
  element.className. For DOM elements, this is a DOMString. For SVG elements,
  this is an SVGAnimatedString, which is an object. All we need to do is use
  element.className.baseVal if it exists instead.

  element.className is used in addClass, removeClass, toggleClass and
  hasClass.

  NOTE: .filter() will not work fine in jQuery 1.x -- you NEED jQuery 2.x.
  (You can monkey patch $.expr.filter.CLASS, but since we're anyway targeting
  IE9+, there's no point supporting jQuery 1.x.)

  Changes made:

  1. Add hasBaseVal = typeof elem.className == "object"
  1. Add cls = hasBaseVal ? elem.className.baseVal : elem.className
  1. Use these two variables to get and set className

 */

var rclass = /[\t\r\n\f]/g,
    // Used for splitting on whitespace
    core_rnotwhite = /\S+/g;

let addClass = function( value ) {
    var classes, elem, cur, clazz, j,
        hasBaseVal, cls,
        i = 0,
        len = this.length,
        proceed = typeof value === "string" && value;

    if ( jQuery.isFunction( value ) ) {
        return this.each(function( j ) {
            jQuery( this ).addClass( value.call( this, j, typeof this.className == "object" ? this.className.baseVal : this.className ) );
        });
    }

    if ( proceed ) {
        // The disjunction here is for better compressibility (see removeClass)
        classes = ( value || "" ).match( core_rnotwhite ) || [];

        for ( ; i < len; i++ ) {
            elem = this[ i ];
            hasBaseVal = typeof elem.className == "object";
            cls = hasBaseVal ? elem.className.baseVal : elem.className;
            cur = elem.nodeType === 1 && ( cls ?
                ( " " + cls + " " ).replace( rclass, " " ) :
                " "
            );

            if ( cur ) {
                j = 0;
                while ( (clazz = classes[j++]) ) {
                    if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
                        cur += clazz + " ";
                    }
                }
                if ( hasBaseVal ) {
                    elem.className.baseVal = jQuery.trim( cur );
                } else {
                    elem.className = jQuery.trim( cur );
                }


            }
        }
    }

    return this;
};


let removeClass = function( value ) {
    var classes, elem, cur, clazz, j,
        hasBaseVal, cls,
        i = 0,
        len = this.length,
        proceed = arguments.length === 0 || typeof value === "string" && value;

    if ( jQuery.isFunction( value ) ) {
        return this.each(function( j ) {
            jQuery( this ).removeClass( value.call( this, j, typeof this.className == "object" ? this.className.baseVal : this.className ) );
        });
    }
    if ( proceed ) {
        classes = ( value || "" ).match( core_rnotwhite ) || [];

        for ( ; i < len; i++ ) {
            elem = this[ i ];
            hasBaseVal = typeof elem.className == "object";
            cls = hasBaseVal ? elem.className.baseVal : elem.className;
            // This expression is here for better compressibility (see addClass)
            cur = elem.nodeType === 1 && ( cls ?
                ( " " + cls + " " ).replace( rclass, " " ) :
                ""
            );

            if ( cur ) {
                j = 0;
                while ( (clazz = classes[j++]) ) {
                    // Remove *all* instances
                    while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
                        cur = cur.replace( " " + clazz + " ", " " );
                    }
                }
                if ( hasBaseVal ) {
                    elem.className.baseVal = value ? jQuery.trim( cur ) : "";
                } else {
                    elem.className = value ? jQuery.trim( cur ) : "";
                }
            }
        }
    }

    return this;
};


let toggleClass = function( value, stateVal ) {
    var type = typeof value;

    if ( typeof stateVal === "boolean" && type === "string" ) {
        return stateVal ? this.addClass( value ) : this.removeClass( value );
    }

    if ( jQuery.isFunction( value ) ) {
        return this.each(function( i ) {
            jQuery( this ).toggleClass( value.call(this, i, typeof this.className == "object" ? this.className.baseVal : this.className, stateVal), stateVal );
        });
    }

    return this.each(function() {
        var hasBaseVal, cls;
        if ( type === "string" ) {
            // toggle individual class names
            var className,
                i = 0,
                self = jQuery( this ),
                classNames = value.match( core_rnotwhite ) || [];

            while ( (className = classNames[ i++ ]) ) {
                // check each className given, space separated list
                if ( self.hasClass( className ) ) {
                    self.removeClass( className );
                } else {
                    self.addClass( className );
                }
            }

        // Toggle whole class name
        } else if ( type === core_strundefined || type === "boolean" ) {
            hasBaseVal = typeof this.className == "object";
            cls = hasBaseVal ? this.className.baseVal : this.className
            if ( cls ) {
                // store className if set
                data_priv.set( this, "__className__", cls );
            }

            // If the element has a class name or if we're passed "false",
            // then remove the whole classname (if there was one, the above saved it).
            // Otherwise bring back whatever was previously saved (if anything),
            // falling back to the empty string if nothing was stored.
            if ( hasBaseVal ) {
                this.className.baseVal = this.className.baseVal || value === false ? "" : data_priv.get( this, "__className__" ) || "";
            } else {
                this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
            }
        }
    });
};


let hasClass = function( selector ) {
    var className = " " + selector + " ",
        cls,
        i = 0,
        l = this.length;
    for ( ; i < l; i++ ) {
        cls = this[i].className;
        if ( this[i].nodeType === 1 && (" " + (typeof cls == "object" ? cls.baseVal : cls) + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
            return true;
        }
    }

    return false;
};
export {addClass, removeClass, toggleClass, hasClass}
