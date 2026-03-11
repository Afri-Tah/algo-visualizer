import React, { useState, useEffect, useRef, useCallback } from "react";

const P = {
  bg: "#fdf6f0",
  panel: "#ffffff",
  border: "#e8d5c4",
  accent: "#b76e79",
  accent2: "#d4956a",
  accent3: "#8faf8f",
  accent4: "#9b7fa6",
  text: "#3d2b2b",
  muted: "#a89080",
  rose: "#b76e79",
  gold: "#c9a96e",
  blush: "#f2d4d4",
  cream: "#fdf6f0",
};

const phaseColor = { init: P.accent3, compare: P.accent2, update: P.accent, swap: P.accent4, result: P.accent };

function lisSteps(arr){const n=arr.length,dp=Array(n).fill(1),prev=Array(n).fill(-1),steps=[];steps.push({arr:[...arr],dp:[...dp],comparing:[],active:[],phase:"init",msg:"Initialize dp[i]=1 — every element is its own subsequence."});for(let i=1;i<n;i++)for(let j=0;j<i;j++){steps.push({arr:[...arr],dp:[...dp],comparing:[i,j],active:[],phase:"compare",msg:`arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}?`});if(arr[j]<arr[i]&&dp[j]+1>dp[i]){dp[i]=dp[j]+1;prev[i]=j;steps.push({arr:[...arr],dp:[...dp],comparing:[i,j],active:[i],phase:"update",msg:`✓ dp[${i}]=${dp[i]}`});}}const mx=Math.max(...dp);let ix=dp.indexOf(mx);const path=[];while(ix!==-1){path.unshift(ix);ix=prev[ix];}steps.push({arr:[...arr],dp:[...dp],comparing:[],active:path,phase:"result",msg:`✓ LIS=${mx}: [${path.map(i=>arr[i]).join(", ")}]`});return{steps,result:mx};}
function bubbleSteps(arr){const a=[...arr],n=a.length,s=new Set(),steps=[];steps.push({arr:[...a],comparing:[],sorted:new Set(),swapped:[],phase:"init",msg:"Bubble Sort — compare adjacent pairs."});for(let i=0;i<n-1;i++){for(let j=0;j<n-i-1;j++){steps.push({arr:[...a],comparing:[j,j+1],sorted:new Set(s),swapped:[],phase:"compare",msg:`Compare ${a[j]} and ${a[j+1]}`});if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[j,j+1],phase:"swap",msg:`Swap!`});}}s.add(n-1-i);}s.add(0);steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[],phase:"result",msg:`✓ Sorted: [${a.join(", ")}]`});return{steps,result:[...a]};}
function selectionSteps(arr){const a=[...arr],n=a.length,s=new Set(),steps=[];steps.push({arr:[...a],comparing:[],sorted:new Set(),swapped:[],phase:"init",msg:"Selection Sort — find minimum each pass."});for(let i=0;i<n-1;i++){let m=i;for(let j=i+1;j<n;j++){steps.push({arr:[...a],comparing:[j,m],sorted:new Set(s),swapped:[],phase:"compare",msg:`${a[j]}<${a[m]}? ${a[j]<a[m]?"Yes!":"No."}`});if(a[j]<a[m])m=j;}if(m!==i){[a[i],a[m]]=[a[m],a[i]];steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[i,m],phase:"swap",msg:`Swap a[${i}]↔a[${m}]`});}s.add(i);}s.add(n-1);steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[],phase:"result",msg:`✓ Sorted: [${a.join(", ")}]`});return{steps,result:[...a]};}
function insertionSteps(arr){const a=[...arr],n=a.length,steps=[];steps.push({arr:[...a],comparing:[],sorted:new Set([0]),swapped:[],phase:"init",msg:"Insertion Sort — insert each element into sorted portion."});for(let i=1;i<n;i++){const key=a[i];let j=i-1;steps.push({arr:[...a],comparing:[i],sorted:new Set(Array.from({length:i},(_,k)=>k)),swapped:[],phase:"compare",msg:`key=${key}`});while(j>=0&&a[j]>key){a[j+1]=a[j];j--;steps.push({arr:[...a],comparing:[j+1],sorted:new Set(Array.from({length:i},(_,k)=>k)),swapped:[j+1,j+2],phase:"swap",msg:`Shift ${a[j+1]}`});}a[j+1]=key;steps.push({arr:[...a],comparing:[],sorted:new Set(Array.from({length:i+1},(_,k)=>k)),swapped:[j+1],phase:"update",msg:`Insert ${key} at ${j+1}`});}steps.push({arr:[...a],comparing:[],sorted:new Set(Array.from({length:a.length},(_,k)=>k)),swapped:[],phase:"result",msg:`✓ Sorted: [${a.join(", ")}]`});return{steps,result:[...a]};}
function quickSteps(arr){const a=[...arr],s=new Set(),steps=[];steps.push({arr:[...a],comparing:[],sorted:new Set(),swapped:[],pivot:-1,phase:"init",msg:"Quick Sort — pick pivot, partition, recurse."});function part(lo,hi){const pv=a[hi];steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[],pivot:hi,phase:"compare",msg:`Pivot=${pv}`});let i=lo-1;for(let j=lo;j<hi;j++){steps.push({arr:[...a],comparing:[j,hi],sorted:new Set(s),swapped:[],pivot:hi,phase:"compare",msg:`${a[j]}≤${pv}?`});if(a[j]<=pv){i++;[a[i],a[j]]=[a[j],a[i]];if(i!==j)steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[i,j],pivot:hi,phase:"swap",msg:`Swap`});};}[a[i+1],a[hi]]=[a[hi],a[i+1]];s.add(i+1);steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[i+1,hi],pivot:i+1,phase:"update",msg:`Pivot placed at ${i+1}`});return i+1;}function qs(lo,hi){if(lo>=hi){if(lo===hi)s.add(lo);return;}const p=part(lo,hi);qs(lo,p-1);qs(p+1,hi);}qs(0,a.length-1);steps.push({arr:[...a],comparing:[],sorted:new Set(Array.from({length:a.length},(_,k)=>k)),swapped:[],pivot:-1,phase:"result",msg:`✓ Sorted: [${a.join(", ")}]`});return{steps,result:[...a]};}
function mergeSteps(arr){const a=[...arr],steps=[];steps.push({arr:[...a],comparing:[],merging:[],phase:"init",msg:"Merge Sort — divide in half, merge sorted halves."});function mg(lo,mid,hi){const L=a.slice(lo,mid+1),R=a.slice(mid+1,hi+1);steps.push({arr:[...a],comparing:[],merging:Array.from({length:hi-lo+1},(_,k)=>lo+k),phase:"compare",msg:`Merge [${L}]+[${R}]`});let i=0,j=0,k=lo;while(i<L.length&&j<R.length){a[k++]=L[i]<=R[j]?L[i++]:R[j++];steps.push({arr:[...a],comparing:[],merging:Array.from({length:hi-lo+1},(_,kk)=>lo+kk),phase:"update",msg:`Placed ${a[k-1]}`});}while(i<L.length)a[k++]=L[i++];while(j<R.length)a[k++]=R[j++];}function ms(lo,hi){if(lo>=hi)return;const mid=Math.floor((lo+hi)/2);steps.push({arr:[...a],comparing:[],merging:[],phase:"compare",msg:`Split [${lo}..${hi}]`});ms(lo,mid);ms(mid+1,hi);mg(lo,mid,hi);}ms(0,a.length-1);steps.push({arr:[...a],comparing:[],merging:[],sorted:new Set(Array.from({length:a.length},(_,k)=>k)),phase:"result",msg:`✓ Sorted: [${a.join(", ")}]`});return{steps,result:[...a]};}
function bsearchSteps(arr,target){const s=[...arr].sort((a,b)=>a-b),steps=[];steps.push({arr:s,lo:0,hi:s.length-1,mid:-1,found:-1,target,phase:"init",msg:`Search ${target} in [${s.join(", ")}]`});let lo=0,hi=s.length-1;while(lo<=hi){const mid=Math.floor((lo+hi)/2);steps.push({arr:s,lo,hi,mid,found:-1,target,phase:"compare",msg:`mid=${mid}, val=${s[mid]}`});if(s[mid]===target){steps.push({arr:s,lo,hi,mid,found:mid,target,phase:"result",msg:`✓ Found at index ${mid}!`});return{steps,result:mid};}else if(s[mid]<target){lo=mid+1;steps.push({arr:s,lo,hi,mid,found:-1,target,phase:"update",msg:`Go right. lo=${lo}`});}else{hi=mid-1;steps.push({arr:s,lo,hi,mid,found:-1,target,phase:"update",msg:`Go left. hi=${hi}`;});}}steps.push({arr:s,lo,hi,mid:-1,found:-1,target,phase:"result",msg:`✗ Not found.`});return{steps,result:-1};}
function lcsSteps(s1,s2){const m=s1.length,n=s2.length,steps=[];const dp=Array.from({length:m+1},()=>Array(n+1).fill(0));steps.push({dp:dp.map(r=>[...r]),cell:null,s1,s2,phase:"init",msg:"LCS DP table initialized."});for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){const match=s1[i-1]===s2[j-1];dp[i][j]=match?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);steps.push({dp:dp.map(r=>[...r]),cell:[i,j],s1,s2,phase:match?"update":"compare",msg:match?`✓ '${s1[i-1]}'='${s2[j-1]}' dp=${dp[i][j]}`:`No match, max=${dp[i][j]}`});}steps.push({dp:dp.map(r=>[...r]),cell:[m,n],s1,s2,phase:"result",msg:`✓ LCS length = ${dp[m][n]}`});return{steps,result:dp[m][n]};}
function knapsackSteps(w,v,cap){const n=w.length,steps=[];const dp=Array.from({length:n+1},()=>Array(cap+1).fill(0));steps.push({dp:dp.map(r=>[...r]),cell:null,phase:"init",msg:"Knapsack DP initialized."});for(let i=1;i<=n;i++)for(let ww=0;ww<=cap;ww++){if(w[i-1]<=ww){const t=dp[i-1][ww-w[i-1]]+v[i-1],sk=dp[i-1][ww];dp[i][ww]=Math.max(t,sk);steps.push({dp:dp.map(r=>[...r]),cell:[i,ww],phase:t>=sk?"update":"compare",msg:`Item${i}: take=${t} skip=${sk} →${dp[i][ww]}`});}else{dp[i][ww]=dp[i-1][ww];steps.push({dp:dp.map(r=>[...r]),cell:[i,ww],phase:"compare",msg:`Item${i} too heavy`});}}steps.push({dp:dp.map(r=>[...r]),cell:null,phase:"result",msg:`✓ Max value = ${dp[n][cap]}`});return{steps,result:dp[n][cap]};}
const GD={nodes:[{id:0,label:"A",x:280,y:55},{id:1,label:"B",x:140,y:165},{id:2,label:"C",x:420,y:165},{id:3,label:"D",x:60,y:290},{id:4,label:"E",x:220,y:290},{id:5,label:"F",x:360,y:290},{id:6,label:"G",x:500,y:290}],edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]};
function graphSteps(type){const{nodes,edges}=GD,adj={};nodes.forEach(n=>{adj[n.id]=[];});edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const steps=[],visited=new Set(),order=[];if(type==="BFS"){const q=[0];visited.add(0);steps.push({visited:new Set(visited),queue:[...q],current:-1,order:[],phase:"init",msg:"BFS — explore level by level."});while(q.length){const cur=q.shift();order.push(cur);steps.push({visited:new Set(visited),queue:[...q],current:cur,order:[...order],phase:"compare",msg:`Visit ${nodes[cur].label}`});for(const nb of adj[cur])if(!visited.has(nb)){visited.add(nb);q.push(nb);steps.push({visited:new Set(visited),queue:[...q],current:cur,order:[...order],phase:"update",msg:`Enqueue ${nodes[nb].label}`});}}}else{function dfs(c){visited.add(c);order.push(c);steps.push({visited:new Set(visited),stack:[...order],current:c,order:[...order],phase:"compare",msg:`Visit ${nodes[c].label}`});for(const nb of adj[c])if(!visited.has(nb)){steps.push({visited:new Set(visited),stack:[...order],current:c,order:[...order],phase:"update",msg:`→ ${nodes[nb].label}`});dfs(nb);}steps.push({visited:new Set(visited),stack:[...order],current:c,order:[...order],phase:"compare",msg:`Back from ${nodes[c].label}`});}steps.push({visited:new Set(),stack:[],current:-1,order:[],phase:"init",msg:"DFS — explore as deep as possible."});dfs(0);}steps.push({visited:new Set(visited),queue:[],stack:[],current:-1,order:[...order],phase:"result",msg:`✓ ${type}: ${order.map(i=>nodes[i].label).join(" → ")}`});return{steps,result:order.map(i=>nodes[i].label).join(" → ")};}

