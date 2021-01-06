function _interopDefault(ex) {
    return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex;
}

var React = _interopDefault(require('react'));

function _extends() {
    // eslint-disable-next-line no-func-assign
    _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    };

    return _extends.apply(this, arguments);
}

var fi_box = require("./fi_box~GsuVzeko.svg").default;

var heading_yaw = require("./heading_yaw~bobjMqwT.svg").default;

var heading_mechanics = require("./heading_mechanics~LnEXqkNn.svg").default;

var fi_circle = require("./fi_circle~UWbONNsy.svg").default;

var vertical_mechanics = require("./vertical_mechanics~necSfeyG.svg").default;

var fi_needle = require("./fi_needle~xDIrdyew.svg").default;

var turn_coordinator = require("./turn_coordinator~AOvMJjuH.svg").default;

var fi_tc_airplane = require("./fi_tc_airplane~rlIjNUeF.svg").default;

var speed_mechanics = require("./speed_mechanics~bfCIlIYE.svg").default;

var altitude_pressure = require("./altitude_pressure~djhxaaFg.svg").default;

var altitude_ticks = require("./altitude_ticks~bkaxgnzJ.svg").default;

var fi_needle_small = require("./fi_needle_small~boLlQwLq.svg").default;

var horizon_back = require("./horizon_back~voMaAEaI.svg").default;

var horizon_ball = require("./horizon_ball~bcMjrNsr.svg").default;

var horizon_circle = require("./horizon_circle~qRDWUGmQ.svg").default;

var horizon_mechanics = require("./horizon_mechanics~rRLTtKVH.svg").default;

var constants = {
    pitch_bound: 30,
    vario_bound: 1.95,
    airspeed_bound_l: 0,
    airspeed_bound_h: 160
};
var box = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
};

var Instrument = function Instrument(_ref) {
    var children = _ref.children,
        showBox = _ref.showBox,
        size = _ref.size;
    return /*#__PURE__*/React.createElement("div", {
        className: "instrument heading",
        style: {
            height: size != null ? size : '250px',
            width: size != null ? size : '250px',
            position: 'relative',
            display: 'inline-block',
            overflow: 'hidden',
        }
    }, (showBox != null ? showBox : true) && /*#__PURE__*/React.createElement("img", {
        src: fi_box,
        className: "background box",
        style: box,
        alt: ""
    }), children);
};

