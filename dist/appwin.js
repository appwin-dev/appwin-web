(function(){'use strict';var O="appwin-host",b="appwin-panel";function p(e){return {v:2,from:O,...e}}function g(e){return {v:2,from:b,...e}}function E(e,t){if(typeof e!="object"||e===null)return null;let r=e;return r.from!==t||r.v!==2&&r.v!==1?null:r}function w(e){let t=E(e,b);if(!t)return null;switch(t.type){case "ready":return typeof t.primary!="string"||typeof t.primaryForeground!="string"?null:g({type:"ready",primary:t.primary,primaryForeground:t.primaryForeground});case "unread":return typeof t.count!="number"||!Number.isFinite(t.count)?null:g({type:"unread",count:Math.max(0,Math.trunc(t.count))});case "close":return g({type:"close"});default:return null}}var x={openMessenger:"Open the support messenger",closeMessenger:"Close the support messenger",messenger:"Support messenger"},L={openMessenger:"Ouvrir la messagerie d'assistance",closeMessenger:"Fermer la messagerie d'assistance",messenger:"Messagerie d'assistance"},S={en:x,fr:L};function v(e){let t=(e??"").toLowerCase().split("-")[0];return t&&S[t]||x}function A(e){let t=[],r=false;return {post(s){r?e(s):t.push(s);},open(){if(!r){r=true;for(let s of t.splice(0))e(s);}}}}var T="2147483000",I=480;function k(){let e=document.currentScript??document.querySelector("script[data-appwin-app-id]");if(!e)return null;let t=e.getAttribute("data-appwin-app-id");if(!t)return null;let r=e.getAttribute("data-appwin-panel-url")??new URL("panel.js",e.src||location.href).toString();return {appId:t,panelScriptUrl:r,apiUrl:e.getAttribute("data-appwin-api-url"),gatewayUrl:e.getAttribute("data-appwin-gateway-url"),externalId:e.getAttribute("data-appwin-external-id")??e.getAttribute("data-appwin-user-id")}}function f(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function U(e){let t=[["data-app-id",e.appId],["data-host-origin",location.origin],["data-api-url",e.apiUrl],["data-gateway-url",e.gatewayUrl],["data-external-id",e.externalId]].filter(s=>typeof s[1]=="string"&&s[1]!=="").map(([s,c])=>` ${s}="${f(c)}"`).join("");return `<!doctype html><html lang="${f(document.documentElement.lang||"en")}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="robots" content="noindex"><title>Appwin</title></head><body><div id="root"></div><script src="${f(e.panelScriptUrl)}"${t}></script></body></html>`}function C(){return `
    :host { all: initial; }
    button, iframe { box-sizing: border-box; }
    .launcher {
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 56px;
      height: 56px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: #1f1f1f;
      color: #fff;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.24);
      display: none;
      align-items: center;
      justify-content: center;
      transition: transform 120ms ease, opacity 120ms ease;
    }
    .launcher[data-visible='true'] { display: flex; }
    .launcher:hover { transform: scale(1.05); }
    .launcher:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
    .launcher svg { width: 26px; height: 26px; display: block; }
    .launcher .close { display: none; }
    .launcher[data-open='true'] .open { display: none; }
    .launcher[data-open='true'] .close { display: block; }
    .badge {
      position: absolute;
      top: -2px;
      right: -2px;
      min-width: 20px;
      height: 20px;
      padding: 0 5px;
      border-radius: 10px;
      background: #ef4444;
      color: #fff;
      font: 600 12px/20px system-ui, sans-serif;
      display: none;
    }
    .badge[data-count]:not([data-count='0']) { display: block; }
    .panel {
      position: fixed;
      right: 20px;
      bottom: 88px;
      width: 400px;
      height: min(680px, calc(100vh - 120px));
      border: 0;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
      background: #fff;
      /* "display: none" still loads the document, so the panel boots and
         fetches its config while the page is untouched. The launcher only
         appears once that config is in, in the studio's own colours. */
      display: none;
    }
    .panel[data-open='true'] {
      display: block;
      transform-origin: bottom right;
      animation: appwin-panel-open 240ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes appwin-panel-open {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (max-width: ${I}px) {
      .panel[data-open='true'] {
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
        transform-origin: bottom center;
        animation-name: appwin-panel-open-sheet;
      }
      .launcher[data-open='true'] { display: none; }
    }
    @keyframes appwin-panel-open-sheet {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .launcher { transition: none; }
      .panel[data-open='true'] { animation: none; }
    }
  `}function R(){return `
    <svg class="open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
    </svg>
    <svg class="close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  `}function P(e){let t=v(document.documentElement.lang||navigator.language),r=document.createElement("div");r.style.setProperty("position","relative","important"),r.style.setProperty("z-index",T,"important"),document.body.appendChild(r);let s=r.attachShadow({mode:"closed"}),c=document.createElement("style");c.textContent=C();let o=document.createElement("button");o.className="launcher",o.type="button",o.setAttribute("aria-label",t.openMessenger),o.innerHTML=`${R()}<span class="badge" data-count="0"></span>`;let m=o.querySelector(".badge"),i=document.createElement("iframe");i.className="panel",i.title=t.messenger,i.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"),i.srcdoc=U(e),s.append(c,o,i);let y=location.origin,d=false,h=A(n=>{i.contentWindow?.postMessage(n,y);}),l=h.post,u=n=>{d!==n&&(d=n,i.dataset.open=String(n),o.dataset.open=String(n),o.setAttribute("aria-label",n?t.closeMessenger:t.openMessenger),l(p({type:n?"open":"close"})),n&&i.focus());};return o.addEventListener("click",()=>u(!d)),window.addEventListener("message",n=>{if(n.origin!==y||n.source!==i.contentWindow)return;let a=w(n.data);if(a)switch(a.type){case "ready":h.open(),o.style.background=a.primary,o.style.color=a.primaryForeground,o.dataset.visible="true";break;case "unread":m.dataset.count=String(a.count),m.textContent=a.count>9?"9+":String(a.count);break;case "close":u(false);break}}),{open:()=>u(true),close:()=>u(false),toggle:()=>u(!d),identify:(n,a)=>l(p({type:"identify",externalId:n,...a?{attributes:a}:{}})),updateUser:n=>l(p({type:"updateUser",attributes:n})),logout:()=>l(p({type:"logout"})),reset:()=>l(p({type:"logout"}))}}var M=k();if(M){let e=()=>{let t=P(M);window.Appwin=t;};document.body?e():document.addEventListener("DOMContentLoaded",e,{once:true});}else typeof console<"u"&&console.warn("[appwin] missing `data-appwin-app-id` on the script tag, widget not started.");})();