const GROUPS=[
  {label:"Dynamic Programming",color:P.accent,items:[{id:"LIS",label:"LIS",full:"Longest Increasing Subsequence",type:"array"},{id:"LCS",label:"LCS",full:"Longest Common Subsequence",type:"strings"},{id:"KNAPSACK",label:"Knapsack",full:"0/1 Knapsack",type:"knapsack"}]},
  {label:"Sorting",color:P.accent2,items:[{id:"BUBBLE",label:"Bubble",full:"Bubble Sort",type:"array"},{id:"SELECTION",label:"Selection",full:"Selection Sort",type:"array"},{id:"INSERTION",label:"Insertion",full:"Insertion Sort",type:"array"},{id:"QUICK",label:"Quick",full:"Quick Sort",type:"array"},{id:"MERGE",label:"Merge",full:"Merge Sort",type:"array"}]},
  {label:"Search",color:P.accent3,items:[{id:"BSEARCH",label:"Binary Search",full:"Binary Search",type:"bsearch"}]},
  {label:"Graph",color:P.accent4,items:[{id:"BFS",label:"BFS",full:"BFS",type:"graph"},{id:"DFS",label:"DFS",full:"DFS",type:"graph"}]},
];

function runBuiltin(id,inp){
  const arr=inp.arr.trim().split(/\s+/).map(Number).filter(n=>!isNaN(n));
  switch(id){
    case "LIS":return lisSteps(arr);
    case "LCS":return lcsSteps(inp.s1.toUpperCase(),inp.s2.toUpperCase());
    case "KNAPSACK":return knapsackSteps(inp.w.trim().split(/\s+/).map(Number),inp.v.trim().split(/\s+/).map(Number),parseInt(inp.cap)||8);
    case "BUBBLE":return bubbleSteps(arr);case "SELECTION":return selectionSteps(arr);
    case "INSERTION":return insertionSteps(arr);case "QUICK":return quickSteps(arr);case "MERGE":return mergeSteps(arr);
    case "BSEARCH":return bsearchSteps(arr,parseInt(inp.target)||7);
    case "BFS":return graphSteps("BFS");case "DFS":return graphSteps("DFS");
    default:return{steps:[],result:null};
  }
}

