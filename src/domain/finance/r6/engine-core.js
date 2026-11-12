/* eslint-disable */
// r6 데모(끼니 수정데모 r6, 2026-11-08)의 계산 엔진을 그대로 옮긴 모듈.
// 제출 보고서의 수치(정기 월수지 −61만, 59세 고갈, 95세 −27.1억 / 추천안 −12만·유지·+3.2억)를
// 같은 식으로 재현하기 위해 원본 식을 바꾸지 않았다. 단위는 만 원.

export const BASE={age0:50,sage0:48,kids:[21,18],par_age:78,par_inc:180,par_care:false,
net_m:600,gross:9000,sp_net_m:0,sp_ret:60,peak_age:55,peak_cut:0.2,retire:60,basic_m:258,ret_m:298.1,infl:0.02,
tuition:823,hag_m:79.3,par_m:50,par_years:11,
loan:18000,loan_r:0.042,loan_n:15,ins_m:45,dep0:3500,inv0:2500,mt0:1500,house:60000,car:2000,
safe_r:0.03,risk_r:0.06,risk_w:0.1,dc0:11000,dc_r:0.04,dc_n:10,rt_eff:0.05,ps0:1800,ps_m:25,irp_y:0,ps_age:60,ps_n:15,
np_m:174,np_age:65,np_idx:0.021,early:0.06,late:0.072,snp_m:0,med:550.8,med_s:0.2,
cl_ps:600,cl_all:900,cr_lo:0.165,cr_hi:0.132,cr_th:5500,edu_cr:0.15,edu_cap:900,
card_ref:0,ds_age:0,ds_cash:0,reemp_m:0,hp_age:0,hp_m:0,death_age:0,cover:0,sp_prem:0,sp_years:0,ev_job:false,ev_care:false,ev_wed:false,ev_rate:false,ret_min:216.6,
 int_tax:0.154,isa_cap:0,mt_r:0.055,mt_lim:5000,dc_w:0.3,med_infl:0.03,nh:true,nh_rate:0.0719,nh_ltc:0.1314,prop_m:null,horizon:95,mtr:null,npc_m:0,ev_loanrate:false,prepay:false,inh_age:0,inh_amt:0};
