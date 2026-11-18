var SUBJECTS=["Информатика","Математика","Физика","Русский язык","История","Биология","Химия","Английский"];
var GRADES=[5,6,7,8,9,10,11];
var KEY="konspektor-v1";
var mem=null;
function load(){try{var r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch(e){}return mem}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){mem=db}}
var db=load()||{users:[],session:null,marks:{},posts:[
 {id:1,title:"Как работает двоичная система",subject:"Информатика",grade:8,topic:"Системы счисления",author:"Алина",date:"2026-10-02",
  text:"Мы считаем в десятичной системе, потому что у нас десять цифр. Компьютер использует две: 0 и 1.\n\nЧтобы перевести число в двоичную систему, делим его на 2 и записываем остатки снизу вверх.\n\nПример: 13 → 13/2=6 (ост. 1), 6/2=3 (ост. 0), 3/2=1 (ост. 1), 1/2=0 (ост. 1). Читаем снизу: 1101.",likes:["Макс","Дана"],comments:[{a:"Макс",t:"Наконец понял, как читать остатки!"}]},
 {id:2,title:"Дискриминант без паники",subject:"Математика",grade:8,topic:"Квадратные уравнения",author:"Дана",date:"2026-10-09",
  text:"Для уравнения ax²+bx+c=0 считаем D=b²−4ac.\n\nЕсли D>0 — два корня, если D=0 — один, если D<0 — корней нет.\n\nКорни: x=(−b±√D)/(2a). Всегда сначала проверяй, что уравнение приведено к стандартному виду.",likes:["Алина"],comments:[]},
 {id:3,title:"Закон Ома простыми словами",subject:"Физика",grade:8,topic:"Электрический ток",author:"Макс",date:"2026-10-15",
  text:"Сила тока зависит от напряжения и сопротивления: I=U/R.\n\nПредставь трубу с водой: напряжение — это напор, сопротивление — узкое место в трубе, а ток — сколько воды протекает.",likes:[],comments:[]}
],nextId:4};
if(!db.marks)db.marks={};
var $=function(i){return document.getElementById(i)};
var state={tab:"all",sub:"",authMode:"login"};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function toast(m){var t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
function hash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h)}
function me(){return db.session}
function needLogin(){if(me())return true;openAuth("login");return false}

