import { useState, useEffect, useRef, useCallback } from "react";

const P = {
  bg:"#0a0a0f",panel:"#0f0f1a",border:"#1e2a4a",
  accent:"#00d4ff",a2:"#ff6b35",a3:"#7fff6b",a4:"#c97bff",
  text:"#c8d8ff",muted:"#4a5a7a",
};
const phaseColor = { init:P.a3, compare:P.a2, update:P.accent, swap:P.a4, result:P.a3 };

function lisSteps(arr) {
  const n=arr.length,dp=Array(n).fill(1),prev=Array(n).fill(-1),steps=[];
  steps.push({arr:[...arr],dp:[...dp],comparing:[],active:[],phase:"init",msg:"Initialize dp[i]=1 for all i."});
  for(let i=1;i<n;i++) for(let j=0;j<i;j++){
    steps.push({arr:[...arr],dp:[...dp],comparing:[i,j],active:[],phase:"compare",msg:`arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}?`});
    if(arr[j]<arr[i]&&dp[j]+1>dp[i]){dp[i]=dp[j]+1;prev[i]=j;steps.push({arr:[...arr],dp:[...dp],comparing:[i,j],active:[i],phase:"update",msg:`✓ dp[${i}]=${dp[i]}`});}
  }
  const mx=Math.max(...dp);let ix=dp.indexOf(mx);const path=[];
  while(ix!==-1){path.unshift(ix);ix=prev[ix];}
  steps.push({arr:[...arr],dp:[...dp],comparing:[],active:path,phase:"result",msg:`✓ LIS=${mx}: [${path.map(i=>arr[i]).join(",")}]`});
  return {steps,result:mx};
}
function bubbleSteps(arr){
  const a=[...arr],n=a.length,s=new Set(),steps=[];
  steps.push({arr:[...a],comparing:[],sorted:new Set(),swapped:[],phase:"init",msg:"Bubble Sort start."});
  for(let i=0;i<n-1;i++){
    for(let j=0;j<n-i-1;j++){
      steps.push({arr:[...a],comparing:[j,j+1],sorted:new Set(s),swapped:[],phase:"compare",msg:`Compare ${a[j]} and ${a[j+1]}`});
      if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[j,j+1],phase:"swap",msg:`Swap!`});}
    }
    s.add(n-1-i);
  }
  s.add(0);steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[],phase:"result",msg:`✓ Sorted: [${a.join(",")}]`});
  return {steps,result:[...a]};
}
function selectionSteps(arr){
  const a=[...arr],n=a.length,s=new Set(),steps=[];
  steps.push({arr:[...a],comparing:[],sorted:new Set(),swapped:[],phase:"init",msg:"Selection Sort start."});
  for(let i=0;i<n-1;i++){
    let m=i;
    for(let j=i+1;j<n;j++){steps.push({arr:[...a],comparing:[j,m],sorted:new Set(s),swapped:[],phase:"compare",msg:`${a[j]}<${a[m]}? ${a[j]<a[m]?"Yes":"No"}`});if(a[j]<a[m])m=j;}
    if(m!==i){[a[i],a[m]]=[a[m],a[i]];steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[i,m],phase:"swap",msg:`Swap a[${i}]↔a[${m}]`});}
    s.add(i);
  }
  s.add(n-1);steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[],phase:"result",msg:`✓ Sorted: [${a.join(",")}]`});
  return {steps,result:[...a]};
}
function insertionSteps(arr){
  const a=[...arr],n=a.length,steps=[];
  steps.push({arr:[...a],comparing:[],sorted:new Set([0]),swapped:[],phase:"init",msg:"Insertion Sort start."});
  for(let i=1;i<n;i++){
    const key=a[i];let j=i-1;
    steps.push({arr:[...a],comparing:[i],sorted:new Set(Array.from({length:i},(_,k)=>k)),swapped:[],phase:"compare",msg:`key=${key}`});
    while(j>=0&&a[j]>key){a[j+1]=a[j];j--;steps.push({arr:[...a],comparing:[j+1],sorted:new Set(Array.from({length:i},(_,k)=>k)),swapped:[j+1,j+2],phase:"swap",msg:`Shift ${a[j+1]}`});}
    a[j+1]=key;steps.push({arr:[...a],comparing:[],sorted:new Set(Array.from({length:i+1},(_,k)=>k)),swapped:[j+1],phase:"update",msg:`Insert ${key} at ${j+1}`});
  }
  steps.push({arr:[...a],comparing:[],sorted:new Set(Array.from({length:a.length},(_,k)=>k)),swapped:[],phase:"result",msg:`✓ Sorted: [${a.join(",")}]`});
  return {steps,result:[...a]};
}
function quickSteps(arr){
  const a=[...arr],s=new Set(),steps=[];
  steps.push({arr:[...a],comparing:[],sorted:new Set(),swapped:[],pivot:-1,phase:"init",msg:"Quick Sort start."});
  function part(lo,hi){
    const pv=a[hi];s.add(hi);
    steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[],pivot:hi,phase:"compare",msg:`Pivot=${pv}`});
    let i=lo-1;
    for(let j=lo;j<hi;j++){
      steps.push({arr:[...a],comparing:[j,hi],sorted:new Set(s),swapped:[],pivot:hi,phase:"compare",msg:`${a[j]}≤${pv}?`});
      if(a[j]<=pv){i++;[a[i],a[j]]=[a[j],a[i]];if(i!==j)steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[i,j],pivot:hi,phase:"swap",msg:`Swap`});}
    }
    [a[i+1],a[hi]]=[a[hi],a[i+1]];s.add(i+1);
    steps.push({arr:[...a],comparing:[],sorted:new Set(s),swapped:[i+1,hi],pivot:i+1,phase:"update",msg:`Pivot placed at ${i+1}`});
    return i+1;
  }
  function qs(lo,hi){if(lo>=hi){if(lo===hi)s.add(lo);return;}const p=part(lo,hi);qs(lo,p-1);qs(p+1,hi);}
  qs(0,a.length-1);
  steps.push({arr:[...a],comparing:[],sorted:new Set(Array.from({length:a.length},(_,k)=>k)),swapped:[],pivot:-1,phase:"result",msg:`✓ Sorted: [${a.join(",")}]`});
  return {steps,result:[...a]};
}
function mergeSteps(arr){
  const a=[...arr],steps=[];
  steps.push({arr:[...a],comparing:[],merging:[],phase:"init",msg:"Merge Sort start."});
  function mg(lo,mid,hi){
    const L=a.slice(lo,mid+1),R=a.slice(mid+1,hi+1);
    steps.push({arr:[...a],comparing:[],merging:Array.from({length:hi-lo+1},(_,k)=>lo+k),phase:"compare",msg:`Merge [${L}]+[${R}]`});
    let i=0,j=0,k=lo;
    while(i<L.length&&j<R.length){a[k++]=L[i]<=R[j]?L[i++]:R[j++];steps.push({arr:[...a],comparing:[],merging:Array.from({length:hi-lo+1},(_,kk)=>lo+kk),phase:"update",msg:`Placed ${a[k-1]}`});}
    while(i<L.length)a[k++]=L[i++];while(j<R.length)a[k++]=R[j++];
  }
  function ms(lo,hi){if(lo>=hi)return;const mid=Math.floor((lo+hi)/2);steps.push({arr:[...a],comparing:[],merging:[],phase:"compare",msg:`Split [${lo}..${hi}]`});ms(lo,mid);ms(mid+1,hi);mg(lo,mid,hi);}
  ms(0,a.length-1);
  steps.push({arr:[...a],comparing:[],merging:[],sorted:new Set(Array.from({length:a.length},(_,k)=>k)),phase:"result",msg:`✓ Sorted: [${a.join(",")}]`});
  return {steps,result:[...a]};
}
function bsearchSteps(arr,target){
  const s=[...arr].sort((a,b)=>a-b),steps=[];
  steps.push({arr:s,lo:0,hi:s.length-1,mid:-1,found:-1,target,phase:"init",msg:`Search ${target} in [${s.join(",")}]`});
  let lo=0,hi=s.length-1;
  while(lo<=hi){
    const mid=Math.floor((lo+hi)/2);
    steps.push({arr:s,lo,hi,mid,found:-1,target,phase:"compare",msg:`mid=${mid},val=${s[mid]}`});
    if(s[mid]===target){steps.push({arr:s,lo,hi,mid,found:mid,target,phase:"result",msg:`✓ Found at ${mid}!`});return {steps,result:mid};}
    else if(s[mid]<target){lo=mid+1;steps.push({arr:s,lo,hi,mid,found:-1,target,phase:"update",msg:`Go right. lo=${lo}`});}
    else{hi=mid-1;steps.push({arr:s,lo,hi,mid,found:-1,target,phase:"update",msg:`Go left. hi=${hi}`});}
  }
  steps.push({arr:s,lo,hi,mid:-1,found:-1,target,phase:"result",msg:`✗ Not found.`});
  return {steps,result:-1};
}
function lcsSteps(s1,s2){
  const m=s1.length,n=s2.length,steps=[];
  const dp=Array.from({length:m+1},()=>Array(n+1).fill(0));
  steps.push({dp:dp.map(r=>[...r]),cell:null,s1,s2,phase:"init",msg:"LCS DP table init."});
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
    const match=s1[i-1]===s2[j-1];
    dp[i][j]=match?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
    steps.push({dp:dp.map(r=>[...r]),cell:[i,j],s1,s2,phase:match?"update":"compare",msg:match?`✓ Match '${s1[i-1]}' dp=${dp[i][j]}`:`No match, max=${dp[i][j]}`});
  }
  steps.push({dp:dp.map(r=>[...r]),cell:[m,n],s1,s2,phase:"result",msg:`✓ LCS=${dp[m][n]}`});
  return {steps,result:dp[m][n]};
}
function knapsackSteps(w,v,cap){
  const n=w.length,steps=[];
  const dp=Array.from({length:n+1},()=>Array(cap+1).fill(0));
  steps.push({dp:dp.map(r=>[...r]),cell:null,phase:"init",msg:"Knapsack DP init."});
  for(let i=1;i<=n;i++) for(let ww=0;ww<=cap;ww++){
    if(w[i-1]<=ww){const t=dp[i-1][ww-w[i-1]]+v[i-1],sk=dp[i-1][ww];dp[i][ww]=Math.max(t,sk);steps.push({dp:dp.map(r=>[...r]),cell:[i,ww],phase:t>=sk?"update":"compare",msg:`Item${i}: take=${t} skip=${sk} →${dp[i][ww]}`});}
    else{dp[i][ww]=dp[i-1][ww];steps.push({dp:dp.map(r=>[...r]),cell:[i,ww],phase:"compare",msg:`Item${i} too heavy`});}
  }
  steps.push({dp:dp.map(r=>[...r]),cell:null,phase:"result",msg:`✓ Max value=${dp[n][cap]}`});
  return {steps,result:dp[n][cap]};
}
const GD={nodes:[{id:0,label:"A",x:280,y:55},{id:1,label:"B",x:140,y:165},{id:2,label:"C",x:420,y:165},{id:3,label:"D",x:60,y:290},{id:4,label:"E",x:220,y:290},{id:5,label:"F",x:360,y:290},{id:6,label:"G",x:500,y:290}],edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]};
function graphSteps(type){
  const {nodes,edges}=GD,adj={};nodes.forEach(n=>{adj[n.id]=[];});edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});
  const steps=[],visited=new Set(),order=[];
  if(type==="BFS"){
    const q=[0];visited.add(0);steps.push({visited:new Set(visited),queue:[...q],current:-1,order:[],phase:"init",msg:"BFS start."});
    while(q.length){const cur=q.shift();order.push(cur);steps.push({visited:new Set(visited),queue:[...q],current:cur,order:[...order],phase:"compare",msg:`Visit ${nodes[cur].label}`});for(const nb of adj[cur])if(!visited.has(nb)){visited.add(nb);q.push(nb);steps.push({visited:new Set(visited),queue:[...q],current:cur,order:[...order],phase:"update",msg:`Enqueue ${nodes[nb].label}`});}}
  }else{
    function dfs(c){visited.add(c);order.push(c);steps.push({visited:new Set(visited),stack:[...order],current:c,order:[...order],phase:"compare",msg:`Visit ${nodes[c].label}`});for(const nb of adj[c])if(!visited.has(nb)){steps.push({visited:new Set(visited),stack:[...order],current:c,order:[...order],phase:"update",msg:`→${nodes[nb].label}`});dfs(nb);}steps.push({visited:new Set(visited),stack:[...order],current:c,order:[...order],phase:"compare",msg:`Back from ${nodes[c].label}`});}
    steps.push({visited:new Set(),stack:[],current:-1,order:[],phase:"init",msg:"DFS start."});dfs(0);
  }
  steps.push({visited:new Set(visited),queue:[],stack:[],current:-1,order:[...order],phase:"result",msg:`✓ ${type}: ${order.map(i=>nodes[i].label).join("→")}`});
  return {steps,result:order.map(i=>nodes[i].label).join("→")};
}

