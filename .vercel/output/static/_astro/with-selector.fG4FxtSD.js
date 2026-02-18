import{r as z,g as A}from"./index.Dr7TU7rC.js";var j={exports:{}},R={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var J;function F(){if(J)return R;J=1;var u=Symbol.for("react.transitional.element"),E=Symbol.for("react.fragment");function S(p,n,i){var v=null;if(i!==void 0&&(v=""+i),n.key!==void 0&&(v=""+n.key),"key"in n){i={};for(var d in n)d!=="key"&&(i[d]=n[d])}else i=n;return n=i.ref,{$$typeof:u,type:p,key:v,ref:n!==void 0?n:null,props:i}}return R.Fragment=E,R.jsx=S,R.jsxs=S,R}var M;function G(){return M||(M=1,j.exports=F()),j.exports}var H=G(),y={exports:{}},w={},q={exports:{}},k={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var W;function I(){if(W)return k;W=1;var u=z();function E(e,r){return e===r&&(e!==0||1/e===1/r)||e!==e&&r!==r}var S=typeof Object.is=="function"?Object.is:E,p=u.useState,n=u.useEffect,i=u.useLayoutEffect,v=u.useDebugValue;function d(e,r){var o=r(),a=p({inst:{value:o,getSnapshot:r}}),t=a[0].inst,l=a[1];return i(function(){t.value=o,t.getSnapshot=r,x(t)&&l({inst:t})},[e,o,r]),n(function(){return x(t)&&l({inst:t}),e(function(){x(t)&&l({inst:t})})},[e]),v(o),o}function x(e){var r=e.getSnapshot;e=e.value;try{var o=r();return!S(e,o)}catch{return!0}}function s(e,r){return r()}var c=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?s:d;return k.useSyncExternalStore=u.useSyncExternalStore!==void 0?u.useSyncExternalStore:c,k}var C;function L(){return C||(C=1,q.exports=I()),q.exports}/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var O;function P(){if(O)return w;O=1;var u=z(),E=L();function S(s,c){return s===c&&(s!==0||1/s===1/c)||s!==s&&c!==c}var p=typeof Object.is=="function"?Object.is:S,n=E.useSyncExternalStore,i=u.useRef,v=u.useEffect,d=u.useMemo,x=u.useDebugValue;return w.useSyncExternalStoreWithSelector=function(s,c,e,r,o){var a=i(null);if(a.current===null){var t={hasValue:!1,value:null};a.current=t}else t=a.current;a=d(function(){function V(f){if(!T){if(T=!0,h=f,f=r(f),o!==void 0&&t.hasValue){var m=t.value;if(o(m,f))return _=m}return _=f}if(m=_,p(h,f))return m;var D=r(f);return o!==void 0&&o(m,D)?(h=f,m):(h=f,_=D)}var T=!1,h,_,b=e===void 0?null:e;return[function(){return V(c())},b===null?void 0:function(){return V(b())}]},[c,e,r,o]);var l=n(s,a[0],a[1]);return v(function(){t.hasValue=!0,t.value=l},[l]),x(l),l},w}var $;function U(){return $||($=1,y.exports=P()),y.exports}var Y=U();const N=A(Y);export{H as j,N as u,Y as w};