var HeadingIndicator = function HeadingIndicator(params) {
    var _params$heading;
    var _params$animate;

    return /*#__PURE__*/React.createElement(Instrument, params, /*#__PURE__*/React.createElement("div", {
        className: "heading box",
        style: _extends({}, box, {
            transform: "rotate(" + ((_params$heading = -params.heading) != null ? _params$heading : 0) + "deg)",
            transition: (_params$animate = params.animate) ? "transform 1.5s ease" : "none",
        })
    }, /*#__PURE__*/React.createElement("img", {
        src: heading_yaw,
        className: "box",
        style: box,
        alt: ""
    })), /*#__PURE__*/React.createElement("div", {
        className: "mechanics box",
        style: box
    }, /*#__PURE__*/React.createElement("img", {
        src: heading_mechanics,
        className: "box",
        style: box,
        alt: ""
    }), /*#__PURE__*/React.createElement("img", {
        src: fi_circle,
        className: "box",
        style: box,
        alt: ""
    })), React.createElement("div", {className: "flex absolute h-full w-full"}, React.createElement("p", {
        className: "text-gray-400 pb-4 m-auto",
    }, (params.heading ? params.heading % 360 : 0) + "°")));
};
var Variometer = function Variometer(params) {
    var _params$vario;

    var vario = ((_params$vario = params.vario) != null ? _params$vario : 0) / 1000;
    if (vario > constants.vario_bound) vario = constants.vario_bound; else if (vario < -constants.vario_bound) vario = -constants.vario_bound;
    vario = vario * 90;
    return /*#__PURE__*/React.createElement(Instrument, params, /*#__PURE__*/React.createElement("img", {
        src: vertical_mechanics,
        className: "box",
        style: box,
        alt: ""
    }), /*#__PURE__*/React.createElement("div", {
        className: "vario box",
        style: _extends({}, box, {
            transform: "rotate(" + vario + "deg)"
        })
    }, /*#__PURE__*/React.createElement("img", {
        src: fi_needle,
        className: "box",
        style: box,
        alt: ""
    })), /*#__PURE__*/React.createElement("div", {
        className: "mechanics box",
        style: box
    }, /*#__PURE__*/React.createElement("img", {
        src: fi_circle,
        className: "box",
        style: box,
        alt: ""
    })));
};
var TurnCoordinator = function TurnCoordinator(params) {
    return /*#__PURE__*/React.createElement(Instrument, params, /*#__PURE__*/React.createElement("img", {
        src: turn_coordinator,
        className: "box",
        style: box,
        alt: ""
    }), /*#__PURE__*/React.createElement("div", {
        className: "turn box",
        style: _extends({}, box, {
            transform: "rotate(" + params.turn + "deg)"
        })
    }, /*#__PURE__*/React.createElement("img", {
        src: fi_tc_airplane,
        className: "box",
        style: box,
        alt: ""
    })), /*#__PURE__*/React.createElement("div", {
        className: "mechanics box",
        style: box
    }, /*#__PURE__*/React.createElement("img", {
        src: fi_circle,
        className: "box",
        style: box,
        alt: ""
    })));
};
var Airspeed = function Airspeed(params) {
    var _params$speed;

    var speed = (_params$speed = params.speed) != null ? _params$speed : 0;
    if (speed > constants.airspeed_bound_h) speed = constants.airspeed_bound_h; else if (speed < constants.airspeed_bound_l) speed = constants.airspeed_bound_l;
    speed = 90 + speed * 2;
    return /*#__PURE__*/React.createElement(Instrument, params, /*#__PURE__*/React.createElement("img", {
        src: speed_mechanics,
        className: "box",
        style: box,
        alt: ""
    }), /*#__PURE__*/React.createElement("div", {
        className: "speed box",
        style: _extends({}, box, {
            transform: "rotate(" + speed + "deg)",
            transition: "transform 1.5s ease",
        })
    }, /*#__PURE__*/React.createElement("img", {
        src: fi_needle,
        className: "box",
        style: box,
        alt: ""
    })), /*#__PURE__*/React.createElement("div", {
        className: "mechanics box",
        style: box
    }, /*#__PURE__*/React.createElement("img", {
        src: fi_circle,
        className: "box",
        style: box,
        alt: ""
    })));
};
var Altimeter = function Altimeter(params) {
    var _params$altitude, _params$pressure;

    var altitude = (_params$altitude = params.altitude) != null ? _params$altitude : 0;
    var needle = 90 + altitude % 1000 * 360 / 1000;
    var needleSmall = altitude / 10000 * 360;
    var pressure = (_params$pressure = params.pressure) != null ? _params$pressure : 1013.25;
    pressure = 2 * pressure - 1980;
    return /*#__PURE__*/React.createElement(Instrument, params, /*#__PURE__*/React.createElement("div", {
        className: "pressure box",
        style: _extends({}, box, {
            transform: "rotate(" + pressure + "deg)"
        })
    }, /*#__PURE__*/React.createElement("img", {
        src: altitude_pressure,
        className: "box",
        style: box,
        alt: ""
    })), /*#__PURE__*/React.createElement("img", {
        src: altitude_ticks,
        className: "box",
        style: box,
        alt: ""
    }), /*#__PURE__*/React.createElement("div", {
        className: "needleSmall box",
        style: _extends({}, box, {
            transform: "rotate(" + needleSmall + "deg)"
        })
    }, /*#__PURE__*/React.createElement("img", {
        src: fi_needle_small,
        className: "box",
        style: box,
        alt: ""
    })), /*#__PURE__*/React.createElement("div", {
        className: "needle box",
        style: _extends({}, box, {
            transform: "rotate(" + needle + "deg)"
        })
    }, /*#__PURE__*/React.createElement("img", {
        src: fi_needle,
        className: "box",
        style: box,
        alt: ""
    })), /*#__PURE__*/React.createElement("div", {
        className: "mechanics box",
        style: box
    }, /*#__PURE__*/React.createElement("img", {
        src: fi_circle,
        className: "box",
        style: box,
        alt: ""
    })));
};
var AttitudeIndicator = function AttitudeIndicator(params) {
    var _params$pitch, _params$roll;

    var pitch = (_params$pitch = params.pitch) != null ? _params$pitch : 0;

    if (pitch > constants.pitch_bound) {
        pitch = constants.pitch_bound;
    } else if (pitch < -constants.pitch_bound) {
        pitch = -constants.pitch_bound;
    }

    return /*#__PURE__*/React.createElement(Instrument, params, /*#__PURE__*/React.createElement("div", {
        className: "roll box",
        style: _extends({}, box, {
            top: '0%',
            transform: "rotate(" + ((_params$roll = params.roll) != null ? _params$roll : 0) + "deg)",
            transition: "transform 1.5s ease"
        })
    }, /*#__PURE__*/React.createElement("img", {
        src: horizon_back,
        className: "box",
        alt: "",
        style: _extends({}, box)
    }), /*#__PURE__*/React.createElement("div", {
        className: "pitch box",
        style: _extends({}, box, {
            top: pitch * 0.7 + "%",
            transition: "top 1.5s ease"
        })
    }, /*#__PURE__*/React.createElement("img", {
        src: horizon_ball,
        className: "box",
        style: box,
        alt: ""
    })), /*#__PURE__*/React.createElement("img", {
        src: horizon_circle,
        className: "box",
        style: box,
        alt: ""
    })), /*#__PURE__*/React.createElement("div", {
        className: "mechanics box",
        style: box
    }, /*#__PURE__*/React.createElement("img", {
        src: horizon_mechanics,
        className: "box",
        style: box,
        alt: ""
    }), /*#__PURE__*/React.createElement("img", {
        src: fi_circle,
        className: "box",
        style: box,
        alt: ""
    })));
};

exports.Airspeed = Airspeed;
exports.Altimeter = Altimeter;
exports.AttitudeIndicator = AttitudeIndicator;
exports.HeadingIndicator = HeadingIndicator;
exports.TurnCoordinator = TurnCoordinator;
exports.Variometer = Variometer;
//# sourceMappingURL=index.js.map