const GROUPS=[
  {label:"DP",color:P.accent,items:[{id:"LIS",label:"LIS",full:"Longest Increasing Subsequence",type:"array"},{id:"LCS",label:"LCS",full:"Longest Common Subsequence",type:"strings"},{id:"KNAPSACK",label:"Knapsack",full:"0/1 Knapsack",type:"knapsack"}]},
  {label:"SORT",color:P.a2,items:[{id:"BUBBLE",label:"Bubble",full:"Bubble Sort",type:"array"},{id:"SELECTION",label:"Selection",full:"Selection Sort",type:"array"},{id:"INSERTION",label:"Insertion",full:"Insertion Sort",type:"array"},{id:"QUICK",label:"Quick",full:"Quick Sort",type:"array"},{id:"MERGE",label:"Merge",full:"Merge Sort",type:"array"}]},
  {label:"SEARCH",color:P.a3,items:[{id:"BSEARCH",label:"Binary Search",full:"Binary Search",type:"bsearch"}]},
  {label:"GRAPH",color:P.a4,items:[{id:"BFS",label:"BFS",full:"BFS",type:"graph"},{id:"DFS",label:"DFS",full:"DFS",type:"graph"}]},
];
function runBuiltin(id,inp){
  const arr=inp.arr.trim().split(/\s+/).map(Number).filter(n=>!isNaN(n));
  switch(id){
    case "LIS":return lisSteps(arr);case "LCS":return lcsSteps(inp.s1.toUpperCase(),inp.s2.toUpperCase());
    case "KNAPSACK":return knapsackSteps(inp.w.trim().split(/\s+/).map(Number),inp.v.trim().split(/\s+/).map(Number),parseInt(inp.cap)||8);
    case "BUBBLE":return bubbleSteps(arr);case "SELECTION":return selectionSteps(arr);case "INSERTION":return insertionSteps(arr);
    case "QUICK":return quickSteps(arr);case "MERGE":return mergeSteps(arr);
    case "BSEARCH":return bsearchSteps(arr,parseInt(inp.target)||7);
    case "BFS":return graphSteps("BFS");case "DFS":return graphSteps("DFS");
    default:return {steps:[],result:null};
  }
}

