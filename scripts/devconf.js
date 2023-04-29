(()=>{"use strict";const e=e=>document.getElementById(e)?.cloneNode(!0)?.content,t=(e,t,n)=>{e.querySelector(t).innerText=n},n=(e,t,n,o,s,a)=>{const r=()=>{document.querySelector("div.popupBackdrop").classList.add("popupBackdropHidden"),document.removeEventListener("keydown",i);const e=document.querySelector('div[data-popup-content="yes"]');e?.parentNode?.removeChild(e),s?.call(void 0)},i=e=>{"Escape"===e.key&&r()};document.querySelector("div.popupClose").onclick=()=>{r()};const c=document.querySelector("div.popupBackdropHidden");c.addEventListener("click",r),e.forEach((e=>{const s=t(e);s?(n&&e.classList.add(n),e.onclick=()=>{c.classList.remove("popupBackdropHidden"),document.addEventListener("keydown",i);const e=document.querySelector("div.popupContent");e.querySelectorAll("div.popupBio").forEach((t=>{e.removeChild(t)})),s.setAttribute("data-popup-content","yes"),e.insertAdjacentElement("beforeend",s),a?.call(void 0,e)}):o&&e.classList.add(o)}))},o=async e=>{let t;const n=(e=>{const t=window.sessionStorage.getItem(`event${e}`);if(t)try{return JSON.parse(t)}catch{return void alert("Oh no! Something has gone horribly wrong. Please close and reopen your browser and try again.")}})(e);if(n)return n;if(navigator.onLine)try{const n=await fetch(`https://sessionize.com/api/v2/${e}/view/all`);n.ok&&(t=await n.json(),window.sessionStorage.setItem(`event${e}`,JSON.stringify(t)))}catch{alert("Oh no! Something has gone horribly wrong. Please reload your browser and try again.")}return t},s={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let a;const r=new Uint8Array(16);function i(){if(!a&&(a="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!a))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return a(r)}const c=[];for(let e=0;e<256;++e)c.push((e+256).toString(16).slice(1));const l=function(e,t,n){if(s.randomUUID&&!t&&!e)return s.randomUUID();const o=(e=e||{}).random||(e.rng||i)();if(o[6]=15&o[6]|64,o[8]=63&o[8]|128,t){n=n||0;for(let e=0;e<16;++e)t[n+e]=o[e];return t}return function(e,t=0){return(c[e[t+0]]+c[e[t+1]]+c[e[t+2]]+c[e[t+3]]+"-"+c[e[t+4]]+c[e[t+5]]+"-"+c[e[t+6]]+c[e[t+7]]+"-"+c[e[t+8]]+c[e[t+9]]+"-"+c[e[t+10]]+c[e[t+11]]+c[e[t+12]]+c[e[t+13]]+c[e[t+14]]+c[e[t+15]]).toLowerCase()}(o)};"undefined"==typeof fetch&&alert("Oh no 😢 We don't support your web browser. Please upgrade to a newer version!"),(async()=>{const s=document.getElementById("agenda");if(!s)return;const a=s.getAttribute("data-event-id");if(!a)return;let r;const i=e=>r.speakers.filter((t=>e.indexOf(t.id)>=0)),c=e=>{const t=i(e).map((e=>e.fullName));return 1===t.length?t[0]:`${t.filter(((e,n)=>n<t.length-1)).join(", ")} & ${t[t.length-1]}`},l=e=>{const t=i(e).map((e=>e.profilePicture));return 1===t.length?[]:t.slice(1)},d=e=>i(e)[0],u=e=>d(e).profilePicture,p=e=>r.sessions.filter((t=>t.id===e))[0],m=(e,t=!1)=>{const n=document.createElement("img");return n.src=e,n.classList.add("speaker-image"),t&&n.classList.add("hide"),n},g=(e,t,n=!1)=>{const o=document.createElement("div");o.setAttribute("x-imageset",""),o.classList.add("multi-speaker-container");const s=m(e);return s.classList.add("multi-speaker-image"),n&&s.classList.add("largePopupImage"),o.appendChild(s),t.forEach((e=>{const t=m(e,!0);t.classList.add("multi-speaker-image"),n&&t.classList.add("largePopupImage"),o.appendChild(t)})),o};r=await o(a),r&&(document.querySelectorAll(".agenda-session").forEach((t=>{const n=t,o=n.attributes["data-slot-id"].value,s=p(o);if(s)e("sessionCardTemplate").querySelectorAll("div").forEach((e=>{switch(e.className){case"agenda-session-image":{const t=l(s.speakers);if(t.length>0){const n=g(u(s.speakers),t);e.appendChild(n)}else e.appendChild(m(u(s.speakers)));break}case"agenda-session-name":e.innerText=c(s.speakers);break;case"agenda-session-title":e.innerText=s.title}n.insertAdjacentElement("beforeend",e)}));else{const t=e("tbaCardTemplate").querySelector("div");n.insertAdjacentElement("beforeend",t)}})),n(document.querySelectorAll(".agenda-session"),(n=>{const o=n.attributes["data-slot-id"].value;if(!o&&"0"===o)return null;const s=n.attributes["data-slot-id"].value,a=p(s),r=d(a.speakers),u=i(a.speakers).flatMap((e=>(e=>{const t=[];return e.links.forEach((e=>{const n=document.createElement("a");n.target="_blank",n.href=e.url;const o=document.createElement("img");switch(o.alt=e.title,e.title){case"Twitter":o.src="/public/images/icons8-twitter-50.png";break;case"LinkedIn":o.src="/public/images/icons8-linkedin-50.png";break;case"Blog":o.src="/public/images/icons8-website-50.png";break;default:o.src="/public/images/icons8-external-link-50.png"}n.appendChild(o),t.push(n)})),t})(e))),m=e("popupBioContent").firstElementChild,f=l(a.speakers);if(f.length>0){const e=m.querySelector("img.largePopupImage");e.classList.add("hide");const t=g(r.profilePicture,f,!0);e.insertAdjacentElement("afterend",t)}else m.querySelector("img.largePopupImage").src=r.profilePicture;t(m,"div.bio-speaker",c(a.speakers));const y=m.querySelector("div.bio-social");u.forEach((e=>{y.appendChild(e)}));const h=(e=>{const t=i(e).map((e=>e.bio));return 1===t.length?t[0]:t.join(" <hr/> ")})(a.speakers);return 0===f.length&&t(m,"div.bio-tagline",r.tagLine),t(m,"div.bio-title",a.title),t(m,"div.bio-talk-description",a.description),t(m,"div.bio-speaker-bio",h),m}),"clickable-session","unclickable-session"),document.querySelectorAll(".agenda-row-style-loading").forEach((e=>{e.style.display="none"})),document.querySelectorAll(".agenda > .hidden-row").forEach((e=>{e.style.display="grid"})),setInterval((()=>{Array.from(document.querySelectorAll("div[x-imageSet]")).forEach((e=>{const t=e.querySelectorAll("img"),n=Array.from(t).findIndex((e=>!e.classList.contains("hide")));(e=>{let t=1;const n=()=>{t<=.1?e.classList.add("hide"):(e.style.opacity=t.toString(),t-=.025*t,requestAnimationFrame(n))};n()})(t[n]);let o=n+1;o>=t.length&&(o=0),(e=>{let t=.1;e.classList.remove("hide");const n=()=>{t>=1||(e.style.opacity=t.toString(),t+=.025*t,requestAnimationFrame(n))};n()})(t[o])}))}),3500))})(),(async()=>{const s=document.getElementById("feedbackStage");if(!s)return;const a=await fetch("/public/ratingconfig.json");if(!a.ok)return;const r=s.getAttribute("data-rating-id");if(!r)return;const i=s.getAttribute("data-event-id");if(!i)return;const c=document.getElementById("sessionData").innerText.trim().split(" "),d=await o(i),u=document.getElementById("workshopData").innerText.trim().split(";;;").map((e=>e.trim())),p=window.localStorage.getItem(`rating${r}`);let m;m=p?JSON.parse(p):{event:r,submitter:l()};const g=e=>{const t=d.sessions.find((t=>t.id===e)),n=t.speakers.map((e=>d.speakers.find((t=>t.id===e)).fullName)).join(" and ");return`${t.title} by ${n}`},f=(e,t,n)=>{m[`s${e}`]||(m[`s${e}`]={}),m[`s${e}`][t]=n,window.localStorage.setItem(`rating${r}`,JSON.stringify(m))},y=await a.json();y.structure.forEach(((n,o)=>{let a,r=!1;if(void 0!==n.workshop){const e=u[n.workshop];"none"!==e&&(r=!0,a=e)}else r=!0;if(r){const r=e("feedbackButton").querySelector("div");r.setAttribute("data-id",o.toString()),t(r,".feedbackButtonTitle",n.title);const i=Object.keys(m[`s${o}`]||{}).length;t(r,".feedbackButtonProgressBar",`Questions Completed ${i} / ${n.questions.length}`),a&&t(r,".feedbackButtonWorkshop",a),s.insertAdjacentElement("beforeend",r)}})),n(document.querySelectorAll(".feedbackButton"),(n=>{const o=+n.attributes["data-id"].value,s=e("feedbackPopup").firstElementChild,a=y.structure[o];return t(s,"div.feedbackTitle",`Feedback for ${a.title}`),a.questions.forEach((n=>{const a=e("questionTemplate").firstElementChild;t(a,"div.questionTitle",n.label);const r=e(`${n.type}QuestionStyleTemplate`).firstElementChild;switch(n.type){case"email":((e,t,n)=>{const o=m[`s${n}`]?.[t.id];o&&(e.value=o),e.onchange=()=>{const{value:o}=e;o&&f(n,t.id,o)}})(r,n,o);break;case"level":case"role":case"influence":((e,t,n)=>{const o=m[`s${n}`]?.[t.id];o&&e.querySelectorAll("option").forEach((e=>{e.value===o&&(e.selected=!0)})),e.onchange=()=>{f(n,t.id,e.value)}})(r,n,o);break;case"text":((e,t,n)=>{const o=m[`s${n}`]?.[t.id];o&&(e.value=o),e.onchange=()=>{const{value:o}=e;o&&f(n,t.id,o)}})(r,n,o);break;case"rate":((e,t,n)=>{const o=e.querySelector('input[type="range"]'),s=m[`s${n}`]?.[t.id];s&&(o.value=s),o.oninput=()=>{console.log("update");const e=o.value;e&&f(n,t.id,e)}})(r,n,o);break;case"yesno":((e,t,n)=>{const o=m[`s${n}`]?.[t.id];o&&(e.querySelector(`input[name="yesno"][value="${o}"]`).checked=!0),e.onchange=()=>{const o=e.querySelector('input[name="yesno"]:checked')?.value;o&&f(n,t.id,o)}})(r,n,o);break;case"years":((e,t,n)=>{const o=m[`s${n}`]?.[t.id];o&&(e.value=o),e.onchange=()=>{const{value:o}=e;if(o){let e;try{e=+o}catch{}e&&f(n,t.id,o)}}})(r,n,o);break;case"timeslot-selector":((e,t,n)=>{const o=5*t.key+1,s=o+5;for(let t=o;t<s;t++){const n=c[t],o=document.createElement("option");o.value=n,o.text=g(n),e.append(o)}const a=m[`s${n}`]?.[t.id];a&&e.querySelectorAll("option").forEach((e=>{e.value===a&&(e.selected=!0)})),e.onchange=()=>{f(n,t.id,e.value)}})(r,n,o)}r&&a.insertAdjacentElement("beforeend",r),s.insertAdjacentElement("beforeend",a)})),s}),void 0,void 0,(()=>{document.querySelectorAll("div.feedbackButton").forEach((e=>{const n=+e.attributes["data-id"].value,o=Object.keys(m[`s${n}`]||{}).length;t(e,".feedbackButtonProgressBar",`Questions Completed ${o} / ${y.structure[n].questions.length}`)}))}),(e=>{e.querySelectorAll('input[type="range"]').forEach((e=>{e.dispatchEvent(new Event("input"))}))})),(()=>{const e=document.getElementById("saveDataButton");e.onclick=t=>{e.innerText="Saving...",e.disabled=!0,t.preventDefault(),grecaptcha.ready((async()=>{const t=await grecaptcha.execute("6LfkPcUlAAAAAHwYs14fkTiEZYsu5hAAq_bLKp-j",{action:"submit"});m.captcha=t,(await fetch("https://ratings-2slkxdorza-nw.a.run.app",{method:"POST",body:JSON.stringify(m)})).ok?(e.disabled=!1,e.innerText="Save Complete",setTimeout((()=>{e.innerText="Save"}),2e3)):(e.innerText="Save",e.disabled=!1,alert("Oh no! Something has gone horribly wrong. Please reload your browser and try again."))}))}})()})(),(()=>{const e=document.getElementsByClassName("sponsor-content-detail-wide-body")[0];if(!e)return;let t=0;setInterval((()=>{t+=.25,t>e.scrollWidth&&(t=0),e.scrollTo(t,0)}),10)})()})();