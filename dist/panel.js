(function(){'use strict';var sr=Object.defineProperty;var ir=(t,e)=>()=>(t&&(e=t(t=0)),e);var or=(t,e)=>{for(var n in e)sr(t,n,{get:e[n],enumerable:true});};var Jt={};or(Jt,{createRecorder:()=>Mr});function Mr(){throw new Error("session replay is not in this build")}var Qt=ir(()=>{});var ue,w,ht,H,ut,mt,yt,Le,oe,X,vt,We,qe,He,bt,ce={},pe=[],lr=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,fe=Array.isArray;function U(t,e){for(var n in e)t[n]=e[n];return t}function Be(t){t&&t.parentNode&&t.parentNode.removeChild(t);}function ze(t,e,n){var r,s,i,a={};for(i in e)i=="key"?r=e[i]:i=="ref"?s=e[i]:a[i]=e[i];if(arguments.length>2&&(a.children=arguments.length>3?ue.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(i in t.defaultProps)a[i]===void 0&&(a[i]=t.defaultProps[i]);return ae(t,a,r,s,null)}function ae(t,e,n,r,s){var i={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:s??++ht,__i:-1,__u:0};return s==null&&w.vnode!=null&&w.vnode(i),i}function D(t){return t.children}function le(t,e){this.props=t,this.context=e;}function B(t,e){if(e==null)return t.__?B(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?B(t):null}function cr(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,r=[],s=[],i=U({},e);i.__v=e.__v+1,w.vnode&&w.vnode(i),je(t.__P,i,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,r,n??B(e),!!(32&e.__u),s),i.__v=e.__v,i.__.__k[i.__i]=i,Ct(r,i,s),e.__e=e.__=null,i.__e!=n&&_t(i);}}function _t(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),_t(t)}function $e(t){(!t.__d&&(t.__d=true)&&H.push(t)&&!de.__r++||ut!=w.debounceRendering)&&((ut=w.debounceRendering)||mt)(de);}function de(){try{for(var t,e=1;H.length;)H.length>e&&H.sort(yt),t=H.shift(),e=H.length,cr(t);}finally{H.length=de.__r=0;}}function wt(t,e,n,r,s,i,a,c,d,p,u){var f,l,g,y,m,h,b=r&&r.__k||pe,v=e.length;for(d=pr(n,e,b,d,v),f=0;f<v;f++)(g=n.__k[f])!=null&&(l=g.__i!=-1&&b[g.__i]||ce,g.__i=f,h=je(t,g,l,s,i,a,c,d,p,u),y=g.__e,g.ref&&l.ref!=g.ref&&(l.ref&&Ve(l.ref,null,g),u.push(g.ref,g.__c||y,g)),m==null&&y!=null&&(m=y),4&g.__u?(d=xt(g,d,t),l.__e&&(l.__e=null)):typeof g.type=="function"&&h!==void 0?d=h:y&&(d=y.nextSibling),g.__u&=-7);return n.__e=m,d}function pr(t,e,n,r,s){var i,a,c,d,p,u=n.length,f=u,l=0;for(t.__k=new Array(s),i=0;i<s;i++)(a=e[i])!=null&&typeof a!="boolean"&&typeof a!="function"?(typeof a=="string"||typeof a=="number"||typeof a=="bigint"||a.constructor==String?a=t.__k[i]=ae(null,a,null,null,null):fe(a)?a=t.__k[i]=ae(D,{children:a},null,null,null):a.constructor===void 0&&a.__b>0?a=t.__k[i]=ae(a.type,a.props,a.key,a.ref?a.ref:null,a.__v):t.__k[i]=a,d=i+l,a.__=t,a.__b=t.__b+1,c=null,(p=a.__i=dr(a,n,d,f))!=-1&&(f--,(c=n[p])&&(c.__u|=2)),c==null||c.__v==null?(p==-1&&(s>u?l--:s<u&&l++),typeof a.type!="function"&&(a.__u|=4)):p!=d&&(p==d-1?l--:p==d+1?l++:(p>d?l--:l++,a.__u|=4))):t.__k[i]=null;if(f)for(i=0;i<u;i++)(c=n[i])!=null&&(2&c.__u)==0&&(c.__e==r&&(r=B(c)),kt(c,c));return r}function xt(t,e,n){var r,s;if(typeof t.type=="function"){for(r=t.__k,s=0;r&&s<r.length;s++)r[s]&&(r[s].__=t,e=xt(r[s],e,n));return e}t.__e!=e&&(e&&t.type&&!e.parentNode&&(e=B(t)),e=n.insertBefore(t.__e,e||null));do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function dr(t,e,n,r){var s,i,a,c=t.key,d=t.type,p=e[n],u=p!=null&&(2&p.__u)==0;if(p===null&&c==null||u&&c==p.key&&d==p.type)return n;if(r>(u?1:0)){for(s=n-1,i=n+1;s>=0||i<e.length;)if((p=e[a=s>=0?s--:i++])!=null&&(2&p.__u)==0&&c==p.key&&d==p.type)return a}return  -1}function ft(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||lr.test(e)?n:n+"px";}function ie(t,e,n,r,s){var i,a;e:if(e=="style")if(typeof n=="string")t.style.cssText=n;else {if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||ft(t.style,e,"");if(n)for(e in n)r&&n[e]==r[e]||ft(t.style,e,n[e]);}else if(e[0]=="o"&&e[1]=="n")i=e!=(e=e.replace(vt,"$1")),a=e.toLowerCase(),e=a in t||e=="onFocusOut"||e=="onFocusIn"?a.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+i]=n,n?r?n[X]=r[X]:(n[X]=We,t.addEventListener(e,i?He:qe,i)):t.removeEventListener(e,i?He:qe,i);else {if(s=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===false&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n));}}function gt(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[oe]==null)e[oe]=We++;else if(e[oe]<n[X])return;return n(w.event?w.event(e):e)}}}function je(t,e,n,r,s,i,a,c,d,p){var u,f,l,g,y,m,h,b,v,E,_,x,M,W,q,j,C=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),i=[c=e.__e=n.__e]),(u=w.__b)&&u(e);e:if(typeof C=="function"){f=a.length;try{if(v=e.props,E=C.prototype&&C.prototype.render,_=(u=C.contextType)&&r[u.__c],x=u?_?_.props.value:u.__:r,n.__c?b=(l=e.__c=n.__c).__=l.__E:(E?e.__c=l=new C(v,x):(e.__c=l=new le(v,x),l.constructor=C,l.render=fr),_&&_.sub(l),l.state||(l.state={}),l.__n=r,g=l.__d=!0,l.__h=[],l._sb=[]),E&&l.__s==null&&(l.__s=l.state),E&&C.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=U({},l.__s)),U(l.__s,C.getDerivedStateFromProps(v,l.__s))),y=l.props,m=l.state,l.__v=e,g)E&&C.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),E&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else {if(E&&C.getDerivedStateFromProps==null&&v!==y&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(v,x),e.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(v,l.__s,x)===!1){e.__v!=n.__v&&(l.props=v,l.state=l.__s,l.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(R){R&&(R.__=e);}),pe.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&a.push(l),c=B(n);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(v,l.__s,x),E&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(y,m,h);});}if(l.context=x,l.props=v,l.__P=t,l.__e=!1,M=w.__r,W=0,E)l.state=l.__s,l.__d=!1,M&&M(e),u=l.render(l.props,l.state,l.context),pe.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,M&&M(e),u=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++W<25);l.state=l.__s,l.getChildContext!=null&&(r=U(U({},r),l.getChildContext())),E&&!g&&l.getSnapshotBeforeUpdate!=null&&(h=l.getSnapshotBeforeUpdate(y,m)),q=u!=null&&u.type===D&&u.key==null?At(u.props.children):u,c=wt(t,fe(q)?q:[q],e,n,r,s,i,a,c,d,p),l.base=e.__e,e.__u&=-161,l.__h.length&&a.push(l),b&&(l.__E=l.__=null);}catch(R){if(a.length=f,e.__v=null,d||i!=null){if(R.then){for(e.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;i!=null&&(i[i.indexOf(c)]=null),e.__e=c;}else if(i!=null)for(j=i.length;j--;)Be(i[j]);}else e.__e=n.__e;e.__k==null&&(e.__k=n.__k||[]),R.then||St(e),w.__e(R,e,n);}}else i==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):c=e.__e=ur(n.__e,e,n,r,s,i,a,d,p);return (u=w.diffed)&&u(e),128&e.__u?void 0:c}function St(t){t&&(t.__c&&(t.__c.__e=true),t.__k&&t.__k.some(St));}function Ct(t,e,n){for(var r=0;r<n.length;r++)Ve(n[r],n[++r],n[++r]);w.__c&&w.__c(e,t),t.some(function(s){try{t=s.__h,s.__h=[],t.some(function(i){i.call(s);});}catch(i){w.__e(i,s.__v);}});}function At(t){return typeof t!="object"||t==null||t.__b>0?t:fe(t)?t.map(At):t.constructor!==void 0?null:U({},t)}function ur(t,e,n,r,s,i,a,c,d){var p,u,f,l,g,y,m,h=n.props||ce,b=e.props,v=e.type;if(v=="svg"?s="http://www.w3.org/2000/svg":v=="math"?s="http://www.w3.org/1998/Math/MathML":s||(s="http://www.w3.org/1999/xhtml"),i!=null){for(p=0;p<i.length;p++)if((g=i[p])&&"setAttribute"in g==!!v&&(v?g.localName==v:g.nodeType==3)){t=g,i[p]=null;break}}if(t==null){if(v==null)return document.createTextNode(b);t=document.createElementNS(s,v,b.is&&b),c&&(w.__m&&w.__m(e,i),c=false),i=null;}if(v==null)h===b||c&&t.data==b||(t.data=b);else {if(i=v=="textarea"&&b.defaultValue!=null?null:i&&ue.call(t.childNodes),!c&&i!=null)for(h={},p=0;p<t.attributes.length;p++)h[(g=t.attributes[p]).name]=g.value;for(p in h)g=h[p],p=="dangerouslySetInnerHTML"?f=g:p=="children"||p in b||p=="value"&&"defaultValue"in b||p=="checked"&&"defaultChecked"in b||ie(t,p,null,g,s);for(p in b)g=b[p],p=="children"?l=g:p=="dangerouslySetInnerHTML"?u=g:p=="value"?y=g:p=="checked"?m=g:c&&typeof g!="function"||h[p]===g||ie(t,p,g,h[p],s);if(u)c||f&&(u.__html==f.__html||u.__html==t.innerHTML)||(t.innerHTML=u.__html),e.__k=[];else if(f&&(t.innerHTML=""),wt(e.type=="template"?t.content:t,fe(l)?l:[l],e,n,r,v=="foreignObject"?"http://www.w3.org/1999/xhtml":s,i,a,i?i[0]:n.__k&&B(n,0),c,d),i!=null)for(p=i.length;p--;)Be(i[p]);c&&v!="textarea"||(p="value",v=="progress"&&y==null?t.removeAttribute("value"):y!=null&&(y!==t[p]||v=="progress"&&!y||v=="option"&&y!=h[p])&&ie(t,p,y,h[p],s),p="checked",m!=null&&m!=t[p]&&ie(t,p,m,h[p],s));}return t}function Ve(t,e,n){try{if(typeof t=="function"){var r=typeof t.__u=="function";r&&t.__u(),r&&e==null||(t.__u=t(e));}else t.current=e;}catch(s){w.__e(s,n);}}function kt(t,e,n){var r,s;if(w.unmount&&w.unmount(t),(r=t.ref)&&(r.current&&r.current!=t.__e||Ve(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount();}catch(i){w.__e(i,e);}r.base=r.__P=r.__n=null;}if(r=t.__k)for(s=0;s<r.length;s++)r[s]&&kt(r[s],e,n||typeof t.type!="function");n||Be(t.__e),t.__c=t.__=t.__e=void 0;}function fr(t,e,n){return this.constructor(t,n)}function Et(t,e,n){var r,s,i,a;e==document&&(e=document.documentElement),w.__&&w.__(t,e),s=(r="undefined"=="function")?null:e.__k,i=[],a=[],je(e,t=(e).__k=ze(D,null,[t]),s||ce,ce,e.namespaceURI,s?null:e.firstChild?ue.call(e.childNodes):null,i,s?s.__e:e.firstChild,r,a),Ct(i,t,a),t.props.children=null;}function Tt(t){function e(n){var r,s;return this.getChildContext||(r=new Set,(s={})[e.__c]=this,this.getChildContext=function(){return s},this.componentWillUnmount=function(){r=null;},this.shouldComponentUpdate=function(i){this.props.value!=i.value&&r.forEach(function(a){a.__e=true,$e(a);});},this.sub=function(i){r.add(i);var a=i.componentWillUnmount;i.componentWillUnmount=function(){r&&r.delete(i),a&&a.call(i);};}),n.children}return e.__c="__cC"+bt++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,r){return n.children(r)}).contextType=e,e}ue=pe.slice,w={__e:function(t,e,n,r){for(var s,i,a;e=e.__;)if((s=e.__c)&&!s.__)try{if((i=s.constructor)&&i.getDerivedStateFromError!=null&&(s.setState(i.getDerivedStateFromError(t)),a=s.__d),s.componentDidCatch!=null&&(s.componentDidCatch(t,r||{}),a=s.__d),a)return s.__E=s}catch(c){t=c;}throw t}},ht=0,le.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=U({},this.state),typeof t=="function"&&(t=t(U({},n),this.props)),t&&U(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),$e(this));},le.prototype.forceUpdate=function(t){this.__v&&(this.__e=true,t&&this.__h.push(t),$e(this));},le.prototype.render=D,H=[],mt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,yt=function(t,e){return t.__v.__b-e.__v.__b},de.__r=0,Le=Math.random().toString(8),oe="__d"+Le,X="__a"+Le,vt=/(PointerCapture)$|Capture$/i,We=0,qe=gt(false),He=gt(true),bt=0;var A=class extends Error{constructor(e,n,r=null){super(n),this.name="AppwinError",this.code=e,this.status=r;}get retryable(){return this.code==="network"||this.code==="server_error"||this.code==="rate_limited"}};function It(t){return t===403?"origin_not_allowed":t===401?"unauthorized":t===404?"not_found":t===429?"rate_limited":t>=500?"server_error":"bad_request"}async function Pt(t,e,n){let r={};try{let s=await t.fetch({method:"GET",path:"/api/sdk/v1/availability"});for(let i of n){let a=s.products[i]??{enabled:!1,reason:"disabled"};e.set(Mt(i),JSON.stringify(a)),r[i]=a;}}catch(s){if(s instanceof A&&!s.retryable)throw s;for(let i of n)r[i]=gr(e,Mt(i));}return r}function Mt(t){return `availability:${t}`}function gr(t,e){try{let n=JSON.parse(t.get(e)??"null");if(n&&typeof n=="object"&&"enabled"in n)return n}catch{}return null}var ge=class{constructor(e=Date.now){this.items=[];this.current=null;this.now=e;}add(e,n){if(!n)return;let r={at:new Date(this.now()).toISOString(),type:e,name:n.slice(0,128)};e==="screen"&&(this.current=r.name),this.items.push(r),this.items.length>20&&this.items.shift();}get screen(){return this.current}snapshot(){return this.items.map(e=>({...e}))}};var Rt="device-id";function J(){try{return globalThis.crypto.randomUUID()}catch{let t=()=>Math.floor(Math.random()*65536).toString(16).padStart(4,"0");return `${t()}${t()}-${t()}-4${t().slice(1)}-a${t().slice(1)}-${t()}${t()}${t()}`}}function hr(t){let e=t.get(Rt);if(e)return e;let n=J();return t.set(Rt,n),n}function Ge(t){let e=globalThis.navigator??{},n={deviceId:hr(t),platform:"web"},r=mr(e.userAgent);r&&(n.model=r);let s=yr(e.userAgent);return s&&(n.os=s),e.language&&(n.language=e.language),n}function mr(t){if(!t)return;let e=[["Edge",/Edg\/(\d+)/],["Opera",/OPR\/(\d+)/],["Chrome",/Chrome\/(\d+)/],["Firefox",/Firefox\/(\d+)/],["Safari",/Version\/(\d+).*Safari/]];for(let[n,r]of e){let s=r.exec(t);if(s)return `${n} ${s[1]}`}}function yr(t){if(t){if(/Windows NT 10/.test(t))return "Windows 10+";if(/Windows/.test(t))return "Windows";if(/Android/.test(t))return "Android";if(/iPhone|iPad|iPod/.test(t))return "iOS";if(/Mac OS X/.test(t))return "macOS";if(/Linux/.test(t))return "Linux"}}var Ke=32e3,vr=256,he=1024,Ot=64,Ut=128,br=32;function Q(t,e){if(t&&typeof t=="object"){let{name:r,message:s,stack:i}=t;if(typeof s=="string"||typeof i=="string")return {type:typeof r=="string"&&r?r:e,...typeof s=="string"&&s?{message:s}:{},...typeof i=="string"?{stack:i}:{}}}let n=wr(t);return {type:e,...n?{message:n}:{}}}function Dt(t,e,n,r,s){let i=e.message?.slice(0,he),a={crashId:J(),kind:t,runtime:"web",occurredAt:new Date(s).toISOString(),exception:{type:e.type.slice(0,vr),...i?{message:i}:{}},frames:n,app:{version:r.appVersion.slice(0,Ot)},device:{os:r.os.slice(0,Ot),model:r.model.slice(0,Ut)},sdkVersion:r.sdkVersion.slice(0,br),...r.sessionId?{sessionId:r.sessionId}:{},...r.screen?{screen:r.screen.slice(0,Ut)}:{},...r.breadcrumbs.length>0?{breadcrumbs:r.breadcrumbs}:{}};return _r(a,Ke)}function _r(t,e){if(V(t)<=e)return t;let n={...t,frames:[...t.frames],exception:{...t.exception}};for(;n.frames.length>0&&V(n)>e;){let r=V(n)-e,s=Math.max(1,JSON.stringify(n.frames).length/n.frames.length);n.frames.length=Math.max(0,n.frames.length-Math.ceil(r/s));}return V(n)>e&&n.exception.message&&(n.exception.message=n.exception.message.slice(0,128)),n}function V(t){return new TextEncoder().encode(JSON.stringify(t)).length}function wr(t){if(t===void 0)return "";if(typeof t=="string")return t.slice(0,he);try{return (JSON.stringify(t)??String(t)).slice(0,he)}catch{return String(t).slice(0,he)}}var Ye="analytics:crashes",me=class{constructor(e){this.storage=e;}get size(){return this.load().length}push(e){let n=this.load();n.push(e),this.save(n.slice(-20));}nextBatch(e){let n=[],r=0;for(let s of this.load()){let i=V(s);if(n.length>0&&r+i>e)break;n.push(s),r+=i;}return n}remove(e){let n=new Set(e.map(s=>s.crashId)),r=this.load().filter(s=>!n.has(s.crashId));r.length===0?this.clear():this.save(r);}clear(){this.storage.remove(Ye);}load(){try{let e=JSON.parse(this.storage.get(Ye)??"[]");return Array.isArray(e)?e:[]}catch{return []}}save(e){this.storage.set(Ye,JSON.stringify(e));}};function Ft(t,e){let n=a=>{if(a.target&&a.target!==t)return;let{error:c,message:d,filename:p,lineno:u,colno:f}=a,l=c!=null?Q(c,"Error"):{type:"Error",...d?{message:d}:{}};e.capture({kind:"crash",thrown:l,location:{url:p||void 0,line:u||void 0,col:f||void 0}});},r=a=>{e.capture({kind:"crash",thrown:Q(a.reason,"UnhandledRejection")});},s=()=>{e.flush();},i=globalThis.document;return t.addEventListener("error",n),t.addEventListener("unhandledrejection",r),t.addEventListener("online",s),i?.addEventListener("visibilitychange",s),()=>{t.removeEventListener("error",n),t.removeEventListener("unhandledrejection",r),t.removeEventListener("online",s),i?.removeEventListener("visibilitychange",s);}}var Nt={baseMs:2e3,capMs:3e5};function Sr(t,e=Math.random){return Math.min(Nt.capMs,Nt.baseMs*2**Math.min(t,30))*(.5+e()*.5)}var G=class{constructor(e){this.inFlight=null;this.rerun=false;this.attempt=0;this.retryTimer=null;this.deps=e;}get retryPending(){return this.retryTimer!==null}run(){return this.deps.canRun()?this.inFlight?(this.rerun=true,this.inFlight):(this.inFlight=this.drainUntilSettled().finally(()=>{this.inFlight=null;}),this.inFlight):this.inFlight??Promise.resolve()}cancelRetry(){this.retryTimer&&clearTimeout(this.retryTimer),this.retryTimer=null,this.attempt=0;}async drainUntilSettled(){do this.rerun=false,await this.drain();while(this.rerun&&this.deps.canRun()&&!this.retryTimer)}async drain(){for(;this.deps.canRun();){let e=await this.deps.step();if(e==="idle")return;if(e==="retry"){this.scheduleRetry();return}this.attempt=0;}}scheduleRetry(){let e=Sr(this.attempt);this.attempt+=1,this.retryTimer&&clearTimeout(this.retryTimer),this.retryTimer=setTimeout(()=>{this.retryTimer=null,this.run();},e);}};var Lt=/^\s*at\s+(?:async\s+)?(.*)$/,Cr=/^\s*(.*?)@(.*)$/,Ar=/^(.*?):(\d+)(?::(\d+))?$/;function qt(t,e){if(!t)return [];let n=t.split(`
`),r=n.some(i=>Lt.test(i)),s=[];for(let i of n){if(s.length>=200)break;let a=r?kr(i):Er(i);a&&s.push(Wt(a,e));}return s}function Ht(t,e,n,r){return t?[Wt({fn:"",url:t,...ye("line",e),...ye("col",n)},r)]:[]}function kr(t){let e=Lt.exec(t);if(!e)return null;let n=e[1].trim(),r=/^(.*?) \((.*)\)$/.exec(n),s=r?r[1]:"",i=r?r[2]:n;return i.includes(", ")&&(i=i.slice(i.lastIndexOf(", ")+2)),s.startsWith("async ")&&(s=s.slice(6)),{fn:s,...$t(i)}}function Er(t){let e=Cr.exec(t);if(!e)return null;let n=e[1].replace(/^async\*/,""),r=e[2];return r.includes(" > ")&&(r=r.slice(0,r.indexOf(" line "))),{fn:n,...$t(r)}}function $t(t){let e=Ar.exec(t);return e?{url:e[1],...ye("line",Number(e[2])),...ye("col",e[3]===void 0?void 0:Number(e[3]))}:t?{url:t}:{}}function ye(t,e){return e!==void 0&&Number.isInteger(e)&&e>=0?{[t]:e}:{}}function Wt(t,e){let n={fn:t.fn.slice(0,512),inApp:false},r=Tr(t.url);return r?(n.file=r.pathname.slice(0,512),n.module=r.origin.slice(0,256),n.inApp=r.origin===e.origin&&!r.pathname.includes("/node_modules/")):t.url&&(n.file=t.url.slice(0,512)),t.line!==void 0&&(n.line=t.line),t.col!==void 0&&(n.col=t.col),n}function Tr(t){if(!t||!/^[a-z][a-z0-9+.-]*:\/\//i.test(t))return null;try{let e=new URL(t);return {origin:e.origin==="null"?`${e.protocol}//${e.host}`:e.origin,pathname:e.pathname}}catch{return null}}var Bt={dedupeWindowMs:5e3,maxReportsPerPage:10},ve=class{constructor(e){this.uploadsEnabled=false;this.isShutDown=false;this.captured=0;this.recent=new Map;this.deps=e,this.now=e.now??Date.now,this.drain=new G({step:()=>this.sendNextBatch(),canRun:()=>this.canUpload()});}capture(e){try{if(this.isShutDown||this.deps.consent.state("analytics")==="denied"||this.captured>=Bt.maxReportsPerPage)return;let n=this.framesOf(e);if(this.isDuplicate(e.thrown,n))return;this.captured+=1;let r=Dt(e.kind,e.thrown,n,this.deps.context(),this.now());this.deps.queue.push(r),this.flush();}catch{}}enableUploads(){this.uploadsEnabled=true,this.flush();}shutdown(){this.isShutDown=true,this.uploadsEnabled=false,this.drain.cancelRetry(),this.deps.queue.clear();}onConsentChange(e){e==="denied"?(this.drain.cancelRetry(),this.deps.queue.clear()):e==="granted"&&this.flush();}flush(){return this.drain.run()}async sendNextBatch(){let{queue:e,send:n}=this.deps,r=e.nextBatch(Ke);return r.length===0?"idle":await n(r)==="retry"?"retry":(e.remove(r),"next")}canUpload(){return this.uploadsEnabled&&!this.isShutDown&&this.deps.consent.state("analytics")==="granted"}framesOf(e){let n=qt(e.thrown.stack,this.deps.stack);if(n.length>0||!e.location)return n;let{url:r,line:s,col:i}=e.location;return Ht(r,s,i,this.deps.stack)}isDuplicate(e,n){let r=this.now();for(let[a,c]of this.recent)r-c>Bt.dedupeWindowMs&&this.recent.delete(a);let s=n[0],i=[e.type,e.message??"",s?.fn??"",s?.file??"",s?.line??""].join("|");return this.recent.has(i)?true:(this.recent.set(i,r),false)}};var Ir=new Set(["bad_request","not_found","origin_not_allowed"]);function zt(t){return async e=>{try{return (await t.fetch({method:"POST",path:"/api/sdk/v1/events",body:{events:e,sentAt:new Date().toISOString()},keepalive:!0})).quotaExceeded?"quota_exceeded":"ok"}catch(n){return Xe(n,"analytics batch")}}}function Xe(t,e){return t instanceof A&&Ir.has(t.code)?(console.warn(`[appwin] ${e} refused: ${t.message}`),"drop"):"retry"}function jt(t){return async e=>{try{return await t.fetch({method:"POST",path:"/api/sdk/v1/crashes",body:{crashes:e,sentAt:new Date().toISOString()},keepalive:!0}),"ok"}catch(n){return Xe(n,"crash reports")}}}function Vt(t){let{session:e,storage:n,consent:r,sessions:s,breadcrumbs:i,sdkVersion:a}=t,c=new me(n);r.state("analytics")==="denied"&&c.clear();let d=new ve({queue:c,consent:r,send:jt(e),stack:{origin:globalThis.location?.origin??null},context:()=>({appVersion:e.appVersion??"",os:e.deviceInfo.os??"",model:e.deviceInfo.model??"",sdkVersion:a,sessionId:s.sessionId,screen:i.screen,breadcrumbs:i.snapshot()})}),u=typeof globalThis.addEventListener=="function"?Ft(globalThis,d):()=>{};return {reporter:d,stop(){u(),d.shutdown();}}}function Gt(t){let e=null,n=()=>{let i=location.pathname;i!==e&&(e=i,t(i));},{pushState:r,replaceState:s}=history;return history.pushState=function(...i){r.apply(this,i),n();},history.replaceState=function(...i){s.apply(this,i),n();},addEventListener("popstate",n),n(),()=>{history.pushState=r,history.replaceState=s,removeEventListener("popstate",n);}}var Kt={segmentMs:1e4};function Yt(t){let e=t?.sampleRate;return {sampleRate:typeof e=="number"&&e>=0&&e<=1?e:1,maskAllText:t?.maskAllText!==false,maskAllImages:t?.maskAllImages!==false}}function Xt(t,e){if(e>=1)return  true;if(e<=0)return  false;let n=Number.parseInt(t.replace(/-/g,"").slice(-8),16);return Number.isFinite(n)?n/2**32<e:false}function Zt(t){let{consent:e,sessions:n,settings:r}=t,s={screen(){},onConsentChange(){},stop(){}};if(typeof document>"u")return s;if(typeof CompressionStream>"u")return console.warn("[appwin] session replay off: this browser has no CompressionStream."),s;let i=null,a=false,c=false,d=t.initialScreen,p=()=>{if(c||e.state("analytics")!=="granted")return null;let l=n.sessionId;return l&&Xt(l,r.sampleRate)?l:null},u=()=>{if(i){i.sync(p());return}a||!p()||(a=true,Promise.resolve().then(()=>(Qt(),Jt)).then(({createRecorder:l})=>{c||(i=l({session:t.session,storage:t.storage,settings:r,currentScreen:()=>d,onDisabled:()=>{c=true,clearInterval(f);}}),i.sync(p()));}).catch(l=>{c=true,clearInterval(f),console.warn(`[appwin] session replay could not load: ${l instanceof Error?l.message:String(l)}`);}));},f=setInterval(u,Kt.segmentMs);return u(),{screen(l){d=l,u(),i?.screen(l);},onConsentChange(l){l!=="granted"&&i?.discard(),u();},stop(){c=true,clearInterval(f),i?.stop();}}}var Pr=/^[a-z][a-z0-9_]{0,63}$/,Rr=new Set(["session_start","session_end","screen_view","app_install","app_update","install_referrer","app_open","app_background","push_opt_in","push_opened"]),Or=20,Ur=64,Dr=256,Fr=128;function en(t){return Pr.test(t)&&!Rr.has(t)}function tn(t){return t.slice(0,Fr)}function nn(t){if(!t)return;let e={},n=0;for(let r of Object.keys(t).sort()){if(n>=Or)break;if(!r||r.length>Ur)continue;let s=t[r];if(typeof s=="string")e[r]=s.slice(0,Dr);else if(typeof s=="boolean")e[r]=s;else if(typeof s=="number"&&Number.isFinite(s))e[r]=s;else continue;n+=1;}return n>0?e:void 0}function rn({session:t,storage:e,sdkVersion:n,pipeline:r,consent:s,sessions:i}){let a=new ge,c=null,d=null,p=null,u=null,f=false,l=false,g=()=>{p||f||!u||(p=Zt({session:t,storage:e,consent:s,sessions:i,settings:u,initialScreen:a.screen}));},y=()=>{p?.stop(),p=null;},m=_=>{let x=tn(_);a.add("screen",x),r.enqueue("screen_view",{screen:x}),p?.screen(x);};async function h(_){let x=_.pageViews===false?()=>{}:Gt(m);_.crashReporting!==false&&(d=Vt({session:t,storage:e,consent:s,sessions:i,breadcrumbs:a,sdkVersion:n}));let M=(C,R)=>(x(),d?.stop(),d=null,console.warn(`[appwin] analytics did not start: ${R}`),C),W,q;try{({analytics:W,replay:q}=await Pt(t,e,["analytics","replay"]));}catch(C){let R=C instanceof A&&C.code==="origin_not_allowed"?"origin_not_allowed":"refused";return M({ready:false,reason:R},C instanceof Error?C.message:String(C))}if(!W)return {ready:false,reason:"unreachable"};if(!W.enabled){let C=W.reason??"disabled";return M({ready:false,reason:C},`unavailable for this app (${C}).`)}d?.reporter.enableUploads();let j=_.sessionReplay??true;return j===false?f=true:q?.enabled&&(u=Yt(q.config),(j===true||l)&&g()),{ready:true}}let b=(_,x)=>{if(!en(_)){console.warn(`[appwin] analytics event "${_}" dropped: invalid or reserved name.`);return}let M=nn(x);a.add("event",_),r.enqueue(_,M?{props:M}:{});},v=(_,x)=>{r.setConsent(_,x);let M=s.state("analytics");d?.reporter.onConsentChange(M),p?.onConsentChange(M);};return {analytics:{initialize(_={}){return c??=h(_),c},track:b,screen(_){!c||!_||m(_);},flush:()=>r.flush(),setConsent:_=>v(_),startSessionReplay(){l=true,g();},stopSessionReplay(){l=false,y();},recordError(_,x){d?.reporter.capture({kind:x?.fatal?"crash":"non_fatal",thrown:Q(_,"Error")});}},track:b,setConsent:v}}var sn="analytics:consent",Z=["analytics","marketing","advertising"],_e=class{constructor(e){this.storage=e,this.migrateLegacy();}state(e){let n=this.storage.get(be(e));return n==="unknown"||n==="denied"?n:"granted"}set(e,n){for(let r of n?[n]:Z)this.storage.set(be(r),e);}migrateLegacy(){let e=this.storage.get(sn);if(e!==null){if(e==="unknown"||e==="denied"||e==="granted")for(let n of Z)this.storage.get(be(n))===null&&this.storage.set(be(n),e);this.storage.remove(sn);}}get grantedPurposes(){return Z.filter(e=>this.state(e)==="granted")}get allDenied(){return Z.every(e=>this.state(e)==="denied")}get anyUnknown(){return Z.some(e=>this.state(e)==="unknown")}};function be(t){return `consent:${t}`}var Je="analytics:queue",we=class{constructor(e,n){this.storage=e,this.maxEvents=n,this.events=Nr(e);}get size(){return this.events.length}push(e){this.events.push(e),this.events.length>this.maxEvents&&this.events.splice(0,this.events.length-this.maxEvents),this.save();}nextBatch(e){let n=[],r=0;for(let s of this.events){let i=Lr(JSON.stringify(s));if(n.length>0&&(n.length>=e.maxEvents||r+i>e.maxBytes))break;n.push(s),r+=i;}return n}remove(e){let n=new Set(e.map(r=>r.eventId));this.events=this.events.filter(r=>!n.has(r.eventId)),this.save();}clear(){this.events=[],this.storage.remove(Je);}save(){this.storage.set(Je,JSON.stringify(this.events));}};function Nr(t){try{let e=JSON.parse(t.get(Je)??"[]");return Array.isArray(e)?e:[]}catch{return []}}function Lr(t){return new TextEncoder().encode(t).length}var O={flushAt:20,flushIntervalMs:3e4,maxQueueEvents:1e3,maxBatchEvents:500,maxBatchBytes:6e4,sessionTimeoutMs:30*6e4,maxSessionAgeMs:1440*6e4,quotaCooldownMs:60*6e4},xe=class{constructor(e){this.uploadsEnabled=false;this.isShutDown=false;this.inForeground=false;this.cooldownUntil=0;this.deps=e,this.now=e.now??Date.now,this.drain=new G({step:()=>this.sendNextBatch(),canRun:()=>this.canUpload()});}enqueue(e,n={}){let{queue:r,sessions:s,consent:i}=this.deps;if(!(this.isShutDown||i.allDenied)){for(let a of s.touch())r.push(on(a.name,a.occurredAt,a.sessionId,{...a.durationMs!==void 0?{props:{duration_ms:a.durationMs}}:{}}));r.push(on(e,this.now(),s.sessionId,n)),r.size>=O.flushAt&&this.flush();}}onForeground(){this.inForeground||(this.inForeground=true,this.enqueue("app_open"));}onBackground(){this.inForeground&&(this.inForeground=false,this.enqueue("app_background"),this.deps.sessions.markInactive(),this.flush());}enableUploads(){this.uploadsEnabled=true,this.flush();}shutdown(){this.isShutDown=true,this.uploadsEnabled=false,this.drain.cancelRetry(),this.deps.queue.clear();}setConsent(e,n){let{consent:r,queue:s,sessions:i}=this.deps,a=r.allDenied;r.set(e,n),r.allDenied?(this.drain.cancelRetry(),s.clear(),i.reset()):(a&&this.inForeground&&this.enqueue("app_open"),this.flush());}flush(){return this.drain.run()}async sendNextBatch(){let{queue:e,send:n}=this.deps,r=e.nextBatch({maxEvents:O.maxBatchEvents,maxBytes:O.maxBatchBytes});if(r.length===0)return "idle";let s=this.deps.consent.grantedPurposes,i=await n(r.map(a=>({...a,purposes:s})));return i==="retry"?"retry":(e.remove(r),i==="quota_exceeded"&&(this.cooldownUntil=this.now()+O.quotaCooldownMs),"next")}canUpload(){let{consent:e}=this.deps;return this.uploadsEnabled&&!e.anyUnknown&&e.grantedPurposes.length>0&&this.now()>=this.cooldownUntil}};function on(t,e,n,r){return {eventId:J(),name:t,occurredAt:new Date(e).toISOString(),...n?{sessionId:n}:{},...r.screen?{screen:r.screen}:{},...r.props?{props:r.props}:{}}}function an(t){let e=setInterval(()=>{t.flush();},O.flushIntervalMs);e.unref?.();let n=()=>{document.visibilityState==="hidden"?t.onBackground():t.onForeground();};return document.addEventListener("visibilitychange",n),()=>{clearInterval(e),document.removeEventListener("visibilitychange",n);}}function ln(t=Date.now()){let e=qr(16);for(let r=0;r<6;r++)e[r]=Math.floor(t/2**(8*(5-r)))&255;e[6]=112|e[6]&15,e[8]=128|e[8]&63;let n=Array.from(e,r=>r.toString(16).padStart(2,"0")).join("");return `${n.slice(0,8)}-${n.slice(8,12)}-${n.slice(12,16)}-${n.slice(16,20)}-${n.slice(20)}`}function qr(t){let e=new Uint8Array(t);try{globalThis.crypto.getRandomValues(e);}catch{for(let n=0;n<t;n++)e[n]=Math.floor(Math.random()*256);}return e}var Qe="analytics:session-id",Ze="analytics:session-started-at",et="analytics:session-last-active-at",Hr=1e4,Se=class{constructor(e,n){this.lastActivityWrite=0;this.storage=e,this.options=n,this.now=n.now??Date.now;}get sessionId(){return this.storage.get(Qe)}touch(){let e=this.now(),n=this.sessionId,r=this.readNumber(Ze),s=this.readNumber(et);return n&&r!==null&&s!==null?e-s>this.options.timeoutMs||e-r>this.options.maxAgeMs?[{name:"session_end",sessionId:n,occurredAt:s,durationMs:Math.max(0,s-r)},this.start(e)]:(this.recordActivity(e),[]):[this.start(e)]}markInactive(){this.sessionId&&(this.lastActivityWrite=0,this.recordActivity(this.now()));}reset(){this.storage.remove(Qe),this.storage.remove(Ze),this.storage.remove(et);}start(e){let n=ln(e);return this.storage.set(Qe,n),this.storage.set(Ze,String(e)),this.lastActivityWrite=0,this.recordActivity(e),{name:"session_start",sessionId:n,occurredAt:e}}recordActivity(e){e-this.lastActivityWrite<Hr||(this.storage.set(et,String(e)),this.lastActivityWrite=e);}readNumber(e){let n=this.storage.get(e),r=n===null?NaN:Number(n);return Number.isFinite(r)?r:null}};async function ee(t,e){let n=new URL(`${t}${e.path}`);for(let[a,c]of Object.entries(e.query??{}))c!==void 0&&n.searchParams.set(a,String(c));let r={Accept:"application/json",...e.headers},s=typeof FormData<"u"&&e.body instanceof FormData;e.body!==void 0&&!s&&(r["Content-Type"]="application/json"),e.token&&(r.Authorization=`Bearer ${e.token}`);let i;try{i=await fetch(n.toString(),{method:e.method,headers:r,body:e.body===void 0?void 0:s?e.body:JSON.stringify(e.body),credentials:"omit",...e.signal?{signal:e.signal}:{},...e.keepalive?{keepalive:!0}:{}});}catch(a){throw Br(a)?new A("aborted","Request aborted"):new A("network","Could not reach the Appwin API")}if(!i.ok){let a=await zr(i);if(i.status===403&&a.code==="PLAN_UPGRADE_REQUIRED")throw new A("plan_upgrade_required",Wr(a.product),403);let c=It(i.status),d=c==="origin_not_allowed"?$r():a.message??`HTTP ${i.status}`;throw new A(c,d,i.status)}if(i.status!==204)return await i.json()}function $r(){return `${globalThis.location?.origin??"This page"} is not allowed to use this App ID. In the Appwin dashboard, open your app, SDK tab, Web domains, and add it. While that list is empty, every site is refused, localhost included.`}function Wr(t){return `The organisation's plan does not include ${t??"this product"}. Upgrade it at https://appwin.io/pricing.`}function Br(t){return t instanceof Error&&t.name==="AbortError"}async function zr(t){try{let e=await t.json();if(!e||typeof e!="object")return {};let{message:n,code:r,product:s}=e;return {...typeof n=="string"&&n?{message:n}:{},...typeof r=="string"?{code:r}:{},...typeof s=="string"?{product:s}:{}}}catch{return {}}}var tt="session-token",nt="external-id";function rt(t){if(typeof t!="object"||t===null||Array.isArray(t))return;let e=Object.entries(t).filter(n=>typeof n[1]=="string");return e.length>0?Object.fromEntries(e):void 0}var jr=["email","name","avatarUrl","language","timezone","location","plan"],Ce=class{constructor(e){this.pending=null;this.pendingFor=null;this.identityListeners=new Set;this.options=e,this.token=e.storage.get(tt),this.externalId=e.storage.get(nt),this.device=Ge(e.storage);}get deviceId(){return this.device.deviceId}get deviceInfo(){return this.device}get appVersion(){return this.options.appVersion}async authenticate(){return this.token?this.token:this.open()}onIdentityChange(e){return this.identityListeners.add(e),()=>this.identityListeners.delete(e)}async identify(e,n){if(!e)throw new A("bad_request","`externalId` must not be empty");e===this.externalId?await this.authenticate():(this.externalId=e,this.options.storage.set(nt,e),await this.open(),this.notifyIdentityChange()),n&&await this.updateUser(n);}async updateUser(e){await this.fetch({method:"PATCH",path:"/api/sdk/v1/me",body:Vr(e)});}async logout(){let e=this.token;if(e)try{await ee(this.options.baseUrl,{method:"POST",path:"/api/sdk/v1/auth/revoke",token:e});}catch{}this.token=null,this.externalId=null,this.options.storage.remove(tt),this.options.storage.remove(nt),this.options.storage.remove("device-id"),this.device=Ge(this.options.storage);try{await this.open();}catch{}this.notifyIdentityChange();}async fetch(e){let n=await this.authenticate();try{return await ee(this.options.baseUrl,{...e,token:n})}catch(r){if(!(r instanceof A)||r.code!=="unauthorized")throw r;let s=await this.open();return ee(this.options.baseUrl,{...e,token:s})}}open(){let e=this.externalId;if(this.pending&&this.pendingFor===e)return this.pending;let r=(this.pending?.catch(()=>{})??Promise.resolve()).then(()=>this.requestToken(e)).then(s=>(this.token=s,this.options.storage.set(tt,s),s)).finally(()=>{this.pending===r&&(this.pending=null,this.pendingFor=null);});return this.pending=r,this.pendingFor=e,r}notifyIdentityChange(){for(let e of this.identityListeners)e();}async requestToken(e){return (await ee(this.options.baseUrl,{method:"POST",path:"/api/sdk/v1/auth/init",headers:{"X-Appwin-App-Id":this.options.appId},body:{deviceId:this.device.deviceId,platform:this.device.platform,sdkVersion:this.options.sdkVersion,...this.options.appVersion?{appVersion:this.options.appVersion}:{},...this.device.model?{model:this.device.model}:{},...this.device.os?{os:this.device.os}:{},...this.device.language?{language:this.device.language}:{},...e?{externalId:e}:{}}})).token}};function Vr(t){let e={};for(let r of jr){let s=t[r];typeof s=="string"&&(e[r]=s);}let n=rt(t.customAttributes);return n&&(e.customAttributes=n),e}function st(t,e){return `appwin:${t}:${e}`}function cn(){let t=new Map;return {get:e=>t.get(e)??null,set:(e,n)=>{t.set(e,n);},remove:e=>{t.delete(e);}}}function Gr(t){try{let e="__appwin_probe__";return globalThis[t].setItem(e,"1"),globalThis[t].removeItem(e),!0}catch{return  false}}function it(t,e="localStorage"){if(!Gr(e))return cn();let n=cn();return {get(r){try{return globalThis[e].getItem(st(t,r))}catch{return n.get(r)}},set(r,s){try{globalThis[e].setItem(st(t,r),s);}catch{n.set(r,s);}},remove(r){try{globalThis[e].removeItem(st(t,r));}catch{n.remove(r);}}}}var T="/api/sdk/support/v1",pn=20,Ae=class{constructor(e){this.session=e;}onVisitorChange(e){return this.session.onIdentityChange(e)}config(e){return this.session.fetch({method:"GET",path:`${T}/config`,...e?{signal:e}:{}})}faqs(e){return this.session.fetch({method:"GET",path:`${T}/faqs`,...e?{signal:e}:{}})}faqCategories(e){return this.session.fetch({method:"GET",path:`${T}/faq-categories`,...e?{signal:e}:{}})}conversations(e,n){return this.session.fetch({method:"GET",path:`${T}/conversations`,query:{limit:pn,...e?{cursor:e}:{}},...n?{signal:n}:{}})}async unreadCount(e){return (await this.conversations(void 0,e)).data.filter($).length}conversation(e,n){return this.session.fetch({method:"GET",path:`${T}/conversations/${e}`,...n?{signal:n}:{}})}createConversation(e){return this.session.fetch({method:"POST",path:`${T}/conversations`,body:{firstMessage:dn(e)}})}messages(e,n,r){return this.session.fetch({method:"GET",path:`${T}/conversations/${e}/messages`,query:{limit:pn,...n?{cursor:n}:{}},...r?{signal:r}:{}})}sendMessage(e,n){return this.session.fetch({method:"POST",path:`${T}/conversations/${e}/messages`,body:dn(n)})}markRead(e){return this.session.fetch({method:"POST",path:`${T}/conversations/${e}/messages/read`})}async setTyping(e,n){try{await this.session.fetch({method:"POST",path:`${T}/conversations/${e}/typing`,body:{isTyping:n}});}catch{}}toggleReaction(e,n,r){return this.session.fetch({method:"POST",path:`${T}/conversations/${e}/messages/${n}/reactions`,body:{emoji:r}})}updateMessage(e,n,r){return this.session.fetch({method:"PATCH",path:`${T}/conversations/${e}/messages/${n}`,body:{body:r}})}deleteMessage(e,n){return this.session.fetch({method:"DELETE",path:`${T}/conversations/${e}/messages/${n}`})}attachmentUrl(e){return this.session.fetch({method:"GET",path:`${T}/attachments/${e}/url`})}async upload(e,n){let r=await this.session.fetch({method:"POST",path:`${T}/uploads/sign`,body:{mimeType:e.type||"application/octet-stream",sizeBytes:e.size},...n?{signal:n}:{}}),s=new FormData;for(let[a,c]of Object.entries(r.fields))s.append(a,c);s.append("file",e);let i;try{i=await fetch(r.postUrl,{method:"POST",body:s,...n?{signal:n}:{}});}catch{throw new A("network","Could not reach the storage service")}if(!i.ok)throw new A("bad_request","The file was rejected by storage",i.status);return await this.session.fetch({method:"POST",path:`${T}/uploads/${r.uploadId}/confirm`}),{storageKey:r.storageKey,mimeType:e.type||"application/octet-stream",sizeBytes:e.size,filename:e.name}}};function $(t){return t.lastMessageAuthorType===null||t.lastMessageAuthorType==="customer"||!t.lastMessageAt?false:t.lastReadAt?new Date(t.lastMessageAt)>new Date(t.lastReadAt):true}function dn(t){return {body:t.body?.trim()??"",attachments:t.attachments??[]}}var ke=class{constructor(e){this.socket=null;this.attempts=0;this.pingTimer=null;this.retryTimer=null;this.closed=false;this.stopWatchingIdentity=null;this.generation=0;this.options=e;}async connect(){this.closed=false,this.stopWatchingIdentity??=this.options.session.onIdentityChange(()=>this.reopen()),await this.open();}disconnect(){this.closed=true,this.stopWatchingIdentity?.(),this.stopWatchingIdentity=null,this.clearTimers(),this.socket?.close(1e3),this.socket=null;}async open(){if(this.closed)return;let e=this.generation,n;try{n=(await this.options.session.fetch({method:"POST",path:"/api/sdk/v1/realtime/token"})).token;}catch{if(e!==this.generation)return;this.scheduleReconnect();return}if(e!==this.generation||this.closed)return;let r=new WebSocket(`${this.options.gatewayUrl}/ws?t=${encodeURIComponent(n)}`);this.socket=r,r.onopen=()=>{this.attempts=0;for(let s of Kr(n))r.send(JSON.stringify({a:"sub",topic:s}));this.options.onConnectionChange?.(true),this.startPing();},r.onmessage=s=>this.onFrame(s.data),r.onclose=s=>{this.stopPing(),this.options.onConnectionChange?.(false),!this.closed&&(s.code===4001&&(this.attempts=0),this.scheduleReconnect());},r.onerror=()=>{};}reopen(){if(this.closed)return;this.clearTimers();let e=this.socket;this.socket=null,e&&(e.onclose=null,e.close(1e3),this.options.onConnectionChange?.(false)),this.attempts=0,this.generation+=1,this.open();}onFrame(e){if(typeof e!="string")return;let n;try{n=JSON.parse(e);}catch{return}if(!n||typeof n!="object")return;let r=n;if(r.v!==1||typeof r.t!="string"||!r.data)return;let s=Yr(r.t,r.data);s&&this.options.onEvent(s);}startPing(){this.stopPing(),this.pingTimer=setInterval(()=>{this.socket?.readyState===WebSocket.OPEN&&this.socket.send('{"a":"ping"}');},25e3);}stopPing(){this.pingTimer&&clearInterval(this.pingTimer),this.pingTimer=null;}clearTimers(){this.stopPing(),this.retryTimer&&clearTimeout(this.retryTimer),this.retryTimer=null;}scheduleReconnect(){if(this.closed||this.retryTimer)return;let n=Math.min(1e3*2**this.attempts,3e4)*(.5+Math.random()*.5);this.attempts+=1,this.retryTimer=setTimeout(()=>{this.retryTimer=null,this.open();},n);}};function Kr(t){let e=t.split(".")[1];if(!e)return [];try{let n=e.replace(/-/g,"+").replace(/_/g,"/"),r=JSON.parse(atob(n.padEnd(Math.ceil(n.length/4)*4,"=")));return Array.isArray(r.topics)?r.topics.filter(s=>typeof s=="string"):[]}catch{return []}}function Yr(t,e){if(t==="support.message.created"||t==="support.message.updated")return {type:"message"};if(t==="support.conversation.updated")return typeof e.resourceId!="string"?null:{type:"conversation",conversationId:e.resourceId};if(t==="support.typing"){if(e.typingActor==="customer")return null;let n=typeof e.conversationId=="string"?e.conversationId:typeof e.resourceId=="string"?e.resourceId:null;return n?{type:"typing",conversationId:n,isTyping:e.isTyping===true}:null}return null}var un="0.14.0",Xr="https://api.appwin.io",Jr="wss://ws.appwin.io";function gn(t){if(!t.appId)throw new Error("[appwin] `appId` is required. Find it in the dashboard, SDK tab.");let e=fn(t.apiUrl??Xr),n=fn(t.gatewayUrl??Jr),r=it(t.appId),s=new Ce({appId:t.appId,baseUrl:e,storage:r,sdkVersion:un,...t.appVersion?{appVersion:t.appVersion}:{}});t.externalId&&s.identify(t.externalId);let i=new Ae(s),a=new Se(r,{timeoutMs:O.sessionTimeoutMs,maxAgeMs:O.maxSessionAgeMs}),c=new _e(r),d=new xe({queue:new we(it(t.appId,"sessionStorage"),O.maxQueueEvents),sessions:a,consent:c,send:zt(s)});d.enableUploads(),typeof document<"u"&&(an(d),document.visibilityState!=="hidden"&&d.onForeground());let p=rn({session:s,storage:r,sdkVersion:un,pipeline:d,consent:c,sessions:a});return {support:i,analytics:p.analytics,track:p.track,setConsent:p.setConsent,connect(u,f){let l=new ke({session:s,gatewayUrl:n,onEvent:u,...f?{onConnectionChange:f}:{}});return l.connect(),l},identify:(u,f)=>s.identify(u,f),updateUser:u=>s.updateUser(u),async logout(){await p.analytics.flush(),await s.logout();}}}function fn(t){return t.endsWith("/")?t.slice(0,-1):t}var hn=`/*
 * The messenger's stylesheet, bundled into \`panel.js\` as a string and
 * injected into the iframe's document at boot (ADR-0046 \xA73, amended
 * 2026-09-23). Inline on purpose: it is the first paint, and a widget that
 * flashes unstyled on somebody's landing page is a widget they take off the
 * page. Every colour comes from a variable the studio's configuration sets.
 */
:root {
  --appwin-primary: #1f1f1f;
  --appwin-primary-foreground: #ffffff;
  --appwin-radius: 12px;
  --appwin-page: #f8fafc;
  --appwin-surface: #ffffff;
  --appwin-raised: #f1f5f9;
  --appwin-text: #0f172a;
  --appwin-muted: #334155;
  --appwin-subtle: #94a3b8;
  --appwin-border: #e2e8f0;
  --appwin-unread: #e71919;
  color-scheme: light;
}

/* The gray vars (surface/raised/text/muted/border) are set from the config's
   grayWarmth + resolved scheme in theme.ts; the values above are the light
   fallback shown before that runs. \`data-appwin-scheme\` keeps the browser's
   own chrome (textarea, scrollbars) in step with the dark theme. */
:root[data-appwin-scheme='dark'] { color-scheme: dark; }

* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  display: flex;
  flex-direction: column;
  background: var(--appwin-page);
  color: var(--appwin-text);
  /* Inter Tight to match the design when the host has it; system fallback
     otherwise (an embedded widget must not force a web-font load past a strict
     CSP). The 1.3 line-height is the Figma text scale. */
  font: 400 14px/1.3 'Inter Tight', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* Nothing shows until the configuration is in: no flash of the wrong brand. */
body:not([data-state='ready']) #root { visibility: hidden; }
#root { display: flex; flex-direction: column; flex: 1; min-height: 0; }

button { font: inherit; color: inherit; cursor: pointer; }
a { color: inherit; }

/* --- Frame ---------------------------------------------------------- */
/* Figma blur-top / blur-bottom (40:7153, 40:7358): a 320x200 ellipse of the
   brand at 24 %, blur 40 (Figma's layer blur 80), centred on the panel's top and
   bottom edges, behind the bar and the cards. */
.home-glow {
  position: fixed;
  left: 50%;
  width: 320px;
  height: 200px;
  margin-left: -160px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--appwin-primary) 24%, transparent);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
}
.home-glow.top { top: -100px; }
.home-glow.bottom { bottom: -100px; }
.appbar, .body { position: relative; z-index: 1; }
.appbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px calc(14px + env(safe-area-inset-top, 0px));
  /* Transparent: the panel is already bg/page, and the home glow shows through. */
  background: transparent;
  color: var(--appwin-text);
  flex: none;
}
.appbar-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.icon-button {
  display: flex;
  width: 32px;
  height: 32px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
}
.icon-button:hover { background: rgb(128 128 128 / 0.18); }
.body { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
/* Each screen fades and lifts in on navigation. Keyed remount in app.tsx
   replays it; the container is a transparent flex passthrough. */
.screen-swap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  animation: appwin-screen-in 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes appwin-screen-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .screen-swap { animation: none; }
}
.screen { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* --- Shared bits ---------------------------------------------------- */
.avatar { border-radius: 50%; object-fit: cover; flex: none; }
/* Figma Profile avatar: the brand at 24 % over the surface, and the initials
   drawn twice in place, brand at 16 % under text at 12 % (the ::after). */
.avatar-fallback {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(
      color-mix(in srgb, var(--appwin-primary) 24%, transparent),
      color-mix(in srgb, var(--appwin-primary) 24%, transparent)
    ),
    var(--appwin-surface);
  color: color-mix(in srgb, var(--appwin-primary) 16%, transparent);
  font-weight: 800;
}
.avatar-fallback::after {
  content: attr(data-initials);
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: color-mix(in srgb, var(--appwin-text) 12%, transparent);
}
.unread-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--appwin-unread);
  flex: none;
}
.spinner {
  display: inline-block;
  width: 18px; height: 18px;
  border: 2px solid var(--appwin-border);
  border-top-color: var(--appwin-primary);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 2s; } }