function Bars({step}){
  if(!step?.arr)return null;
  const a=step.arr,max=Math.max(...a,1);
  return <div style={{display:"flex",alignItems:"flex-end",gap:3,flexWrap:"wrap",minHeight:140,padding:"6px 0"}}>
    {a.map((v,i)=>{
      let c=P.muted;
      if(step.found===i)c=P.a3;else if(step.swapped?.includes(i))c=P.a4;else if(step.pivot===i)c="#ffdd00";
      else if(step.comparing?.includes(i))c=P.a2;else if(step.active?.includes(i))c=P.accent;
      else if(step.sorted instanceof Set&&step.sorted.has(i))c=P.a3;else if(step.merging?.includes(i))c=`${P.accent}88`;
      else if(step.lo!==undefined&&i>=step.lo&&i<=step.hi)c=`${P.accent}55`;
      const h=Math.max(8,(v/max)*120);
      return <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <span style={{color:c,fontSize:9,fontWeight:700,minWidth:14,textAlign:"center"}}>{v}</span>
        <div style={{width:Math.max(14,Math.floor(360/a.length)-3),height:h,background:c,borderRadius:"2px 2px 0 0",boxShadow:c!==P.muted?`0 0 7px ${c}`:"none",transition:"all 0.2s"}}/>
        <span style={{color:P.muted,fontSize:8}}>{i}</span>
      </div>;
    })}
  </div>;
}
function Table2D({step,maxC=13}){
  if(!step?.dp)return null;
  const cols=Math.min(step.dp[0].length,maxC),maxV=Math.max(...step.dp.flat(),1);
  return <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",fontFamily:"monospace",fontSize:10}}>
    <thead><tr><th style={{padding:"2px 5px",color:P.muted,fontWeight:400}}>i\j</th>
      {Array.from({length:cols},(_,j)=><th key={j} style={{padding:"2px 5px",color:P.accent}}>{step.s2?(["-",...step.s2])[j]??j:j}</th>)}
    </tr></thead>
    <tbody>{step.dp.map((row,i)=><tr key={i}>
      <td style={{padding:"2px 5px",color:P.accent,fontWeight:700}}>{step.s1?(["-",...step.s1])[i]??i:i}</td>
      {row.slice(0,cols).map((v,j)=>{const isA=step.cell&&step.cell[0]===i&&step.cell[1]===j;return <td key={j} style={{padding:"3px 7px",textAlign:"center",fontWeight:isA?700:400,color:isA?"#000":v>0?P.text:P.muted,background:isA?P.accent:v>0?`rgba(0,212,255,${(v/maxV)*0.15})`:"transparent",border:`1px solid ${isA?P.accent:P.border}`,transition:"all 0.18s",minWidth:24}}>{v}</td>;})}
    </tr>)}</tbody>
  </table></div>;
}
function GraphView({step}){
  const {nodes,edges}=GD,visited=step?.visited||new Set(),current=step?.current??-1,order=step?.order||[],q=step?.queue||step?.stack||[];
  return <div>
    <svg width="540" height="310" viewBox="0 0 540 310" style={{width:"100%",maxWidth:540,display:"block"}}>
      {edges.map(([u,v],i)=>{const nu=nodes[u],nv=nodes[v],both=order.includes(u)&&order.includes(v);return <line key={i} x1={nu.x} y1={nu.y} x2={nv.x} y2={nv.y} stroke={both?P.accent:P.border} strokeWidth={both?2.5:1.5} strokeDasharray={both?"none":"5,4"} style={{transition:"stroke 0.3s"}}/>;})}
      {nodes.map(n=>{const iC=n.id===current,iV=visited.has(n.id);return <g key={n.id}><circle cx={n.x} cy={n.y} r={21} fill={iC?P.a2:iV?P.accent:P.panel} stroke={iC?P.a2:iV?P.accent:P.border} strokeWidth={iC?3:2} style={{transition:"all 0.3s",filter:iC?`drop-shadow(0 0 8px ${P.a2})`:iV?`drop-shadow(0 0 5px ${P.accent})`:"none"}}/><text x={n.x} y={n.y+5} textAnchor="middle" fill={iV?"#000":P.text} fontSize={13} fontWeight={700} fontFamily="monospace">{n.label}</text>{order.includes(n.id)&&<text x={n.x+16} y={n.y-16} fill={P.a3} fontSize={10} fontFamily="monospace" fontWeight={700}>{order.indexOf(n.id)+1}</text>}</g>;})}
    </svg>
    {q.length>0&&<div style={{marginTop:7,display:"flex",gap:5,alignItems:"center"}}><span style={{color:P.muted,fontSize:10}}>{step?.stack?"STACK:":"QUEUE:"}</span>{q.map((id,i)=><div key={i} style={{padding:"2px 8px",background:`${P.accent}18`,border:`1px solid ${P.accent}`,borderRadius:4,color:P.accent,fontSize:11,fontWeight:700}}>{nodes[id]?.label}</div>)}</div>}
  </div>;
}

