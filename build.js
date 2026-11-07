// Canopy static site generator. No dependencies. Run: node build.js -> dist/
// Content lives in content/. See EDITING-GUIDE.md for what every field does.
const fs=require('fs'),P=require('path'),R=__dirname,C=p=>P.join(R,'content',p),O=P.join(R,'dist');
const readJSON=(p,fb)=>fs.existsSync(C(p))?JSON.parse(fs.readFileSync(C(p),'utf8').replace(/^﻿/,'')):fb;
const S=readJSON('site.json');
const CATS=readJSON('categories.json',{cats:S.cats||[]}).cats||[];   // menu: rooms + their categories
const SEC=readJSON('sections.json',{});                              // home / blog / works / areas landing pages
const UI={en:{shop:'Shop now',price:'Tk',call:'Call',wa:'Order on WhatsApp',works:'Our Works',blog:'Blog',areas:'Areas',testi:'What our customers say',room:'Shop by room',trend:'Trending at Canopy',lang:'বাংলা',enq:'Send enquiry',name:'Your name',phone:'Phone',msg:'Message',visit:'Visit our showrooms',rel:'You may also like',none:'Products coming soon.'},
bn:{shop:'এখনই কিনুন',price:'৳',call:'কল করুন',wa:'হোয়াটসঅ্যাপে অর্ডার',works:'আমাদের কাজ',blog:'ব্লগ',areas:'এলাকা',testi:'গ্রাহকদের মতামত',room:'রুম অনুযায়ী কিনুন',trend:'ক্যানোপিতে জনপ্রিয়',lang:'English',enq:'অনুসন্ধান পাঠান',name:'আপনার নাম',phone:'ফোন',msg:'বার্তা',visit:'আমাদের শোরুম',rel:'আপনার পছন্দ হতে পারে',none:'পণ্য শীঘ্রই আসছে।'}};
const fmt=n=>Number(n).toLocaleString('en-IN');
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const md=s=>s.split(/\n{2,}/).map(b=>{b=b.trim();if(!b)return'';
 const i=t=>t.replace(/!\[(.*?)\]\((.*?)\)/g,'<img src="$2" alt="$1" loading=lazy>').replace(/\[(.*?)\]\((.*?)\)/g,'<a href="$2">$1</a>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>').replace(/(^|[^*\w])[*_]([^*_\n]+)[*_](?![*\w])/g,'$1<em>$2</em>');
 const m=b.match(/^(#{1,4}) (.*)/);if(m)return`<h${m[1].length}>${i(m[2])}</h${m[1].length}>`;
 if(/^[-*] /.test(b))return'<ul>'+b.split('\n').map(l=>'<li>'+i(l.replace(/^[-*] /,''))+'</li>').join('')+'</ul>';
 if(/^\d+\. /.test(b))return'<ol>'+b.split('\n').map(l=>'<li>'+i(l.replace(/^\d+\. /,''))+'</li>').join('')+'</ol>';
 return'<p>'+i(b)+'</p>'}).join('');
// Front matter: a small YAML subset (key: value, 'quoted', lists "- x", block text "|" / ">", # comments). Works with hand-written files and files saved by /admin.
const unq=v=>{v=v.trim();if(/^'.*'$/.test(v))return v.slice(1,-1).replace(/''/g,"'");if(/^".*"$/.test(v))return JSON.parse(v);return v};
const yaml=src=>{const o={},L=src.split('\n');for(let i=0;i<L.length;i++){const m=L[i].match(/^([\w-]+):\s*(.*)$/);if(!m)continue;const[,k,v]=m;
 if(/^[|>][-+]?$/.test(v)){const b=[];while(i+1<L.length&&(/^\s/.test(L[i+1])||L[i+1]===''))b.push(L[++i]);const ind=Math.min(...b.filter(x=>x.trim()).map(x=>x.match(/^ */)[0].length));o[k]=b.map(x=>x.slice(ind)).join(v[0]=='>'?' ':'\n').trim()}
 else if(v===''&&/^\s*- /.test(L[i+1]||'')){const a=[];while(/^\s*- /.test(L[i+1]||''))a.push(unq(L[++i].replace(/^\s*- /,'')));o[k]=a.join(', ')}
 else if(/^\[.*\]$/.test(v))o[k]=v.slice(1,-1).split(',').map(unq).filter(Boolean).join(', ');else o[k]=unq(v)}return o};
const load=d=>fs.existsSync(C(d))?fs.readdirSync(C(d)).filter(f=>f.endsWith('.md')).map(n=>{
 const raw=fs.readFileSync(C(d+'/'+n),'utf8').replace(/^﻿/,'').replace(/\r\n?/g,'\n'),m=raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
 if(!m){console.warn('Skipped (no front matter):',d+'/'+n);return null}
 const o={...yaml(m[1]),slug:n.slice(0,-3)};let[en,bn]=m[2].split(/^\\?<!--bn--\\?>\s*$/m);if(o.body_bn)bn=o.body_bn;
 o.body={en:en||'',bn:bn||en||''};return o}).filter(Boolean):[];

// ---- Visibility & SEO controls (same field names everywhere) ----
// draft: true      -> page is not built at all
// index: false     -> page is built but tells Google not to index it, and is left out of sitemap.xml
// date             -> shown on blog posts; used as "last modified" in sitemap.xml
// canonical(_bn)   -> override the canonical URL ("/category/sofas/" or a full https:// URL)
// seo_title(_bn)   -> override the browser/Google title (used exactly as written)
// subtitle(_bn)    -> line shown under the page heading
// summary(_bn)     -> meta description for Google
const yes=v=>String(v).toLowerCase()==='true';
const draft=o=>yes(o?.draft);
const noindex=o=>String(o?.index).toLowerCase()==='false';
const f=(o,k,l)=>(l=='bn'&&o[k+'_bn'])||o[k]||'';       // Bangla falls back to English
const g=(o,k,l)=>(l=='bn'?o[k+'_bn']:o[k])||'';         // no fallback (titles, subtitles, canonicals)
const name=(o,l)=>o[l]||o.title&&f(o,'title',l)||'';    // categories use en/bn, files use title/title_bn
const sub=(o,l)=>g(o,'subtitle',l)?`<p class=lead>${g(o,'subtitle',l)}</p>`:'';
const fdate=(d,l)=>{const t=new Date(String(d||'').slice(0,10)+'T00:00:00');return isNaN(t)?'':t.toLocaleDateString(l=='bn'?'bn-BD':'en-GB',{day:'numeric',month:'long',year:'numeric'})};
const sec=k=>SEC[k]||{};

const cats=CATS.filter(c=>!draft(c)).map(c=>({...c,subs:(c.subs||[]).filter(s=>!draft(s))}));
const allSubs=CATS.flatMap(c=>c.subs||[]);
const visible=p=>{const c=CATS.find(x=>x.slug==p.category),s=c?.subs?.find(x=>x.slug==p.sub);return!draft(p)&&!draft(c)&&!draft(s)};
const u=(l,p)=>(l=='bn'?'/bn':'')+p;
const imageList=o=>{const images=(o.images||'').split(',').map(s=>s.trim()).filter(Boolean);return images.length?images:o.image?[o.image]:[]};
const img=(o,l)=>imageList(o).length?`<img src="${imageList(o)[0]}" alt="${esc(name(o,l))}" loading=lazy>`:`<div class=ph>${name(o,l)}</div>`;
const gallery=(o,l)=>{const images=imageList(o);return images.length?`<div class=gallery>${images.map((src,i)=>`<img src="${src}" alt="${esc(name(o,l))}${images.length>1?' '+(i+1):''}" loading=lazy>`).join('')}</div>`:img(o,l)};

const pages=[];
// m = {title, desc, o}: title/desc are the automatic defaults, o is the item whose SEO fields can override them.
function out(l,p,m,body,ld){const t=UI[l],other=l=='en'?'bn':'en',T=S.t[l],o=m.o||{},self=S.domain+u(l,p);
 const title=g(o,'seo_title',l)||`${m.title} | ${S.brand}`,desc=f(o,'summary',l)||m.desc,ni=noindex(o);
 const cr=g(o,'canonical',l),canon=cr?(/^https?:/.test(cr)?cr:S.domain+cr):self;
 pages.push({loc:self,inMap:!ni&&canon==self,date:String(o.date||'').slice(0,10)});
 const nav=cats.map(c=>`<li class=dd><a href="${u(l,'/category/'+c.slug+'/')}">${c[l]}</a>${c.subs.length?`<button class=sub-btn type=button aria-expanded=false aria-label="${esc(c[l])}"></button>`:''}<div>${c.subs.map(s=>`<a href="${u(l,'/category/'+s.slug+'/')}">${s[l]}</a>`).join('')}</div></li>`).join('');
 const extra=['works','blog','areas'].filter(k=>!draft(sec(k))).map(k=>`<li><a href="${u(l,'/'+k+'/')}">${t[k]}</a></li>`).join('');
 const html=`<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}">${ni?'<meta name="robots" content="noindex,follow">':''}<link rel="canonical" href="${esc(canon)}"><link rel="alternate" hreflang="en" href="${S.domain}${p}"><link rel="alternate" hreflang="bn" href="${S.domain}/bn${p}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(canon)}">${m.image?`<meta property="og:image" content="${S.domain}${m.image}">`:''}<link rel="stylesheet" href="/style.css"><link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&amp;family=Inter:wght@400;500;600&amp;family=Montserrat:wght@500;700;800&amp;display=swap" rel="stylesheet">${ld?`<script type="application/ld+json">${JSON.stringify(ld)}</script>`:''}</head><body><div class=top>${T.promo}</div><header><a class=logo href="${u(l,'/')}">${S.brand}<small>${T.slogan}</small></a><button class=menu-btn type=button aria-expanded=false aria-label="Menu"><span></span></button><nav><ul>${nav}${extra}</ul></nav><a class=lang href="${u(other,p)}">${t.lang}</a></header><main>${body}</main><footer><div><b>${S.brand}</b><p>${S.address[l]}</p><p><a href="tel:${S.phone}">${S.phone}</a> · <a href="mailto:${S.email}">${S.email}</a></p></div><div>${Object.entries(S.social).map(([k,v])=>`<a href="${v}">${k}</a>`).join(' · ')}</div><div>${cats.map(c=>`<a href="${u(l,'/category/'+c.slug+'/')}">${c[l]}</a>`).join(' ')}</div></footer><script>document.querySelector(".menu-btn").onclick=function(){var h=this.closest("header");this.setAttribute("aria-expanded",h.classList.toggle("open"))};document.querySelectorAll(".sub-btn").forEach(function(x){x.onclick=function(){this.setAttribute("aria-expanded",this.parentNode.classList.toggle("open"))}})</script><a class=wa href="https://wa.me/${S.whatsapp}">WhatsApp</a></body></html>`;
 const fp=P.join(O,u(l,p),'index.html');fs.mkdirSync(P.dirname(fp),{recursive:true});fs.writeFileSync(fp,html)}

fs.rmSync(O,{recursive:true,force:true});
const live=a=>a.filter(x=>!draft(x));
const prods=load('products').filter(visible),works=live(load('works')),blog=live(load('blog')).sort((a,b)=>String(b.date)>String(a.date)?1:-1),areas=live(load('areas')),tests=live(load('testimonials')),pg=live(load('pages'));
for(const l of['en','bn']){const t=UI[l],T=S.t[l];
 const card=x=>`<a class=card data-t="${x.tag||''}" href="${u(l,'/product/'+x.slug+'/')}">${x.tag?`<i>${x.tag}</i>`:''}${img(x,l)}<small>${(allSubs.find(s=>s.slug==x.sub)||{})[l]||x.sub}</small><h3>${f(x,'title',l)}</h3><p>${t.price} ${fmt(x.price)}${x.old?` <s>${fmt(x.old)}</s>`:''}</p></a>`;
 const grid=a=>a.length?`<div class=grid>${a.map(card).join('')}</div>`:`<p>${t.none}</p>`;
 const form=ref=>`<form class=enq method=post action="${S.formAction}"><h3>${t.enq}</h3><input type=hidden name=ref value="${esc(ref)}"><input name=name placeholder="${t.name}" required><input name=phone placeholder="${t.phone}" required><textarea name=message placeholder="${t.msg}"></textarea><button class=btn>${t.enq}</button></form>`;
 const rooms=S.showrooms.map(s=>`<div class=sr><small>${s.city[l]}</small><b>${s.area[l]}</b><p>${s.hours}</p></div>`).join('');
 const tm=`<section class=tm><h2>${t.testi}</h2><div class=grid3>${tests.map(x=>`<blockquote>${md(x.body[l])}<cite>${f(x,'title',l)}, ${f(x,'place',l)}</cite></blockquote>`).join('')}</div></section>`;
 // Home
 out(l,'/',{title:T.tagline,desc:T.desc,o:sec('home'),image:'/'+T.image.replace(/^\/+/,'')},`<section class=hero><div><h1>${T.hero}</h1><p>${T.sub}</p><a class=btn href="${u(l,'/category/'+(cats[0]?.slug||'living')+'/')}">${t.shop}</a></div><img class=hero-image src="/${T.image.replace(/^\/+/, '')}" alt="${esc(T.tagline)}"></section>${tm}<section class=svc>${S.services.map(s=>`<div><b>${s[l]}</b></div>`).join('')}</section><section><h2>${t.room}</h2><div class=rooms>${cats.map(c=>`<a href="${u(l,'/category/'+c.slug+'/')}">${c.image?`<img class=round src="${c.image}" alt="${esc(c[l])}" loading=lazy>`:`<div class="ph round">${c[l]}</div>`}<b>${c[l]}</b><small>${prods.filter(p=>p.category==c.slug).length}</small></a>`).join('')}</div></section><section class=alt><h2>${t.trend}</h2><p class=tabs>${['All','New','Sale','Bestseller'].map(x=>`<button data-f="${x}">${x}</button>`).join('')}</p>${grid(prods.slice(0,8))}</section><section class="dark feat"><div><h2>${T.dining}</h2><a class=btn href="${u(l,'/category/dining/')}">${t.shop}</a></div>${S.diningImage?`<img src="${S.diningImage}" alt="${esc(T.dining)}" loading=lazy>`:''}</section><section><h2>${t.visit}</h2><div class=grid>${rooms}</div></section><script>document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>document.querySelectorAll('.alt .card').forEach(c=>c.hidden=b.dataset.f!='All'&&c.dataset.t!=b.dataset.f))</script>`,{'@context':'https://schema.org','@type':'FurnitureStore',name:S.brand,telephone:S.phone,address:{'@type':'PostalAddress',addressLocality:'Chattogram',addressCountry:'BD'}});
 // Categories (rooms) and their sub-categories
 for(const c of cats){out(l,'/category/'+c.slug+'/',{title:c[l],desc:c[l]+' – '+S.brand,o:c,image:c.image},`<h1>${c[l]}</h1>${sub(c,l)}<p class=subs>${c.subs.map(s=>`<a href="${u(l,'/category/'+s.slug+'/')}">${s[l]}</a>`).join('')}</p>${grid(prods.filter(p=>p.category==c.slug))}`);
  for(const s of c.subs)out(l,'/category/'+s.slug+'/',{title:s[l],desc:s[l]+' – '+S.brand,o:s,image:s.image},`<p class=crumb><a href="${u(l,'/category/'+c.slug+'/')}">${c[l]}</a> /</p><h1>${s[l]}</h1>${sub(s,l)}${grid(prods.filter(p=>p.sub==s.slug))}`)}
 // Products
 for(const p of prods){const n=f(p,'title',l),c=cats.find(x=>x.slug==p.category),s=allSubs.find(x=>x.slug==p.sub);
  out(l,'/product/'+p.slug+'/',{title:n,desc:n+' – '+S.brand,o:p,image:imageList(p)[0]},`<div class=pd><div>${gallery(p,l)}</div><div>${c&&s?`<p class=crumb><a href="${u(l,'/category/'+c.slug+'/')}">${c[l]}</a> / <a href="${u(l,'/category/'+s.slug+'/')}">${s[l]}</a></p>`:''}<h1>${n}</h1>${sub(p,l)}<p class=pr>${t.price} ${fmt(p.price)}${p.old?` <s>${fmt(p.old)}</s>`:''}</p>${md(p.body[l])}<p><a class=btn href="tel:${S.phone}">${t.call}</a> <a class=btn href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent(n)}">${t.wa}</a></p>${form(n)}</div></div><h2>${t.rel}</h2>${grid(prods.filter(x=>x.sub==p.sub&&x!=p).concat(prods.filter(x=>x.category==p.category&&x.sub!=p.sub)).slice(0,4))}`,{'@context':'https://schema.org','@type':'Product',name:n,image:imageList(p).map(x=>S.domain+x),offers:{'@type':'Offer',priceCurrency:'BDT',price:p.price}})}
 // Works / Blog / Areas: landing page + one page per file
 for(const[d,a]of[['works',works],['blog',blog],['areas',areas]]){const so=sec(d);if(draft(so))continue;const h=g(so,'title',l)||t[d];
  out(l,'/'+d+'/',{title:h,desc:h+' – '+S.brand,o:so},`<h1>${h}</h1>${sub(so,l)}<div class=grid>${a.map(x=>`<a class=card href="${u(l,'/'+d+'/'+x.slug+'/')}">${img(x,l)}${d=='blog'&&fdate(x.date,l)?`<small>${fdate(x.date,l)}</small>`:''}<h3>${f(x,'title',l)}</h3><p>${f(x,'summary',l)}</p></a>`).join('')}</div>`);
  for(const x of a){const n=f(x,'title',l);out(l,'/'+d+'/'+x.slug+'/',{title:n,desc:n+' – '+S.brand,o:x,image:imageList(x)[0]},`<article><h1>${n}</h1>${sub(x,l)}${d=='blog'&&fdate(x.date,l)?`<p class=date><time datetime="${String(x.date).slice(0,10)}">${fdate(x.date,l)}</time></p>`:''}${x.image?img(x,l):''}${md(x.body[l])}${d=='areas'?`<h2>${t.visit}</h2><div class=grid>${rooms}</div>${form(n)}`:''}</article>`,
   d=='areas'?{'@context':'https://schema.org','@type':'FurnitureStore',name:S.brand,telephone:S.phone,areaServed:x.title,address:{'@type':'PostalAddress',addressLocality:'Chattogram',addressCountry:'BD'}}:d=='blog'?{'@context':'https://schema.org','@type':'BlogPosting',headline:n,datePublished:String(x.date||'').slice(0,10)||undefined,image:x.image?S.domain+x.image:undefined}:null)}}
 // Plain pages (About, Contact...)
 for(const x of pg){const n=f(x,'title',l);out(l,'/'+x.slug+'/',{title:n,desc:n+' – '+S.brand,o:x},`<article><h1>${n}</h1>${sub(x,l)}${md(x.body[l])}${yes(x.form)||x.form=='1'?form(n):''}</article>`)}}
fs.cpSync(P.join(R,'static'),O,{recursive:true});

// ---- /admin editor settings, generated so dropdowns always match content/categories.json ----
// Written as JSON (which is valid YAML) so it can never be malformed.
const M=(name,label,widget,x={})=>({name,label,widget,...x});
const OPT={required:false};
const T2=(name,label,req=true)=>[M(name,label+' (English)','string',req?{}:OPT),M(name+'_bn',label+' (বাংলা)','string',OPT)];
const BODY=[M('body','Text (English)','markdown'),M('body_bn','Text (বাংলা)','markdown',OPT)];
const sel=a=>a.map(([value,label])=>({label,value}));
const DATE=label=>M('date',label,'datetime',{date_format:'YYYY-MM-DD',time_format:false,format:'YYYY-MM-DD',...OPT});
const SEO=(dateLabel='Last updated (YYYY-MM-DD)')=>[
 M('subtitle','Subtitle under the heading (English)','string',OPT),M('subtitle_bn','Subtitle (বাংলা)','string',OPT),
 M('seo_title','SEO title (English). Empty = automatic','string',{...OPT,hint:'Shown in the browser tab and on Google. Used exactly as written.'}),M('seo_title_bn','SEO title (বাংলা). Empty = automatic','string',OPT),
 M('summary','Meta description for Google (English, about 150 characters)','text',OPT),M('summary_bn','Meta description (বাংলা)','text',OPT),
 DATE(dateLabel),
 M('index','Index in Google','boolean',{default:true,hint:'Turn off to keep this page out of Google and the sitemap. The page still works.'}),
 M('canonical','Canonical URL (English). Empty = this page','string',{...OPT,hint:'Only if another page should rank instead, e.g. /category/sofas/'}),M('canonical_bn','Canonical URL (বাংলা). Empty = this page','string',OPT),
 M('draft','Draft (hide from website)','boolean',{default:false,hint:'On = the page is not published at all.'})];
const IMG=M('image','Main photo','image',{...OPT,hint:'Sizes: see EDITING-GUIDE.md'});
const IMGS=M('images','More photos (gallery)','list',{...OPT,field:M('image','Photo','image')});
const coll=(name,label,fields,x={})=>({name,label,folder:'content/'+name,create:true,slug:'{{slug}}',extension:'md',format:'frontmatter',...x,fields});
const CATF=kids=>[M('slug','URL slug','string',{hint:'Lower-case with dashes. Changing it changes the page URL.'}),M('en','Name (English)','string'),M('bn','Name (বাংলা)','string'),M('image','Picture (round, on homepage)','image',OPT),...SEO(),...(kids?[M('subs','Sub-categories','list',{summary:'{{fields.en}}',fields:CATF(false)})]:[])];
const SECF=(k,label,home)=>M(k,label,'object',{collapsed:true,fields:[...(home?[]:T2('title','Heading',false)),...SEO().filter(x=>!(home&&/^(subtitle|subtitle_bn|draft)$/.test(x.name)))]});
const cms={
 backend:{name:'github',repo:S.cmsRepo||'Fayed17/canopy',branch:'main',base_url:S.cmsBaseUrl||S.domain,auth_endpoint:'api/auth',
  commit_messages:{create:'Add {{collection}} "{{slug}}"',update:'Update {{collection}} "{{slug}}"',delete:'Delete {{collection}} "{{slug}}"',uploadMedia:'Upload "{{path}}"',deleteMedia:'Delete "{{path}}"'}},
 local_backend:true,site_url:S.domain,media_folder:'static/images',public_folder:'/images',
 collections:[
  coll('products','Products',[...T2('title','Name'),
   M('category','Room','select',{options:sel(CATS.map(c=>[c.slug,c.en]))}),
   M('sub','Category','select',{options:sel(CATS.flatMap(c=>(c.subs||[]).map(x=>[x.slug,c.en+' > '+x.en])))}),
   M('price','Price (Tk)','number',{value_type:'int'}),M('old','Old price (Tk, shows crossed out)','number',{value_type:'int',...OPT}),
   M('tag','Badge','select',{...OPT,options:['New','Sale','Bestseller']}),IMG,IMGS,...SEO(),...BODY],{summary:'{{title}} ({{sub}})',sortable_fields:['title','price','sub','date']}),
  coll('blog','Blog posts',[...T2('title','Title'),IMG,...SEO('Publish date (YYYY-MM-DD)'),...BODY],{sortable_fields:['date','title']}),
  coll('works','Our Works',[...T2('title','Project name'),IMG,IMGS,...SEO(),...BODY]),
  coll('areas','Area pages (local SEO)',[...T2('title','Page title, e.g. Furniture Shop in Halishahar, Chattogram'),IMG,...SEO(),...BODY]),
  coll('testimonials','Testimonials',[...T2('title','Customer name'),...T2('place','Area',false),IMG,M('draft','Draft (hide)','boolean',{default:false}),...BODY]),
  coll('pages','Pages (About, Contact...)',[...T2('title','Title'),M('form','Show enquiry form','boolean',{default:false}),...SEO(),...BODY]),
  {name:'settings',label:'Categories & section pages',files:[
   {name:'categories',label:'Categories (menu, category pages)',file:'content/categories.json',fields:[M('cats','Rooms','list',{summary:'{{fields.en}}',fields:CATF(true)})]},
   {name:'sections',label:'Home, Blog, Works and Areas landing pages',file:'content/sections.json',fields:[SECF('home','Home page',true),SECF('blog','Blog page (/blog/)'),SECF('works','Our Works page (/works/)'),SECF('areas','Areas page (/areas/)')]}]}]};
fs.mkdirSync(P.join(O,'admin'),{recursive:true});
fs.writeFileSync(P.join(O,'admin','config.yml'),'# Generated by build.js. Do not edit: change build.js or content/ instead.\n'+JSON.stringify(cms,null,1)+'\n');

// ---- sitemap.xml (only indexable pages that are their own canonical) + robots.txt ----
const urls=pages.filter(x=>x.inMap).map(x=>`<url><loc>${x.loc}</loc>${/^\d{4}-\d{2}-\d{2}$/.test(x.date)?`<lastmod>${x.date}</lastmod>`:''}</url>`).join('');
fs.writeFileSync(P.join(O,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
fs.writeFileSync(P.join(O,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${S.domain}/sitemap.xml\n`);
console.log('Built',pages.length,'pages,',pages.filter(x=>x.inMap).length,'in sitemap');
