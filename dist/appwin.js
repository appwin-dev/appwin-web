(function(){'use strict';var O="appwin-host",h="appwin-panel";function p(e){return {v:2,from:O,...e}}function g(e){return {v:2,from:h,...e}}function M(e,t){if(typeof e!="object"||e===null)return null;let r=e;return r.from!==t||r.v!==2&&r.v!==1?null:r}function w(e){let t=M(e,h);if(!t)return null;switch(t.type){case "ready":return typeof t.primary!="string"||typeof t.primaryForeground!="string"?null:g({type:"ready",primary:t.primary,primaryForeground:t.primaryForeground});case "unread":return typeof t.count!="number"||!Number.isFinite(t.count)?null:g({type:"unread",count:Math.max(0,Math.trunc(t.count))});case "close":return g({type:"close"});default:return null}}var x={openMessenger:"Open the support messenger",closeMessenger:"Close the support messenger",messenger:"Support messenger"},T={openMessenger:"Ouvrir la messagerie d'assistance",closeMessenger:"Fermer la messagerie d'assistance",messenger:"Messagerie d'assistance"},E={en:x,fr:T};function b(e){let t=(e??"").toLowerCase().split("-")[0];return t&&E[t]||x}var L="2147483000",A=480;function S(){let e=document.currentScript??document.querySelector("script[data-appwin-app-id]");if(!e)return null;let t=e.getAttribute("data-appwin-app-id");if(!t)return null;let r=e.getAttribute("data-appwin-panel-url")??new URL("panel.js",e.src||location.href).toString();return {appId:t,panelScriptUrl:r,apiUrl:e.getAttribute("data-appwin-api-url"),gatewayUrl:e.getAttribute("data-appwin-gateway-url"),externalId:e.getAttribute("data-appwin-external-id")??e.getAttribute("data-appwin-user-id")}}function f(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function I(e){let t=[["data-app-id",e.appId],["data-host-origin",location.origin],["data-api-url",e.apiUrl],["data-gateway-url",e.gatewayUrl],["data-external-id",e.externalId]].filter(i=>typeof i[1]=="string"&&i[1]!=="").map(([i,d])=>` ${i}="${f(d)}"`).join("");return `<!doctype html><html lang="${f(document.documentElement.lang||"en")}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="robots" content="noindex"><title>Appwin</title></head><body><div id="root"></div><script src="${f(e.panelScriptUrl)}"${t}></script></body></html>`}function U(){return `
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
    .panel[data-open='true'] { display: block; }
    @media (max-width: ${A}px) {
      .panel[data-open='true'] {
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
      }
      .launcher[data-open='true'] { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .launcher { transition: none; }
    }
  `}function k(){return `
    <svg class="open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
    </svg>
    <svg class="close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  `}function C(e){let t=b(document.documentElement.lang||navigator.language),r=document.createElement("div");r.style.setProperty("position","relative","important"),r.style.setProperty("z-index",L,"important"),document.body.appendChild(r);let i=r.attachShadow({mode:"closed"}),d=document.createElement("style");d.textContent=U();let o=document.createElement("button");o.className="launcher",o.type="button",o.setAttribute("aria-label",t.openMessenger),o.innerHTML=`${k()}<span class="badge" data-count="0"></span>`;let y=o.querySelector(".badge"),a=document.createElement("iframe");a.className="panel",a.title=t.messenger,a.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"),a.srcdoc=I(e),i.append(d,o,a);let m=location.origin,c=false,l=n=>{a.contentWindow?.postMessage(n,m);},u=n=>{c!==n&&(c=n,a.dataset.open=String(n),o.dataset.open=String(n),o.setAttribute("aria-label",n?t.closeMessenger:t.openMessenger),l(p({type:n?"open":"close"})),n&&a.focus());};return o.addEventListener("click",()=>u(!c)),window.addEventListener("message",n=>{if(n.origin!==m||n.source!==a.contentWindow)return;let s=w(n.data);if(s)switch(s.type){case "ready":o.style.background=s.primary,o.style.color=s.primaryForeground,o.dataset.visible="true";break;case "unread":y.dataset.count=String(s.count),y.textContent=s.count>9?"9+":String(s.count);break;case "close":u(false);break}}),{open:()=>u(true),close:()=>u(false),toggle:()=>u(!c),identify:(n,s)=>l(p({type:"identify",externalId:n,...s?{traits:s}:{}})),updateUser:n=>l(p({type:"updateUser",traits:n})),logout:()=>l(p({type:"logout"})),reset:()=>l(p({type:"logout"}))}}var v=S();if(v){let e=()=>{let t=C(v);window.Appwin=t;};document.body?e():document.addEventListener("DOMContentLoaded",e,{once:true});}else typeof console<"u"&&console.warn("[appwin] missing `data-appwin-app-id` on the script tag, widget not started.");})();