function usePlayback(steps){
  const [idx,setIdx]=useState(0);const [playing,setPlaying]=useState(false);const [speed,setSpeed]=useState(700);
  const timer=useRef(null);const logRef=useRef(null);
  useEffect(()=>{clearInterval(timer.current);if(playing)timer.current=setInterval(()=>setIdx(i=>{if(i>=steps.length-1){setPlaying(false);return i;}return i+1;}),speed);return()=>clearInterval(timer.current);},[playing,steps.length,speed]);
  useEffect(()=>{setIdx(0);setPlaying(false);},[steps]);
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[idx]);
  return {idx,setIdx,playing,setPlaying,speed,setSpeed,logRef};
}
function Controls({idx,setIdx,playing,setPlaying,speed,setSpeed,steps,logRef}){
  const step=steps[idx];
  return <div>
    <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:9}}>
      {[["⏮",()=>{setIdx(0);setPlaying(false);},idx===0],["◀",()=>setIdx(i=>Math.max(0,i-1)),idx===0]].map(([l,fn,d],i)=><button key={i} onClick={fn} disabled={d} style={{background:"transparent",color:P.accent,border:`1px solid ${P.accent}44`,padding:"5px 9px",fontSize:11,borderRadius:4}}>{l}</button>)}
      <button onClick={()=>setPlaying(p=>!p)} style={{background:P.accent,color:"#000",fontWeight:700,padding:"6px 14px",fontSize:11,borderRadius:4}}>{playing?"⏸ PAUSE":"▶ PLAY"}</button>
      {[["▶",()=>setIdx(i=>Math.min(steps.length-1,i+1)),idx>=steps.length-1],["⏭",()=>{setIdx(steps.length-1);setPlaying(false);},idx>=steps.length-1]].map(([l,fn,d],i)=><button key={i} onClick={fn} disabled={d} style={{background:"transparent",color:P.accent,border:`1px solid ${P.accent}44`,padding:"5px 9px",fontSize:11,borderRadius:4}}>{l}</button>)}
      <span style={{color:P.muted,fontSize:9,marginLeft:3}}>{idx+1}/{steps.length}</span>
      <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
        {[["0.5×",1200],["1×",700],["2×",350],["4×",120]].map(([l,v])=><button key={l} onClick={()=>setSpeed(v)} style={{padding:"2px 6px",fontSize:8,borderRadius:3,background:speed===v?`${P.accent}20`:"transparent",color:speed===v?P.accent:P.muted,border:`1px solid ${speed===v?P.accent:P.border}`}}>{l}</button>)}
      </div>
    </div>
    <div style={{height:3,background:P.border,borderRadius:2,overflow:"hidden",marginBottom:9}}>
      <div style={{height:"100%",width:`${((idx+1)/steps.length)*100}%`,background:`linear-gradient(90deg,${P.accent},${P.a3})`,transition:"width 0.2s"}}/>
    </div>
    <div style={{background:"#050510",border:`1px solid ${P.border}`,borderRadius:5,padding:"10px 12px",fontSize:12,color:step?(phaseColor[step.phase]||P.text):P.muted,lineHeight:1.6,minHeight:40}}>
      <span style={{color:P.muted}}>$ </span>{step?.msg||"—"}<span style={{animation:"blink 1s infinite",color:P.accent,marginLeft:2}}>█</span>
    </div>
    <div ref={logRef} style={{marginTop:6,background:"#040410",border:`1px solid ${P.border}`,borderRadius:5,padding:8,height:85,overflowY:"auto",fontSize:9}}>
      {steps.slice(0,idx+1).map((s,i)=><div key={i} style={{color:i===idx?(phaseColor[s.phase]||P.text):P.muted,padding:"1px 0",opacity:i===idx?1:.4}}><span style={{color:`${P.accent}44`,marginRight:6}}>{String(i+1).padStart(3,"0")}</span>{s.msg}</div>)}
    </div>
  </div>;
}

