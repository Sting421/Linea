"use strict";
var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // ds-raw:__ds_raw__
  var require_ds_raw = __commonJS({
    "ds-raw:__ds_raw__"(exports, module) {
      init_define_import_meta_env();
      module.exports = window.Reap;
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x in p) if (x !== "children") o[x] = p[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx2(t, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t, np(p, k)) : R.createElement(t, np(p, k), c);
      }
      function jsxs2(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs2;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs2 : jsx2)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/PreviewCard.tsx
  var PreviewCard_exports = {};
  __export(PreviewCard_exports, {
    AreaOneInstances: () => AreaOneInstances,
    EmptyAndZero: () => EmptyAndZero,
    LiveDeepLinks: () => LiveDeepLinks
  });
  init_define_import_meta_env();

  // ds-shim:ds
  var ds_exports = {};
  __export(ds_exports, {
    default: () => ds_default
  });
  init_define_import_meta_env();
  __reExport(ds_exports, __toESM(require_ds_raw()));
  var g = window.Reap;
  var ds_default = "default" in g ? g.default : g;

  // .design-sync/previews/PreviewCard.tsx
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var row = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(240px, 1fr))",
    gap: 16,
    alignItems: "stretch"
  };
  var Trend = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { "aria-hidden": "true", style: { width: "100%", height: "100%" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 100 32", preserveAspectRatio: "none", width: "100%", height: "100%", style: { display: "block" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "path",
    {
      d: "M 3 24 L 15 18 L 27 21 L 39 12 L 51 15 L 63 8 L 75 11 L 87 5 L 97 9",
      fill: "none",
      stroke: "#009DE4",
      strokeWidth: "1.6",
      vectorEffect: "non-scaling-stroke",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) }) });
  var AreaOneInstances = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: row, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.PreviewCard,
      {
        title: "Grid condition",
        value: 49.98,
        unit: "Hz",
        caption: "Rolling 24h · 128 sites",
        sparkline: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trend, {})
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.PreviewCard,
      {
        title: "Financial impact",
        state: "placeholder",
        caption: "Savings and tariff impact"
      }
    )
  ] });
  var LiveDeepLinks = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: row, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.PreviewCard, { title: "Estimated savings", value: "$1,284", caption: "This month", href: "/savings" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.PreviewCard, { title: "Events", value: 12, caption: "Last 7 days", href: "/events", sparkline: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trend, {}) })
  ] });
  var EmptyAndZero = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: row, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.PreviewCard, { title: "Grid condition", value: null, caption: "Rolling 24h", href: "/grid" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.PreviewCard, { title: "Events", value: null, emptyLabel: "No events in range", href: "/events" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.PreviewCard, { title: "Curtailment events", value: 0, caption: "Zero is a value, not empty", href: "/events" })
  ] });
  return __toCommonJS(PreviewCard_exports);
})();