.centered {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
}
.centered.thin { flex: none; padding: 12px; }
.failure-title { margin: 0; font-weight: 600; }
.failure-body { margin: 0; color: var(--appwin-muted); }
.button {
  padding: 9px 16px;
  border: 0;
  border-radius: var(--appwin-radius);
  background: var(--appwin-primary);
  color: var(--appwin-primary-foreground);
  font-weight: 600;
}

/* --- Home ----------------------------------------------------------- */
/* --- Banner ---------------------------------------------------------
   A transcription of Figma BannerForSupport (441:6615), the same one the
   dashboard preview and the iOS SDK render. The percentages live in
   \`banner.tsx\`; what is here is only the plumbing they need. */
.banner {
  position: relative;
  aspect-ratio: 280 / 91;
  border-radius: var(--appwin-radius);
  overflow: hidden;
  background-color: var(--appwin-raised);
  flex: none;
}
.banner-fill {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
}
.banner-layer { position: absolute; }
.tile-slot {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  container-type: size;
}
.tile {
  position: relative;
  flex: none;
  transform: rotate(-8deg);
  /* The tile is Figma's rotated frame: its box is the hypotenuse of the
     slot. The first pair is the fallback for a browser without \`hypot()\`
     (Chrome < 111, Safari < 15.4) - close enough that the grid holds. */
  width: 88cqw;
  height: 88cqh;
  width: hypot(87.6777cqw, 12.3223cqh);
  height: hypot(12.3223cqw, 87.6777cqh);
}
.tile-empty {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: rgb(255 255 255 / 0.05);
}
.banner-photo {
  position: absolute;
  top: -260.51%;
  bottom: -101.03%;
  left: 50%;
  transform: translateX(-50%);
  aspect-ratio: 500 / 750;
}
.banner-badge {
  position: absolute;
  top: 24.62%;
  bottom: 24.1%;
  left: 50%;
  transform: translateX(-50%);
  aspect-ratio: 1;
  overflow: hidden;
}
.greeting { margin: 0; font-size: 32px; font-weight: 500; line-height: 1.05; }
.greeting-line { margin: 0; }
.welcome {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: var(--appwin-radius);
  background: var(--appwin-raised);
  color: var(--appwin-muted);
}
.welcome p { margin: 0; flex: 1; min-width: 0; font-size: 12px; line-height: 1.3; overflow-wrap: anywhere; }
/* Cards are the Figma bg/container (white) on the bg/page panel: no border and
   no shadow, the contrast is the surface/page difference (support-home 40:6481). */