// AI viz
function AIViz({step,vizType}){
  if(!step)return null;
  if(vizType==="bars"&&step.arrayState){
    const a=step.arrayState,max=Math.max(...a,1);
    return <div style={{display:"flex",alignItems:"flex-end",gap:3,flexWrap:"wrap",minHeight:130,padding:"6px 0"}}>
      {a.map((v,i)=>{
        let c=P.muted;
        if(step.special?.includes(i))c="#ffdd00";else if(step.swapped?.includes(i))c=P.a4;
        else if(step.highlights?.includes(i))c=P.a2;else if(step.sorted?.includes(i))c=P.a3;
        const h=Math.max(8,(v/max)*120);
        return <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{color:c,fontSize:9,fontWeight:700,minWidth:14,textAlign:"center"}}>{v}</span>
          <div style={{width:Math.max(14,Math.floor(360/a.length)-3),height:h,background:c,borderRadius:"2px 2px 0 0",boxShadow:c!==P.muted?`0 0 7px ${c}`:"none",transition:"all 0.2s"}}/>
          <span style={{color:P.muted,fontSize:8}}>{i}</span>
        </div>;
      })}
    </div>;
  }
  if(vizType==="table2d"&&step.tableState){
    const t=step.tableState,maxV=Math.max(...t.flat(),1);
    return <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",fontFamily:"monospace",fontSize:10}}>
      <tbody>{t.map((row,i)=><tr key={i}><td style={{padding:"2px 5px",color:P.muted,fontSize:9}}>{i}</td>
        {row.map((v,j)=>{const isA=step.activeCell&&step.activeCell[0]===i&&step.activeCell[1]===j;return <td key={j} style={{padding:"3px 7px",textAlign:"center",color:isA?"#000":v>0?P.text:P.muted,background:isA?P.accent:v>0?`rgba(0,212,255,${(v/maxV)*0.15})`:"transparent",border:`1px solid ${isA?P.accent:P.border}`,transition:"all 0.18s",minWidth:26,fontWeight:isA?700:400}}>{v}</td>;})}
      </tr>)}</tbody>
    </table></div>;
  }
  // custom
  const items=step.arrayState||[];
  return <div style={{display:"flex",gap:7,flexWrap:"wrap",minHeight:50,alignItems:"center",padding:"8px 0"}}>
    {items.map((v,i)=>{
      let c=P.muted;
      if(step.special?.includes(i))c="#ffdd00";else if(step.highlights?.includes(i))c=P.a2;else if(step.sorted?.includes(i))c=P.a3;
      return <div key={i} style={{padding:"7px 13px",border:`1px solid ${c}`,background:`${c}18`,color:c,borderRadius:5,fontFamily:"monospace",fontSize:12,fontWeight:700,boxShadow:c!==P.muted?`0 0 7px ${c}50`:"none",transition:"all 0.2s"}}>{String(v)}</div>;
    })}
    {step.extra&&<div style={{width:"100%",marginTop:5,color:P.accent,fontSize:11}}>→ {step.extra}</div>}
  </div>;
}

