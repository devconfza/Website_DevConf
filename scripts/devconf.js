!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";function r(e,t){var n=function(e){return document.getElementById(e).cloneNode(!0).content},r=function(e){var r=e.rooms.length;t.style.gridTemplateColumns=e.rooms.map(function(){return"auto"}).join(" "),e.sessions.map(function(t,o){return t.isServiceSession?function(e,t){var r=n("breakTeamplate"),o=r.querySelector("div.break");return o.textContent=e.title,o.style.gridColumnEnd="span "+t,r}(t,r):function(e,t,r){var o=n("sessionTemplate");o.querySelector("span.talkTitle").textContent=e.title;var i=e.speakers.map(function(e){return t.filter(function(t){return t.id===e})[0]}),u=o.querySelector("div.talkImages");if(i.map(function(e){var t=document.createElement("img");return t.classList.add("profileImage"),t.src=e.profilePicture,t.alt="Profile picture of "+e.fullName,t}).forEach(function(e){return u.appendChild(e)}),o.querySelector("span.talkSpeaker").innerHTML=i.map(function(e){return e.fullName}).join("<br/>"),e.isPlenumSession){var a=o.querySelector("div.session");a.classList.add("highlight"),a.style.gridColumnEnd="span "+r}return o}(t,e.speakers,r)}).forEach(function(e){t.appendChild(document.importNode(e,!0))})},o=function(){var t=window.sessionStorage.getItem("event"+e);if(t){var n=JSON.parse(t);r(n)}};navigator.onLine?fetch("https://sessionize.com/api/v2/"+e+"/view/all").then(function(t){switch(t.status){case 200:t.json().then(function(e){return e}).then(function(t){window.sessionStorage.setItem("event"+e,JSON.stringify(t)),r(t)});break;case 304:o()}}):o()}n.r(t),n.d(t,"loadEventSessions",function(){return r}),"undefined"==typeof fetch&&alert("Oh no 😢 We don't support your web browser. Please upgrade to a newer version!")}]);