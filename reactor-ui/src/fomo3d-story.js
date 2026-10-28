import './konterball-fonts.css';
import './fomo3d-story.css';
const chapters=[...document.querySelectorAll('.story-chapter')],nav=[...document.querySelectorAll('[data-chapter]')];
let current=0;
function show(index,{focus=false,replace=false}={}){
  current=Math.min(chapters.length-1,Math.max(0,index));
  chapters.forEach((chapter,i)=>{chapter.hidden=i!==current;});
  nav.forEach((button,i)=>{if(i===current)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  document.querySelector('#story-previous').disabled=current===0;
  document.querySelector('#story-next').disabled=current===chapters.length-1;
  document.querySelector('#story-position').textContent=`Chapter ${current+1} of ${chapters.length}`;
  document.title=`${chapters[current].querySelector('h1,h2').textContent.replace(/\s+/g,' ')} — PIGGY`;
  history[replace?'replaceState':'pushState'](null,'',`#${chapters[current].id}`);
  if(focus){const title=chapters[current].querySelector('h1,h2');title.tabIndex=-1;title.focus({preventScroll:true});}
}
function fromHash(){const index=chapters.findIndex(chapter=>`#${chapter.id}`===location.hash);show(index<0?0:index,{replace:true});}
nav.forEach((button,i)=>button.addEventListener('click',()=>show(i,{focus:true})));
document.querySelector('#story-previous').addEventListener('click',()=>show(current-1,{focus:true}));
document.querySelector('#story-next').addEventListener('click',()=>show(current+1,{focus:true}));
window.addEventListener('popstate',fromHash);
const sources=document.querySelector('#story-sources');
document.querySelectorAll('[data-sources]').forEach(button=>button.addEventListener('click',()=>sources.showModal()));
document.querySelector('#close-sources').addEventListener('click',()=>sources.close());
document.addEventListener('keydown',event=>{if(sources.open||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('button,a,input,select,textarea'))return;if(event.key==='ArrowRight'){event.preventDefault();show(current+1,{focus:true});}if(event.key==='ArrowLeft'){event.preventDefault();show(current-1,{focus:true});}});
const roles=[...document.querySelectorAll('[data-role]')];
function role(index,{focus=false}={}){roles.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});const last=index===1;document.querySelector('#role-panel').classList.toggle('role-last',last);document.querySelector('#role-panel').setAttribute('aria-labelledby',roles[index].id);document.querySelector('#role-headline').textContent=last?'The jackpot at zero':'A cut of later buys';document.querySelector('#role-description').textContent=last?'Be the final buyer when time runs out. A later purchase takes the lead and extends the round.':'Your existing keys keep earning even after somebody else takes the lead.';document.querySelector('#role-note').textContent=last?'Buying more keys increases the reward share, not a guarantee of winning.':'No new buys means no new buy-funded dividends.';if(focus)roles[index].focus();}
roles.forEach((button,i)=>{button.addEventListener('click',()=>role(i));button.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();role(event.key==='Home'?0:event.key==='End'?1:1-i,{focus:true});}});});
fromHash();

const compareButtons=[...document.querySelectorAll('[data-compare]')];
function compare(kind,{focus=false}={}){document.querySelector('#comparison-result').setAttribute('aria-labelledby',kind==='game'?'compare-game':'compare-rewards');document.querySelector('#compare').classList.toggle('compare-rewards',kind==='rewards');compareButtons.forEach(button=>{const selected=button.dataset.compare===kind;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;if(selected&&focus)button.focus();});}
compareButtons.forEach(button=>{button.addEventListener('click',()=>compare(button.dataset.compare));button.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();compare(event.key==='Home'?'game':event.key==='End'?'rewards':button.dataset.compare==='game'?'rewards':'game',{focus:true});}});});