export default function App(){
  const [tab,setTab]=useState("builtin");
  const [algoId,setAlgoId]=useState("BUBBLE");
  const [inp,setInp]=useState({arr:"5 3 8 1 9 2 7 4 6",s1:"ABCBDAB",s2:"BDCAB",w:"2 3 4 5",v:"3 4 5 6",cap:"8",target:"7"});
  const [bSteps,setBSteps]=useState([]);const [bResult,setBResult]=useState(null);
  const bPb=usePlayback(bSteps);
  const [query,setQuery]=useState("");const [aiLoading,setAiLoading]=useState(false);
  const [aiData,setAiData]=useState(null);const [aiError,setAiError]=useState("");
  const aiPb=usePlayback(aiData?.steps||[]);
  const ca=GROUPS.flatMap(g=>g.items).find(a=>a.id===algoId);

  const runB=useCallback(()=>{const {steps:s,result:r}=runBuiltin(algoId,inp);setBSteps(s);setBResult(r);},[algoId,inp]);

  const genAI=async(q=query)=>{
    if(!q.trim())return;
    setAiLoading(true);setAiError("");setAiData(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:4000,
        system:`You are an algorithm visualization engine. Respond ONLY with raw JSON — no markdown, no explanation.
Format:
{"title":"...","description":"...","vizType":"bars|table2d|custom","steps":[{"msg":"...","phase":"init|compare|update|swap|result","arrayState":[1,2,3],"highlights":[0],"swapped":[1,2],"sorted":[3,4],"special":[0],"tableState":[[0,1],[2,3]],"activeCell":[1,2],"extra":"..."}],"result":"..."}
Rules: 10-20 steps on small input. bars=sorting/search. table2d=DP. custom=everything else. Always init first, result last. Explain WHY each step. Be accurate.`,
        messages:[{role:"user",content:`Visualize algorithm: ${q}`}],
      })});
      const data=await res.json();
      const raw=data.content?.map(b=>b.text||"").join("")||"";
      setAiData(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    }catch(e){setAiError("Failed to generate. Try rephrasing.");}
    setAiLoading(false);
  };

  const panel=(ch,s={})=><div style={{background:P.panel,border:`1px solid ${P.border}`,borderRadius:8,padding:14,...s}}>{ch}</div>;
  const sec=(t,c=P.accent)=><div style={{color:c,fontSize:9,letterSpacing:2,marginBottom:10,display:"flex",alignItems:"center",gap:5}}><div style={{width:4,height:4,background:c,borderRadius:"50%",boxShadow:`0 0 4px ${c}`}}/>{t}</div>;

  const bs=bSteps[bPb.idx];
  const as=aiData?.steps?.[aiPb.idx];

  return <div style={{minHeight:"100vh",background:P.bg,color:P.text,fontFamily:"'Courier New',monospace",padding:"14px 11px"}}>
    <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:${P.bg}}::-webkit-scrollbar-thumb{background:${P.border};border-radius:3px}input{background:${P.panel};border:1px solid ${P.border};color:${P.text};padding:6px 9px;border-radius:4px;font-family:'Courier New',monospace;font-size:12px;outline:none;width:100%;transition:border .2s}input:focus{border-color:${P.accent};box-shadow:0 0 6px ${P.accent}33}button{cursor:pointer;border:none;font-family:'Courier New',monospace;transition:all .15s}button:disabled{opacity:.3;cursor:not-allowed}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fu{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}`}</style>

    <div style={{maxWidth:860,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{fontSize:22,fontWeight:900,color:P.accent,letterSpacing:5,textShadow:`0 0 22px ${P.accent}`,marginBottom:2}}>ALGO_VIZ</div>
        <div style={{color:P.muted,fontSize:9,letterSpacing:4}}>ALGORITHM VISUALIZATION TERMINAL v3.0</div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:0,marginBottom:14,background:P.panel,border:`1px solid ${P.border}`,borderRadius:7,padding:3}}>
        {[["builtin","⚙  BUILT-IN",P.accent],["ai","✦  AI MODE — TYPE ANY ALGO",P.a4]].map(([t,l,c])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"9px 0",fontSize:11,letterSpacing:1,borderRadius:5,background:tab===t?`${c}18`:"transparent",color:tab===t?c:P.muted,border:tab===t?`1px solid ${c}`:"1px solid transparent",fontWeight:tab===t?700:400}}>{l}</button>
        ))}
      </div>

      {/* BUILT-IN */}
      {tab==="builtin"&&<div style={{display:"flex",flexDirection:"column",gap:11}}>
        {panel(<>
          {sec("SELECT ALGORITHM")}
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {GROUPS.map(g=><div key={g.label}>
              <div style={{color:g.color,fontSize:8,letterSpacing:3,marginBottom:5,opacity:.7}}>{g.label}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {g.items.map(item=><button key={item.id} onClick={()=>setAlgoId(item.id)} style={{background:algoId===item.id?`${g.color}18`:"transparent",border:`1px solid ${algoId===item.id?g.color:P.border}`,color:algoId===item.id?g.color:P.muted,padding:"5px 12px",fontSize:11,borderRadius:4,boxShadow:algoId===item.id?`0 0 8px ${g.color}30`:"none"}}>{item.label}</button>)}
              </div>
            </div>)}
          </div>
        </>)}
        {panel(<>
          {sec(`INPUT — ${ca?.full||""}`)}
          {(ca?.type==="array"||ca?.type==="bsearch")&&<div style={{marginBottom:7}}><label style={{color:P.muted,fontSize:9,display:"block",marginBottom:3}}>ARRAY</label><input value={inp.arr} onChange={e=>setInp(p=>({...p,arr:e.target.value}))}/></div>}
          {ca?.type==="bsearch"&&<div style={{marginBottom:7}}><label style={{color:P.muted,fontSize:9,display:"block",marginBottom:3}}>TARGET</label><input value={inp.target} onChange={e=>setInp(p=>({...p,target:e.target.value}))}/></div>}
          {ca?.type==="strings"&&<div style={{display:"flex",gap:7,marginBottom:7,flexWrap:"wrap"}}><div style={{flex:1,minWidth:100}}><label style={{color:P.muted,fontSize:9,display:"block",marginBottom:3}}>STRING 1</label><input value={inp.s1} onChange={e=>setInp(p=>({...p,s1:e.target.value}))}/></div><div style={{flex:1,minWidth:100}}><label style={{color:P.muted,fontSize:9,display:"block",marginBottom:3}}>STRING 2</label><input value={inp.s2} onChange={e=>setInp(p=>({...p,s2:e.target.value}))}/></div></div>}
          {ca?.type==="knapsack"&&<div style={{display:"flex",gap:7,marginBottom:7,flexWrap:"wrap"}}><div style={{flex:2,minWidth:90}}><label style={{color:P.muted,fontSize:9,display:"block",marginBottom:3}}>WEIGHTS</label><input value={inp.w} onChange={e=>setInp(p=>({...p,w:e.target.value}))}/></div><div style={{flex:2,minWidth:90}}><label style={{color:P.muted,fontSize:9,display:"block",marginBottom:3}}>VALUES</label><input value={inp.v} onChange={e=>setInp(p=>({...p,v:e.target.value}))}/></div><div style={{flex:1,minWidth:60}}><label style={{color:P.muted,fontSize:9,display:"block",marginBottom:3}}>CAP</label><input value={inp.cap} onChange={e=>setInp(p=>({...p,cap:e.target.value}))}/></div></div>}
          {ca?.type==="graph"&&<p style={{color:P.muted,fontSize:10,margin:"0 0 7px"}}>7-node graph A–G.</p>}
          <button onClick={runB} style={{background:P.accent,color:"#000",fontWeight:700,padding:"7px 18px",fontSize:11,borderRadius:4,letterSpacing:2,boxShadow:`0 0 12px ${P.accent}45`}}>▶ RUN</button>
        </>)}
        {panel(<>
          {sec("VISUALIZATION")}
          {!bs&&<div style={{color:P.muted,textAlign:"center",padding:28,fontSize:11}}>Press ▶ RUN above</div>}
          {bs&&(ca?.type==="array"||ca?.type==="bsearch")&&<Bars step={bs}/>}
          {bs&&algoId==="LIS"&&bs.dp&&<><div style={{color:P.muted,fontSize:8,marginTop:10,letterSpacing:1}}>DP ARRAY:</div><div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>{bs.dp.map((v,i)=>{const isA=bs.active?.includes(i),isC=bs.comparing?.includes(i);return <div key={i} style={{textAlign:"center"}}><div style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:isA?"rgba(0,212,255,0.2)":isC?"rgba(255,107,53,0.15)":"transparent",border:`1px solid ${isA?P.accent:isC?P.a2:P.border}`,color:isA?P.accent:P.text,fontWeight:700,fontSize:11,borderRadius:4,transition:"all 0.2s"}}>{v}</div><div style={{color:P.muted,fontSize:7,marginTop:2}}>dp[{i}]</div></div>;})}</div></>}
          {bs&&ca?.type==="strings"&&<Table2D step={bs} maxC={(bs.s2?.length||0)+1}/>}
          {bs&&ca?.type==="knapsack"&&<Table2D step={bs} maxC={parseInt(inp.cap)+1}/>}
          {bs&&ca?.type==="graph"&&<GraphView step={bs}/>}
        </>)}
        {bSteps.length>0&&panel(<>{sec("PLAYBACK")}<Controls {...bPb} steps={bSteps}/></>)}
        {bResult!==null&&bPb.idx===bSteps.length-1&&bSteps.length>0&&(
          <div style={{background:"rgba(0,212,255,0.04)",border:`1px solid ${P.accent}`,borderRadius:7,padding:"13px 16px",textAlign:"center",animation:"fu 0.3s ease"}}>
            <div style={{color:P.muted,fontSize:8,letterSpacing:3,marginBottom:4}}>RESULT</div>
            <div style={{fontSize:Array.isArray(bResult)?13:24,fontWeight:900,color:P.accent,textShadow:`0 0 16px ${P.accent}`,wordBreak:"break-all"}}>{Array.isArray(bResult)?`[ ${bResult.join(", ")} ]`:String(bResult)}</div>
            <div style={{color:P.muted,fontSize:9,marginTop:3}}>{ca?.full}</div>
          </div>
        )}
      </div>}

      {/* AI MODE */}
      {tab==="ai"&&<div style={{display:"flex",flexDirection:"column",gap:11}}>
        {panel(<>
          {sec("TYPE ANY ALGORITHM — AI GENERATES THE VISUALIZATION",P.a4)}
          <div style={{display:"flex",gap:7,marginBottom:11}}>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&genAI()} placeholder="e.g. Dijkstra, Coin Change, Edit Distance, Rabin-Karp, Prim's MST..." style={{flex:1,fontSize:13}}/>
            <button onClick={()=>genAI()} disabled={aiLoading||!query.trim()} style={{background:aiLoading?P.muted:P.a4,color:"#000",fontWeight:700,padding:"7px 16px",fontSize:11,borderRadius:5,letterSpacing:1,whiteSpace:"nowrap",boxShadow:!aiLoading?`0 0 12px ${P.a4}45`:"none"}}>{aiLoading?"⏳...":"✦ GENERATE"}</button>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            <span style={{color:P.muted,fontSize:9,alignSelf:"center",marginRight:2}}>TRY:</span>
            {["Dijkstra","Coin Change","Edit Distance","Floyd-Warshall","Huffman Encoding","Prim's MST","Rabin-Karp","Activity Selection"].map(ex=>(
              <button key={ex} onClick={()=>{setQuery(ex);genAI(ex);}} style={{background:"transparent",border:`1px solid ${P.border}`,color:P.muted,padding:"3px 8px",fontSize:9,borderRadius:4,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=P.a4;e.currentTarget.style.color=P.a4;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.color=P.muted;}}
              >{ex}</button>
            ))}
          </div>
        </>)}

        {aiLoading&&<div style={{background:P.panel,border:`1px solid ${P.a4}`,borderRadius:8,padding:38,textAlign:"center"}}>
          <div style={{fontSize:24,marginBottom:8,animation:"spin 1s linear infinite",display:"inline-block"}}>⚙</div>
          <div style={{color:P.a4,fontSize:11,letterSpacing:2}}>AI IS GENERATING VISUALIZATION...</div>
          <div style={{color:P.muted,fontSize:9,marginTop:3}}>Analyzing algorithm and building steps</div>
        </div>}

        {aiError&&<div style={{background:"rgba(255,107,53,0.08)",border:`1px solid ${P.a2}`,borderRadius:7,padding:12,color:P.a2,fontSize:11,textAlign:"center"}}>⚠ {aiError}</div>}

        {aiData&&!aiLoading&&<div style={{display:"flex",flexDirection:"column",gap:11,animation:"fu 0.35s ease"}}>
          <div style={{background:P.panel,border:`1px solid ${P.a4}33`,borderRadius:8,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:7}}>
            <div><div style={{color:P.a4,fontSize:14,fontWeight:900,letterSpacing:2}}>{aiData.title}</div><div style={{color:P.muted,fontSize:10,marginTop:2}}>{aiData.description}</div></div>
            <div style={{color:P.muted,fontSize:9,border:`1px solid ${P.border}`,padding:"2px 8px",borderRadius:4}}>{aiData.steps?.length} STEPS</div>
          </div>
          {panel(<>{sec("VISUALIZATION")}<AIViz step={as} vizType={aiData.vizType}/>{as?.extra&&aiData.vizType!=="custom"&&<div style={{marginTop:7,color:P.accent,fontSize:10}}>→ {as.extra}</div>}</>)}
          {panel(<>{sec("PLAYBACK")}<Controls {...aiPb} steps={aiData.steps}/></>)}
          {aiPb.idx===aiData.steps.length-1&&aiData.result&&(
            <div style={{background:"rgba(201,123,255,0.04)",border:`1px solid ${P.a4}`,borderRadius:7,padding:"13px 16px",textAlign:"center"}}>
              <div style={{color:P.muted,fontSize:8,letterSpacing:3,marginBottom:4}}>RESULT</div>
              <div style={{fontSize:20,fontWeight:900,color:P.a4,textShadow:`0 0 16px ${P.a4}`}}>{aiData.result}</div>
              <div style={{color:P.muted,fontSize:9,marginTop:3}}>{aiData.title}</div>
            </div>
          )}
        </div>}

        {!aiData&&!aiLoading&&!aiError&&<div style={{background:P.panel,border:`1px dashed ${P.border}`,borderRadius:8,padding:40,textAlign:"center"}}>
          <div style={{fontSize:26,marginBottom:8,opacity:.3}}>✦</div>
          <div style={{color:P.muted,fontSize:11}}>Type any algorithm above and press GENERATE</div>
          <div style={{color:`${P.muted}88`,fontSize:9,marginTop:3}}>Works with ANY algorithm — classical, advanced, or custom</div>
        </div>}
      </div>}

      <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",paddingTop:14,paddingBottom:18}}>
        {[[P.accent,"ACTIVE"],[P.a2,"COMPARING"],[P.a3,"SORTED"],[P.a4,"SWAP"],["#ffdd00","PIVOT"],[P.muted,"DEFAULT"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,background:c,borderRadius:2,boxShadow:`0 0 4px ${c}60`}}/><span style={{color:P.muted,fontSize:8}}>{l}</span></div>
        ))}
      </div>
    </div>
  </div>;
}