function Bars({step}){
  if(!step?.arr)return null;
  const a=step.arr,max=Math.max(...a,1);
  return <div style={{display:"flex",alignItems:"flex-end",gap:5,flexWrap:"wrap",minHeight:160,padding:"10px 0"}}>
    {a.map((v,i)=>{
      let c=P.muted;
      if(step.found===i)c=P.accent3;else if(step.swapped?.includes(i))c=P.accent4;
      else if(step.pivot===i)c=P.gold;else if(step.comparing?.includes(i))c=P.accent2;
      else if(step.active?.includes(i))c=P.accent;else if(step.sorted instanceof Set&&step.sorted.has(i))c=P.accent3;
      else if(step.merging?.includes(i))c=`${P.accent}88`;
      else if(step.lo!==undefined&&i>=step.lo&&i<=step.hi)c=`${P.blush}`;
      const h=Math.max(10,(v/max)*140);
      return <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <span style={{color:c,fontSize:12,fontWeight:700,minWidth:18,textAlign:"center"}}>{v}</span>
        <div style={{width:Math.max(18,Math.floor(380/a.length)-4),height:h,background:c,borderRadius:"6px 6px 0 0",boxShadow:c!==P.muted?`0 0 12px ${c}60`:"none",transition:"all 0.25s"}}/>
        <span style={{color:P.muted,fontSize:10}}>{i}</span>
      </div>;
    })}
  </div>;
}

