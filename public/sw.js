if(!self.define){let e,s={};const n=(n,r)=>(n=new URL(n+".js",r).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(r,i)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(s[c])return;let d={};const o=e=>n(e,c),a={module:{uri:c},exports:d,require:o};s[c]=Promise.all(r.map((e=>a[e]||o(e)))).then((e=>(i(...e),d)))}}define(["./workbox-21ffec5e"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/favicon.png",revision:"45918b2d99821949e97083d57ed05647"},{url:"assets/icon512_maskable.png",revision:"f58d1fe5404467645c8babb6b0c54257"},{url:"assets/icon512_rounded.png",revision:"1be0f31767e0ac76edfa142da7da40ac"},{url:"assets/screenshot-narrow-2.png",revision:"b99d6a38db2895d2532acde56e5145ff"},{url:"assets/screenshot-narrow.png",revision:"e4eaa2716024eab864a879e5e0d22aef"},{url:"assets/screenshot-wide-2.png",revision:"5d197abcd4cb569bce4503eea054dd6d"},{url:"assets/screenshot-wide.png",revision:"060d77db7c49beef2ad30b3e4d001196"},{url:"index.html",revision:"d7c4ecf43ebfb632011080c1e4f4e153"},{url:"style.css",revision:"e57e5ccd0f8e15903a52a2a71ac10007"},{url:"style.src.css",revision:"c60c479e8a39bba60a0d2d2cd1d3d75c"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.registerRoute(/\/$/,new e.NetworkFirst({cacheName:"my-cache-index",plugins:[]}),"GET")}));
//# sourceMappingURL=sw.js.map