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

  // .design-sync/previews/StatCard.tsx
  var StatCard_exports = {};
  __export(StatCard_exports, {
    CapacityFacts: () => CapacityFacts,
    EmptyAndAbsent: () => EmptyAndAbsent,
    HeadlineWithDelta: () => HeadlineWithDelta,
    StatusBreakdown: () => StatusBreakdown
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

  // .design-sync/previews/StatCard.tsx
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var row = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
    gap: 16,
    alignItems: "stretch"
  };
  var CapacityFacts = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { maxWidth: 720 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.StatCard,
    {
      label: "Fleet capacity",
      facts: [
        { label: "DC", value: 612.44, unit: "kW" },
        { label: "AC", value: 498, unit: "kW" },
        { label: "Storage", value: 120.5, unit: "kWh" },
        { label: "Export", value: 450, unit: "kW" }
      ]
    }
  ) });
  var HeadlineWithDelta = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: row, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.StatCard, { label: "Energy produced today", value: 482, unit: "kWh", delta: 12, note: "vs 410" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.StatCard, { label: "Grid import", value: 38, unit: "kWh", delta: -9, note: "vs 64" })
  ] });
  var StatusBreakdown = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { maxWidth: 340 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.StatCard,
    {
      label: "Status in view",
      value: "12 of 48",
      unit: "plants",
      breakdown: [
        { label: "fault", count: 2, tone: "fault" },
        { label: "warning", count: 3, tone: "warning" },
        { label: "offline", count: 1, tone: "offline" }
      ]
    }
  ) });
  var EmptyAndAbsent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: row, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.StatCard, { label: "Fleet capacity", value: null }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.StatCard, { label: "Events", value: null, emptyLabel: "Not reporting" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.StatCard,
      {
        label: "Fleet capacity",
        facts: [
          { label: "DC", value: 612.4, unit: "kW" },
          { label: "Storage", value: null, unit: "kWh" }
        ]
      }
    )
  ] });
  return __toCommonJS(StatCard_exports);
})();
