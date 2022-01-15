(()=>{"use strict";"undefined"==typeof fetch&&alert("Oh no 😢 We don't support your web browser. Please upgrade to a newer version!");const e=document.getElementById("agenda");if(e){const t=e.getAttribute("data-event-id");t&&function(e,t){let n;const s=e=>document.getElementById(e).cloneNode(!0).content,o=e=>n.speakers.filter((t=>e.indexOf(t.id)>=0)),a=e=>{const t=o(e).map((e=>e.fullName));return 1===t.length?t[0]:t.filter(((e,n)=>n<t.length-1)).join(", ")+" & "+t[t.length-1]},i=e=>{const t=o(e).map((e=>e.profilePicture));return 1===t.length?[]:t.slice(1)},r=e=>o(e)[0],c=()=>{document.querySelector("div.popupBackdrop").classList.add("popupBackdropHidden"),document.removeEventListener("keydown",l)},l=e=>{"Escape"===e.key&&c()},d=(e,t,n)=>{e.querySelector(t).innerHTML=n},p=()=>{document.querySelector("div.popupClose").onclick=e=>{c()};const e=document.querySelector("div.popupBackdropHidden");e.addEventListener("click",c),document.querySelectorAll(".agenda-session").forEach((t=>{const n=t,c=t.attributes["data-slot-id"].value;c&&"0"!==c?(n.classList.add("clickable-session"),n.onclick=t=>{const c=n.attributes["data-slot-id"].value,p=u(c);e.classList.remove("popupBackdropHidden"),document.addEventListener("keydown",l);const g=document.querySelector("div.popupContent");g.querySelectorAll("div.popupBio").forEach((e=>{g.removeChild(e)}));const m=r(p.speakers),b=(e=>{const t=[];return e.links.forEach((e=>{const n=document.createElement("a");n.target="_blank",n.href=e.url;const s=document.createElement("img");switch(s.alt=e.title,e.title){case"Twitter":s.src="/public/images/icons8-twitter-50.png";break;case"LinkedIn":s.src="/public/images/icons8-linkedin-50.png";break;case"Blog":s.src="/public/images/icons8-website-50.png";break;default:s.src="/public/images/icons8-external-link-50.png"}n.appendChild(s),t.push(n)})),t})(m),h=s("popupBioContent").firstElementChild,k=h.querySelector("img.largePopupImage");k.src=m.profilePicture;const f=i(p.speakers);f.length>0&&k.setAttribute("x-altImage",f[0]),d(h,"div.bio-speaker",a(p.speakers));const y=h.querySelector("div.bio-social");b.forEach((e=>{y.appendChild(e)}));const v=(e=>{const t=o(e).map((e=>e.bio));return 1===t.length?t[0]:t.join(" <br/> ")})(p.speakers);d(h,"div.bio-tagline",m.tagLine),d(h,"div.bio-title",p.title),d(h,"div.bio-talk-description",p.description),d(h,"div.bio-speaker-bio",v),g.insertAdjacentElement("beforeend",h)}):n.classList.add("unclickable-session")}))},u=e=>n.sessions.filter((t=>t.id===e))[0],g=e=>{n=e,document.querySelectorAll(".agenda-session").forEach(((e,t)=>{const n=e,o=n.attributes["data-slot-id"].value,c=u(o);if(c)s("sessionCardTemplate").querySelectorAll("div").forEach((e=>{switch(e.className){case"agenda-session-image":{const n=document.createElement("img");n.src=(t=c.speakers,r(t).profilePicture);const s=i(c.speakers);s.length>0&&n.setAttribute("x-altImage",s[0]),n.classList.add("speaker-image"),e.appendChild(n);break}case"agenda-session-name":e.innerText=a(c.speakers);break;case"agenda-session-title":e.innerText=c.title}var t;n.insertAdjacentElement("beforeend",e)}));else{const e=s("tbaCardTemplate").querySelector("div");n.insertAdjacentElement("beforeend",e)}})),p(),document.querySelectorAll(".agenda-row-style-loading").forEach((e=>{e.style.display="none"})),document.querySelectorAll(".agenda > .hidden-row").forEach((e=>{e.style.display="grid"}))},m=()=>{const t=window.sessionStorage.getItem(`event${e}`);if(t){const e=JSON.parse(t);g(e)}else alert("Oh no! Something has gone horribly wrong. Please reload your browser and try again.")};navigator.onLine?fetch(`https://sessionize.com/api/v2/${e}/view/all`).then((t=>{switch(t.status){case 200:t.json().then((e=>e)).then((t=>{window.sessionStorage.setItem(`event${e}`,JSON.stringify(t)),g(t)}));break;case 304:m()}})):m(),setInterval((()=>{Array.from(document.getElementsByTagName("img")).filter((e=>null!==e.getAttribute("x-altImage"))).forEach((e=>{const t=e.src;e.src=e.getAttribute("x-altImage"),e.setAttribute("x-altImage",t)}))}),2500)}(t)}})();