function renderUser(){
  var u=$("user");
  u.innerHTML=me()?'Привет, <b>'+esc(me())+'</b> <button id="out">Выйти</button>':'<button id="in" class="main">Войти</button>';
  var o=$("out");if(o)o.onclick=function(){db.session=null;save();renderUser();render()};
  var i=$("in");if(i)i.onclick=function(){openAuth("login")};
}
function renderChips(){
  var h='<button class="chip'+(state.sub===""?' on':'')+'" data-s="">Все предметы</button>';
  SUBJECTS.forEach(function(s){h+='<button class="chip'+(state.sub===s?' on':'')+'" data-s="'+s+'">'+s+'</button>'});
  $("chips").innerHTML=h;
}
function render(){
  var q=$("q").value.trim().toLowerCase(),g=$("grade").value,sort=$("sort").value;
  var m=db.marks[me()]||[];
  var arr=db.posts.filter(function(p){
    if(state.sub&&p.subject!==state.sub)return false;
    if(g&&String(p.grade)!==g)return false;
    if(q&&(p.title+" "+p.text+" "+p.topic).toLowerCase().indexOf(q)<0)return false;
    if(state.tab==="marks"&&m.indexOf(p.id)<0)return false;
    if(state.tab==="mine"&&p.author!==me())return false;
    return true});
  arr.sort(function(a,b){return sort==="top"?b.likes.length-a.likes.length:b.id-a.id});
  var h=arr.map(function(p){
    return '<article class="post" tabindex="0" data-id="'+p.id+'"><span class="tag">'+esc(p.subject)+', '+p.grade+' класс</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.text)+'</p><div class="meta"><span>'+esc(p.author)+'</span><span>Полезно: '+p.likes.length+' · Комментарии: '+p.comments.length+'</span></div></article>'}).join("");
  if(!h){
    var msg=state.tab==="marks"?(me()?"В закладках пока пусто. Откройте разбор и нажмите «В закладки».":"Войдите, чтобы пользоваться закладками."):state.tab==="mine"?(me()?"Вы ещё ничего не публиковали. Нажмите «Написать разбор».":"Войдите, чтобы увидеть свои материалы."):"Ничего не найдено. Измените запрос или напишите первый разбор по этой теме.";
    h='<div class="empty">'+msg+'</div>'}
  $("list").innerHTML=h;
}
function openPost(id){
  var p=db.posts.filter(function(x){return x.id===id})[0];if(!p)return;
  var liked=p.likes.indexOf(me())>=0,marked=(db.marks[me()]||[]).indexOf(id)>=0;
  var cm=p.comments.map(function(c){return '<div class="cm"><b>'+esc(c.a)+':</b> '+esc(c.t)+'</div>'}).join("")||'<p style="color:var(--muted)">Комментариев пока нет.</p>';
  $("view").innerHTML='<span class="tag">'+esc(p.subject)+', '+p.grade+' класс · '+esc(p.topic||"без темы")+'</span><h2>'+esc(p.title)+'</h2><div class="meta" style="margin:0"><span>Автор: '+esc(p.author)+', '+p.date+'</span></div><div class="body">'+esc(p.text)+'</div>'
  +'<div class="actions"><button id="vLike" class="'+(liked?'on-mark':'')+'">Полезно: '+p.likes.length+'</button><button id="vMark" class="'+(marked?'on-mark':'')+'">'+(marked?'В закладках':'В закладки')+'</button>'+(p.author===me()?'<button id="vDel">Удалить</button>':'')+'<button class="link" data-close>Закрыть</button></div>'
  +'<h3 style="margin:8px 0 0">Комментарии</h3>'+cm+'<div class="row"><input id="vCm" maxlength="300" placeholder="Что было полезно или непонятно?" aria-label="Комментарий"><button id="vSend" style="flex:0 0 auto">Отправить</button></div>';
  $("vLike").onclick=function(){if(!needLogin())return;var i=p.likes.indexOf(me());if(i<0)p.likes.push(me());else p.likes.splice(i,1);save();openPost(id);render()};
  $("vMark").onclick=function(){if(!needLogin())return;var a=db.marks[me()]=db.marks[me()]||[];var i=a.indexOf(id);if(i<0)a.push(id);else a.splice(i,1);save();openPost(id);render()};
  var d=$("vDel");if(d)d.onclick=function(){if(confirm("Удалить этот разбор?")){db.posts=db.posts.filter(function(x){return x.id!==id});save();$("viewDlg").close();render();toast("Разбор удалён")}};
  $("vSend").onclick=function(){if(!needLogin())return;var t=$("vCm").value.trim();if(!t)return;p.comments.push({a:me(),t:t});save();openPost(id);render()};
  if(!$("viewDlg").open)$("viewDlg").showModal();
}
function openAuth(mode){
  state.authMode=mode;var reg=mode==="reg";
  $("authTitle").textContent=reg?"Регистрация":"Вход";
  $("aGo").textContent=reg?"Создать аккаунт":"Войти";
  $("aSwitch").textContent=reg?"Уже есть аккаунт? Войти":"Нет аккаунта? Зарегистрироваться";
  $("aErr").textContent="";
  if($("viewDlg").open)$("viewDlg").close();
  if(!$("authDlg").open)$("authDlg").showModal();
}
$("aSwitch").onclick=function(){openAuth(state.authMode==="reg"?"login":"reg")};
$("aGo").onclick=function(){
  var n=$("aName").value.trim(),p=$("aPass").value;
  if(n.length<2)return $("aErr").textContent="Логин должен быть не короче 2 символов.";
  if(p.length<4)return $("aErr").textContent="Пароль должен быть не короче 4 символов.";
  var u=db.users.filter(function(x){return x.name.toLowerCase()===n.toLowerCase()})[0];
  if(state.authMode==="reg"){
    if(u)return $("aErr").textContent="Такой логин уже занят.";
    db.users.push({name:n,pass:hash(p)});db.session=n;
  }else{
    if(!u||u.pass!==hash(p))return $("aErr").textContent="Неверный логин или пароль.";
    db.session=u.name;
  }
  save();$("authDlg").close();$("aPass").value="";renderUser();render();toast("Добро пожаловать, "+db.session+"!");
};
$("add").onclick=function(){if(!needLogin())return;$("nErr").textContent="";$("newDlg").showModal()};
$("nGo").onclick=function(){
  var t=$("nTitle").value.trim(),x=$("nText").value.trim();
  if(t.length<5)return $("nErr").textContent="Добавьте заголовок (минимум 5 символов).";
  if(x.length<30)return $("nErr").textContent="Объяснение слишком короткое: напишите хотя бы 30 символов.";
  db.posts.push({id:db.nextId++,title:t,subject:$("nSub").value,grade:+$("nGrade").value,topic:$("nTopic").value.trim(),author:me(),date:new Date().toISOString().slice(0,10),text:x,likes:[],comments:[]});
  save();["nTitle","nTopic","nText"].forEach(function(i){$(i).value=""});$("newDlg").close();state.tab="all";syncTabs();render();toast("Разбор опубликован");
};
function syncTabs(){document.querySelectorAll(".tab").forEach(function(b){b.classList.toggle("on",b.dataset.t===state.tab)})}
$("tabs").onclick=function(e){var b=e.target.closest(".tab");if(!b)return;state.tab=b.dataset.t;syncTabs();render()};
$("chips").onclick=function(e){var b=e.target.closest(".chip");if(!b)return;state.sub=b.dataset.s;renderChips();render()};
$("list").onclick=function(e){var c=e.target.closest(".post");if(c)openPost(+c.dataset.id)};
$("list").onkeydown=function(e){if(e.key==="Enter"){var c=e.target.closest(".post");if(c)openPost(+c.dataset.id)}};
["q","grade","sort"].forEach(function(i){$(i).oninput=render});
document.addEventListener("click",function(e){if(e.target.hasAttribute&&e.target.hasAttribute("data-close")){var d=e.target.closest("dialog");if(d)d.close()}});
$("nSub").innerHTML=SUBJECTS.map(function(s){return "<option>"+s+"</option>"}).join("");
$("nGrade").innerHTML=GRADES.map(function(g){return "<option>"+g+"</option>"}).join("");
$("grade").innerHTML+=GRADES.map(function(g){return '<option value="'+g+'">'+g+" класс</option>"}).join("");
renderUser();renderChips();render();
