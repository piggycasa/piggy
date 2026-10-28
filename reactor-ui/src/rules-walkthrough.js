/** Explanatory practice only. Never connects a wallet or touches game state. */
import './intuitive-rules.css';
import { costForExactKeys } from './solana-curve.mjs';
import { formatSol } from './sol-format.mjs';
const dialog=document.querySelector('#rules-dialog');
const tabs=[...dialog.querySelectorAll('[data-learn-step]')],panels=[...dialog.querySelectorAll('[data-learn-panel]')];
let current=0;
function show(index,{focus=false}={}){
 current=Math.max(0,Math.min(3,index));
 tabs.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===current));button.tabIndex=i===current?0:-1;});panels.forEach((panel,i)=>panel.hidden=i!==current);
 dialog.querySelector('#learn-prev').disabled=current===0;dialog.querySelector('#learn-next').textContent=['Then someone else buys →','Run the clock to zero →','Why buy earlier? →','Got it — back to PIGGY'][current];dialog.querySelector('#learn-step-count').textContent=`${current+1} of 4`;
 const later=current>0,ended=current===2;dialog.querySelector('#learn-round').hidden=current===3;
 dialog.querySelector('#learn-other-keys').textContent=later?'1':'0';dialog.querySelector('#learn-other-unit').textContent=later?'key':'keys';dialog.querySelector('#learn-current-leader').textContent=later?'Another buyer':'You';dialog.querySelector('#learn-leader-label').textContent=ended?'Wins the jackpot':'Would win if nobody buys again';dialog.querySelector('#learn-practice-clock').textContent=ended?'00:00':later?'1:05:30':'1:05:00';dialog.querySelector('#learn-key-share').textContent=later?'90.9%':'100%';dialog.querySelector('#learn-share-fill').style.width=later?'90.9%':'100%';
 for(const[id,leading]of[['#learn-you',!later],['#learn-other',later]]){const node=dialog.querySelector(id);node.classList.toggle('is-leading',leading);node.querySelector('.learn-crown').hidden=!leading;}
 if(focus)tabs[current].focus();
}
tabs.forEach((button,i)=>{button.addEventListener('click',()=>show(i));button.addEventListener('keydown',event=>{const map={ArrowRight:(current+1)%4,ArrowLeft:(current+3)%4,Home:0,End:3};if(event.key in map){event.preventDefault();show(map[event.key],{focus:true});}});});
dialog.querySelector('#learn-prev').addEventListener('click',()=>show(current-1));dialog.querySelector('#learn-next').addEventListener('click',()=>current===3?dialog.close():show(current+1));
const examples=new Map([0,100,1000,10000].map(value=>[String(value),costForExactKeys(BigInt(value)*1_000_000_000n,1000n).lamports]));
const max=Number(examples.get('10000'));
function curve(value){const amount=examples.get(String(value));if(amount===undefined)return;dialog.querySelector('#learn-curve-cost').textContent=formatSol(Number(amount));dialog.querySelectorAll('[data-curve-funding]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.curveFunding===String(value))));dialog.querySelectorAll('[data-curve-bar]').forEach(bar=>{bar.style.height=`${Number(examples.get(bar.dataset.curveBar))/max*100}%`;bar.classList.toggle('is-selected',bar.dataset.curveBar===String(value));});}
dialog.querySelectorAll('[data-curve-funding]').forEach(button=>button.addEventListener('click',()=>curve(button.dataset.curveFunding)));
dialog.addEventListener('close',()=>{show(0);curve('0');});show(0);curve('0');
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-learn-open]');if(!trigger)return;const step=Number(trigger.dataset.learnOpen);if(Number.isInteger(step))show(step);});
// Detailed practice opens only when requested from How it works.