.card {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px;
  border: 0;
  border-radius: var(--appwin-radius);
  background: var(--appwin-surface);
  text-align: left;
}
.card:hover { background: var(--appwin-raised); }
/* The fill comes from the configuration (flat, or the studio's gradient),
   so only the ring and the lift are here. Same two shadows as the
   dashboard preview. */
.card.cta {
  border-color: transparent;
  color: var(--appwin-primary-foreground);
  font-weight: 500;
  box-shadow:
    inset 0 0 0 1.5px rgb(255 255 255 / 0.2),
    0 4px 8px rgb(2 6 23 / 0.1);
}
.card.cta:hover { filter: brightness(0.97); }
.card-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.card-label { font-size: 12px; color: var(--appwin-muted); }
.card-title { flex: 1; font-size: 14px; font-weight: 500; }
.card-preview, .row-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
  font-size: 12px;
  color: var(--appwin-muted);
}
/* FAQ (Figma support-home 40:7225): a titled section under a divider, each
   category a light label over card rows that match the message cards. */
.section-title { margin: 0; font-size: 24px; font-weight: 500; line-height: 1; color: var(--appwin-text); }
.faq-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 4px;
  padding-top: 24px;
  border-top: 1px solid var(--appwin-border);
}
.faq-group { display: flex; flex-direction: column; gap: 6px; }
.faq-category { margin: 0 0 2px; font-size: 14px; font-weight: 600; color: var(--appwin-subtle); }
.faq-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 14px;
  border: 0;
  border-radius: var(--appwin-radius);
  background: var(--appwin-surface);
  text-align: left;
  font-weight: 500;
}
.faq-row:hover { background: var(--appwin-raised); }
.faq-question { flex: 1; min-width: 0; }

