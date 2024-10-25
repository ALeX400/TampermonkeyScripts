// ==UserScript==
// @name         17Buddies Auto Map Downloader
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Replace the normal download behavior with an automatic downloader script on 17Buddies.rocks
// @author       @LeX
// @match        https://www.17buddies.rocks/*
// @grant        none
// ==/UserScript==

(function(){'use strict';function a(){const b=document.querySelectorAll(".MapBtn.MapDown");b.forEach(c=>{c.removeAttribute("onclick"),c.addEventListener("click",function(d){d.preventDefault(),d.stopPropagation();const e=document.getElementById("Loading");e&&(e.style.display="block"),(function(){const f="https://www.17buddies.rocks/17b2/",g="Map",h=window.location.href.match(/\/Map\/(\d+)\//)[1],i=1,j="x",k=f+"Push/PreDown/"+g+"/"+h+"/"+j+"/"+i+"/index.html",l=window.location.href.match(/\/([^\/]+)\.html$/)[1];async function m(){try{let n=await fetch(k);if(!n.ok)return;let o=await n.text(),p=o.split("|"),q=p[2];for(;;)if(await r(q))return}finally{e&&(e.style.display="none")}}async function r(s){try{let t=await fetch(f+"Get/"+s+".zip");if(!t.ok)return!1;let u=await t.arrayBuffer(),v=new Blob([u],{type:t.headers.get("content-type")||"application/octet-stream"});return w(v,l+".zip"),!0}catch{return!1}}function w(x,y){var z=document.createElement("a");z.href=window.URL.createObjectURL(x),z.download=y,document.body.appendChild(z),z.click(),document.body.removeChild(z)}m()})()})})}window.addEventListener("load",a)})();