function Table2D({step,maxC=13}){
  if(!step?.dp)return null;
  const cols=Math.min(step.dp[0].length,maxC),maxV=Math.max(...step.dp.flat(),1);
  return <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",fontFamily:"inherit",fontSize:12}}>
    <thead><tr><th style={{padding:"4px 8px",color:P.muted,fontWeight:500}}>i\j</th>
      {Array.from({length:cols},(_,j)=><th key={j} style={{padding:"4px 8px",color:P.accent}}>{step.s2?(["-",...step.s2])[j]??j:j}</th>)}
    </tr></thead>
    <tbody>{step.dp.map((row,i)=><tr key={i}>
      <td style={{padding:"3px 8px",color:P.accent,fontWeight:700}}>{step.s1?(["-",...step.s1])[i]??i:i}</td>
      {row.slice(0,cols).map((v,j)=>{const isA=step.cell&&step.cell[0]===i&&step.cell[1]===j;return <td key={j} style={{padding:"4px 10px",textAlign:"center",fontWeight:isA?700:400,color:isA?"#fff":v>0?P.text:P.muted,background:isA?P.accent:v>0?`${P.blush}`:"transparent",border:`1px solid ${isA?P.accent:P.border}`,transition:"all 0.2s",minWidth:28,borderRadius:4}}>{v}</td>;})}
    </tr>)}</tbody>
  </table></div>;
}

function GraphView({step}){
  const{nodes,edges}=GD,visited=step?.visited||new Set(),current=step?.current??-1,order=step?.order||[],q=step?.queue||step?.stack||[];
  return <div>
    <svg width="540" height="310" viewBox="0 0 540 310" style={{width:"100%",maxWidth:540,display:"block"}}>
      {edges.map(([u,v],i)=>{const nu=nodes[u],nv=nodes[v],both=order.includes(u)&&order.includes(v);return <line key={i} x1={nu.x} y1={nu.y} x2={nv.x} y2={nv.y} stroke={both?P.accent:P.border} strokeWidth={both?2.5:1.5} strokeDasharray={both?"none":"6,4"} style={{transition:"stroke 0.3s"}}/>;})}
      {nodes.map(n=>{const iC=n.id===current,iV=visited.has(n.id);return <g key={n.id}><circle cx={n.x} cy={n.y} r={22} fill={iC?P.accent2:iV?P.accent:"#fff"} stroke={iC?P.accent2:iV?P.accent:P.border} strokeWidth={2.5} style={{transition:"all 0.3s",filter:iC?`drop-shadow(0 0 8px ${P.accent2})`:iV?`drop-shadow(0 0 6px ${P.accent})`:"none"}}/><text x={n.x} y={n.y+5} textAnchor="middle" fill={iV||iC?"#fff":P.text} fontSize={14} fontWeight={700}>{n.label}</text>{order.includes(n.id)&&<text x={n.x+17} y={n.y-17} fill={P.gold} fontSize={11} fontWeight={700}>{order.indexOf(n.id)+1}</text>}</g>;})}
    </svg>
    {q.length>0&&<div style={{marginTop:8,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{color:P.muted,fontSize:12}}>{step?.stack?"Stack:":"Queue:"}</span>{q.map((id,i)=><div key={i} style={{padding:"3px 10px",background:P.blush,border:`1px solid ${P.accent}`,borderRadius:20,color:P.accent,fontSize:12,fontWeight:700}}>{nodes[id]?.label}</div>)}</div>}
  </div>;
}

function usePlayback(steps){
  const[idx,setIdx]=useState(0);const[playing,setPlaying]=useState(false);const[speed,setSpeed]=useState(700);
  const timer=useRef(null);const logRef=useRef(null);
  useEffect(()=>{clearInterval(timer.current);if(playing)timer.current=setInterval(()=>setIdx(i=>{if(i>=steps.length-1){setPlaying(false);return i;}return i+1;}),speed);return()=>clearInterval(timer.current);},[playing,steps.length,speed]);
  useEffect(()=>{setIdx(0);setPlaying(false);},[steps]);
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[idx]);
  return{idx,setIdx,playing,setPlaying,speed,setSpeed,logRef};
}

