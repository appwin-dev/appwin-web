(function(){'use strict';var M="appwin-host",h="appwin-panel";function u(e){return {v:1,from:M,...e}}function g(e){return {v:1,from:h,...e}}function S(e,t){if(typeof e!="object"||e===null)return null;let o=e;return o.from!==t||o.v!==1?null:o}function w(e){let t=S(e,h);if(!t)return null;switch(t.type){case "ready":return typeof t.primary!="string"||typeof t.primaryForeground!="string"?null:g({type:"ready",primary:t.primary,primaryForeground:t.primaryForeground});case "unread":return typeof t.count!="number"||!Number.isFinite(t.count)?null:g({type:"unread",count:Math.max(0,Math.trunc(t.count))});case "close":return g({type:"close"});default:return null}}var b={openMessenger:"Open the support messenger",closeMessenger:"Close the support messenger",messenger:"Support messenger"},E={openMessenger:"Ouvrir la messagerie d'assistance",closeMessenger:"Fermer la messagerie d'assistance",messenger:"Messagerie d'assistance"},L={en:b,fr:E};function x(e){let t=(e??"").toLowerCase().split("-")[0];return t&&L[t]||b}var O="2147483000",k=480;function A(){let e=document.currentScript??document.querySelector("script[data-appwin-app-id]");if(!e)return null;let t=e.getAttribute("data-appwin-app-id");if(!t)return null;let o=e.getAttribute("data-appwin-panel-url")??new URL("panel.js",e.src||location.href).toString();return {appId:t,panelScriptUrl:o,apiUrl:e.getAttribute("data-appwin-api-url"),gatewayUrl:e.getAttribute("data-appwin-gateway-url"),userId:e.getAttribute("data-appwin-user-id")}}function f(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function T(e){let t=[["data-app-id",e.appId],["data-host-origin",location.origin],["data-api-url",e.apiUrl],["data-gateway-url",e.gatewayUrl],["data-user-id",e.userId]].filter(i=>typeof i[1]=="string"&&i[1]!=="").map(([i,l])=>` ${i}="${f(l)}"`).join("");return `<!doctype html><html lang="${f(document.documentElement.lang||"en")}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="robots" content="noindex"><title>Appwin</title></head><body><div id="root"></div><script src="${f(e.panelScriptUrl)}"${t}></script></body></html>`}function I(){return `
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
    @media (max-width: ${k}px) {
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
  `}function C(){return `
    <svg class="open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
    </svg>
    <svg class="close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  `}function P(e){let t=x(document.documentElement.lang||navigator.language),o=document.createElement("div");o.style.setProperty("position","relative","important"),o.style.setProperty("z-index",O,"important"),document.body.appendChild(o);let i=o.attachShadow({mode:"closed"}),l=document.createElement("style");l.textContent=I();let r=document.createElement("button");r.className="launcher",r.type="button",r.setAttribute("aria-label",t.openMessenger),r.innerHTML=`${C()}<span class="badge" data-count="0"></span>`;let m=r.querySelector(".badge"),s=document.createElement("iframe");s.className="panel",s.title=t.messenger,s.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"),s.srcdoc=T(e),i.append(l,r,s);let y=location.origin,d=false,c=n=>{s.contentWindow?.postMessage(n,y);},p=n=>{d!==n&&(d=n,s.dataset.open=String(n),r.dataset.open=String(n),r.setAttribute("aria-label",n?t.closeMessenger:t.openMessenger),c(u({type:n?"open":"close"})),n&&s.focus());};return r.addEventListener("click",()=>p(!d)),window.addEventListener("message",n=>{if(n.origin!==y||n.source!==s.contentWindow)return;let a=w(n.data);if(a)switch(a.type){case "ready":r.style.background=a.primary,r.style.color=a.primaryForeground,r.dataset.visible="true";break;case "unread":m.dataset.count=String(a.count),m.textContent=a.count>9?"9+":String(a.count);break;case "close":p(false);break}}),{open:()=>p(true),close:()=>p(false),toggle:()=>p(!d),identify:n=>c(u({type:"identify",userId:n})),reset:()=>c(u({type:"reset"}))}}var v=A();if(v){let e=()=>{let t=P(v);window.Appwin=t;};document.body?e():document.addEventListener("DOMContentLoaded",e,{once:true});}else typeof console<"u"&&console.warn("[appwin] missing `data-appwin-app-id` on the script tag, widget not started.");})();