/* --- Lists ---------------------------------------------------------- */
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 12px;
  border: 0;
  border-bottom: 1px solid var(--appwin-border);
  background: transparent;
  text-align: left;
}
.row:hover { background: var(--appwin-raised); }
.row-text { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.badge-status {
  flex: none;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--appwin-border);
  font-size: 11px;
  color: var(--appwin-muted);
}
.empty { align-items: center; justify-content: center; text-align: center; color: var(--appwin-muted); }
.empty-title { margin: 0; font-weight: 600; color: var(--appwin-text); }
.empty-body { margin: 0; }

/* --- Article -------------------------------------------------------- */
/* The question sits in a brand-soft pill (Figma bg/brand-soft = the studio's
   colour at 24%), rounded like every other card (support-convo 40:7605). */
.article-question {
  margin: 0;
  padding: 20px;
  border-radius: var(--appwin-radius);
  background: color-mix(in srgb, var(--appwin-primary) 24%, transparent);
  color: var(--appwin-text);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}
.article-body {
  margin: 0;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.36;
  color: var(--appwin-muted);
}

/* --- Thread --------------------------------------------------------- */
.thread { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.thread-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
/* A short thread sits on the composer, as every messenger does. On the
   container \`justify-content: flex-end\` would cut the top off once the
   history overflows; pushing the first child down does not. */
.thread-scroll > :first-child { margin-top: auto; }
.day { display: flex; flex-direction: column; gap: 8px; }
.day-label { margin: 0 0 2px; text-align: center; font-size: 11px; color: var(--appwin-muted); }
.bubble-row { display: flex; gap: 8px; align-items: flex-end; }
.bubble-row.mine { justify-content: flex-end; }
.bubble-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 78%;
  align-items: flex-start;
}
.bubble-row.mine .bubble-column { align-items: flex-end; }
.bubble {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 9px 12px;
  border: 0;
  border-radius: var(--appwin-radius);
  background: var(--appwin-raised);
  text-align: left;
  font: inherit;
  color: inherit;
}
.bubble-row.mine .bubble {
  background: var(--appwin-primary);
  color: var(--appwin-primary-foreground);
}
/* --- Message actions ------------------------------------------------ */
.actions { display: flex; flex-direction: column; gap: 6px; align-items: inherit; }
.pill {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--appwin-border);
  border-radius: 999px;
  background: var(--appwin-surface);
  box-shadow: 0 2px 8px rgb(2 6 23 / 0.08);
}
.pill-emoji {
  border: 0;
  border-radius: 50%;
  padding: 3px 5px;
  background: transparent;
  font-size: 15px;
  line-height: 1;
}
.pill-emoji:hover, .pill-emoji.on { background: var(--appwin-border); }
.pill-action {
  border: 0;
  border-radius: 999px;
  padding: 3px 10px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
}
.pill-action:hover { background: var(--appwin-border); }
.pill-action.danger { color: var(--appwin-unread); }
.bubble-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 0;
}
.bubble-footer:empty { display: none; }
.reactions { display: flex; gap: 4px; }
.reaction {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border: 1px solid var(--appwin-border);
  border-radius: 999px;
  background: var(--appwin-surface);
  font-size: 12px;
  line-height: 1.4;
}
.reaction.on { border-color: var(--appwin-primary); }
.reaction-count { color: var(--appwin-muted); font-size: 11px; }
.link {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--appwin-muted);
  font-size: 11px;
  text-decoration: underline;
}
.bubble-body { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.bubble-time { font-size: 10px; opacity: 0.65; align-self: flex-end; }
.attachment-image img { display: block; max-width: 100%; border-radius: 8px; }
.attachment-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgb(128 128 128 / 0.16);
  text-decoration: none;
}
.attachment-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachment-size { flex: none; font-size: 11px; opacity: 0.7; }
.typing { display: flex; gap: 4px; padding: 4px 2px; }
.typing span {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--appwin-muted);
  animation: blink 1.2s infinite ease-in-out;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }

