const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
// Fixed allowlist: no arbitrary external URL fetching / SSRF.
const sources = {
 leftright:'https://www.reddit.com/r/nosleep/comments/7asz8x/has_anyone_heard_of_the_leftright_game_part_1/',
 peeking:'https://www.reddit.com/r/nosleep/comments/sva7z6/my_wife_has_been_peeking_at_me_from_around/',
 autopilot:'https://www.reddit.com/r/nosleep/comments/19fmjf/autopilot/',
 neverfull:'https://www.reddit.com/r/shortscarystories/comments/10xove9/i_have_never_seen_her_full/',
 snowangel:'https://www.reddit.com/r/LetsNotMeet/comments/9m9fz0/angel_in_the_snow/',
 kinki:'https://kakuyomu.jp/works/16817330652495155185',
 dakuda:'https://kakuyomu.jp/works/16818622175776590823',
 choice:'https://gall.dcinside.com/mgallery/board/view/?id=napolitan&no=10059',
 'mexico-grandma':'https://www.reddit.com/r/HistoriasdeTerror/comments/vm3oma/',
 replaced:'https://www.creepypasta.com/replaced/'
};
const response=(status,obj)=>({statusCode:status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(obj)});
async function load(url,headers={}){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),11000);try {const r=await fetch(url,{headers:{'User-Agent':'TheDreadIndexReader/0.9 (personal-beta)','Accept':'text/html,application/json',...headers},signal:controller.signal,redirect:'follow'});if(!r.ok)throw Error('원문 사이트에서 HTTP '+r.status+' 응답');return await r.text()} finally{clearTimeout(timer)}}
function clean(text){return String(text||'').replace(/\r/g,'').trim().slice(0,350000)}
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return response(405,{detail:'POST only'});
 const id=event.queryStringParameters?.id;
 const url=sources[id];
 if(!url)return response(404,{detail:'등록되지 않은 작품'});
 try{
  let text='';
  if(url.includes('reddit.com')){
   let data=JSON.parse(await load(url.replace(/\/$/,'')+'.json?raw_json=1&limit=0',{'Accept':'application/json'}));
   const post=data?.[0]?.data?.children?.[0]?.data;
   text=post?.selftext||'';
  }else{
   const html=await load(url);
   const dom=new JSDOM(html,{url});
   const article=new Readability(dom.window.document).parse();
   text=article?.textContent||'';
  }
  text=clean(text);
  if(text.length<350)return response(422,{detail:'자동 추출에서 충분한 본문을 확보하지 못했어. 원문 사이트 접근 제한이나 동적 로딩 때문일 수 있어. 개인 독서판에 직접 입력할 수 있어.'});
  return response(200,{id,source:url,text,characters:text.length,comments:[],notice:'자동 추출 원문이며 누락이나 게시판 UI 혼입이 없는지 확인해야 합니다. 한국어 번역은 별도 기능입니다.'});
 }catch(err){return response(502,{detail:'원문 가져오기 실패: '+String(err.message||err).slice(0,240)})}
};