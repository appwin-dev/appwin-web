(function(){'use strict';var oe,y,je,R,$e,ze,Be,ye,ee,j,Ve,Se,be,we,Ge,re={},ie=[],Zt=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,ae=Array.isArray;function M(t,e){for(var n in e)t[n]=e[n];return t}function ke(t){t&&t.parentNode&&t.parentNode.removeChild(t);}function Te(t,e,n){var r,i,o,a={};for(o in e)o=="key"?r=e[o]:o=="ref"?i=e[o]:a[o]=e[o];if(arguments.length>2&&(a.children=arguments.length>3?oe.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(o in t.defaultProps)a[o]===void 0&&(a[o]=t.defaultProps[o]);return te(t,a,r,i,null)}function te(t,e,n,r,i){var o={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i??++je,__i:-1,__u:0};return i==null&&y.vnode!=null&&y.vnode(o),o}function O(t){return t.children}function ne(t,e){this.props=t,this.context=e;}function N(t,e){if(e==null)return t.__?N(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?N(t):null}function Qt(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,r=[],i=[],o=M({},e);o.__v=e.__v+1,y.vnode&&y.vnode(o),Ce(t.__P,o,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,r,n??N(e),!!(32&e.__u),i),o.__v=e.__v,o.__.__k[o.__i]=o,Ze(r,o,i),e.__e=e.__=null,o.__e!=n&&Ye(o);}}function Ye(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),Ye(t)}function xe(t){(!t.__d&&(t.__d=true)&&R.push(t)&&!se.__r++||$e!=y.debounceRendering)&&(($e=y.debounceRendering)||ze)(se);}function se(){try{for(var t,e=1;R.length;)R.length>e&&R.sort(Be),t=R.shift(),e=R.length,Qt(t);}finally{R.length=se.__r=0;}}function Ke(t,e,n,r,i,o,a,c,d,p,u){var g,l,f,b,m,h,v=r&&r.__k||ie,_=e.length;for(d=en(n,e,v,d,_),g=0;g<_;g++)(f=n.__k[g])!=null&&(l=f.__i!=-1&&v[f.__i]||re,f.__i=g,h=Ce(t,f,l,i,o,a,c,d,p,u),b=f.__e,f.ref&&l.ref!=f.ref&&(l.ref&&Ie(l.ref,null,f),u.push(f.ref,f.__c||b,f)),m==null&&b!=null&&(m=b),4&f.__u?(d=Xe(f,d,t),l.__e&&(l.__e=null)):typeof f.type=="function"&&h!==void 0?d=h:b&&(d=b.nextSibling),f.__u&=-7);return n.__e=m,d}function en(t,e,n,r,i){var o,a,c,d,p,u=n.length,g=u,l=0;for(t.__k=new Array(i),o=0;o<i;o++)(a=e[o])!=null&&typeof a!="boolean"&&typeof a!="function"?(typeof a=="string"||typeof a=="number"||typeof a=="bigint"||a.constructor==String?a=t.__k[o]=te(null,a,null,null,null):ae(a)?a=t.__k[o]=te(O,{children:a},null,null,null):a.constructor===void 0&&a.__b>0?a=t.__k[o]=te(a.type,a.props,a.key,a.ref?a.ref:null,a.__v):t.__k[o]=a,d=o+l,a.__=t,a.__b=t.__b+1,c=null,(p=a.__i=tn(a,n,d,g))!=-1&&(g--,(c=n[p])&&(c.__u|=2)),c==null||c.__v==null?(p==-1&&(i>u?l--:i<u&&l++),typeof a.type!="function"&&(a.__u|=4)):p!=d&&(p==d-1?l--:p==d+1?l++:(p>d?l--:l++,a.__u|=4))):t.__k[o]=null;if(g)for(o=0;o<u;o++)(c=n[o])!=null&&(2&c.__u)==0&&(c.__e==r&&(r=N(c)),et(c,c));return r}function Xe(t,e,n){var r,i;if(typeof t.type=="function"){for(r=t.__k,i=0;r&&i<r.length;i++)r[i]&&(r[i].__=t,e=Xe(r[i],e,n));return e}t.__e!=e&&(e&&t.type&&!e.parentNode&&(e=N(t)),e=n.insertBefore(t.__e,e||null));do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function tn(t,e,n,r){var i,o,a,c=t.key,d=t.type,p=e[n],u=p!=null&&(2&p.__u)==0;if(p===null&&c==null||u&&c==p.key&&d==p.type)return n;if(r>(u?1:0)){for(i=n-1,o=n+1;i>=0||o<e.length;)if((p=e[a=i>=0?i--:o++])!=null&&(2&p.__u)==0&&c==p.key&&d==p.type)return a}return  -1}function qe(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Zt.test(e)?n:n+"px";}function Q(t,e,n,r,i){var o,a;e:if(e=="style")if(typeof n=="string")t.style.cssText=n;else {if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||qe(t.style,e,"");if(n)for(e in n)r&&n[e]==r[e]||qe(t.style,e,n[e]);}else if(e[0]=="o"&&e[1]=="n")o=e!=(e=e.replace(Ve,"$1")),a=e.toLowerCase(),e=a in t||e=="onFocusOut"||e=="onFocusIn"?a.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+o]=n,n?r?n[j]=r[j]:(n[j]=Se,t.addEventListener(e,o?we:be,o)):t.removeEventListener(e,o?we:be,o);else {if(i=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===false&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n));}}function We(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[ee]==null)e[ee]=Se++;else if(e[ee]<n[j])return;return n(y.event?y.event(e):e)}}}function Ce(t,e,n,r,i,o,a,c,d,p){var u,g,l,f,b,m,h,v,_,T,F,D,W,He,Z,ve,A=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),o=[c=e.__e=n.__e]),(u=y.__b)&&u(e);e:if(typeof A=="function"){g=a.length;try{if(_=e.props,T=A.prototype&&A.prototype.render,F=(u=A.contextType)&&r[u.__c],D=u?F?F.props.value:u.__:r,n.__c?v=(l=e.__c=n.__c).__=l.__E:(T?e.__c=l=new A(_,D):(e.__c=l=new ne(_,D),l.constructor=A,l.render=rn),F&&F.sub(l),l.state||(l.state={}),l.__n=r,f=l.__d=!0,l.__h=[],l._sb=[]),T&&l.__s==null&&(l.__s=l.state),T&&A.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=M({},l.__s)),M(l.__s,A.getDerivedStateFromProps(_,l.__s))),b=l.props,m=l.state,l.__v=e,f)T&&A.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),T&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else {if(T&&A.getDerivedStateFromProps==null&&_!==b&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(_,D),e.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(_,l.__s,D)===!1){e.__v!=n.__v&&(l.props=_,l.state=l.__s,l.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function($){$&&($.__=e);}),ie.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&a.push(l),c=N(n);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(_,l.__s,D),T&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(b,m,h);});}if(l.context=D,l.props=_,l.__P=t,l.__e=!1,W=y.__r,He=0,T)l.state=l.__s,l.__d=!1,W&&W(e),u=l.render(l.props,l.state,l.context),ie.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,W&&W(e),u=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++He<25);l.state=l.__s,l.getChildContext!=null&&(r=M(M({},r),l.getChildContext())),T&&!f&&l.getSnapshotBeforeUpdate!=null&&(h=l.getSnapshotBeforeUpdate(b,m)),Z=u!=null&&u.type===O&&u.key==null?Qe(u.props.children):u,c=Ke(t,ae(Z)?Z:[Z],e,n,r,i,o,a,c,d,p),l.base=e.__e,e.__u&=-161,l.__h.length&&a.push(l),v&&(l.__E=l.__=null);}catch($){if(a.length=g,e.__v=null,d||o!=null){if($.then){for(e.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;o!=null&&(o[o.indexOf(c)]=null),e.__e=c;}else if(o!=null)for(ve=o.length;ve--;)ke(o[ve]);}else e.__e=n.__e;e.__k==null&&(e.__k=n.__k||[]),$.then||Je(e),y.__e($,e,n);}}else o==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):c=e.__e=nn(n.__e,e,n,r,i,o,a,d,p);return (u=y.diffed)&&u(e),128&e.__u?void 0:c}function Je(t){t&&(t.__c&&(t.__c.__e=true),t.__k&&t.__k.some(Je));}function Ze(t,e,n){for(var r=0;r<n.length;r++)Ie(n[r],n[++r],n[++r]);y.__c&&y.__c(e,t),t.some(function(i){try{t=i.__h,i.__h=[],t.some(function(o){o.call(i);});}catch(o){y.__e(o,i.__v);}});}function Qe(t){return typeof t!="object"||t==null||t.__b>0?t:ae(t)?t.map(Qe):t.constructor!==void 0?null:M({},t)}function nn(t,e,n,r,i,o,a,c,d){var p,u,g,l,f,b,m,h=n.props||re,v=e.props,_=e.type;if(_=="svg"?i="http://www.w3.org/2000/svg":_=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),o!=null){for(p=0;p<o.length;p++)if((f=o[p])&&"setAttribute"in f==!!_&&(_?f.localName==_:f.nodeType==3)){t=f,o[p]=null;break}}if(t==null){if(_==null)return document.createTextNode(v);t=document.createElementNS(i,_,v.is&&v),c&&(y.__m&&y.__m(e,o),c=false),o=null;}if(_==null)h===v||c&&t.data==v||(t.data=v);else {if(o=_=="textarea"&&v.defaultValue!=null?null:o&&oe.call(t.childNodes),!c&&o!=null)for(h={},p=0;p<t.attributes.length;p++)h[(f=t.attributes[p]).name]=f.value;for(p in h)f=h[p],p=="dangerouslySetInnerHTML"?g=f:p=="children"||p in v||p=="value"&&"defaultValue"in v||p=="checked"&&"defaultChecked"in v||Q(t,p,null,f,i);for(p in v)f=v[p],p=="children"?l=f:p=="dangerouslySetInnerHTML"?u=f:p=="value"?b=f:p=="checked"?m=f:c&&typeof f!="function"||h[p]===f||Q(t,p,f,h[p],i);if(u)c||g&&(u.__html==g.__html||u.__html==t.innerHTML)||(t.innerHTML=u.__html),e.__k=[];else if(g&&(t.innerHTML=""),Ke(e.type=="template"?t.content:t,ae(l)?l:[l],e,n,r,_=="foreignObject"?"http://www.w3.org/1999/xhtml":i,o,a,o?o[0]:n.__k&&N(n,0),c,d),o!=null)for(p=o.length;p--;)ke(o[p]);c&&_!="textarea"||(p="value",_=="progress"&&b==null?t.removeAttribute("value"):b!=null&&(b!==t[p]||_=="progress"&&!b||_=="option"&&b!=h[p])&&Q(t,p,b,h[p],i),p="checked",m!=null&&m!=t[p]&&Q(t,p,m,h[p],i));}return t}function Ie(t,e,n){try{if(typeof t=="function"){var r=typeof t.__u=="function";r&&t.__u(),r&&e==null||(t.__u=t(e));}else t.current=e;}catch(i){y.__e(i,n);}}function et(t,e,n){var r,i;if(y.unmount&&y.unmount(t),(r=t.ref)&&(r.current&&r.current!=t.__e||Ie(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount();}catch(o){y.__e(o,e);}r.base=r.__P=r.__n=null;}if(r=t.__k)for(i=0;i<r.length;i++)r[i]&&et(r[i],e,n||typeof t.type!="function");n||ke(t.__e),t.__c=t.__=t.__e=void 0;}function rn(t,e,n){return this.constructor(t,n)}function tt(t,e,n){var r,i,o,a;e==document&&(e=document.documentElement),y.__&&y.__(t,e),i=(r="undefined"=="function")?null:e.__k,o=[],a=[],Ce(e,t=(e).__k=Te(O,null,[t]),i||re,re,e.namespaceURI,i?null:e.firstChild?oe.call(e.childNodes):null,o,i?i.__e:e.firstChild,r,a),Ze(o,t,a),t.props.children=null;}function nt(t){function e(n){var r,i;return this.getChildContext||(r=new Set,(i={})[e.__c]=this,this.getChildContext=function(){return i},this.componentWillUnmount=function(){r=null;},this.shouldComponentUpdate=function(o){this.props.value!=o.value&&r.forEach(function(a){a.__e=true,xe(a);});},this.sub=function(o){r.add(o);var a=o.componentWillUnmount;o.componentWillUnmount=function(){r&&r.delete(o),a&&a.call(o);};}),n.children}return e.__c="__cC"+Ge++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,r){return n.children(r)}).contextType=e,e}oe=ie.slice,y={__e:function(t,e,n,r){for(var i,o,a;e=e.__;)if((i=e.__c)&&!i.__)try{if((o=i.constructor)&&o.getDerivedStateFromError!=null&&(i.setState(o.getDerivedStateFromError(t)),a=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(t,r||{}),a=i.__d),a)return i.__E=i}catch(c){t=c;}throw t}},je=0,ne.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=M({},this.state),typeof t=="function"&&(t=t(M({},n),this.props)),t&&M(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),xe(this));},ne.prototype.forceUpdate=function(t){this.__v&&(this.__e=true,t&&this.__h.push(t),xe(this));},ne.prototype.render=O,R=[],ze=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Be=function(t,e){return t.__v.__b-e.__v.__b},se.__r=0,ye=Math.random().toString(8),ee="__d"+ye,j="__a"+ye,Ve=/(PointerCapture)$|Capture$/i,Se=0,be=We(false),we=We(true),Ge=0;var rt="device-id";function sn(){try{return globalThis.crypto.randomUUID()}catch{let t=()=>Math.floor(Math.random()*65536).toString(16).padStart(4,"0");return `${t()}${t()}-${t()}-4${t().slice(1)}-a${t().slice(1)}-${t()}${t()}${t()}`}}function on(t){let e=t.get(rt);if(e)return e;let n=sn();return t.set(rt,n),n}function Ae(t){let e=globalThis.navigator??{},n={deviceId:on(t),platform:"web"},r=an(e.userAgent);r&&(n.model=r);let i=ln(e.userAgent);return i&&(n.os=i),e.language&&(n.language=e.language),n}function an(t){if(!t)return;let e=[["Edge",/Edg\/(\d+)/],["Opera",/OPR\/(\d+)/],["Chrome",/Chrome\/(\d+)/],["Firefox",/Firefox\/(\d+)/],["Safari",/Version\/(\d+).*Safari/]];for(let[n,r]of e){let i=r.exec(t);if(i)return `${n} ${i[1]}`}}function ln(t){if(t){if(/Windows NT 10/.test(t))return "Windows 10+";if(/Windows/.test(t))return "Windows";if(/Android/.test(t))return "Android";if(/iPhone|iPad|iPod/.test(t))return "iOS";if(/Mac OS X/.test(t))return "macOS";if(/Linux/.test(t))return "Linux"}}var I=class extends Error{constructor(e,n,r=null){super(n),this.name="AppwinError",this.code=e,this.status=r;}get retryable(){return this.code==="network"||this.code==="server_error"||this.code==="rate_limited"}};function it(t){return t===403?"origin_not_allowed":t===401?"unauthorized":t===404?"not_found":t===429?"rate_limited":t>=500?"server_error":"bad_request"}async function z(t,e){let n=new URL(`${t}${e.path}`);for(let[o,a]of Object.entries(e.query??{}))a!==void 0&&n.searchParams.set(o,String(a));let r={Accept:"application/json",...e.headers};e.body!==void 0&&(r["Content-Type"]="application/json"),e.token&&(r.Authorization=`Bearer ${e.token}`);let i;try{i=await fetch(n.toString(),{method:e.method,headers:r,body:e.body===void 0?void 0:JSON.stringify(e.body),credentials:"omit",...e.signal?{signal:e.signal}:{}});}catch(o){throw cn(o)?new I("aborted","Request aborted"):new I("network","Could not reach the Appwin API")}if(!i.ok)throw new I(it(i.status),await pn(i),i.status);if(i.status!==204)return await i.json()}function cn(t){return t instanceof Error&&t.name==="AbortError"}async function pn(t){try{let e=await t.json();if(e&&typeof e=="object"&&"message"in e){let{message:n}=e;if(typeof n=="string"&&n)return n}}catch{}return `HTTP ${t.status}`}var Me="session-token",Ee="external-id",dn=["email","name","avatarUrl","language","timezone","location","plan"],le=class{constructor(e){this.pending=null;this.pendingFor=null;this.identityListeners=new Set;this.options=e,this.token=e.storage.get(Me),this.externalId=e.storage.get(Ee),this.device=Ae(e.storage);}get deviceId(){return this.device.deviceId}async authenticate(){return this.token?this.token:this.open()}onIdentityChange(e){return this.identityListeners.add(e),()=>this.identityListeners.delete(e)}async identify(e,n){if(!e)throw new I("bad_request","`externalId` must not be empty");e===this.externalId?await this.authenticate():(this.externalId=e,this.options.storage.set(Ee,e),await this.open(),this.notifyIdentityChange()),n&&await this.updateUser(n);}async updateUser(e){await this.fetch({method:"PATCH",path:"/api/sdk/v1/me",body:un(e)});}async logout(){let e=this.token;if(e)try{await z(this.options.baseUrl,{method:"POST",path:"/api/sdk/v1/auth/revoke",token:e});}catch{}this.token=null,this.externalId=null,this.options.storage.remove(Me),this.options.storage.remove(Ee),this.options.storage.remove("device-id"),this.device=Ae(this.options.storage);try{await this.open();}catch{}this.notifyIdentityChange();}async fetch(e){let n=await this.authenticate();try{return await z(this.options.baseUrl,{...e,token:n})}catch(r){if(!(r instanceof I)||r.code!=="unauthorized")throw r;let i=await this.open();return z(this.options.baseUrl,{...e,token:i})}}open(){let e=this.externalId;if(this.pending&&this.pendingFor===e)return this.pending;let r=(this.pending?.catch(()=>{})??Promise.resolve()).then(()=>this.requestToken(e)).then(i=>(this.token=i,this.options.storage.set(Me,i),i)).finally(()=>{this.pending===r&&(this.pending=null,this.pendingFor=null);});return this.pending=r,this.pendingFor=e,r}notifyIdentityChange(){for(let e of this.identityListeners)e();}async requestToken(e){return (await z(this.options.baseUrl,{method:"POST",path:"/api/sdk/v1/auth/init",headers:{"X-Appwin-App-Id":this.options.appId},body:{deviceId:this.device.deviceId,platform:this.device.platform,sdkVersion:this.options.sdkVersion,...this.device.model?{model:this.device.model}:{},...this.device.os?{os:this.device.os}:{},...this.device.language?{language:this.device.language}:{},...e?{externalId:e}:{}}})).token}};function un(t){let e={};for(let n of dn){let r=t[n];typeof r=="string"&&(e[n]=r);}return e}function Pe(t,e){return `appwin:${t}:${e}`}function st(){let t=new Map;return {get:e=>t.get(e)??null,set:(e,n)=>{t.set(e,n);},remove:e=>{t.delete(e);}}}function gn(){try{let t="__appwin_probe__";return globalThis.localStorage.setItem(t,"1"),globalThis.localStorage.removeItem(t),!0}catch{return  false}}function ot(t){if(!gn())return st();let e=st();return {get(n){try{return globalThis.localStorage.getItem(Pe(t,n))}catch{return e.get(n)}},set(n,r){try{globalThis.localStorage.setItem(Pe(t,n),r);}catch{e.set(n,r);}},remove(n){try{globalThis.localStorage.removeItem(Pe(t,n));}catch{e.remove(n);}}}}var S="/api/sdk/support/v1",at=20,ce=class{constructor(e){this.session=e;}onVisitorChange(e){return this.session.onIdentityChange(e)}config(e){return this.session.fetch({method:"GET",path:`${S}/config`,...e?{signal:e}:{}})}faqs(e){return this.session.fetch({method:"GET",path:`${S}/faqs`,...e?{signal:e}:{}})}faqCategories(e){return this.session.fetch({method:"GET",path:`${S}/faq-categories`,...e?{signal:e}:{}})}conversations(e,n){return this.session.fetch({method:"GET",path:`${S}/conversations`,query:{limit:at,...e?{cursor:e}:{}},...n?{signal:n}:{}})}async unreadCount(e){return (await this.conversations(void 0,e)).data.filter(U).length}conversation(e,n){return this.session.fetch({method:"GET",path:`${S}/conversations/${e}`,...n?{signal:n}:{}})}createConversation(e){return this.session.fetch({method:"POST",path:`${S}/conversations`,body:{firstMessage:lt(e)}})}messages(e,n,r){return this.session.fetch({method:"GET",path:`${S}/conversations/${e}/messages`,query:{limit:at,...n?{cursor:n}:{}},...r?{signal:r}:{}})}sendMessage(e,n){return this.session.fetch({method:"POST",path:`${S}/conversations/${e}/messages`,body:lt(n)})}markRead(e){return this.session.fetch({method:"POST",path:`${S}/conversations/${e}/messages/read`})}async setTyping(e,n){try{await this.session.fetch({method:"POST",path:`${S}/conversations/${e}/typing`,body:{isTyping:n}});}catch{}}toggleReaction(e,n,r){return this.session.fetch({method:"POST",path:`${S}/conversations/${e}/messages/${n}/reactions`,body:{emoji:r}})}updateMessage(e,n,r){return this.session.fetch({method:"PATCH",path:`${S}/conversations/${e}/messages/${n}`,body:{body:r}})}deleteMessage(e,n){return this.session.fetch({method:"DELETE",path:`${S}/conversations/${e}/messages/${n}`})}attachmentUrl(e){return this.session.fetch({method:"GET",path:`${S}/attachments/${e}/url`})}async upload(e,n){let r=await this.session.fetch({method:"POST",path:`${S}/uploads/sign`,body:{mimeType:e.type||"application/octet-stream",sizeBytes:e.size},...n?{signal:n}:{}}),i=new FormData;for(let[a,c]of Object.entries(r.fields))i.append(a,c);i.append("file",e);let o;try{o=await fetch(r.postUrl,{method:"POST",body:i,...n?{signal:n}:{}});}catch{throw new I("network","Could not reach the storage service")}if(!o.ok)throw new I("bad_request","The file was rejected by storage",o.status);return await this.session.fetch({method:"POST",path:`${S}/uploads/${r.uploadId}/confirm`}),{storageKey:r.storageKey,mimeType:e.type||"application/octet-stream",sizeBytes:e.size,filename:e.name}}};function U(t){return t.lastMessageAuthorType===null||t.lastMessageAuthorType==="customer"||!t.lastMessageAt?false:t.lastReadAt?new Date(t.lastMessageAt)>new Date(t.lastReadAt):true}function lt(t){return {body:t.body?.trim()??"",attachments:t.attachments??[]}}var pe=class{constructor(e){this.socket=null;this.attempts=0;this.pingTimer=null;this.retryTimer=null;this.closed=false;this.stopWatchingIdentity=null;this.generation=0;this.options=e;}async connect(){this.closed=false,this.stopWatchingIdentity??=this.options.session.onIdentityChange(()=>this.reopen()),await this.open();}disconnect(){this.closed=true,this.stopWatchingIdentity?.(),this.stopWatchingIdentity=null,this.clearTimers(),this.socket?.close(1e3),this.socket=null;}async open(){if(this.closed)return;let e=this.generation,n;try{n=(await this.options.session.fetch({method:"POST",path:"/api/sdk/v1/realtime/token"})).token;}catch{if(e!==this.generation)return;this.scheduleReconnect();return}if(e!==this.generation||this.closed)return;let r=new WebSocket(`${this.options.gatewayUrl}/ws?t=${encodeURIComponent(n)}`);this.socket=r,r.onopen=()=>{this.attempts=0;for(let i of fn(n))r.send(JSON.stringify({a:"sub",topic:i}));this.options.onConnectionChange?.(true),this.startPing();},r.onmessage=i=>this.onFrame(i.data),r.onclose=i=>{this.stopPing(),this.options.onConnectionChange?.(false),!this.closed&&(i.code===4001&&(this.attempts=0),this.scheduleReconnect());},r.onerror=()=>{};}reopen(){if(this.closed)return;this.clearTimers();let e=this.socket;this.socket=null,e&&(e.onclose=null,e.close(1e3),this.options.onConnectionChange?.(false)),this.attempts=0,this.generation+=1,this.open();}onFrame(e){if(typeof e!="string")return;let n;try{n=JSON.parse(e);}catch{return}if(!n||typeof n!="object")return;let r=n;if(r.v!==1||typeof r.t!="string"||!r.data)return;let i=hn(r.t,r.data);i&&this.options.onEvent(i);}startPing(){this.stopPing(),this.pingTimer=setInterval(()=>{this.socket?.readyState===WebSocket.OPEN&&this.socket.send('{"a":"ping"}');},25e3);}stopPing(){this.pingTimer&&clearInterval(this.pingTimer),this.pingTimer=null;}clearTimers(){this.stopPing(),this.retryTimer&&clearTimeout(this.retryTimer),this.retryTimer=null;}scheduleReconnect(){if(this.closed||this.retryTimer)return;let n=Math.min(1e3*2**this.attempts,3e4)*(.5+Math.random()*.5);this.attempts+=1,this.retryTimer=setTimeout(()=>{this.retryTimer=null,this.open();},n);}};function fn(t){let e=t.split(".")[1];if(!e)return [];try{let n=e.replace(/-/g,"+").replace(/_/g,"/"),r=JSON.parse(atob(n.padEnd(Math.ceil(n.length/4)*4,"=")));return Array.isArray(r.topics)?r.topics.filter(i=>typeof i=="string"):[]}catch{return []}}function hn(t,e){if(t==="support.message.created"||t==="support.message.updated")return {type:"message"};if(t==="support.conversation.updated")return typeof e.resourceId!="string"?null:{type:"conversation",conversationId:e.resourceId};if(t==="support.typing"){if(e.typingActor==="customer")return null;let n=typeof e.conversationId=="string"?e.conversationId:typeof e.resourceId=="string"?e.resourceId:null;return n?{type:"typing",conversationId:n,isTyping:e.isTyping===true}:null}return null}var mn="0.8.1",_n="https://api.appwin.io",vn="wss://ws.appwin.io";function pt(t){if(!t.appId)throw new Error("[appwin] `appId` is required. Find it in the dashboard, SDK tab.");let e=ct(t.apiUrl??_n),n=ct(t.gatewayUrl??vn),r=ot(t.appId),i=new le({appId:t.appId,baseUrl:e,storage:r,sdkVersion:mn});return t.externalId&&i.identify(t.externalId),{support:new ce(i),connect(a,c){let d=new pe({session:i,gatewayUrl:n,onEvent:a,...c?{onConnectionChange:c}:{}});return d.connect(),d},identify:(a,c)=>i.identify(a,c),updateUser:a=>i.updateUser(a),logout:()=>i.logout()}}function ct(t){return t.endsWith("/")?t.slice(0,-1):t}var dt=`/*
 * The messenger's stylesheet, bundled into \`panel.js\` as a string and
 * injected into the iframe's document at boot (ADR-0046 \xA73, amended
 * 2026-09-23). Inline on purpose: it is the first paint, and a widget that
 * flashes unstyled on somebody's landing page is a widget they take off the
 * page. Every colour comes from a variable the studio's configuration sets.
 */
:root {
  --appwin-primary: #1f1f1f;
  --appwin-primary-foreground: #ffffff;
  --appwin-radius: 10px;
  --appwin-surface: #ffffff;
  --appwin-raised: #f8fafc;
  --appwin-text: #101828;
  --appwin-muted: #667085;
  --appwin-border: #e4e7ec;
  --appwin-unread: #ef4444;
}
/* Light only, whatever the visitor's system says. A dark theme is not an
   inversion of these variables - a studio's brand colour rarely survives
   one - and neither the dashboard nor the native SDKs have one, so it is
   a decision for all five surfaces or for none.

   \`color-scheme\` is what keeps the browser's own chrome in step: without
   it a dark system paints the textarea and the scrollbars dark inside an
   otherwise light panel. */
:root { color-scheme: light; }

* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  display: flex;
  flex-direction: column;
  background: var(--appwin-surface);
  color: var(--appwin-text);
  font: 400 14px/1.5 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* Nothing shows until the configuration is in: no flash of the wrong brand. */
body:not([data-state='ready']) #root { visibility: hidden; }
#root { display: flex; flex-direction: column; flex: 1; min-height: 0; }

button { font: inherit; color: inherit; cursor: pointer; }
a { color: inherit; }

/* --- Frame ---------------------------------------------------------- */
.appbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px calc(14px + env(safe-area-inset-top, 0px));
  background: var(--appwin-primary);
  color: var(--appwin-primary-foreground);
  flex: none;
}
.appbar-title {
  flex: 1;
  margin: 0;
  font-size: 15px;
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
.screen { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* --- Shared bits ---------------------------------------------------- */
.avatar { border-radius: 50%; object-fit: cover; flex: none; }
.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--appwin-primary);
  color: var(--appwin-primary-foreground);
  font-weight: 600;
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
  border-radius: 16px;
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
.greeting { margin: 0; font-size: 21px; font-weight: 500; }
.greeting-line { margin: 0; }
.welcome {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid var(--appwin-border);
  border-radius: var(--appwin-radius);
  color: var(--appwin-muted);
}
.card {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px;
  border: 1px solid var(--appwin-border);
  border-radius: var(--appwin-radius);
  background: var(--appwin-raised);
  text-align: left;
}
.card:hover { border-color: var(--appwin-primary); }
/* The fill comes from the configuration (flat, or the studio's gradient),
   so only the ring and the lift are here. Same two shadows as the
   dashboard preview. */
.card.cta {
  border-color: transparent;
  color: var(--appwin-primary-foreground);
  font-weight: 600;
  box-shadow:
    inset 0 0 0 1.5px rgb(255 255 255 / 0.2),
    0 4px 8px rgb(2 6 23 / 0.1);
}
.card.cta:hover { filter: brightness(0.97); }
.card-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.card-label { font-size: 12px; color: var(--appwin-muted); }
.card-title { flex: 1; font-weight: 500; }
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
.section-title { margin: 8px 0 0; font-size: 13px; font-weight: 600; color: var(--appwin-muted); }
.faq-section { display: flex; flex-direction: column; gap: 10px; }
.faq-group { display: flex; flex-direction: column; gap: 2px; }
.faq-category { margin: 0 0 2px; font-size: 12px; color: var(--appwin-muted); }
.faq-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 11px 12px;
  border: 0;
  border-radius: var(--appwin-radius);
  background: var(--appwin-raised);
  text-align: left;
}
.faq-row:hover { background: var(--appwin-border); }

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
.article-title { margin: 0; font-size: 18px; }
.article-body { margin: 0; white-space: pre-wrap; }

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
.thread-welcome { display: flex; gap: 10px; align-items: flex-start; }
.thread-welcome p {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--appwin-radius);
  background: var(--appwin-raised);
}
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
`;var gt="appwin-host",bn="appwin-panel";function H(t){return {v:2,from:gt,...t}}function B(t){return {v:2,from:bn,...t}}function wn(t,e){if(typeof t!="object"||t===null)return null;let n=t;return n.from!==e||n.v!==2&&n.v!==1?null:n}function ft(t){let e=wn(t,gt);if(!e)return null;if(e.v===1)return xn(e);switch(e.type){case "open":case "close":case "logout":return H({type:e.type});case "identify":{if(typeof e.externalId!="string"||!e.externalId)return null;if(e.attributes===void 0)return H({type:"identify",externalId:e.externalId});let n=ut(e.attributes);return n?H({type:"identify",externalId:e.externalId,attributes:n}):null}case "updateUser":{let n=ut(e.attributes);return n?H({type:"updateUser",attributes:n}):null}default:return null}}function xn(t){switch(t.type){case "open":case "close":return H({type:t.type});case "reset":return H({type:"logout"});case "identify":return typeof t.userId!="string"||!t.userId?null:H({type:"identify",externalId:t.userId});default:return null}}var Sn=["email","name","avatarUrl","language","timezone","location","plan"];function ut(t){if(typeof t!="object"||t===null)return null;let e=t,n={};for(let r of Sn){let i=e[r];if(i!==void 0){if(typeof i!="string")return null;n[r]=i;}}return n}var ht={openMessenger:"Open the support messenger",closeMessenger:"Close the support messenger",messenger:"Support messenger"},mt={openMessenger:"Ouvrir la messagerie d'assistance",closeMessenger:"Fermer la messagerie d'assistance",messenger:"Messagerie d'assistance"};var _t={...ht,close:"Close",back:"Back",retry:"Retry",greetingNamed:"Hello {name} \u{1F44B}",greetingYou:"you",greetingSubtitle:"Need help?",sendToSupport:"Send us a message",conversations:"Your conversations",conversationsTitle:"My conversations",recentMessage:"Recent message",faq:"Help centre",noArticles:"No articles",noConversation:"No conversation yet",emptyConversationsHint:"Write to support to get started - we reply here.",newConversationPreview:"New conversation",youPreview:"You: {message}",statusResolved:"Resolved",statusClosed:"Closed",editMessage:"Edit",deleteMessage:"Delete",editingBanner:"Editing message",cancel:"Cancel",save:"Save",react:"React",showOriginal:"Show original",seeTranslation:"See translation",writeMessage:"Write a message",messagePlaceholder:"Write a message\u2026",send:"Send",attachFile:"Attach a file",typing:"Typing",seen:"Seen",sent:"Sent",agentFallback:"Support",loadErrorTitle:"Couldn't load",loadErrorMessage:"Check your connection and try again.",offline:"The messenger is unreachable right now.",today:"Today",yesterday:"Yesterday",justNow:"Just now",relativeMinutes:"{n} min",relativeHours:"{n} h",relativeDays:"{n} d",relativeWeeks:"{n} w"},kn={...mt,close:"Fermer",back:"Retour",retry:"R\xE9essayer",greetingNamed:"Hello {name} \u{1F44B}",greetingYou:"toi",greetingSubtitle:"Besoin d'aide ?",sendToSupport:"Envoyer un message au support",conversations:"Vos conversations",conversationsTitle:"Mes conversations",recentMessage:"Message r\xE9cent",faq:"Centre d'aide",noArticles:"Aucun article",noConversation:"Aucune conversation",emptyConversationsHint:"\xC9cris au support pour d\xE9marrer - on te r\xE9pond ici.",newConversationPreview:"Nouvelle conversation",youPreview:"Vous : {message}",statusResolved:"R\xE9solue",statusClosed:"Ferm\xE9e",editMessage:"Modifier",deleteMessage:"Supprimer",editingBanner:"Modification du message",cancel:"Annuler",save:"Enregistrer",react:"R\xE9agir",showOriginal:"Voir l'original",seeTranslation:"Voir la traduction",writeMessage:"\xC9crire un message",messagePlaceholder:"\xC9crire un message\u2026",send:"Envoyer",attachFile:"Joindre un fichier",typing:"En train d'\xE9crire",seen:"Vu",sent:"Envoy\xE9",agentFallback:"Support",loadErrorTitle:"Impossible de charger",loadErrorMessage:"V\xE9rifiez votre connexion et r\xE9essayez.",offline:"La messagerie est injoignable pour l'instant.",today:"Aujourd'hui",yesterday:"Hier",justNow:"\xC0 l'instant",relativeMinutes:"{n} min",relativeHours:"{n} h",relativeDays:"{n} j",relativeWeeks:"{n} sem."},Tn={en:_t,fr:kn};function vt(t){let e=(t??"").toLowerCase().split("-")[0];return e&&Tn[e]||_t}var q,w,Re,yt,ue=0,It=[],x=y,bt=x.__b,wt=x.__r,xt=x.diffed,St=x.__c,kt=x.unmount,Tt=x.__;function ge(t,e){x.__h&&x.__h(w,t,ue||e),ue=0;var n=w.__H||(w.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function E(t){return ue=1,Cn(Et,t)}function Cn(t,e,n){var r=ge(q++,2);if(r.t=t,!r.__c&&(r.__=[Et(void 0,e),function(c){var d=r.__N?r.__N[0]:r.__[0],p=r.t(d,c);d!==p&&(r.__N=[p,r.__[1]],r.__c.setState({}));}],r.__c=w,!w.__f)){var i=function(c,d,p){if(!r.__c.__H)return  true;var u=false,g=r.__c.props!==c;if(r.__c.__H.__.some(function(f){if(f.__N){u=true;var b=f.__[0];f.__=f.__N,f.__N=void 0,b!==f.__[0]&&(g=true);}}),o){var l=o.call(this,c,d,p);return u?l||g:l}return !u||g};w.__f=true;var o=w.shouldComponentUpdate,a=w.componentWillUpdate;w.componentWillUpdate=function(c,d,p){if(this.__e){var u=o;o=void 0,i(c,d,p),o=u;}a&&a.call(this,c,d,p);},w.shouldComponentUpdate=i;}return r.__N||r.__}function V(t,e){var n=ge(q++,3);!x.__s&&Mt(n.__H,e)&&(n.__=t,n.u=e,w.__H.__h.push(n));}function Ue(t){return ue=5,In(function(){return {current:t}},[])}function In(t,e){var n=ge(q++,7);return Mt(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function At(t){var e=w.context[t.__c],n=ge(q++,9);return n.c=t,e?(n.__==null&&(n.__=true,e.sub(w)),e.props.value):t.__}function An(){for(var t;t=It.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(de),e.__h.some(Oe),e.__h=[];}catch(n){e.__h=[],x.__e(n,t.__v);}}}x.__b=function(t){w=null,bt&&bt(t);},x.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Tt&&Tt(t,e);},x.__r=function(t){wt&&wt(t),q=0;var e=(w=t.__c).__H;e&&(Re===w?(e.__h=[],w.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0;})):(e.__h.some(de),e.__h.some(Oe),e.__h=[],q=0)),Re=w;},x.diffed=function(t){xt&&xt(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(It.push(e)!==1&&yt===x.requestAnimationFrame||((yt=x.requestAnimationFrame)||Mn)(An)),e.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0);})),Re=w=null;},x.__c=function(t,e){e.some(function(n){try{n.__h.some(de),n.__h=n.__h.filter(function(r){return !r.__||Oe(r)});}catch(r){e.some(function(i){i.__h&&(i.__h=[]);}),e=[],x.__e(r,n.__v);}}),St&&St(t,e);},x.unmount=function(t){kt&&kt(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(r){try{de(r);}catch(i){e=i;}}),n.__H=void 0,e&&x.__e(e,n.__v));};var Ct=typeof requestAnimationFrame=="function";function Mn(t){var e,n=function(){clearTimeout(r),Ct&&cancelAnimationFrame(e),setTimeout(t);},r=setTimeout(n,35);Ct&&(e=requestAnimationFrame(n));}function de(t){var e=w,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),w=e;}function Oe(t){var e=w;t.__c=t.__(),w=e;}function Mt(t,e){return !t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function Et(t,e){return typeof e=="function"?e(t):e}function fe(t,e,n,r=Date.now()){let i=new Date(t).getTime();if(Number.isNaN(i))return "";let o=Math.max(0,r-i);return o<6e4?e.justNow:o<36e5?e.relativeMinutes.replace("{n}",String(Math.floor(o/6e4))):o<864e5?e.relativeHours.replace("{n}",String(Math.floor(o/36e5))):o<6048e5?e.relativeDays.replace("{n}",String(Math.floor(o/864e5))):o<5*6048e5?e.relativeWeeks.replace("{n}",String(Math.floor(o/6048e5))):new Intl.DateTimeFormat(n,{day:"numeric",month:"short"}).format(i)}function Pt(t,e){let n=new Date(t);return Number.isNaN(n.getTime())?"":new Intl.DateTimeFormat(e,{hour:"2-digit",minute:"2-digit"}).format(n)}function En(t,e,n,r=Date.now()){let i=new Date(t);if(Number.isNaN(i.getTime()))return "";let o=c=>new Date(c.getFullYear(),c.getMonth(),c.getDate()).getTime(),a=Math.round((o(new Date(r))-o(i))/864e5);return a===0?e.today:a===1?e.yesterday:new Intl.DateTimeFormat(n,{day:"numeric",month:"long",...i.getFullYear()===new Date(r).getFullYear()?{}:{year:"numeric"}}).format(i)}function Rt(t,e,n,r=Date.now()){let i=[];for(let o=t.length-1;o>=0;o-=1){let a=t[o];if(!a)continue;let c=En(a.createdAt,e,n,r),d=i[i.length-1];d&&d.day===c?d.messages.push(a):i.push({day:c,messages:[a]});}return i}function he(t,e){let n=t.preview?.trim();return n?t.lastMessageAuthorType==="customer"?e.youPreview.replace("{message}",n):n:e.newConversationPreview}function Ot(t){return t.trim().split(/\s+/).filter(Boolean).slice(0,2).map(r=>[...r][0]??"").join("").toUpperCase()}function Ut(t,e){let n=["B","kB","MB","GB"],r=Math.max(0,t),i=0;for(;r>=1e3&&i<n.length-1;)r/=1e3,i+=1;return `${new Intl.NumberFormat(e,{maximumFractionDigits:r<10&&i>0?1:0}).format(r)} ${n[i]}`}var Pn=0;function s(t,e,n,r,i,o){e||(e={});var a,c,d=e;if("ref"in d)for(c in d={},e)c=="ref"?a=e[c]:d[c]=e[c];var p={type:t,props:d,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--Pn,__i:-1,__u:0,__source:i,__self:o};if(typeof t=="function"&&(a=t.defaultProps))for(c in a)d[c]===void 0&&(d[c]=a[c]);return y.vnode&&y.vnode(p),p}function L({size:t=20,children:e}){return s("svg",{viewBox:"0 0 24 24",width:t,height:t,fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:e})}var Lt=t=>s(L,{...t,children:s("path",{d:"M18 6 6 18M6 6l12 12"})}),Ft=t=>s(L,{...t,children:s("path",{d:"M15 5L9 12L15 19"})}),Le=t=>s(L,{...t,children:s("path",{d:"M9 5L15 12L9 19"})});var Dt=t=>s(L,{...t,children:s("path",{d:"M21.4 11.1 12.3 20a5.5 5.5 0 0 1-7.8-7.8l9.2-9.1a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.1a1.8 1.8 0 0 1-2.6-2.6l8.5-8.4"})}),me=t=>s(L,{...t,children:[s("path",{d:"M17.4975 18.4851L20.6281 9.09373C21.8764 5.34874 22.5006 3.47624 21.5122 2.48782C20.5237 1.49939 18.6511 2.12356 14.906 3.37189L5.57477 6.48218C3.49295 7.1761 2.45203 7.52305 2.13608 8.28637C2.06182 8.46577 2.01692 8.65596 2.00311 8.84963C1.94433 9.67365 2.72018 10.4495 4.27188 12.0011L4.55451 12.2837C4.80921 12.5384 4.93655 12.6658 5.03282 12.8075C5.22269 13.0871 5.33046 13.4143 5.34393 13.7519C5.35076 13.9232 5.32403 14.1013 5.27057 14.4574C5.07488 15.7612 4.97703 16.4131 5.0923 16.9147C5.32205 17.9146 6.09599 18.6995 7.09257 18.9433C7.59255 19.0656 8.24576 18.977 9.5522 18.7997L9.62363 18.79C9.99191 18.74 10.1761 18.715 10.3529 18.7257C10.6738 18.745 10.9838 18.8496 11.251 19.0285C11.3981 19.1271 11.5295 19.2585 11.7923 19.5213L12.0436 19.7725C13.5539 21.2828 14.309 22.0379 15.1101 21.9985C15.3309 21.9877 15.5479 21.9365 15.7503 21.8474C16.4844 21.5244 16.8221 20.5113 17.4975 18.4851Z"}),s("path",{d:"M6 18L21 3"})]}),Nt=t=>s(L,{...t,children:[s("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"}),s("path",{d:"M2 13H5.16026C6.06543 13 6.51802 13 6.91584 13.183C7.31367 13.3659 7.60821 13.7096 8.19729 14.3968L8.80271 15.1032C9.39179 15.7904 9.68633 16.1341 10.0842 16.317C10.482 16.5 10.9346 16.5 11.8397 16.5H12.1603C13.0654 16.5 13.518 16.5 13.9158 16.317C14.3137 16.1341 14.6082 15.7904 15.1973 15.1032L15.8027 14.3968C16.3918 13.7096 16.6863 13.3659 17.0842 13.183C17.482 13 17.9346 13 18.8397 13H22"})]}),Fe=t=>s(L,{...t,children:s("path",{d:"M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"})}),De=t=>s(L,{...t,children:s("path",{d:"M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"})});function G(){return s("span",{class:"spinner",role:"status"})}function Y({name:t,url:e,size:n=32}){let r={width:`${n}px`,height:`${n}px`,fontSize:`${Math.round(n/2.6)}px`};return e?s("img",{class:"avatar",style:r,src:e,alt:"",loading:"lazy"}):s("span",{class:"avatar avatar-fallback",style:r,"aria-hidden":"true",children:Ot(t)})}var K=()=>s("span",{class:"unread-dot"});function Ht(){let{store:t,strings:e,locale:n}=k(),r=C();return r.conversations.length===0?s("div",{class:"screen empty",children:[s(Fe,{size:28}),s("p",{class:"empty-title",children:e.noConversation}),s("p",{class:"empty-body",children:e.emptyConversationsHint}),s("button",{type:"button",class:"button",onClick:()=>t.go({name:"new"}),children:e.sendToSupport})]}):s("div",{class:"screen list",children:[r.conversations.map(i=>s("button",{type:"button",class:"row",onClick:()=>{t.openThread(i.id);},children:[s("div",{class:"row-text",children:[s("span",{class:"row-preview",children:he(i,e)}),i.status!=="open"&&s("span",{class:"badge-status",children:i.status==="resolved"?e.statusResolved:e.statusClosed})]}),s("span",{class:"card-meta",children:[U(i)&&s(K,{}),i.lastMessageAt&&fe(i.lastMessageAt,e,n)]})]},i.id)),s("button",{type:"button",class:"card cta",onClick:()=>t.go({name:"new"}),children:[s(Fe,{size:18}),s("span",{children:e.sendToSupport})]})]})}function $t({faqId:t}){let{strings:e}=k(),r=C().faqs.find(i=>i.id===t);return r?s("article",{class:"screen article",children:[s("h2",{class:"article-title",children:r.question}),r.answer.split(/\n{2,}/).map((i,o)=>s("p",{class:"article-body",children:i},o))]}):s("div",{class:"screen empty",children:s("p",{class:"empty-title",children:e.noArticles})})}var qt={low:"6px",medium:"10px",high:"16px",max:"24px"};function Rn(t){return {"--appwin-primary":t.colors.primary,"--appwin-primary-foreground":t.colors.primaryForeground,"--appwin-radius":qt[t.design.radius]??qt.medium}}function Wt(t,e){for(let[n,r]of Object.entries(Rn(t)))e.style.setProperty(n,r);}function X(t){return t.context.agentName.trim()||t.context.projectName}function J(t){return t.context.agentAvatarUrl??t.context.projectLogoUrl}function Ne(t,e=.22){let n=t.replace("#","").slice(0,6);if(n.length<6)return t;let r=i=>{let o=Number.parseInt(n.slice(i,i+2),16);return Number.isNaN(o)?"00":Math.max(0,Math.min(255,Math.round(o*(1-e)))).toString(16).padStart(2,"0")};return `#${r(0)}${r(2)}${r(4)}`}function jt(t){let e=t.colors.primary;return t.design.autoGradient?`linear-gradient(155deg, ${Ne(e)} 0%, ${e} 100%)`:e}var zt="#e2e8f0";function On(t){let e=n=>`${t}/support/banners/${n}`;return {tileA:e("tile-a.svg"),tileB:e("tile-b.svg"),emojiWave:e("emoji-wave.png"),emojiLaptop:e("emoji-laptop.png"),emojiLifebuoy:e("emoji-lifebuoy.png"),amicale:e("amicale.svg"),discret:e("discret.svg"),photo:e("photo.png"),iconRingOuter:e("icon-ring-outer.svg"),iconRingMid:e("icon-ring-mid.svg"),iconRingInner:e("icon-ring-inner.svg"),iconHeadset:e("icon-headset.svg"),iconMic:e("icon-mic.svg"),serious:e("serious.svg")}}var Un=[{inset:[1.24,88.08,52.42,-3.14],kind:"a"},{inset:[-5.04,73.56,58.7,11.38],kind:"b"},{inset:[-11.32,59.04,64.98,25.91],kind:"a"},{inset:[-17.6,44.51,71.26,40.43],kind:"a"},{inset:[-23.88,29.99,77.55,54.95],kind:"a"},{inset:[-30.16,15.46,83.83,69.48],kind:"b"},{inset:[-36.44,.94,90.11,84],kind:"a"},{inset:[45.93,86.04,7.73,-1.1],kind:"a"},{inset:[39.65,71.52,14.01,13.42],kind:"b"},{inset:[33.37,56.99,20.29,27.95],kind:"wave"},{inset:[27.09,42.47,26.58,42.47],kind:"laptop"},{inset:[20.81,27.95,32.86,56.99],kind:"lifebuoy"},{inset:[14.53,13.42,39.14,71.52],kind:"b"},{inset:[8.25,-1.1,45.42,86.04],kind:"a"},{inset:[90.62,84,-36.96,.94],kind:"a"},{inset:[84.34,69.48,-30.67,15.46],kind:"b"},{inset:[78.06,54.95,-24.39,29.99],kind:"a"},{inset:[71.78,40.43,-18.11,44.51],kind:"a"},{inset:[65.5,25.91,-11.83,59.04],kind:"empty"},{inset:[59.22,11.38,-5.55,73.56],kind:"b"},{inset:[52.94,-3.14,.73,88.08],kind:"a"}];function Ln(t,e){switch(t){case "a":return e.tileA;case "b":return e.tileB;case "wave":return e.emojiWave;case "laptop":return e.emojiLaptop;case "lifebuoy":return e.emojiLifebuoy;case "empty":return null}}function P(t,e,n,r){return {top:`${t}%`,right:`${e}%`,bottom:`${n}%`,left:`${r}%`}}function Bt({config:t}){let{design:e}=t;return e.bannerSource==="none"?null:e.bannerSource==="custom"?e.bannerUrl?s("div",{class:"banner",children:s("img",{class:"banner-fill",src:e.bannerUrl,alt:"",style:{objectFit:"cover",objectPosition:`center ${e.bannerFocusY}%`}})}):null:s("div",{class:"banner",children:s(Fn,{design:e,brand:t.colors.primary,asset:On(t.context.assetsBaseUrl)})})}function Fn({design:t,brand:e,asset:n}){switch(t.presetBannerId){case "amicale":return s(Nn,{brand:e,asset:n});case "discret":return s(Hn,{asset:n});case "photo":return s($n,{brand:e,asset:n});case "icon":return s(qn,{brand:e,asset:n});case "serious":return s(Wn,{asset:n});default:return s(Dn,{brand:e,asset:n})}}function Dn({brand:t,asset:e}){return s("div",{class:"banner-fill",style:{backgroundColor:t},children:Un.map((n,r)=>{let[i,o,a,c]=n.inset,d=Ln(n.kind,e);return s("div",{class:"tile-slot",style:P(i,o,a,c),children:s("div",{class:"tile",children:d?s("img",{class:"banner-fill",src:d,alt:""}):s("div",{class:"tile-empty"})})},r)})})}function Nn({brand:t,asset:e}){return s("div",{class:"banner-fill",style:{backgroundImage:`linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2)), linear-gradient(90deg, ${t}, ${t})`},children:s("div",{class:"banner-layer",style:P(-14.87,22.83,-15.38,22.83),children:s("img",{class:"banner-fill",src:e.amicale,alt:""})})})}function Hn({asset:t}){return s("div",{class:"banner-fill",style:{backgroundColor:zt},children:s("div",{class:"banner-layer",style:P(-15.9,16.67,-89.23,16.67),children:s("img",{class:"banner-fill",src:t.discret,alt:""})})})}function $n({brand:t,asset:e}){return s("div",{class:"banner-fill",style:{backgroundColor:Ne(t,.45)},children:[s("div",{class:"banner-photo",children:s("img",{class:"banner-fill",style:{objectFit:"cover"},src:e.photo,alt:""})}),s("div",{class:"banner-fill",style:{backgroundColor:t,opacity:.8}})]})}function qn({brand:t,asset:e}){return s("div",{class:"banner-fill",style:{backgroundColor:t},children:[s("div",{class:"banner-layer",style:P(-71.28,10,-74.87,10),children:s("img",{class:"banner-fill",src:e.iconRingOuter,alt:""})}),s("div",{class:"banner-layer",style:P(-40.51,20,-44.1,20),children:s("img",{class:"banner-fill",src:e.iconRingMid,alt:""})}),s("div",{class:"banner-layer",style:P(-9.74,30,-13.33,30),children:s("img",{class:"banner-fill",src:e.iconRingInner,alt:""})}),s("div",{class:"banner-badge",children:[s("div",{class:"banner-layer",style:P(12.5,12.5,12.5,12.5),children:s("img",{class:"banner-fill",src:e.iconHeadset,alt:""})}),s("div",{class:"banner-layer",style:P(64.64,39.64,27.08,39.64),children:s("img",{class:"banner-fill",src:e.iconMic,alt:""})})]})]})}function Wn({asset:t}){return s("div",{class:"banner-fill",style:{backgroundColor:zt},children:s("div",{class:"banner-layer",style:P(-21.54,19.67,-65.13,19.67),children:s("img",{class:"banner-fill",src:t.serious,alt:""})})})}function Vt(){let{store:t,strings:e,locale:n}=k(),r=C(),i=r.config;if(!i)return null;let o=zn(r.conversations),a=r.conversations.some(U),c=i.messaging.welcomeMessageEnabled?i.messaging.welcomeMessage?.trim():"";return s("div",{class:"screen home",children:[s(Bt,{config:i}),s("div",{class:"greeting",children:[s("p",{class:"greeting-line",children:e.greetingNamed.replace("{name}",e.greetingYou)}),s("p",{class:"greeting-line",children:e.greetingSubtitle})]}),c&&s("p",{class:"welcome",children:c}),o&&s("button",{type:"button",class:"card recent",onClick:()=>{t.openThread(o.id);},children:[s("div",{class:"card-text",children:[s("span",{class:"card-label",children:e.recentMessage}),s("span",{class:"card-preview",children:he(o,e)})]}),s("span",{class:"card-meta",children:[U(o)&&s(K,{}),o.lastMessageAt&&fe(o.lastMessageAt,e,n)]})]}),s("button",{type:"button",class:"card cta",style:{background:jt(i)},onClick:()=>t.go({name:"new"}),children:[s(me,{size:18}),s("span",{children:e.sendToSupport})]}),s("button",{type:"button",class:"card",onClick:()=>t.go({name:"conversations"}),children:[s(Nt,{size:18}),s("span",{class:"card-title",children:e.conversations}),s("span",{class:"card-meta",children:[a&&s(K,{}),s(Le,{size:16})]})]}),i.modules.faqEnabled&&s(jn,{})]})}function jn(){let{store:t,strings:e}=k(),n=C();if(n.faqs.length===0)return null;let r=n.faqCategories.map(i=>({category:i,faqs:n.faqs.filter(o=>o.categoryId===i.id)})).filter(i=>i.faqs.length>0);return s("section",{class:"faq-section",children:[s("h2",{class:"section-title",children:e.faq}),r.map(({category:i,faqs:o})=>s("div",{class:"faq-group",children:[s("p",{class:"faq-category",children:i.name}),o.map(a=>s("button",{type:"button",class:"faq-row",onClick:()=>t.go({name:"faq",faqId:a.id}),children:[s("span",{children:a.question}),s(Le,{size:16})]},a.id))]},i.id))]})}function zn(t){let e=null;for(let n of t){if(n.status!=="open")continue;let r=n.lastMessageAt??n.createdAt,i=e?e.lastMessageAt??e.createdAt:"";(!e||r>i)&&(e=n);}return e}var Bn=80,Vn=["\u{1F44D}","\u{1F525}","\u2764\uFE0F","\u{1F602}","\u{1F62E}","\u{1F389}"];function Gt(){let{store:t,strings:e,locale:n}=k(),r=C(),i=Ue(null),o=r.thread,a=r.config,c=o?.messages[0]?.id??null;if(V(()=>{let g=i.current;g&&(g.scrollTop=g.scrollHeight);},[c,o?.agentTyping]),!a)return null;let d=o?Rt(o.messages,e,n):[],p=a.messaging.welcomeMessageEnabled?a.messaging.welcomeMessage?.trim():"";return s("div",{class:"thread",children:[s("div",{class:"thread-scroll",ref:i,onScroll:()=>{let g=i.current;!g||g.scrollTop>Bn||t.loadOlder();},children:[o?.loadingOlder&&s("div",{class:"centered thin",children:s(G,{})}),!o&&p&&s("div",{class:"thread-welcome",children:[s(Y,{name:X(a),url:J(a),size:32}),s("p",{children:p})]}),d.map(g=>s("div",{class:"day",children:[s("p",{class:"day-label",children:g.day}),g.messages.map(l=>s(Gn,{message:l},l.id))]},g.day)),o?.agentTyping&&s("div",{class:"typing","aria-label":e.typing,children:[s("span",{}),s("span",{}),s("span",{})]})]}),s(Kn,{})]})}function Gn({message:t}){let{store:e,locale:n,strings:r}=k(),i=C(),[o,a]=E(false),[c,d]=E(false),p=t.authorType==="customer",u=i.config,g=t.translatedBody?.trim(),l=!p&&!!g&&g!==t.body,f=l&&!c?g:t.body,b=p&&!!t.body;return s("div",{class:`bubble-row ${p?"mine":"theirs"}`,children:[!p&&u&&s(Y,{name:t.authorNameSnapshot??X(u),url:J(u),size:24}),s("div",{class:"bubble-column",children:[o&&s("div",{class:"actions",children:[s("div",{class:"pill",children:Vn.map(m=>{let h=t.reactions.some(v=>v.emoji===m&&v.reactedByMe);return s("button",{type:"button",class:`pill-emoji ${h?"on":""}`,onClick:()=>{a(false),e.toggleReaction(t.id,m);},children:m},m)})}),b&&s("div",{class:"pill",children:[s("button",{type:"button",class:"pill-action",onClick:()=>{a(false),e.startEditing(t);},children:r.editMessage}),s("button",{type:"button",class:"pill-action danger",onClick:()=>{a(false),e.deleteMessage(t.id);},children:r.deleteMessage})]})]}),s("button",{type:"button",class:"bubble","aria-label":r.react,onClick:()=>a(m=>!m),children:[f&&s("p",{class:"bubble-body",children:f}),t.attachments.map(m=>s(Yn,{attachment:m},m.id)),s("span",{class:"bubble-time",children:[Pt(t.createdAt,n),p&&t.readAt&&` \xB7 ${r.seen}`]})]}),s("div",{class:"bubble-footer",children:[t.reactions.length>0&&s("span",{class:"reactions",children:t.reactions.map(m=>s("button",{type:"button",class:`reaction ${m.reactedByMe?"on":""}`,onClick:()=>{e.toggleReaction(t.id,m.emoji);},children:[m.emoji,m.count>1&&s("span",{class:"reaction-count",children:m.count})]},m.emoji))}),l&&s("button",{type:"button",class:"link",onClick:()=>d(m=>!m),children:c?r.seeTranslation:r.showOriginal})]})]})]})}function Yn({attachment:t}){let{locale:e}=k();return t.mimeType.startsWith("image/")?s("a",{class:"attachment-image",href:t.url,target:"_blank",rel:"noreferrer noopener",children:s("img",{src:t.url,alt:t.filename,loading:"lazy"})}):s("a",{class:"attachment-file",href:t.url,target:"_blank",rel:"noreferrer noopener",children:[s(De,{size:18}),s("span",{class:"attachment-name",children:t.filename}),s("span",{class:"attachment-size",children:Ut(t.sizeBytes,e)})]})}function Kn(){let{store:t,strings:e}=k(),n=C(),[r,i]=E(""),[o,a]=E([]),[c,d]=E(false),p=Ue(null),u=()=>{let h=p.current;h&&(h.style.height="auto",h.style.height=`${Math.min(h.scrollHeight,120)}px`);},g=n.editing,[l,f]=E(null);V(()=>{g?(l===null&&f(r),i(g.original),p.current?.focus()):l!==null&&(i(l),f(null));},[g?.messageId]);let b=async()=>{if(g){await t.saveEdit(r);return}let h=o.map(v=>v.attachment).filter(v=>!!v);!r.trim()&&h.length===0||(i(""),a([]),p.current&&(p.current.style.height="auto"),await t.send(r,h));},m=async h=>{if(!(!h||h.length===0)){d(true);for(let v of Array.from(h))try{let _=await t.upload(v);a(T=>[...T,{file:v,attachment:_}]);}catch{}d(false);}};return s("div",{class:"composer",children:[g&&s("div",{class:"composer-editing",children:[s("span",{children:e.editingBanner}),s("button",{type:"button",class:"link",onClick:()=>t.cancelEditing(),children:e.cancel})]}),o.length>0&&s("div",{class:"composer-files",children:o.map((h,v)=>s("span",{class:"composer-file",children:[s(De,{size:14}),h.file.name,s("button",{type:"button",class:"composer-file-remove","aria-label":e.close,onClick:()=>a(_=>_.filter((T,F)=>F!==v)),children:"\xD7"})]},`${h.file.name}-${v}`))}),n.sendError&&s("p",{class:"composer-error",children:e.loadErrorMessage}),s("div",{class:"composer-row",children:[!g&&s("label",{class:"icon-button","aria-label":e.attachFile,children:[s(Dt,{}),s("input",{type:"file",multiple:true,hidden:true,onChange:h=>{m(h.target.files);}})]}),s("textarea",{ref:p,class:"composer-input",rows:1,placeholder:e.messagePlaceholder,value:r,onInput:h=>{i(h.target.value),u(),t.notifyTyping();},onKeyDown:h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),b());}}),s("button",{type:"button",class:"send",disabled:n.sending||c||!r.trim()&&(g!==null||o.length===0),onClick:()=>{b();},children:[s("span",{children:g?e.save:e.send}),n.sending||c?s(G,{}):s(me,{size:14})]})]})]})}var Yt=nt(null);function k(){let t=At(Yt);if(!t)throw new Error("[appwin] UI context is missing");return t}function C(){let{store:t}=k(),[e,n]=E(t.getState());return V(()=>t.subscribe(()=>n(t.getState())),[t]),e}function Kt(t){return s(Yt.Provider,{value:t,children:s(Xn,{})})}function Xn(){let{store:t,strings:e}=k(),n=C();return n.status==="loading"?s("div",{class:"centered",children:s(G,{})}):n.status==="error"||!n.config?s("div",{class:"centered failure",children:[s("p",{class:"failure-title",children:e.loadErrorTitle}),s("p",{class:"failure-body",children:e.loadErrorMessage}),s("button",{type:"button",class:"button",onClick:()=>{t.boot();},children:e.retry})]}):s(O,{children:[s(Jn,{config:n.config}),s("main",{class:"body",children:[n.route.name==="home"&&s(Vt,{}),n.route.name==="conversations"&&s(Ht,{}),n.route.name==="faq"&&s($t,{faqId:n.route.faqId}),(n.route.name==="thread"||n.route.name==="new")&&s(Gt,{})]})]})}function Jn({config:t}){let{store:e,strings:n,onClose:r}=k(),i=C(),o=i.route.name==="home",a=X(t);return s("header",{class:"appbar",children:[o?s(Y,{name:a,url:J(t),size:28}):s("button",{type:"button",class:"icon-button","aria-label":n.back,onClick:()=>e.go({name:"home"}),children:s(Ft,{})}),s("h1",{class:"appbar-title",children:o?a:Zn(i.route.name,n,a)}),s("button",{type:"button",class:"icon-button","aria-label":n.close,onClick:r,children:s(Lt,{})})]})}function Zn(t,e,n){return t==="conversations"?e.conversationsTitle:t==="faq"?e.faq:t==="new"?e.writeMessage:n}var Qn=6e3,er=2e3,tr={status:"loading",config:null,route:{name:"home"},conversations:[],faqs:[],faqCategories:[],thread:null,sending:false,sendError:false,editing:null},_e=class{constructor(e){this.state=tr;this.listeners=new Set;this.typingTimer=null;this.lastTypingSentAt=Number.NEGATIVE_INFINITY;this.client=e.client,this.now=e.now??(()=>Date.now());}getState(){return this.state}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}get unread(){return this.state.conversations.filter(U).length}set(e){this.state={...this.state,...e};for(let n of this.listeners)n();}async boot(){try{let e=await this.client.config();this.set({config:e,status:"ready"});}catch{this.set({status:"error"});return}await Promise.all([this.refreshConversations(),this.loadFaqs()]);}async refreshConversations(){try{let e=await this.client.conversations();this.set({conversations:e.data});}catch{}}async visitorChanged(){this.clearTypingTimer(),this.set({route:{name:"home"},conversations:[],thread:null,sending:false,sendError:false,editing:null}),await this.refreshConversations();}async loadFaqs(){if(this.state.config?.modules.faqEnabled)try{let[e,n]=await Promise.all([this.client.faqs(),this.client.faqCategories()]);this.set({faqs:e,faqCategories:n});}catch{}}go(e){if(e.name!=="thread"&&this.state.thread){this.clearTypingTimer(),this.set({route:e,thread:null,sendError:false,editing:null});return}this.set({route:e,sendError:false,editing:null});}async openThread(e){this.set({route:{name:"thread",conversationId:e},thread:{conversationId:e,messages:[],cursor:null,loadingOlder:false,agentTyping:false},sendError:false,editing:null});try{let n=await this.client.messages(e);this.patchThread(e,{messages:n.data,cursor:n.nextCursor});}catch{this.patchThread(e,{messages:[]});}await this.markRead(e);}async loadOlder(){let e=this.state.thread;if(!(!e||!e.cursor||e.loadingOlder)){this.patchThread(e.conversationId,{loadingOlder:true});try{let n=await this.client.messages(e.conversationId,e.cursor),r=this.state.thread;if(!r||r.conversationId!==e.conversationId)return;this.patchThread(e.conversationId,{messages:[...r.messages,...n.data],cursor:n.nextCursor,loadingOlder:!1});}catch{this.patchThread(e.conversationId,{loadingOlder:false});}}}async send(e,n=[]){let r=e.trim();if(!r&&n.length===0||this.state.sending)return;this.set({sending:true,sendError:false});let i=this.state.thread;try{if(!i){let c=await this.client.createConversation({body:r,attachments:n});this.set({sending:!1}),await this.openThread(c.id),this.refreshConversations();return}let o=await this.client.sendMessage(i.conversationId,{body:r,attachments:n});this.client.setTyping(i.conversationId,!1);let a=this.state.thread;a?.conversationId===i.conversationId&&this.patchThread(i.conversationId,{messages:[o,...a.messages]}),this.set({sending:!1}),this.refreshConversations();}catch{this.set({sending:false,sendError:true});}}upload(e){return this.client.upload(e)}startEditing(e){e.authorType!=="customer"||!e.body||this.set({editing:{messageId:e.id,original:e.body},sendError:false});}cancelEditing(){this.set({editing:null});}async saveEdit(e){let n=this.state.editing,r=this.state.thread,i=e.trim();if(!(!n||!r||!i)&&!this.state.sending){this.set({sending:true,sendError:false});try{let o=await this.client.updateMessage(r.conversationId,n.messageId,i);this.replaceMessage(r.conversationId,o),this.set({sending:!1,editing:null}),this.refreshConversations();}catch{this.set({sending:false,sendError:true});}}}async deleteMessage(e){let n=this.state.thread;if(!n)return;try{await this.client.deleteMessage(n.conversationId,e);}catch{this.set({sendError:true});return}let r=this.state.thread;r?.conversationId===n.conversationId&&this.patchThread(n.conversationId,{messages:r.messages.filter(i=>i.id!==e)}),this.refreshConversations(),this.state.editing?.messageId===e&&this.set({editing:null});}async toggleReaction(e,n){let r=this.state.thread;if(r)try{let i=await this.client.toggleReaction(r.conversationId,e,n);this.replaceMessage(r.conversationId,i);}catch{}}replaceMessage(e,n){let r=this.state.thread;!r||r.conversationId!==e||this.patchThread(e,{messages:r.messages.map(i=>i.id===n.id?n:i)});}notifyTyping(){let e=this.state.thread;if(!e)return;let n=this.now();n-this.lastTypingSentAt<er||(this.lastTypingSentAt=n,this.client.setTyping(e.conversationId,true));}onRealtime(e){if(e.type==="typing"){let r=this.state.thread;if(!r||r.conversationId!==e.conversationId)return;this.patchThread(r.conversationId,{agentTyping:e.isTyping}),this.clearTypingTimer(),e.isTyping&&(this.typingTimer=setTimeout(()=>{this.patchThread(e.conversationId,{agentTyping:false});},Qn));return}this.refreshConversations();let n=this.state.thread;n&&(e.type==="conversation"&&e.conversationId!==n.conversationId||this.refreshOpenThread());}async refreshOpenThread(){let e=this.state.thread;if(e){try{let n=await this.client.messages(e.conversationId),r=this.state.thread;if(!r||r.conversationId!==e.conversationId)return;let i=r.messages.filter(a=>!n.data.some(c=>c.id===a.id)),o=new Set(n.data.map(a=>a.id));this.patchThread(e.conversationId,{messages:[...n.data,...i.filter(a=>!o.has(a.id))]});}catch{return}await this.markRead(e.conversationId);}}async markRead(e){try{await this.client.markRead(e);}catch{return}await this.refreshConversations();}patchThread(e,n){let r=this.state.thread;!r||r.conversationId!==e||this.set({thread:{...r,...n}});}clearTypingTimer(){this.typingTimer&&clearTimeout(this.typingTimer),this.typingTimer=null;}dispose(){this.clearTypingTimer(),this.listeners.clear();}};var nr=2e3,rr=6e4;function ir(){let t=document.currentScript;if(!t)return null;let e=t.getAttribute("data-app-id"),n=t.getAttribute("data-host-origin");if(!e||!n)return null;let r;try{r=new URL(n).origin;}catch{return null}return r==="null"?null:{appId:e,hostOrigin:r,apiUrl:t.getAttribute("data-api-url"),gatewayUrl:t.getAttribute("data-gateway-url"),externalId:t.getAttribute("data-external-id")??t.getAttribute("data-user-id")}}function sr(){let t=document.createElement("style");t.textContent=dt,document.head.appendChild(t);}function or(t){let e=navigator.language||"en",n=vt(e),r=u=>{parent.postMessage(u,t.hostOrigin);},i=pt({appId:t.appId,...t.externalId?{externalId:t.externalId}:{},...t.apiUrl?{apiUrl:t.apiUrl}:{},...t.gatewayUrl?{gatewayUrl:t.gatewayUrl}:{}}),o=new _e({client:i.support});i.support.onVisitorChange(()=>{o.visitorChanged();});let a=document.getElementById("root");if(!a)return;tt(Te(Kt,{store:o,strings:n,locale:e,onClose:()=>r(B({type:"close"}))}),a),document.addEventListener("keydown",u=>{u.key==="Escape"&&r(B({type:"close"}));}),window.addEventListener("message",u=>{if(u.origin!==t.hostOrigin)return;let g=ft(u.data);if(g)switch(g.type){case "open":o.refreshConversations();break;case "close":break;case "identify":i.identify(g.externalId,g.attributes).catch(()=>{});break;case "updateUser":i.updateUser(g.attributes).catch(()=>{});break;case "logout":i.logout();break}});let c=-1;o.subscribe(()=>{o.unread!==c&&(c=o.unread,r(B({type:"unread",count:c})));});let d=0,p=async()=>{await o.boot();let u=o.getState().config;if(!u){let g=Math.min(nr*2**d,rr);d+=1,setTimeout(()=>{p();},g);return}d=0,Wt(u,document.documentElement),document.body.dataset.state="ready",r(B({type:"ready",primary:u.colors.primary,primaryForeground:u.colors.primaryForeground})),i.connect(g=>o.onRealtime(g),g=>{g&&o.refreshConversations();});};p();}var Xt=ir();Xt&&(sr(),or(Xt));})();