/* --- Composer ------------------------------------------------------- */
.composer {
  flex: none;
  border-top: 1px solid var(--appwin-border);
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  background: var(--appwin-surface);
}
.composer-row { display: flex; align-items: flex-end; gap: 8px; }
.composer-input {
  flex: 1;
  min-height: 38px;
  max-height: 120px;
  padding: 9px 12px;
  border: 1px solid var(--appwin-border);
  border-radius: var(--appwin-radius);
  background: var(--appwin-surface);
  color: inherit;
  font: inherit;
  resize: none;
}
.composer-input:focus { outline: 2px solid var(--appwin-primary); outline-offset: -1px; }
.send {
  display: flex;
  flex: none;
  align-items: center;
  gap: 5px;
  height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: var(--appwin-primary);
  color: var(--appwin-primary-foreground);
  font-size: 12px;
  font-weight: 600;
}
.send:disabled { opacity: 0.45; cursor: default; }
.composer-files { display: flex; flex-wrap: wrap; gap: 6px; padding-bottom: 8px; }
.composer-file {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--appwin-raised);
  font-size: 12px;
}
.composer-file-remove { border: 0; background: transparent; padding: 0 2px; font-size: 15px; }
.composer-error { margin: 0 0 8px; font-size: 12px; color: var(--appwin-unread); }
.composer-editing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  padding: 5px 10px;
  border-radius: var(--appwin-radius);
  background: var(--appwin-raised);
  font-size: 12px;
  color: var(--appwin-muted);
}
`;var ot=2,yn=1,vn="appwin-host",Zr="appwin-panel";function z(t){return {v:ot,from:vn,...t}}function te(t){return {v:ot,from:Zr,...t}}function es(t,e){if(typeof t!="object"||t===null)return null;let n=t;return n.from!==e||n.v!==ot&&n.v!==yn?null:n}function bn(t){let e=es(t,vn);if(!e)return null;if(e.v===yn)return ts(e);switch(e.type){case "open":case "close":case "logout":return z({type:e.type});case "identify":{if(typeof e.externalId!="string"||!e.externalId)return null;if(e.attributes===void 0)return z({type:"identify",externalId:e.externalId});let n=mn(e.attributes);return n?z({type:"identify",externalId:e.externalId,attributes:n}):null}case "updateUser":{let n=mn(e.attributes);return n?z({type:"updateUser",attributes:n}):null}default:return null}}function ts(t){switch(t.type){case "open":case "close":return z({type:t.type});case "reset":return z({type:"logout"});case "identify":return typeof t.userId!="string"||!t.userId?null:z({type:"identify",externalId:t.userId});default:return null}}var ns=["email","name","avatarUrl","language","timezone","location","plan"];function mn(t){if(typeof t!="object"||t===null)return null;let e=t,n={};for(let s of ns){let i=e[s];if(i!==void 0){if(typeof i!="string")return null;n[s]=i;}}let r=rt(e.customAttributes);return r&&(n.customAttributes=r),n}var _n={openMessenger:"Open the support messenger",closeMessenger:"Close the support messenger",messenger:"Support messenger"},wn={openMessenger:"Ouvrir la messagerie d'assistance",closeMessenger:"Fermer la messagerie d'assistance",messenger:"Messagerie d'assistance"};var xn={..._n,close:"Close",back:"Back",retry:"Retry",greetingNamed:"Hello {name} \u{1F44B}",greetingYou:"you",greetingSubtitle:"Need help?",sendToSupport:"Send us a message",conversations:"Your conversations",conversationsTitle:"My conversations",recentMessage:"Recent message",faq:"FAQ",helpCenter:"Help center",welcomeDefault:"The team will get back to you as soon as possible!",noArticles:"No articles",noConversation:"No conversation yet",emptyConversationsHint:"Write to support to get started - we reply here.",newConversationPreview:"New conversation",youPreview:"You: {message}",statusResolved:"Resolved",statusClosed:"Closed",editMessage:"Edit",deleteMessage:"Delete",editingBanner:"Editing message",cancel:"Cancel",save:"Save",react:"React",showOriginal:"Show original",seeTranslation:"See translation",writeMessage:"Write a message",messagePlaceholder:"Write a message\u2026",send:"Send",attachFile:"Attach a file",typing:"Typing",seen:"Seen",sent:"Sent",agentFallback:"Support",loadErrorTitle:"Couldn't load",loadErrorMessage:"Check your connection and try again.",planUnavailable:"Support is not included in this organisation's plan.",offline:"The messenger is unreachable right now.",today:"Today",yesterday:"Yesterday",justNow:"Just now",relativeMinutes:"{n} min",relativeHours:"{n} h",relativeDays:"{n} d",relativeWeeks:"{n} w"},rs={...wn,close:"Fermer",back:"Retour",retry:"R\xE9essayer",greetingNamed:"Hello {name} \u{1F44B}",greetingYou:"toi",greetingSubtitle:"Besoin d'aide ?",sendToSupport:"Envoyer un message au support",conversations:"Vos conversations",conversationsTitle:"Mes conversations",recentMessage:"Message r\xE9cent",faq:"FAQ",helpCenter:"Centre d\u2019aide",welcomeDefault:"L\u2019\xE9quipe vous r\xE9pondra au plus vite !",noArticles:"Aucun article",noConversation:"Aucune conversation",emptyConversationsHint:"\xC9cris au support pour d\xE9marrer - on te r\xE9pond ici.",newConversationPreview:"Nouvelle conversation",youPreview:"Vous : {message}",statusResolved:"R\xE9solue",statusClosed:"Ferm\xE9e",editMessage:"Modifier",deleteMessage:"Supprimer",editingBanner:"Modification du message",cancel:"Annuler",save:"Enregistrer",react:"R\xE9agir",showOriginal:"Voir l'original",seeTranslation:"Voir la traduction",writeMessage:"\xC9crire un message",messagePlaceholder:"\xC9crire un message\u2026",send:"Envoyer",attachFile:"Joindre un fichier",typing:"En train d'\xE9crire",seen:"Vu",sent:"Envoy\xE9",agentFallback:"Support",loadErrorTitle:"Impossible de charger",loadErrorMessage:"V\xE9rifiez votre connexion et r\xE9essayez.",planUnavailable:"Le support n'est pas inclus dans le plan de cette organisation.",offline:"La messagerie est injoignable pour l'instant.",today:"Aujourd'hui",yesterday:"Hier",justNow:"\xC0 l'instant",relativeMinutes:"{n} min",relativeHours:"{n} h",relativeDays:"{n} j",relativeWeeks:"{n} sem."},ss={en:xn,fr:rs};function Sn(t){let e=(t??"").toLowerCase().split("-")[0];return e&&ss[e]||xn}var K,S,at,Cn,Te=0,Rn=[],k=w,An=k.__b,kn=k.__r,En=k.diffed,Tn=k.__c,In=k.unmount,Mn=k.__;function Ie(t,e){k.__h&&k.__h(S,t,Te||e),Te=0;var n=S.__H||(S.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function F(t){return Te=1,is(Dn,t)}function is(t,e,n){var r=Ie(K++,2);if(r.t=t,!r.__c&&(r.__=[Dn(void 0,e),function(c){var d=r.__N?r.__N[0]:r.__[0],p=r.t(d,c);d!==p&&(r.__N=[p,r.__[1]],r.__c.setState({}));}],r.__c=S,!S.__f)){var s=function(c,d,p){if(!r.__c.__H)return  true;var u=false,f=r.__c.props!==c;if(r.__c.__H.__.some(function(g){if(g.__N){u=true;var y=g.__[0];g.__=g.__N,g.__N=void 0,y!==g.__[0]&&(f=true);}}),i){var l=i.call(this,c,d,p);return u?l||f:l}return !u||f};S.__f=true;var i=S.shouldComponentUpdate,a=S.componentWillUpdate;S.componentWillUpdate=function(c,d,p){if(this.__e){var u=i;i=void 0,s(c,d,p),i=u;}a&&a.call(this,c,d,p);},S.shouldComponentUpdate=s;}return r.__N||r.__}function ne(t,e){var n=Ie(K++,3);!k.__s&&Un(n.__H,e)&&(n.__=t,n.u=e,S.__H.__h.push(n));}function ct(t){return Te=5,os(function(){return {current:t}},[])}function os(t,e){var n=Ie(K++,7);return Un(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function On(t){var e=S.context[t.__c],n=Ie(K++,9);return n.c=t,e?(n.__==null&&(n.__=true,e.sub(S)),e.props.value):t.__}function as(){for(var t;t=Rn.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Ee),e.__h.some(lt),e.__h=[];}catch(n){e.__h=[],k.__e(n,t.__v);}}}k.__b=function(t){S=null,An&&An(t);},k.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Mn&&Mn(t,e);},k.__r=function(t){kn&&kn(t),K=0;var e=(S=t.__c).__H;e&&(at===S?(e.__h=[],S.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0;})):(e.__h.some(Ee),e.__h.some(lt),e.__h=[],K=0)),at=S;},k.diffed=function(t){En&&En(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Rn.push(e)!==1&&Cn===k.requestAnimationFrame||((Cn=k.requestAnimationFrame)||ls)(as)),e.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0);})),at=S=null;},k.__c=function(t,e){e.some(function(n){try{n.__h.some(Ee),n.__h=n.__h.filter(function(r){return !r.__||lt(r)});}catch(r){e.some(function(s){s.__h&&(s.__h=[]);}),e=[],k.__e(r,n.__v);}}),Tn&&Tn(t,e);},k.unmount=function(t){In&&In(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(r){try{Ee(r);}catch(s){e=s;}}),n.__H=void 0,e&&k.__e(e,n.__v));};var Pn=typeof requestAnimationFrame=="function";function ls(t){var e,n=function(){clearTimeout(r),Pn&&cancelAnimationFrame(e),setTimeout(t);},r=setTimeout(n,35);Pn&&(e=requestAnimationFrame(n));}function Ee(t){var e=S,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),S=e;}function lt(t){var e=S;t.__c=t.__(),S=e;}function Un(t,e){return !t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function Dn(t,e){return typeof e=="function"?e(t):e}function Me(t,e,n,r=Date.now()){let s=new Date(t).getTime();if(Number.isNaN(s))return "";let i=Math.max(0,r-s);return i<6e4?e.justNow:i<36e5?e.relativeMinutes.replace("{n}",String(Math.floor(i/6e4))):i<864e5?e.relativeHours.replace("{n}",String(Math.floor(i/36e5))):i<6048e5?e.relativeDays.replace("{n}",String(Math.floor(i/864e5))):i<5*6048e5?e.relativeWeeks.replace("{n}",String(Math.floor(i/6048e5))):new Intl.DateTimeFormat(n,{day:"numeric",month:"short"}).format(s)}function Fn(t,e){let n=new Date(t);return Number.isNaN(n.getTime())?"":new Intl.DateTimeFormat(e,{hour:"2-digit",minute:"2-digit"}).format(n)}function cs(t,e,n,r=Date.now()){let s=new Date(t);if(Number.isNaN(s.getTime()))return "";let i=c=>new Date(c.getFullYear(),c.getMonth(),c.getDate()).getTime(),a=Math.round((i(new Date(r))-i(s))/864e5);return a===0?e.today:a===1?e.yesterday:new Intl.DateTimeFormat(n,{day:"numeric",month:"long",...s.getFullYear()===new Date(r).getFullYear()?{}:{year:"numeric"}}).format(s)}function Nn(t,e,n,r=Date.now()){let s=[];for(let i=t.length-1;i>=0;i-=1){let a=t[i];if(!a)continue;let c=cs(a.createdAt,e,n,r),d=s[s.length-1];d&&d.day===c?d.messages.push(a):s.push({day:c,messages:[a]});}return s}function Pe(t,e){let n=t.preview?.trim();return n?t.lastMessageAuthorType==="customer"?e.youPreview.replace("{message}",n):n:e.newConversationPreview}function Ln(t){return t.trim().split(/\s+/).filter(Boolean).slice(0,2).map(r=>[...r][0]??"").join("").toUpperCase()}function qn(t,e){let n=["B","kB","MB","GB"],r=Math.max(0,t),s=0;for(;r>=1e3&&s<n.length-1;)r/=1e3,s+=1;return `${new Intl.NumberFormat(e,{maximumFractionDigits:r<10&&s>0?1:0}).format(r)} ${n[s]}`}var ps=0;function o(t,e,n,r,s,i){e||(e={});var a,c,d=e;if("ref"in d)for(c in d={},e)c=="ref"?a=e[c]:d[c]=e[c];var p={type:t,props:d,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--ps,__i:-1,__u:0,__source:s,__self:i};if(typeof t=="function"&&(a=t.defaultProps))for(c in a)d[c]===void 0&&(d[c]=a[c]);return w.vnode&&w.vnode(p),p}function N({size:t=20,children:e}){return o("svg",{viewBox:"0 0 24 24",width:t,height:t,fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:e})}var Hn=t=>o(N,{...t,children:o("path",{d:"M18 6 6 18M6 6l12 12"})}),$n=t=>o(N,{...t,children:o("path",{d:"M15 5L9 12L15 19"})}),pt=t=>o(N,{...t,children:o("path",{d:"M9 5L15 12L9 19"})});var Wn=t=>o(N,{...t,children:o("path",{d:"M21.4 11.1 12.3 20a5.5 5.5 0 0 1-7.8-7.8l9.2-9.1a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.1a1.8 1.8 0 0 1-2.6-2.6l8.5-8.4"})}),Y=t=>o(N,{...t,children:[o("path",{d:"M17.4975 18.4851L20.6281 9.09373C21.8764 5.34874 22.5006 3.47624 21.5122 2.48782C20.5237 1.49939 18.6511 2.12356 14.906 3.37189L5.57477 6.48218C3.49295 7.1761 2.45203 7.52305 2.13608 8.28637C2.06182 8.46577 2.01692 8.65596 2.00311 8.84963C1.94433 9.67365 2.72018 10.4495 4.27188 12.0011L4.55451 12.2837C4.80921 12.5384 4.93655 12.6658 5.03282 12.8075C5.22269 13.0871 5.33046 13.4143 5.34393 13.7519C5.35076 13.9232 5.32403 14.1013 5.27057 14.4574C5.07488 15.7612 4.97703 16.4131 5.0923 16.9147C5.32205 17.9146 6.09599 18.6995 7.09257 18.9433C7.59255 19.0656 8.24576 18.977 9.5522 18.7997L9.62363 18.79C9.99191 18.74 10.1761 18.715 10.3529 18.7257C10.6738 18.745 10.9838 18.8496 11.251 19.0285C11.3981 19.1271 11.5295 19.2585 11.7923 19.5213L12.0436 19.7725C13.5539 21.2828 14.309 22.0379 15.1101 21.9985C15.3309 21.9877 15.5479 21.9365 15.7503 21.8474C16.4844 21.5244 16.8221 20.5113 17.4975 18.4851Z"}),o("path",{d:"M6 18L21 3"})]}),Bn=t=>o(N,{...t,children:[o("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"}),o("path",{d:"M2 13H5.16026C6.06543 13 6.51802 13 6.91584 13.183C7.31367 13.3659 7.60821 13.7096 8.19729 14.3968L8.80271 15.1032C9.39179 15.7904 9.68633 16.1341 10.0842 16.317C10.482 16.5 10.9346 16.5 11.8397 16.5H12.1603C13.0654 16.5 13.518 16.5 13.9158 16.317C14.3137 16.1341 14.6082 15.7904 15.1973 15.1032L15.8027 14.3968C16.3918 13.7096 16.6863 13.3659 17.0842 13.183C17.482 13 17.9346 13 18.8397 13H22"})]}),ds=t=>o(N,{...t,children:[o("circle",{cx:"12",cy:"12",r:"10"}),o("path",{d:"M12 17v-6"}),o("circle",{cx:"12",cy:"8",r:"1",fill:"currentColor",stroke:"none"})]}),Re=({text:t})=>o("div",{class:"welcome",children:[o(ds,{size:16}),o("p",{children:t})]}),zn=t=>o(N,{...t,children:o("path",{d:"M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"})}),dt=t=>o(N,{...t,children:o("path",{d:"M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"})});function re(){return o("span",{class:"spinner",role:"status"})}function Oe({name:t,url:e,size:n=32}){let r={width:`${n}px`,height:`${n}px`,fontSize:`${Math.round(n/2.6)}px`};if(e)return o("img",{class:"avatar",style:r,src:e,alt:"",loading:"lazy"});let s=Ln(t);return o("span",{class:"avatar avatar-fallback",style:r,"data-initials":s,"aria-hidden":"true",children:s})}var se=()=>o("span",{class:"unread-dot"});var us={slate:{light:{page:"#f8fafc",surface:"#ffffff",raised:"#f1f5f9",text:"#0f172a",muted:"#334155",subtle:"#94a3b8",border:"#e2e8f0"},dark:{page:"#020617",surface:"#0f172a",raised:"#1e293b",text:"#ffffff",muted:"#94a3b8",subtle:"#64748b",border:"#334155"}},gray:{light:{page:"#f9fafb",surface:"#ffffff",raised:"#f3f4f6",text:"#111827",muted:"#374151",subtle:"#9ca3af",border:"#e5e7eb"},dark:{page:"#030712",surface:"#111827",raised:"#1f2937",text:"#ffffff",muted:"#9ca3af",subtle:"#6b7280",border:"#374151"}},zinc:{light:{page:"#fafafa",surface:"#ffffff",raised:"#f4f4f5",text:"#18181b",muted:"#3f3f46",subtle:"#a1a1aa",border:"#e4e4e7"},dark:{page:"#09090b",surface:"#18181b",raised:"#27272a",text:"#ffffff",muted:"#a1a1aa",subtle:"#71717a",border:"#3f3f46"}},neutral:{light:{page:"#fafafa",surface:"#ffffff",raised:"#f5f5f5",text:"#171717",muted:"#404040",subtle:"#a3a3a3",border:"#e5e5e5"},dark:{page:"#0a0a0a",surface:"#171717",raised:"#262626",text:"#ffffff",muted:"#a3a3a3",subtle:"#737373",border:"#404040"}},stone:{light:{page:"#fafaf9",surface:"#ffffff",raised:"#f5f5f4",text:"#1c1917",muted:"#44403c",subtle:"#a8a29e",border:"#e7e5e4"},dark:{page:"#0c0a09",surface:"#1c1917",raised:"#292524",text:"#ffffff",muted:"#a8a29e",subtle:"#78716c",border:"#44403c"}}};function jn(t,e){let n=us[t][e];return {"--appwin-page":n.page,"--appwin-surface":n.surface,"--appwin-raised":n.raised,"--appwin-text":n.text,"--appwin-muted":n.muted,"--appwin-subtle":n.subtle,"--appwin-border":n.border}}var Vn={low:"6px",medium:"12px",high:"16px",max:"33px"};function fs(t){return t!=="system"?t:window.matchMedia?.("(prefers-color-scheme: dark)")?.matches?"dark":"light"}function gs(t){return {"--appwin-primary":t.colors.primary,"--appwin-primary-foreground":t.colors.primaryForeground,"--appwin-radius":Vn[t.design.radius]??Vn.medium}}function Gn(t,e){let n=fs(t.design.colorScheme??"light"),r={...gs(t),...jn(t.design.grayWarmth??"slate",n)};for(let[s,i]of Object.entries(r))e.style.setProperty(s,i);e.dataset.appwinScheme=n;}function Ue(t){return t.context.agentName.trim()||t.context.projectName}function De(t){return t.context.agentAvatarUrl??t.context.projectLogoUrl}function Kn(t,e=.22){let n=t.replace("#","").slice(0,6);if(n.length<6)return t;let r=s=>{let i=Number.parseInt(n.slice(s,s+2),16);return Number.isNaN(i)?"00":Math.max(0,Math.min(255,Math.round(i*(1-e)))).toString(16).padStart(2,"0")};return `#${r(0)}${r(2)}${r(4)}`}function hs(t){let e=t.replace("#","").slice(0,6);if(!/^[0-9a-fA-F]{6}$/.test(e))return t;let n=x=>Number.parseInt(e.slice(x,x+2),16)/255,r=n(0),s=n(2),i=n(4),a=Math.max(r,s,i),c=Math.min(r,s,i),d=a-c,p=(a+c)/2,u=0,f=0;d!==0&&(f=d/(1-Math.abs(2*p-1)),a===r?u=(s-i)/d%6:a===s?u=(i-r)/d+2:u=(r-s)/d+4,u=(u*60+360)%360);let l=Math.min(1,f*1.25),g=Math.min(1,p+(1-p)*.55),y=(1-Math.abs(2*g-1))*l,m=y*(1-Math.abs(u/60%2-1)),h=g-y/2,[b,v,E]=u<60?[y,m,0]:u<120?[m,y,0]:u<180?[0,y,m]:u<240?[0,m,y]:u<300?[m,0,y]:[y,0,m],_=x=>Math.round(Math.min(1,Math.max(0,x+h))*255).toString(16).padStart(2,"0");return `#${_(b)}${_(v)}${_(E)}`}function Fe(t){let e=t.colors.primary;return t.design.autoGradient?`linear-gradient(155deg, ${t.design.gradientColor??hs(e)} 0%, ${e} 100%) border-box`:e}function Yn(){let{store:t,strings:e,locale:n}=I(),r=P();if(r.conversations.length===0)return o("div",{class:"screen empty",children:[o(zn,{size:28}),o("p",{class:"empty-title",children:e.noConversation}),o("p",{class:"empty-body",children:e.emptyConversationsHint}),o("button",{type:"button",class:"button",onClick:()=>t.go({name:"new"}),children:e.sendToSupport})]});let s=r.config;return o("div",{class:"screen list",children:[r.conversations.map(i=>o("button",{type:"button",class:"row",onClick:()=>{t.openThread(i.id);},children:[o("div",{class:"row-text",children:[o("span",{class:"row-preview",children:Pe(i,e)}),i.status!=="open"&&o("span",{class:"badge-status",children:i.status==="resolved"?e.statusResolved:e.statusClosed})]}),o("span",{class:"card-meta",children:[$(i)&&o(se,{}),i.lastMessageAt&&Me(i.lastMessageAt,e,n)]})]},i.id)),o("button",{type:"button",class:"card cta",style:s?{background:Fe(s)}:void 0,onClick:()=>t.go({name:"new"}),children:[o(Y,{size:18}),o("span",{children:e.sendToSupport})]})]})}function Xn({faqId:t}){let{strings:e}=I(),r=P().faqs.find(s=>s.id===t);return r?o("article",{class:"screen article",children:[o("div",{class:"article-question",children:r.question}),r.answer.split(/\n{2,}/).map((s,i)=>o("p",{class:"article-body",children:s},i))]}):o("div",{class:"screen empty",children:o("p",{class:"empty-title",children:e.noArticles})})}var Jn="#e2e8f0";function ms(t){let e=n=>`${t}/support/banners/${n}`;return {tileA:e("tile-a.svg"),tileB:e("tile-b.svg"),emojiWave:e("emoji-wave.png"),emojiLaptop:e("emoji-laptop.png"),emojiLifebuoy:e("emoji-lifebuoy.png"),amicale:e("amicale.svg"),discret:e("discret.svg"),photo:e("photo.png"),iconRingOuter:e("icon-ring-outer.svg"),iconRingMid:e("icon-ring-mid.svg"),iconRingInner:e("icon-ring-inner.svg"),iconHeadset:e("icon-headset.svg"),iconMic:e("icon-mic.svg"),serious:e("serious.svg")}}var ys=[{inset:[1.24,88.08,52.42,-3.14],kind:"a"},{inset:[-5.04,73.56,58.7,11.38],kind:"b"},{inset:[-11.32,59.04,64.98,25.91],kind:"a"},{inset:[-17.6,44.51,71.26,40.43],kind:"a"},{inset:[-23.88,29.99,77.55,54.95],kind:"a"},{inset:[-30.16,15.46,83.83,69.48],kind:"b"},{inset:[-36.44,.94,90.11,84],kind:"a"},{inset:[45.93,86.04,7.73,-1.1],kind:"a"},{inset:[39.65,71.52,14.01,13.42],kind:"b"},{inset:[33.37,56.99,20.29,27.95],kind:"wave"},{inset:[27.09,42.47,26.58,42.47],kind:"laptop"},{inset:[20.81,27.95,32.86,56.99],kind:"lifebuoy"},{inset:[14.53,13.42,39.14,71.52],kind:"b"},{inset:[8.25,-1.1,45.42,86.04],kind:"a"},{inset:[90.62,84,-36.96,.94],kind:"a"},{inset:[84.34,69.48,-30.67,15.46],kind:"b"},{inset:[78.06,54.95,-24.39,29.99],kind:"a"},{inset:[71.78,40.43,-18.11,44.51],kind:"a"},{inset:[65.5,25.91,-11.83,59.04],kind:"empty"},{inset:[59.22,11.38,-5.55,73.56],kind:"b"},{inset:[52.94,-3.14,.73,88.08],kind:"a"}];function vs(t,e){switch(t){case "a":return e.tileA;case "b":return e.tileB;case "wave":return e.emojiWave;case "laptop":return e.emojiLaptop;case "lifebuoy":return e.emojiLifebuoy;case "empty":return null}}function L(t,e,n,r){return {top:`${t}%`,right:`${e}%`,bottom:`${n}%`,left:`${r}%`}}function Qn({config:t}){let{design:e}=t;return e.bannerSource==="none"?null:e.bannerSource==="custom"?e.bannerUrl?o("div",{class:"banner",children:o("img",{class:"banner-fill",src:e.bannerUrl,alt:"",style:{objectFit:"cover",objectPosition:`center ${e.bannerFocusY}%`}})}):null:o("div",{class:"banner",children:o(bs,{design:e,brand:t.colors.primary,asset:ms(t.context.assetsBaseUrl)})})}function bs({design:t,brand:e,asset:n}){switch(t.presetBannerId){case "amicale":return o(ws,{brand:e,asset:n});case "discret":return o(xs,{asset:n});case "photo":return o(Ss,{brand:e,asset:n});case "icon":return o(Cs,{brand:e,asset:n});case "serious":return o(As,{asset:n});default:return o(_s,{brand:e,asset:n})}}function _s({brand:t,asset:e}){return o("div",{class:"banner-fill",style:{backgroundColor:t},children:ys.map((n,r)=>{let[s,i,a,c]=n.inset,d=vs(n.kind,e);return o("div",{class:"tile-slot",style:L(s,i,a,c),children:o("div",{class:"tile",children:d?o("img",{class:"banner-fill",src:d,alt:""}):o("div",{class:"tile-empty"})})},r)})})}function ws({brand:t,asset:e}){return o("div",{class:"banner-fill",style:{backgroundImage:`linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2)), linear-gradient(90deg, ${t}, ${t})`},children:o("div",{class:"banner-layer",style:L(-14.87,22.83,-15.38,22.83),children:o("img",{class:"banner-fill",src:e.amicale,alt:""})})})}function xs({asset:t}){return o("div",{class:"banner-fill",style:{backgroundColor:Jn},children:o("div",{class:"banner-layer",style:L(-15.9,16.67,-89.23,16.67),children:o("img",{class:"banner-fill",src:t.discret,alt:""})})})}function Ss({brand:t,asset:e}){return o("div",{class:"banner-fill",style:{backgroundColor:Kn(t,.45)},children:[o("div",{class:"banner-photo",children:o("img",{class:"banner-fill",style:{objectFit:"cover"},src:e.photo,alt:""})}),o("div",{class:"banner-fill",style:{backgroundColor:t,opacity:.8}})]})}function Cs({brand:t,asset:e}){return o("div",{class:"banner-fill",style:{backgroundColor:t},children:[o("div",{class:"banner-layer",style:L(-71.28,10,-74.87,10),children:o("img",{class:"banner-fill",src:e.iconRingOuter,alt:""})}),o("div",{class:"banner-layer",style:L(-40.51,20,-44.1,20),children:o("img",{class:"banner-fill",src:e.iconRingMid,alt:""})}),o("div",{class:"banner-layer",style:L(-9.74,30,-13.33,30),children:o("img",{class:"banner-fill",src:e.iconRingInner,alt:""})}),o("div",{class:"banner-badge",children:[o("div",{class:"banner-layer",style:L(12.5,12.5,12.5,12.5),children:o("img",{class:"banner-fill",src:e.iconHeadset,alt:""})}),o("div",{class:"banner-layer",style:L(64.64,39.64,27.08,39.64),children:o("img",{class:"banner-fill",src:e.iconMic,alt:""})})]})]})}function As({asset:t}){return o("div",{class:"banner-fill",style:{backgroundColor:Jn},children:o("div",{class:"banner-layer",style:L(-21.54,19.67,-65.13,19.67),children:o("img",{class:"banner-fill",src:t.serious,alt:""})})})}function Zn(){let{store:t,strings:e,locale:n}=I(),r=P(),s=r.config;if(!s)return null;let i=Es(r.conversations),a=r.conversations.some($),c=s.messaging.welcomeMessageEnabled?s.messaging.welcomeMessage?.trim()||e.welcomeDefault:"";return o("div",{class:"screen home",children:[o(Qn,{config:s}),o("div",{class:"greeting",children:[o("p",{class:"greeting-line",children:e.greetingNamed.replace("{name}",e.greetingYou)}),o("p",{class:"greeting-line",children:e.greetingSubtitle})]}),c&&o(Re,{text:c}),i&&o("button",{type:"button",class:"card recent",onClick:()=>{t.openThread(i.id);},children:[o("div",{class:"card-text",children:[o("span",{class:"card-label",children:e.recentMessage}),o("span",{class:"card-preview",children:Pe(i,e)})]}),o("span",{class:"card-meta",children:[$(i)&&o(se,{}),i.lastMessageAt&&Me(i.lastMessageAt,e,n)]})]}),o("button",{type:"button",class:"card cta",style:{background:Fe(s)},onClick:()=>t.go({name:"new"}),children:[o(Y,{size:18}),o("span",{children:e.sendToSupport})]}),r.conversations.length>0&&o("button",{type:"button",class:"card",onClick:()=>t.go({name:"conversations"}),children:[o(Bn,{size:18}),o("span",{class:"card-title",children:e.conversations}),o("span",{class:"card-meta",children:[a&&o(se,{}),o(pt,{size:16})]})]}),s.modules.faqEnabled&&o(ks,{})]})}function ks(){let{store:t,strings:e}=I(),n=P();if(n.faqs.length===0)return null;let r=n.faqCategories.map(s=>({category:s,faqs:n.faqs.filter(i=>i.categoryId===s.id)})).filter(s=>s.faqs.length>0);return o("section",{class:"faq-section",children:[o("h2",{class:"section-title",children:e.faq}),r.map(({category:s,faqs:i})=>o("div",{class:"faq-group",children:[o("p",{class:"faq-category",children:s.name}),i.map(a=>o("button",{type:"button",class:"faq-row",onClick:()=>t.go({name:"faq",faqId:a.id}),children:[o("span",{class:"faq-question",children:a.question}),o("span",{class:"card-meta",children:o(pt,{size:16})})]},a.id))]},s.id))]})}function Es(t){let e=null;for(let n of t){if(n.status!=="open")continue;let r=n.lastMessageAt??n.createdAt,s=e?e.lastMessageAt??e.createdAt:"";(!e||r>s)&&(e=n);}return e}var Ts=80,Is=["\u{1F44D}","\u{1F525}","\u2764\uFE0F","\u{1F602}","\u{1F62E}","\u{1F389}"];function er(){let{store:t,strings:e,locale:n}=I(),r=P(),s=ct(null),i=r.thread,a=r.config,c=i?.messages[0]?.id??null;if(ne(()=>{let f=s.current;f&&(f.scrollTop=f.scrollHeight);},[c,i?.agentTyping]),!a)return null;let d=i?Nn(i.messages,e,n):[],p=a.messaging.welcomeMessageEnabled?a.messaging.welcomeMessage?.trim()||e.welcomeDefault:"";return o("div",{class:"thread",children:[o("div",{class:"thread-scroll",ref:s,onScroll:()=>{let f=s.current;!f||f.scrollTop>Ts||t.loadOlder();},children:[i?.loadingOlder&&o("div",{class:"centered thin",children:o(re,{})}),!i&&p&&o(Re,{text:p}),d.map(f=>o("div",{class:"day",children:[o("p",{class:"day-label",children:f.day}),f.messages.map(l=>o(Ms,{message:l},l.id))]},f.day)),i?.agentTyping&&o("div",{class:"typing","aria-label":e.typing,children:[o("span",{}),o("span",{}),o("span",{})]})]}),o(Rs,{})]})}function Ms({message:t}){let{store:e,locale:n,strings:r}=I(),s=P(),[i,a]=F(false),[c,d]=F(false),p=t.authorType==="customer",u=s.config,f=t.translatedBody?.trim(),l=!p&&!!f&&f!==t.body,g=l&&!c?f:t.body,y=p&&!!t.body;return o("div",{class:`bubble-row ${p?"mine":"theirs"}`,children:[!p&&u&&o(Oe,{name:t.authorNameSnapshot??Ue(u),url:De(u),size:24}),o("div",{class:"bubble-column",children:[i&&o("div",{class:"actions",children:[o("div",{class:"pill",children:Is.map(m=>{let h=t.reactions.some(b=>b.emoji===m&&b.reactedByMe);return o("button",{type:"button",class:`pill-emoji ${h?"on":""}`,onClick:()=>{a(false),e.toggleReaction(t.id,m);},children:m},m)})}),y&&o("div",{class:"pill",children:[o("button",{type:"button",class:"pill-action",onClick:()=>{a(false),e.startEditing(t);},children:r.editMessage}),o("button",{type:"button",class:"pill-action danger",onClick:()=>{a(false),e.deleteMessage(t.id);},children:r.deleteMessage})]})]}),o("button",{type:"button",class:"bubble","aria-label":r.react,onClick:()=>a(m=>!m),children:[g&&o("p",{class:"bubble-body",children:g}),t.attachments.map(m=>o(Ps,{attachment:m},m.id)),o("span",{class:"bubble-time",children:[Fn(t.createdAt,n),p&&t.readAt&&` \xB7 ${r.seen}`]})]}),o("div",{class:"bubble-footer",children:[t.reactions.length>0&&o("span",{class:"reactions",children:t.reactions.map(m=>o("button",{type:"button",class:`reaction ${m.reactedByMe?"on":""}`,onClick:()=>{e.toggleReaction(t.id,m.emoji);},children:[m.emoji,m.count>1&&o("span",{class:"reaction-count",children:m.count})]},m.emoji))}),l&&o("button",{type:"button",class:"link",onClick:()=>d(m=>!m),children:c?r.seeTranslation:r.showOriginal})]})]})]})}function Ps({attachment:t}){let{locale:e}=I();return t.mimeType.startsWith("image/")?o("a",{class:"attachment-image",href:t.url,target:"_blank",rel:"noreferrer noopener",children:o("img",{src:t.url,alt:t.filename,loading:"lazy"})}):o("a",{class:"attachment-file",href:t.url,target:"_blank",rel:"noreferrer noopener",children:[o(dt,{size:18}),o("span",{class:"attachment-name",children:t.filename}),o("span",{class:"attachment-size",children:qn(t.sizeBytes,e)})]})}function Rs(){let{store:t,strings:e}=I(),n=P(),[r,s]=F(""),[i,a]=F([]),[c,d]=F(false),p=ct(null),u=()=>{let h=p.current;h&&(h.style.height="auto",h.style.height=`${Math.min(h.scrollHeight,120)}px`);},f=n.editing,[l,g]=F(null);ne(()=>{f?(l===null&&g(r),s(f.original),p.current?.focus()):l!==null&&(s(l),g(null));},[f?.messageId]);let y=async()=>{if(f){await t.saveEdit(r);return}let h=i.map(b=>b.attachment).filter(b=>!!b);!r.trim()&&h.length===0||(s(""),a([]),p.current&&(p.current.style.height="auto"),await t.send(r,h));},m=async h=>{if(!(!h||h.length===0)){d(true);for(let b of Array.from(h))try{let v=await t.upload(b);a(E=>[...E,{file:b,attachment:v}]);}catch{}d(false);}};return o("div",{class:"composer",children:[f&&o("div",{class:"composer-editing",children:[o("span",{children:e.editingBanner}),o("button",{type:"button",class:"link",onClick:()=>t.cancelEditing(),children:e.cancel})]}),i.length>0&&o("div",{class:"composer-files",children:i.map((h,b)=>o("span",{class:"composer-file",children:[o(dt,{size:14}),h.file.name,o("button",{type:"button",class:"composer-file-remove","aria-label":e.close,onClick:()=>a(v=>v.filter((E,_)=>_!==b)),children:"\xD7"})]},`${h.file.name}-${b}`))}),n.sendError&&o("p",{class:"composer-error",children:e.loadErrorMessage}),o("div",{class:"composer-row",children:[!f&&o("label",{class:"icon-button","aria-label":e.attachFile,children:[o(Wn,{}),o("input",{type:"file",multiple:true,hidden:true,onChange:h=>{m(h.target.files);}})]}),o("textarea",{ref:p,class:"composer-input",rows:1,placeholder:e.messagePlaceholder,value:r,onInput:h=>{s(h.target.value),u(),t.notifyTyping();},onKeyDown:h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),y());}}),o("button",{type:"button",class:"send",disabled:n.sending||c||!r.trim()&&(f!==null||i.length===0),onClick:()=>{y();},children:[o("span",{children:f?e.save:e.send}),n.sending||c?o(re,{}):o(Y,{size:14})]})]})]})}var tr=Tt(null);function I(){let t=On(tr);if(!t)throw new Error("[appwin] UI context is missing");return t}function P(){let{store:t}=I(),[e,n]=F(t.getState());return ne(()=>t.subscribe(()=>n(t.getState())),[t]),e}function nr(t){return o(tr.Provider,{value:t,children:o(Os,{})})}function Os(){let{store:t,strings:e}=I(),n=P();return n.status==="loading"?o("div",{class:"centered",children:o(re,{})}):n.status==="unavailable"?o("div",{class:"centered failure",children:o("p",{class:"failure-body",children:e.planUnavailable})}):n.status==="error"||!n.config?o("div",{class:"centered failure",children:[o("p",{class:"failure-title",children:e.loadErrorTitle}),o("p",{class:"failure-body",children:e.loadErrorMessage}),o("button",{type:"button",class:"button",onClick:()=>{t.boot();},children:e.retry})]}):o(D,{children:[n.route.name==="home"&&o(D,{children:[o("div",{class:"home-glow top","aria-hidden":"true"}),o("div",{class:"home-glow bottom","aria-hidden":"true"})]}),o(Us,{config:n.config}),o("main",{class:"body",children:o("div",{class:"screen-swap",children:[n.route.name==="home"&&o(Zn,{}),n.route.name==="conversations"&&o(Yn,{}),n.route.name==="faq"&&o(Xn,{faqId:n.route.faqId}),(n.route.name==="thread"||n.route.name==="new")&&o(er,{})]},n.route.name==="new"?"thread":n.route.name)})]})}function Us({config:t}){let{store:e,strings:n,onClose:r}=I(),s=P(),i=s.route.name==="home",a=Ue(t);return o("header",{class:"appbar",children:[i?o(Oe,{name:a,url:De(t),size:28}):o("button",{type:"button",class:"icon-button","aria-label":n.back,onClick:()=>e.go({name:"home"}),children:o($n,{})}),o("h1",{class:"appbar-title",children:i?n.helpCenter:Ds(s.route.name,n,a)}),o("button",{type:"button",class:"icon-button","aria-label":n.close,onClick:r,children:o(Hn,{})})]})}function Ds(t,e,n){return t==="conversations"?e.conversationsTitle:t==="faq"?e.faq:t==="new"?e.writeMessage:n}var Fs=6e3,Ns=2e3,Ls={status:"loading",config:null,route:{name:"home"},conversations:[],faqs:[],faqCategories:[],thread:null,sending:false,sendError:false,editing:null},Ne=class{constructor(e){this.state=Ls;this.listeners=new Set;this.typingTimer=null;this.lastTypingSentAt=Number.NEGATIVE_INFINITY;this.client=e.client,this.now=e.now??(()=>Date.now());}getState(){return this.state}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}get unread(){return this.state.conversations.filter($).length}set(e){this.state={...this.state,...e};for(let n of this.listeners)n();}async boot(){try{let e=await this.client.config();this.set({config:e,status:"ready"});}catch(e){let n=e instanceof A&&e.code==="plan_upgrade_required";this.set({status:n?"unavailable":"error"});return}await Promise.all([this.refreshConversations(),this.loadFaqs()]);}async refreshConversations(){try{let e=await this.client.conversations();this.set({conversations:e.data});}catch{}}async visitorChanged(){this.clearTypingTimer(),this.set({route:{name:"home"},conversations:[],thread:null,sending:false,sendError:false,editing:null}),await this.refreshConversations();}async loadFaqs(){if(this.state.config?.modules.faqEnabled)try{let[e,n]=await Promise.all([this.client.faqs(),this.client.faqCategories()]);this.set({faqs:e,faqCategories:n});}catch{}}go(e){if(e.name!=="thread"&&this.state.thread){this.clearTypingTimer(),this.set({route:e,thread:null,sendError:false,editing:null});return}this.set({route:e,sendError:false,editing:null});}async openThread(e){this.set({route:{name:"thread",conversationId:e},thread:{conversationId:e,messages:[],cursor:null,loadingOlder:false,agentTyping:false},sendError:false,editing:null});try{let n=await this.client.messages(e);this.patchThread(e,{messages:n.data,cursor:n.nextCursor});}catch{this.patchThread(e,{messages:[]});}await this.markRead(e);}async loadOlder(){let e=this.state.thread;if(!(!e||!e.cursor||e.loadingOlder)){this.patchThread(e.conversationId,{loadingOlder:true});try{let n=await this.client.messages(e.conversationId,e.cursor),r=this.state.thread;if(!r||r.conversationId!==e.conversationId)return;this.patchThread(e.conversationId,{messages:[...r.messages,...n.data],cursor:n.nextCursor,loadingOlder:!1});}catch{this.patchThread(e.conversationId,{loadingOlder:false});}}}async send(e,n=[]){let r=e.trim();if(!r&&n.length===0||this.state.sending)return;this.set({sending:true,sendError:false});let s=this.state.thread;try{if(!s){let c=await this.client.createConversation({body:r,attachments:n});this.set({sending:!1}),await this.openThread(c.id),this.refreshConversations();return}let i=await this.client.sendMessage(s.conversationId,{body:r,attachments:n});this.client.setTyping(s.conversationId,!1);let a=this.state.thread;a?.conversationId===s.conversationId&&this.patchThread(s.conversationId,{messages:[i,...a.messages]}),this.set({sending:!1}),this.refreshConversations();}catch{this.set({sending:false,sendError:true});}}upload(e){return this.client.upload(e)}startEditing(e){e.authorType!=="customer"||!e.body||this.set({editing:{messageId:e.id,original:e.body},sendError:false});}cancelEditing(){this.set({editing:null});}async saveEdit(e){let n=this.state.editing,r=this.state.thread,s=e.trim();if(!(!n||!r||!s)&&!this.state.sending){this.set({sending:true,sendError:false});try{let i=await this.client.updateMessage(r.conversationId,n.messageId,s);this.replaceMessage(r.conversationId,i),this.set({sending:!1,editing:null}),this.refreshConversations();}catch{this.set({sending:false,sendError:true});}}}async deleteMessage(e){let n=this.state.thread;if(!n)return;try{await this.client.deleteMessage(n.conversationId,e);}catch{this.set({sendError:true});return}let r=this.state.thread;r?.conversationId===n.conversationId&&this.patchThread(n.conversationId,{messages:r.messages.filter(s=>s.id!==e)}),this.refreshConversations(),this.state.editing?.messageId===e&&this.set({editing:null});}async toggleReaction(e,n){let r=this.state.thread;if(r)try{let s=await this.client.toggleReaction(r.conversationId,e,n);this.replaceMessage(r.conversationId,s);}catch{}}replaceMessage(e,n){let r=this.state.thread;!r||r.conversationId!==e||this.patchThread(e,{messages:r.messages.map(s=>s.id===n.id?n:s)});}notifyTyping(){let e=this.state.thread;if(!e)return;let n=this.now();n-this.lastTypingSentAt<Ns||(this.lastTypingSentAt=n,this.client.setTyping(e.conversationId,true));}onRealtime(e){if(e.type==="typing"){let r=this.state.thread;if(!r||r.conversationId!==e.conversationId)return;this.patchThread(r.conversationId,{agentTyping:e.isTyping}),this.clearTypingTimer(),e.isTyping&&(this.typingTimer=setTimeout(()=>{this.patchThread(e.conversationId,{agentTyping:false});},Fs));return}this.refreshConversations();let n=this.state.thread;n&&(e.type==="conversation"&&e.conversationId!==n.conversationId||this.refreshOpenThread());}async refreshOpenThread(){let e=this.state.thread;if(e){try{let n=await this.client.messages(e.conversationId),r=this.state.thread;if(!r||r.conversationId!==e.conversationId)return;let s=r.messages.filter(a=>!n.data.some(c=>c.id===a.id)),i=new Set(n.data.map(a=>a.id));this.patchThread(e.conversationId,{messages:[...n.data,...s.filter(a=>!i.has(a.id))]});}catch{return}await this.markRead(e.conversationId);}}async markRead(e){try{await this.client.markRead(e);}catch{return}await this.refreshConversations();}patchThread(e,n){let r=this.state.thread;!r||r.conversationId!==e||this.set({thread:{...r,...n}});}clearTypingTimer(){this.typingTimer&&clearTimeout(this.typingTimer),this.typingTimer=null;}dispose(){this.clearTypingTimer(),this.listeners.clear();}};var qs=2e3,Hs=6e4;function $s(){let t=document.currentScript;if(!t)return null;let e=t.getAttribute("data-app-id"),n=t.getAttribute("data-host-origin");if(!e||!n)return null;let r;try{r=new URL(n).origin;}catch{return null}return r==="null"?null:{appId:e,hostOrigin:r,apiUrl:t.getAttribute("data-api-url"),gatewayUrl:t.getAttribute("data-gateway-url"),externalId:t.getAttribute("data-external-id")??t.getAttribute("data-user-id")}}function Ws(){let t=document.createElement("style");t.textContent=hn,document.head.appendChild(t);}function Bs(t){let e=navigator.language||"en",n=Sn(e),r=u=>{parent.postMessage(u,t.hostOrigin);},s=gn({appId:t.appId,...t.externalId?{externalId:t.externalId}:{},...t.apiUrl?{apiUrl:t.apiUrl}:{},...t.gatewayUrl?{gatewayUrl:t.gatewayUrl}:{}}),i=new Ne({client:s.support});s.support.onVisitorChange(()=>{i.visitorChanged();});let a=document.getElementById("root");if(!a)return;Et(ze(nr,{store:i,strings:n,locale:e,onClose:()=>r(te({type:"close"}))}),a),document.addEventListener("keydown",u=>{u.key==="Escape"&&r(te({type:"close"}));}),window.addEventListener("message",u=>{if(u.origin!==t.hostOrigin)return;let f=bn(u.data);if(f)switch(f.type){case "open":i.refreshConversations();break;case "close":break;case "identify":s.identify(f.externalId,f.attributes).catch(()=>{});break;case "updateUser":s.updateUser(f.attributes).catch(()=>{});break;case "logout":s.logout();break}});let c=-1;i.subscribe(()=>{i.unread!==c&&(c=i.unread,r(te({type:"unread",count:c})));});let d=0,p=async()=>{await i.boot();let u=i.getState().config;if(!u){let f=Math.min(qs*2**d,Hs);d+=1,setTimeout(()=>{p();},f);return}d=0,Gn(u,document.documentElement),document.body.dataset.state="ready",r(te({type:"ready",primary:u.colors.primary,primaryForeground:u.colors.primaryForeground})),s.connect(f=>i.onRealtime(f),f=>{f&&i.refreshConversations();});};p();}var rr=$s();rr&&(Ws(),Bs(rr));})();