export function propPrem(house){return Math.max(0,house*0.69*0.6-10000)/15000*12;} // 지역 건보 재산분(월, 만원) 근사: 공시가 69%·공정시장가액 60%·공제 1억, 과표 1.5억당 월 약 12만 원 (팀 추정, 공단 모의계산으로 확인)
export function mtrOf(g){const t=g*0.7;return (t<=1400?0.06:t<=5000?0.15:t<=8800?0.24:t<=15000?0.35:0.38)*1.1+0.05;} // 한계세율 근사(지방세 포함)+건강·고용보험
export function pmt(r,n,pv){return r===0?pv/n:pv*r/(1-Math.pow(1+r,-n));}
export function loanBal(L,r,n,k){if(L<=0||k>=n)return 0;const m=r/12,N=n*12,K=k*12;if(m===0)return L*(1-K/N);const pm=pmt(m,N,L);return L*Math.pow(1+m,K)-pm*(Math.pow(1+m,K)-1)/m;}
export function npStart(age0,year0){const b=year0-age0;return b>=1969?65:b>=1965?64:b>=1961?63:b>=1957?62:b>=1953?61:60;}
export const RATE_SHOCK=0.01;
export function safeRate(o,shock=!!o.ev_rate){return o.safe_r-(shock?RATE_SHOCK:0);}
export function run(o){
 const p=Object.assign({},BASE,o); p.fin0=p.dep0+p.inv0-p.mt0;
 const hasSp=p.sage0>0, kids=(p.kids||[]).filter(k=>k>=0&&k!==null&&!isNaN(k));
 const normalAge=npStart(p.age0,2026); const adj=p.np_age<normalAge?Math.max(0,1-p.early*(normalAge-p.np_age)):1+p.late*Math.min(5,p.np_age-normalAge);
 const rn=p.reemp_m>0?(p.reemp_n??5):0; p.np_m=p.np_m+(p.np_add||0)*Math.min(1,rn/5); // 임의계속가입 효과는 실제로 일한(보험료 낸) 기간만큼
 const loanY=p.loan>0?pmt(p.loan_r/12,p.loan_n*12,p.loan)*12:0;
 const safe=safeRate(p);
 const dcr0=safe*(1-p.dc_w)+p.risk_r*p.dc_w, prop=p.prop_m??propPrem(p.house), mtr=p.mtr??mtrOf(p.gross);
 const cut=p.dc_n>20?0.5:p.dc_n>10?0.4:0.3, cr=p.gross<=p.cr_th?p.cr_lo:p.cr_hi;
 let T=p.fin0,W=p.dc0,Y=p.ps0,g=1,cuts=0,mortgagePaid=false; const rows=[], n=(p.horizon||95)-p.age0+1, gmin=p.ret_min/p.ret_m;
 for(let i=0;i<n;i++){
  const yr=2026+i,age=p.age0+i,sage=hasSp?p.sage0+i:-99,f=p.seq?p.seq.slice(0,i).reduce((a,x)=>a*(1+x.inf),1):Math.pow(1+p.infl,i), npf=p.seq?f*Math.pow(1.001,i):Math.pow(1+p.np_idx,i);
  const dead=p.death_age>0&&age>=p.death_age, dyr=p.death_age>0&&age===p.death_age;
  if(dyr){T+=W+Y;W=0;Y=0;}
  const sold=p.ds_age>0&&age>=p.ds_age, syr=p.ds_age>0&&age===p.ds_age;
  if(syr){T+=p.ds_cash-(mortgagePaid?0:loanBal(p.loan,p.loan_r,p.loan_n,i));mortgagePaid=true;}
  if(p.prepay&&!mortgagePaid&&p.loan>0&&age===p.retire&&i<p.loan_n){const b=loanBal(p.loan,p.loan_r,p.loan_n,i),gross=b/(1-p.rt_eff);if(W>=gross){W-=gross;mortgagePaid=true;}}
  const prepaid=mortgagePaid;
  if(p.inh_age&&i===p.inh_age) T+=p.inh_amt;
  let wage=(!dead&&age<p.retire)?(age>=p.peak_age?Math.max(0,p.net_m*(1-p.peak_cut)):p.net_m)*12:0;
  if(p.ev_job&&age>=56&&age<p.retire) wage*=0.5;
  if(p.ev_carejob&&i===4&&age<p.retire) wage=0; // 부모 돌봄으로 1년 무급 휴직
  if(!dead&&age>=p.retire&&age<p.retire+(p.reemp_n??5)) wage+=p.reemp_m*12;
  if(hasSp&&sage<p.sp_ret) wage+=p.sp_net_m*12;
  const ka=kids.map(k=>k+i), col=ka.filter(a=>a>=19&&a<=22).length, hs=ka.filter(a=>a>=16&&a<=18).length;
  const working=!dead&&age<p.retire;
  const psC=working?p.ps_m*12:0, irp=working?p.irp_y:0;
  const creditPotential=working?(Math.min(psC,p.cl_ps)+Math.min(irp,p.cl_all-Math.min(psC,p.cl_ps)))*cr+Math.min(p.tuition*f,p.edu_cap)*col*p.edu_cr+p.card_ref:0;
  const credit=i===0?Math.max(0,p.refund_y||0):0;
  const survivor=hasSp?Math.max(0,p.survivor_m||0)*12*npf:0;
  const own=hasSp&&sage>=npStart(p.sage0,2026)?p.snp_m*12*npf:0;
  const np=dead?(hasSp?(own>0?Math.max(survivor-own,survivor*0.3):survivor):0):(age>=p.np_age?p.np_m*12*adj*npf:0);
  const snp=own;
  const U=working?p.gross*(age>=p.peak_age?1-p.peak_cut:1)/12:0;
  const yrk=age-p.retire+1, dcr=p.seq?p.seq[i].d:(p.dc_rate??dcr0);
  const V=(age>=p.retire&&age<p.retire+p.dc_n&&W>0)?Math.min(Math.max(0,W*(1+dcr)+U),pmt(dcr0,p.retire+p.dc_n-age,W),yrk<=10?W*1.2/(11-yrk):Infinity):0; // 연금수령한도: 평가액÷(11−연차)×120%
  const yr_k=age-p.retire+1, cutk=yr_k>20?0.5:yr_k>10?0.4:0.3; const H=V*(1-p.rt_eff*(1-cutk));
  const pk=age-p.ps_age+1;
  const X=(age>=p.ps_age&&age<p.ps_age+p.ps_n&&Y>0)?Math.min(Math.max(0,Y*(1+dcr)+psC+irp),pmt(dcr0,p.ps_age+p.ps_n-age,Y),pk<=10?Y*1.2/(11-pk):Infinity):0;
  const privateTaxRate=X>1500?0.165:(age<70?0.055:age<80?0.044:0.033); const I=X*(1-privateTaxRate);
  const hp=(p.hp_age&&age>=p.hp_age)?p.hp_m*12:0;
  const termOn=age<(p.term_end||0);
  const J=wage+credit+np+snp+H+I+hp+(dyr?(p.cover+(termOn?(p.term_cover||0):0)):0);
  if(p.gref&&age>p.retire&&i>0){const z=rows[i-1].Z,r=p.gref[i-1];if(z<r*0.8&&g>gmin){g=Math.max(gmin,g-0.1);cuts++;}else if(z>=r&&g<1)g=Math.min(1,g+0.05);}
  const gk=age>=p.retire?g:1;
  const K=(age<p.retire?p.basic_m:p.ret_m)*12*f*(dead?0.7:1)*gk;
  const L=(p.tuition*col+p.hag_m*12*hs)*f;
  let M=i<p.par_years?p.par_m*12:0; if(p.ev_care&&i>=4&&i<=8) M+=100*12*f;
  let N=(i<p.loan_n&&!sold&&!prepaid)?loanY:0;
  if(N&&p.ev_loanrate&&i>=1) N=pmt((p.loan_r+0.02)/12,(p.loan_n-1)*12,loanBal(p.loan,p.loan_r,p.loan_n,1))*12;
  const O=!dead?((age<p.retire?p.ins_m:Math.max(0,p.ins_ret_m||0))+(termOn?(p.term_m||0):0))*12:0;
  const P=((!dead&&age>=65)+(sage>=65))*p.med*p.med_s*Math.pow(1+p.med_infl,i)*(p.seq?f/Math.pow(1+p.infl,i):1);
  const reempOn=p.reemp_m>0&&age>=p.retire&&age<p.retire+(p.reemp_n??5)&&!dead;
  const NH=(p.nh&&age>=p.retire&&!reempOn)?(((np+snp)*0.5)*p.nh_rate+prop*12*f)*(1+p.nh_ltc):0; // 지역가입자 건보료(연): 공적연금 50%×7.19% + 재산분, 장기요양 13.14%
  const Q=psC+irp;
  let extra=NH; if(p.sp_prem&&i<p.sp_years) extra+=p.sp_prem*12*Math.min(0.13,0.095+0.005*i)/0.095;
  if(p.npc_m&&reempOn) extra+=p.npc_m*12*Math.min(0.13,0.095+0.005*i)/0.095;
  if(p.ltc_age&&!dead&&age>=p.ltc_age&&age<p.ltc_age+(p.ltc_n||5)) extra+=(p.ltc_m||0)*12*f*(1-(p.ltc_cut||0));
  if(p.ev_wed) extra+=ka.filter(a=>a===32).length*(p.wed_amt||2956)*f;
  const debt=T<0?(-T)*p.mt_r:0; // 연초 차입잔액의 이자를 지출에 한 번만 반영
  const R=K+L+M+N+O+P+Q+extra+debt, S=J-R;
  const sf=p.seq?p.seq[i].sf:safe, rk=p.seq?p.seq[i].rk:p.risk_r;
  let fr;
  if(T>=0){const em=Math.min(T,R/2), wr=T>0?Math.max(0,T-em)*p.risk_w/T:0, isa=Math.min(T,p.isa_cap?Math.min(p.isa_cap,2000*(i+1)):0), tx=T>0?(isa*0.099+(T-isa)*p.int_tax)/T:p.int_tax;
   fr=sf*(1-wr)*(1-tx)+rk*wr;}
  else fr=0;
  // 이자는 R과 S에 포함되어 있으므로 자산에서 다시 차감하지 않음
  T=T*(1+fr)+S; W=W*(1+dcr)+U-V; Y=Y*(1+dcr)+Q-X;
  rows.push({creditPotential,privateTaxRate,fundingGap:Math.max(0,-T-p.mt_lim),NH,debt,g:gk,tax:(V-H)+(X-I),i,yr,age,sage,wage,credit,np,snp,H,I,hp,J,K,L,M,N,O,P,Q,extra,R,S,T,W,Y,Z:T+W+Y,V,X,col,hs});
 }
 const dep=rows.find(r=>r.T<0);
 const crev=rows.filter(r=>r.age>=p.retire&&r.age<p.np_age).reduce((a,r)=>a+r.S,0);
 return {p,rows,deplete:dep?dep.age:null,z95:rows[rows.length-1].Z,crev,m0:(rows[0].S-rows[0].credit)/12,annualAverage:rows[0].S/12,loanY,cuts,taxSum:rows.reduce((a,r)=>a+r.tax,0),wdSum:rows.reduce((a,r)=>a+r.V+r.X,0),maxX:Math.max(...rows.map(r=>r.X)),gLow:Math.min(...rows.map(r=>r.g))};
}