function Controls({idx,setIdx,playing,setPlaying,speed,setSpeed,steps,logRef}){
  const step=steps[idx];
  return <div>
    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:12}}>
      {[["⏮",()=>{setIdx(0);setPlaying(false);},idx===0],["◀",()=>setIdx(i=>Math.max(0,i-1)),idx===0]].map(([l,fn,d],i)=>(
        <button key={i} onClick={fn} disabled={d} style={{background:"transparent",color:P.accent,border:`2px solid ${P.border}`,padding:"6px 12px",fontSize:14,borderRadius:20,fontWeight:700}}>{l}</button>
      ))}
      <button onClick={()=>setPlaying(p=>!p)} style={{background:`linear-gradient(135deg,${P.accent},${P.accent2})`,color:"#fff",fontWeight:700,padding:"8px 20px",fontSize:14,borderRadius:20,boxShadow:`0 4px 15px ${P.accent}40`}}>{playing?"⏸ Pause":"▶ Play"}</button>
      {[["▶",()=>setIdx(i=>Math.min(steps.length-1,i+1)),idx>=steps.length-1],["⏭",()=>{setIdx(steps.length-1);setPlaying(false);},idx>=steps.length-1]].map(([l,fn,d],i)=>(
        <button key={i} onClick={fn} disabled={d} style={{background:"transparent",color:P.accent,border:`2px solid ${P.border}`,padding:"6px 12px",fontSize:14,borderRadius:20,fontWeight:700}}>{l}</button>
      ))}
      <span style={{color:P.muted,fontSize:12,marginLeft:4}}>{idx+1} / {steps.length}</span>
      <div style={{display:"flex",gap:4,marginLeft:"auto"}}>
        {[["0.5×",1200],["1×",700],["2×",350],["4×",120]].map(([l,v])=>(
          <button key={l} onClick={()=>setSpeed(v)} style={{padding:"4px 10px",fontSize:11,borderRadius:12,background:speed===v?P.blush:"transparent",color:speed===v?P.accent:P.muted,border:`1px solid ${speed===v?P.accent:P.border}`,fontWeight:speed===v?700:400}}>{l}</button>
        ))}
      </div>
    </div>
    <div style={{height:4,background:P.border,borderRadius:4,overflow:"hidden",marginBottom:12}}>
      <div style={{height:"100%",width:`${((idx+1)/steps.length)*100}%`,background:`linear-gradient(90deg,${P.accent},${P.gold})`,transition:"width 0.2s",borderRadius:4}}/>
    </div>
    <div style={{background:P.blush,border:`1px solid ${P.border}`,borderRadius:12,padding:"12px 16px",fontSize:14,color:step?(phaseColor[step.phase]||P.text):P.muted,lineHeight:1.7,minHeight:48,fontWeight:500}}>
      {step?.msg||"—"}
    </div>
    <div ref={logRef} style={{marginTop:8,background:"#fdf0f0",border:`1px solid ${P.border}`,borderRadius:12,padding:10,height:90,overflowY:"auto",fontSize:11}}>
      {steps.slice(0,idx+1).map((s,i)=><div key={i} style={{color:i===idx?(phaseColor[s.phase]||P.text):P.muted,padding:"2px 0",opacity:i===idx?1:.5,fontWeight:i===idx?600:400}}><span style={{color:P.border,marginRight:8}}>#{String(i+1).padStart(3,"0")}</span>{s.msg}</div>)}
    </div>
  </div>;
}

export default function App(){
  const[tab,setTab]=useState("builtin");
  const[algoId,setAlgoId]=useState("BUBBLE");
  const[inp,setInp]=useState({arr:"5 3 8 1 9 2 7 4 6",s1:"ABCBDAB",s2:"BDCAB",w:"2 3 4 5",v:"3 4 5 6",cap:"8",target:"7"});
  const[bSteps,setBSteps]=useState([]);const[bResult,setBResult]=useState(null);
  const bPb=usePlayback(bSteps);
  const[apiKey,setApiKey]=useState("");const[query,setQuery]=useState("");
  const[aiLoading,setAiLoading]=useState(false);const[aiData,setAiData]=useState(null);const[aiError,setAiError]=useState("");
  const aiPb=usePlayback(aiData?.steps||[]);
  const ca=GROUPS.flatMap(g=>g.items).find(a=>a.id===algoId);

  const runB=useCallback(()=>{const{steps:s,result:r}=runBuiltin(algoId,inp);setBSteps(s);setBResult(r);},[algoId,inp]);
  useEffect(()=>{setBSteps([]);setBResult(null);},[algoId]);

  const genAI=async(q=query)=>{
    if(!q.trim())return;
    if(!apiKey.trim()){setAiError("Please enter your Anthropic API key above.");return;}
    setAiLoading(true);setAiError("");setAiData(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:4000,
        system:`You are an algorithm visualization engine. Respond ONLY with raw JSON — no markdown, no explanation.\nFormat:\n{"title":"...","description":"...","vizType":"bars|table2d|custom","steps":[{"msg":"...","phase":"init|compare|update|swap|result","arrayState":[1,2,3],"highlights":[0],"swapped":[1,2],"sorted":[3,4],"special":[0],"tableState":[[0,1],[2,3]],"activeCell":[1,2],"extra":"..."}],"result":"..."}\nRules: 10-20 steps on small input. bars=sorting/search. table2d=DP. custom=everything else. Always init first, result last.`,
        messages:[{role:"user",content:`Visualize algorithm: ${q}`}],
      })});
      const data=await res.json();
      const raw=data.content?.map(b=>b.text||"").join("")||"";
      setAiData(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    }catch(e){setAiError("Failed. Check your API key and try again.");}
    setAiLoading(false);
  };

  const bs=bSteps[bPb.idx];
  const as=aiData?.steps?.[aiPb.idx];

  const Card=({children,style={}})=><div style={{background:P.panel,border:`1px solid ${P.border}`,borderRadius:16,padding:20,boxShadow:"0 2px 20px rgba(183,110,121,0.06)",...style}}>{children}</div>;
  const Label=({children,color=P.accent})=><div style={{color,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}`}}/>{children}</div>;

  return <div style={{minHeight:"100vh",background:`linear-gradient(135deg,#fdf6f0 0%,#fde8e8 50%,#f5e8f5 100%)`,color:P.text,fontFamily:"'Inter','Helvetica Neue',sans-serif",padding:"20px 16px"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:${P.border};border-radius:10px}input,textarea{background:#fff;border:2px solid ${P.border};color:${P.text};padding:10px 14px;border-radius:12px;font-family:inherit;font-size:14px;outline:none;width:100%;transition:border .2s}input:focus{border-color:${P.accent};box-shadow:0 0 0 3px ${P.accent}20}button{cursor:pointer;border:none;font-family:inherit;transition:all .18s}button:disabled{opacity:.35;cursor:not-allowed}button:hover:not(:disabled){transform:translateY(-1px)}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

    <div style={{maxWidth:900,margin:"0 auto"}}>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:13,color:P.gold,fontWeight:700,letterSpacing:4,textTransform:"uppercase",marginBottom:6}}>✦ Algorithm Visualizer ✦</div>
        <h1 style={{fontSize:42,fontWeight:900,margin:0,background:`linear-gradient(135deg,${P.accent},${P.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-1}}>AlgoViz</h1>
        <p style={{color:P.muted,fontSize:15,marginTop:6,fontWeight:500}}>Beautiful step-by-step algorithm visualization</p>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"#fff",border:`1px solid ${P.border}`,borderRadius:16,padding:5,marginBottom:20,boxShadow:"0 2px 20px rgba(183,110,121,0.08)"}}>
        {[["builtin","⚙  Built-In Algorithms",P.accent],["ai","✦  AI Mode",P.accent4]].map(([t,l,c])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"11px 0",fontSize:14,borderRadius:12,background:tab===t?`linear-gradient(135deg,${c}15,${c}25)`:"transparent",color:tab===t?c:P.muted,border:tab===t?`1.5px solid ${c}60`:"1.5px solid transparent",fontWeight:tab===t?700:500,letterSpacing:.3}}>{l}</button>
        ))}
      </div>

      {/* BUILT-IN */}
      {tab==="builtin"&&<div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .3s ease"}}>
        <Card>
          <Label>Select Algorithm</Label>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {GROUPS.map(g=><div key={g.label}>
              <div style={{color:g.color,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:7,textTransform:"uppercase"}}>{g.label}</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {g.items.map(item=><button key={item.id} onClick={()=>setAlgoId(item.id)} style={{background:algoId===item.id?`linear-gradient(135deg,${g.color}20,${g.color}35)`:"#fdf6f0",border:`1.5px solid ${algoId===item.id?g.color:P.border}`,color:algoId===item.id?g.color:P.muted,padding:"7px 16px",fontSize:13,borderRadius:20,fontWeight:algoId===item.id?700:500,boxShadow:algoId===item.id?`0 4px 12px ${g.color}30`:"none"}}>{item.label}</button>)}
              </div>
            </div>)}
          </div>
        </Card>

        <Card>
          <Label>Input — {ca?.full}</Label>
          {(ca?.type==="array"||ca?.type==="bsearch")&&<div style={{marginBottom:10}}><label style={{color:P.muted,fontSize:12,display:"block",marginBottom:5,fontWeight:600}}>Array values</label><input value={inp.arr} onChange={e=>setInp(p=>({...p,arr:e.target.value}))}/></div>}
          {ca?.type==="bsearch"&&<div style={{marginBottom:10}}><label style={{color:P.muted,fontSize:12,display:"block",marginBottom:5,fontWeight:600}}>Target value</label><input value={inp.target} onChange={e=>setInp(p=>({...p,target:e.target.value}))}/></div>}
          {ca?.type==="strings"&&<div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}><div style={{flex:1,minWidth:120}}><label style={{color:P.muted,fontSize:12,display:"block",marginBottom:5,fontWeight:600}}>String 1</label><input value={inp.s1} onChange={e=>setInp(p=>({...p,s1:e.target.value}))}/></div><div style={{flex:1,minWidth:120}}><label style={{color:P.muted,fontSize:12,display:"block",marginBottom:5,fontWeight:600}}>String 2</label><input value={inp.s2} onChange={e=>setInp(p=>({...p,s2:e.target.value}))}/></div></div>}
          {ca?.type==="knapsack"&&<div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}><div style={{flex:2,minWidth:100}}><label style={{color:P.muted,fontSize:12,display:"block",marginBottom:5,fontWeight:600}}>Weights</label><input value={inp.w} onChange={e=>setInp(p=>({...p,w:e.target.value}))}/></div><div style={{flex:2,minWidth:100}}><label style={{color:P.muted,fontSize:12,display:"block",marginBottom:5,fontWeight:600}}>Values</label><input value={inp.v} onChange={e=>setInp(p=>({...p,v:e.target.value}))}/></div><div style={{flex:1,minWidth:70}}><label style={{color:P.muted,fontSize:12,display:"block",marginBottom:5,fontWeight:600}}>Capacity</label><input value={inp.cap} onChange={e=>setInp(p=>({...p,cap:e.target.value}))}/></div></div>}
          {ca?.type==="graph"&&<p style={{color:P.muted,fontSize:13,margin:"0 0 10px",fontWeight:500}}>7-node graph A through G — no input needed!</p>}
          <button onClick={runB} style={{background:`linear-gradient(135deg,${P.accent},${P.accent2})`,color:"#fff",fontWeight:700,padding:"10px 24px",fontSize:14,borderRadius:20,boxShadow:`0 4px 20px ${P.accent}40`,letterSpacing:.5}}>▶ Run Algorithm</button>
        </Card>

        <Card>
          <Label>Visualization</Label>
          {!bs&&<div style={{color:P.muted,textAlign:"center",padding:36,fontSize:14,fontWeight:500}}>Press Run Algorithm above ✨</div>}
          {bs&&(ca?.type==="array"||ca?.type==="bsearch")&&<Bars step={bs}/>}
          {bs&&algoId==="LIS"&&bs.dp&&<><div style={{color:P.muted,fontSize:12,marginTop:14,fontWeight:600,letterSpacing:1}}>DP ARRAY:</div><div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:7}}>{bs.dp.map((v,i)=>{const isA=bs.active?.includes(i),isC=bs.comparing?.includes(i);return <div key={i} style={{textAlign:"center"}}><div style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",background:isA?P.blush:isC?"#fde8d8":"#fdf6f0",border:`2px solid ${isA?P.accent:isC?P.accent2:P.border}`,color:isA?P.accent:P.text,fontWeight:700,fontSize:13,borderRadius:8,transition:"all 0.2s"}}>{v}</div><div style={{color:P.muted,fontSize:9,marginTop:3}}>dp[{i}]</div></div>;})}</div></>}
          {bs&&ca?.type==="strings"&&<Table2D step={bs} maxC={(bs.s2?.length||0)+1}/>}
          {bs&&ca?.type==="knapsack"&&<Table2D step={bs} maxC={parseInt(inp.cap)+1}/>}
          {bs&&ca?.type==="graph"&&<GraphView step={bs}/>}
        </Card>

        {bSteps.length>0&&<Card><Label>Playback Controls</Label><Controls {...bPb} steps={bSteps}/></Card>}

        {bResult!==null&&bPb.idx===bSteps.length-1&&bSteps.length>0&&(
          <div style={{background:`linear-gradient(135deg,${P.blush},#f5e8f5)`,border:`1.5px solid ${P.accent}`,borderRadius:16,padding:"20px 24px",textAlign:"center",animation:"fadeUp .3s ease",boxShadow:`0 8px 30px ${P.accent}20`}}>
            <div style={{color:P.muted,fontSize:11,fontWeight:700,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>✦ Result</div>
            <div style={{fontSize:Array.isArray(bResult)?16:32,fontWeight:900,background:`linear-gradient(135deg,${P.accent},${P.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",wordBreak:"break-all"}}>{Array.isArray(bResult)?`[ ${bResult.join(", ")} ]`:String(bResult)}</div>
            <div style={{color:P.muted,fontSize:13,marginTop:6,fontWeight:500}}>{ca?.full}</div>
          </div>
        )}
      </div>}

      {/* AI MODE */}
      {tab==="ai"&&<div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .3s ease"}}>
        <Card style={{background:`linear-gradient(135deg,#fff8f8,#f8f0ff)`}}>
          <Label color={P.accent4}>✦ AI Mode — Type Any Algorithm</Label>
          <div style={{marginBottom:12}}>
            <label style={{color:P.muted,fontSize:12,display:"block",marginBottom:5,fontWeight:600}}>🔑 Anthropic API Key <span style={{color:P.accent,fontSize:11}}>(get free key at console.anthropic.com)</span></label>
            <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-ant-..." style={{fontFamily:"monospace"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{color:P.muted,fontSize:12,display:"block",marginBottom:5,fontWeight:600}}>Algorithm to visualize</label>
            <div style={{display:"flex",gap:8}}>
              <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&genAI()} placeholder="e.g. Dijkstra, Coin Change, Edit Distance..."/>
              <button onClick={()=>genAI()} disabled={aiLoading||!query.trim()} style={{background:`linear-gradient(135deg,${P.accent4},${P.accent})`,color:"#fff",fontWeight:700,padding:"10px 20px",fontSize:13,borderRadius:12,whiteSpace:"nowrap",boxShadow:`0 4px 15px ${P.accent4}40`}}>{aiLoading?"⏳":"✦ Generate"}</button>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <span style={{color:P.muted,fontSize:12,alignSelf:"center",fontWeight:600}}>Try:</span>
            {["Dijkstra","Coin Change","Edit Distance","Floyd-Warshall","Prim's MST","Rabin-Karp"].map(ex=>(
              <button key={ex} onClick={()=>{setQuery(ex);genAI(ex);}} style={{background:P.blush,border:`1px solid ${P.border}`,color:P.accent,padding:"4px 12px",fontSize:12,borderRadius:20,fontWeight:600}}>{ex}</button>
            ))}
          </div>
        </Card>

        {aiLoading&&<Card style={{textAlign:"center",padding:48}}><div style={{fontSize:32,animation:"spin 1s linear infinite",display:"inline-block",marginBottom:12}}>✦</div><div style={{color:P.accent4,fontSize:16,fontWeight:700}}>Generating visualization...</div><div style={{color:P.muted,fontSize:13,marginTop:6}}>AI is analyzing the algorithm</div></Card>}
        {aiError&&<div style={{background:"#fff0f0",border:`1.5px solid ${P.accent}`,borderRadius:12,padding:14,color:P.accent,fontSize:14,textAlign:"center",fontWeight:600}}>⚠ {aiError}</div>}

        {aiData&&!aiLoading&&<div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease"}}>
          <Card style={{background:`linear-gradient(135deg,#fff8f8,#f8f0ff)`}}>
            <div style={{fontSize:20,fontWeight:800,color:P.accent4,marginBottom:4}}>{aiData.title}</div>
            <div style={{color:P.muted,fontSize:13,fontWeight:500}}>{aiData.description}</div>
            <div style={{display:"inline-block",marginTop:8,padding:"3px 12px",background:P.blush,borderRadius:20,color:P.accent,fontSize:12,fontWeight:700}}>{aiData.steps?.length} steps</div>
          </Card>
          <Card><Label>Visualization</Label>
            {as&&aiData.vizType==="bars"&&as.arrayState&&(()=>{const a=as.arrayState,max=Math.max(...a,1);return<div style={{display:"flex",alignItems:"flex-end",gap:5,flexWrap:"wrap",minHeight:150,padding:"10px 0"}}>{a.map((v,i)=>{let c=P.muted;if(as.special?.includes(i))c=P.gold;else if(as.swapped?.includes(i))c=P.accent4;else if(as.highlights?.includes(i))c=P.accent2;else if(as.sorted?.includes(i))c=P.accent3;const h=Math.max(10,(v/max)*130);return<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><span style={{color:c,fontSize:12,fontWeight:700}}>{v}</span><div style={{width:Math.max(18,Math.floor(380/a.length)-4),height:h,background:c,borderRadius:"6px 6px 0 0",boxShadow:c!==P.muted?`0 0 10px ${c}50`:"none",transition:"all 0.2s"}}/><span style={{color:P.muted,fontSize:10}}>{i}</span></div>;})}</div>;})()}
            {as&&(aiData.vizType==="custom"||!aiData.vizType)&&(as.arrayState||[]).length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",padding:"8px 0"}}>{(as.arrayState||[]).map((v,i)=>{let c=P.muted;if(as.special?.includes(i))c=P.gold;else if(as.highlights?.includes(i))c=P.accent2;else if(as.sorted?.includes(i))c=P.accent3;return<div key={i} style={{padding:"8px 16px",border:`2px solid ${c}`,background:`${c}18`,color:c,borderRadius:12,fontSize:14,fontWeight:700}}>{String(v)}</div>;})}
            {as?.extra&&<div style={{width:"100%",color:P.accent,fontSize:13,fontWeight:600}}>→ {as.extra}</div>}</div>}
          </Card>
          <Card><Label>Playback</Label><Controls {...aiPb} steps={aiData.steps}/></Card>
          {aiPb.idx===aiData.steps.length-1&&aiData.result&&<div style={{background:`linear-gradient(135deg,${P.blush},#f5e8f5)`,border:`1.5px solid ${P.accent4}`,borderRadius:16,padding:"20px 24px",textAlign:"center",boxShadow:`0 8px 30px ${P.accent4}20`}}><div style={{color:P.muted,fontSize:11,fontWeight:700,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>✦ Result</div><div style={{fontSize:28,fontWeight:900,color:P.accent4}}>{aiData.result}</div><div style={{color:P.muted,fontSize:13,marginTop:6}}>{aiData.title}</div></div>}
        </div>}

        {!aiData&&!aiLoading&&!aiError&&<Card style={{textAlign:"center",padding:48,background:"linear-gradient(135deg,#fff8f8,#f8f0ff)"}}><div style={{fontSize:36,marginBottom:12}}>✦</div><div style={{color:P.muted,fontSize:15,fontWeight:600}}>Enter your API key and type any algorithm</div><div style={{color:P.muted,fontSize:13,marginTop:6}}>Works with Dijkstra, Floyd-Warshall, Coin Change, and more!</div></Card>}
      </div>}

      {/* Legend */}
      <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center",paddingTop:20,paddingBottom:24}}>
        {[[P.accent,"Active"],[P.accent2,"Comparing"],[P.accent3,"Sorted"],[P.accent4,"Swap"],[P.gold,"Pivot"],[P.muted,"Default"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,background:c,borderRadius:3,boxShadow:`0 0 5px ${c}70`}}/><span style={{color:P.muted,fontSize:12,fontWeight:500}}>{l}</span></div>
        ))}
      </div>
    </div>
  </div>;
}
