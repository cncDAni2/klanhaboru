var REF, STATUS = 1, HIBA = 0, AUTO_STATUS=0;
var NEWMAIL=0;
var TOZSDE_SOUNDS = ['bot2.wav', 'BOMB_SIREN_hosszu.mp3', 'Intruder_alert.mp3', 'alarm-frenzy.mp3', 'bubbling-up.mp3', 'capisci.mp3', 'decay.mp3', 'determined.mp3', 'hell-yeah.mp3', 'lovely.mp3', 'may-i-have-your-attention.mp3',
					'nasty-error-long.mp3', 'nice-cut.mp3', 'oh-finally.mp3', 'on-serious-matters.mp3', 'system-fault.mp3', 'thats-nasty.mp3', 'néma.mp3'];
var BELL = {};
var AUTO_MOTOR_DELAYER = null;
document.body.style.backgroundImage="none";
document.body.style.background="#e3d5b3 url(https://dshu.innogamescdn.com/asset/233cdec1/graphic/index/main_bg.jpg) scroll right top repeat";
var ID=game_data.world+" - K" + (game_data.village.y+'')[0] + (game_data.village.x+'')[0];
var CHK_FIELDS = ['minimum', 'maximum', 'any', 'some', 'action', 'keszlet', 'autotrans', 'newMail', 'newAttack'];
var FIELDS = ['min_wood', 'min_stone', 'min_iron', 'max_wood', 'max_stone', 'max_iron', 'action_wood', 'action_stone', 'action_iron', 'keszlet_wood', 'keszlet_stone', 'keszlet_iron', 'nameOfBeerkezo', 'nameOfElad', 'nameOfVasarolj'];
var LANGFIELDS = [];
var AUTO_FIELDS_SELL = ['minRes','minLimit','maxRes','maxLimit'];
var AUTO_FIELDS_BUY = ['minRes','minLimit','maxRes','maxLimit'];
var ISLOGIN = true;
var STATS = {
	min: [9999, 9999, 9999],
	max: [0, 0, 0],
	avg: [0, 0, 0, 0],
	lastStat: new Date(),
	autoSell: [0,0,0,0],
	autoBuy: [0,0,0,0]
};
var SOUND_LOC = 'https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/tozsde/';
var defaultSound = 'bot2.wav';
var TOZSDE_DATA = {};
var TOZSDE_DATA_DEFAULT = {
	minimum: true,
	maximum: false,
	any: false,
	some: false,
	min_wood: 500,
	min_stone: 500,
	min_iron: 500,
	max_wood: 1500,
	max_stone: 1500,
	max_iron: 1500,
	action: true,
	action_wood: 20,
	action_stone: 20,
	action_iron: 20,
	keszlet: false,
	keszlet_wood: 1000,
	keszlet_stone: 1000,
	keszlet_iron: 1000,
	autotrans: true,
	newMail: false,
	newAttack: true,
	nameOfBeerkezo: 'Beérkező',
	nameOfElad: 'Elad',
	nameOfVasarolj: 'Vásárolj',
	sound: {
		minimum: defaultSound,
		maximum: defaultSound,
		any: defaultSound,
		some: defaultSound,
		action: defaultSound,
		keszlet: defaultSound,
		autotrans: defaultSound,
		newMail: defaultSound,
		newAttack: defaultSound
	}
};
var EVENT = {
	hangSzunet: new Date(),
	lastResult: [0,0,0],
	lastChange: new Date(),
	noSoundIf: true,
	agressiveRefresh: false,
	agressiveRefresh_win: false,
	agressiveRefreshTime: 0
};
var TOZSDE_AUTO = {
	wood: {
		sell: {},
		buy: {}
	},
	stone: {
		sell: {},
		buy: {}
	},
	iron: {
		sell: {},
		buy: {}
	}
};
var ISTOZSDE_AUTO = {
	wood: {}, 
	stone: {},
	iron: {}
};
var TOZSDE_AUTOINFO = {
	inProgress: false, //Épp van-e tranzakció folyamatban. false <-> AUTO_STATUS=0 ?
	startProgress: new Date(),  //Mikor kezdődött a művelet? max 6mp legyen, utána RESET
	mode: '', //Sell vagy Buy?
	type: '', //Wood/stone/iron?
	ppValue: 0, //Lightboxból nyert infó - log miatt
	sellValue: 0, //Lightboxból nyert infó - log miatt
	minMaxPrice: 0, //Visszaellenőrzéskor, +-3% engedett (eladáskor max-ot, vásárláskor min-t teszünk bele és vetjük össze az AVG árral)
	isError: false, //Error-t dobott-e a lightbox? Ha igen, akkor legközelebb minMaxPrice-al kevesebb összeggel próbálkozunk
	lastSuccess: new Date() //Sikeres tranzakció - utána várunk az újjal hogy frissüljön a JS/tőzsderaktár
};
var INCOMING = 0;

var BOT, BOTTIME;
var LINK = window.location.href.split("village=");
LINK = LINK[0]+'village='+game_data.village.id+'&screen=market&mode=exchange';

var worker = createWorker(function(self){
	self.addEventListener("message", function(e) {
		setTimeout(function(){
			postMessage('');
		}, e.data);
	}, false);
});
worker.onmessage = function(pm) {
	main();
};
function createWorker(main){
	var blob = new Blob(
		["(" + main.toString() + ")(self)"],
		{type: "text/javascript"}
	);
	return new Worker(window.URL.createObjectURL(blob));
}

function generateSoundSelector(id) {
	var str='<select onchange="changeSound(this, \''+id+'\')" name="'+id+'_sound">';
	for (var i=0;i<TOZSDE_SOUNDS.length;i++) {
		str+='<option value="'+TOZSDE_SOUNDS[i]+'">'+TOZSDE_SOUNDS[i].split('.')[0]+'</option>';
	}
	str+='</select><button type="button" onclick="csengess(\''+id+'\')">&#9654;</button>';
	return str;
}
function generateAutoOptions(mode) {
	var res=['wood', 'stone', 'iron'];
	var str='<div class="autoChk">';
	for (var i=0;i<res.length;i++){
		str+='<span class="icon header '+res[i]+'"> </span> <input type="checkbox" onclick="stopStartAuto(this,\''+mode+'\', \''+res[i]+'\')"><br>';
	}
	str+='</div>';
	return str;
}
function generatePlusMinus(mode, field) {
	return '<button type="button" class="plusminusbutton" onclick="changeLimits(\''+mode+'\', \''+field+'\', 25)">+</button>\
			<button type="button" class="plusminusbutton" onclick="changeLimits(\''+mode+'\', \''+field+'\', -25)">-</button>';
}
function changeLimits(mode, field, val) {
	var x = document.getElementById('cnc_tozsde');
	var res = ['wood', 'stone', 'iron'];
	var fields = {}, values = {}, oneUnit;
	for (var i=0;i<3;i++) {
		fields = {
			minL: 'auto_'+mode+'_'+res[i]+'_minLimit',
			minR: 'auto_'+mode+'_'+res[i]+'_minRes',
			maxL: 'auto_'+mode+'_'+res[i]+'_maxLimit',
			maxR: 'auto_'+mode+'_'+res[i]+'_maxRes'
		};
		values = {
			minL: parseInt(x[fields.minL].value),
			minR: parseInt(x[fields.minR].value),
			maxL: parseInt(x[fields.maxL].value),
			maxR: parseInt(x[fields.maxR].value)
		}
		if (values.maxL == values.minL) {UI.InfoMessage("Nem állítható tovább ("+res[i]+")", 5000); continue;}
		oneUnit = (values.maxR - values.minR) / (values.maxL - values.minL);
		if (oneUnit<0) {alert("Helytelen automata megadás"); return;}
		if (parseInt(x['auto_'+mode+'_'+res[i]+'_'+field].value) < 25) { UI.InfoMessage("Nem csökkenthető tovább ("+res[i]+")", 5000); continue;}
		
		// Min Limit esete
		if (field == "minLimit") {
			values.minL += val; if (values.minL < 0) values.minL = 0;
			values.minR += Math.round(val*oneUnit); if (values.minR < 0) values.minR = 0;
			$('#tozsde_auto input[name='+fields.minL+']').val(values.minL).change();
			$('#tozsde_auto input[name='+fields.minR+']').val(values.minR).change();
		}
		// Max Limit esete
		if (field == "maxLimit") {
			values.maxL += val; if (values.maxL < 0) values.maxL = 0;
			values.maxR += Math.round(val*oneUnit); if (values.maxR < 0) values.maxR = 0;
			$('#tozsde_auto input[name='+fields.maxL+']').val(values.maxL).change();
			$('#tozsde_auto input[name='+fields.maxR+']').val(values.maxR).change();
		}
	}
}

document.title= ID + " Tőzsde";
let tozsdeStyle = `
	h3 {
		transition: width 0.5s, background 0.25s;
		cursor:pointer;
		width: 700px;
		margin: 10px auto;
		padding: 5px;
		border: 1px solid black;
		border-radius: 20px;
	}
	h3:hover {
		background: rgba(0,0,255,0.3) !important;
		width: 725px;
	}
	h3.openedH3 {
		background: rgba(255,255,255,0.5);
		width: 800px;
	}
	.autoChk {
		display: block;
	}
	h1:hover {
		color: #555
	}
	.warning-text {
		color: red;
		font-size: 130%;
		font-weight: bold;
		text-align: center;
	}
	.auto-sugo {
		width: 300px;
		display: block;
		margin: auto;
	}
	.auto-sugo a {
		text-align: center;
		display: block;
		padding-bottom: 15px;
		color: blue;
	}
	#cnc_stats {
		background: #aac;
		margin: 10px auto;
		border-collapse: collapse;
	}
	.plusminusbutton {
		outline: none;
		background: lightgray;
		opacity: 0.7;
		cursor:pointer
	}
	.plusminusbutton:hover {
		opacity:1.0
	}
	#cnc_stats td, #cnc_stats th {
		min-width: 50px;
		text-align: center;
		padding: 3px;
		border-bottom: 1px solid darkgoldenrod;
	}
	#cnc_stats td:first-child, #cnc_stats th:first-child {
		text-align: left;
		border-right: 1px solid black;
		padding-right: 20px;
	}
	#cnc_tozsde input[type="checkbox"] {
		margin: 0 3px 0 0;
		zoom: 1.3;
	}
	#cnc_tozsde #tozsde_auto td {
		padding: 4px
	}
	#cnc_tozsde td {
		padding: 2px
	}
	#cnc_tozsde #tozsde_auto input[type=number] {
		width: 55px;
	}
	#cnc_tozsde .bigNum input[type=number] {
		width: 55px 
	}
	#cnc_tozsde input[type=number] {
		width: 47px;
		padding: 2px;
	}
	#allapot table tr td:not(:first-child), #allapot table tr th:not(:first-child), #cnc_tozsde th:not(:first-child) {
		text-align: center
	}
	.header50 {
		width: 50px;
	}
	.header60 {
		width: 60px;
	}
	#allapot table tr:hover {
		background-color: rgba(100,100,255,0.2)
	}
	#allapot .item-info {
		background-image: linear-gradient(to right, rgba(254,0,255,0.3) , transparent 14%, transparent 86%, rgba(254,0,255,0.3))
	}
	#allapot .item-sell {
		background-image: linear-gradient(to right, rgba(100,100,255,0.6), transparent 14%, transparent 86%, rgba(100,100,255,0.6))
	}
	#allapot .item-buy {
		background-image: linear-gradient(to right, rgba(254,100,100,0.3) , transparent 14%, transparent 86%, rgba(254,100,100,0.3))
	}
	#allapot .item-incoming-warning {
		background-image: linear-gradient(to right, rgba(255,0,0,0.8), transparent 24%, transparent 76%, rgba(255,0,0,0.8)) 
	}
	#tozsde_save:not([disabled]), #auto_save:not([disabled]) {
		background: rgb(236,236,236);
		animation-name: flash;
		animation-duration: 1s;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}
	@keyframes flash {
		0% {
			background: rgb(236,236,236);
		}
		50% {
			background: rgb(100,100,200);
		}
		100% {
			background: rgb(236,236,236);
		}
}`;
let tozsdeStyle_el = document.createElement('style');
tozsdeStyle_el.textContent = tozsdeStyle;
document.head.appendChild(tozsdeStyle_el);
document.body.innerHTML = '<h1 align="center" style="cursor: context-menu;text-shadow: 3px 3px 4px #666; margin-top:10px;">Prémium Tőzsde kezelő ('+ID+')</h1>\
<h4 style="text-align: center; margin-top:0;">'+game_data.player.name+' ('+game_data.village.display_name+')</h4>\
<br><h3 align="center" onclick="setTabVisibility(\'h3_1\', this)">Hangjelzés beállítása</h3>\
<form id="cnc_tozsde"><div style="display:none" id="h3_1"><table class="vis" style="margin: auto;">\
<tr><th>Hangjelzés, amikor...</th><th><span class="icon header wood"> </span></th><th><span class="icon header stone"> </span></th><th><span class="icon header iron"> </span></th><th>Hang</th></tr>\
<tr><td><input type="checkbox" name="minimum"> Az árfolyam ez alá csökken:</td><td><input type="number" name="min_wood"></td><td><input type="number" name="min_stone"></td><td><input type="number" name="min_iron"></td><td>'+generateSoundSelector('minimum')+'</td></tr>\
<tr><td><input type="checkbox" name="maximum"> Az árfolyam e fölé megy:</td><td><input name="max_wood" type="number"></td><td><input type="number" name="max_stone"></td><td><input type="number" name="max_iron"></td><td>'+generateSoundSelector('maximum')+'</td></tr>\
<tr><td colspan="4"><input type="checkbox" name="any"> Lehetséges eladni valamit</td><td>'+generateSoundSelector('any')+'</td></tr>\
<tr><td colspan="4"><input type="checkbox" name="some"> Nem lehet eladni valamit</td><td>'+generateSoundSelector('some')+'</td></tr>\
<tr><td><input type="checkbox" name="action"> Hirtelen áresés történik:</td><td><input type="number" name="action_wood" type="number">%</td><td><input type="number" name="action_stone">%</td><td><input type="number" name="action_iron">%</td><td>'+generateSoundSelector('action')+'</td></tr>\
<tr class="bigNum"><td><input type="checkbox" name="keszlet"> Készleten van ennyi nyersanyag:</td><td><input name="keszlet_wood" type="number"></td><td><input type="number" name="keszlet_stone"></td><td><input type="number" name="keszlet_iron"></td><td>'+generateSoundSelector('keszlet')+'</td></tr>\
<tr><td colspan="4"><input type="checkbox" name="autotrans" disabled>Az automata sikeres tranzakciót hajtott végre</td><td>'+generateSoundSelector('autotrans')+'</td></tr>\
<tr><td colspan="4"><input type="checkbox" name="newMail"><span class="icon header new_mail" style="height:16px"> </span> Új üzeneted érkezett</td><td>'+generateSoundSelector('newMail')+'</td></tr>\
<tr><td colspan="4"><input type="checkbox" name="newAttack"><img src="/graphic/buildings/barracks.png"> Bejövő támadások száma emelkedett</td><td>'+generateSoundSelector('newAttack')+'</td></tr>\
<tr><td colspan="4"><input type="checkbox" checked disabled> Bot védelem aktív</td><td>'+generateSoundSelector('bot')+'</td></tr>\
</table>\
<div style="margin:auto; width:720px; text-align: center;" id="hangero"><hr><strong>Hangerő: </strong>\
<button type="button" onclick="hangero(-20)">-</button> <p style="display: inline; margin:0; padding: 0;">100%</p> <button type="button" onclick="hangero(20)">+</button> <button type="button" onclick="loadSoundData()">Hangok újrabetöltése</button><br>\
Hangjelzés szüneteltetése <input value="5" type="number" id="stoptime"> percre <button type="button" onclick="stopSound(this)">Hangszünet</button><br>\
<div id="stopSoundTime"></div>\
<input type="checkbox" checked onclick="stopSoundIf(this)"> Ne legyen hangjelzés limit alatt/eladható mennyiség/árzuhanás esetén, ha nincs szabad kereskedőd</div></div>\
<h3 align="center" onclick="setTabVisibility(\'h3_2\', this)">Automatika beállítása</h3>\
<div id="h3_2" style="display:none">\
<p class="warning-text">FIGYELEM! Az automatika kiemelten figyelt terület, könnyen bann járhat használatáért!</p>\
<span class="auto-sugo"><a target="_BLANK" href="https://github.com/cncDAni2/klanhaboru/blob/main/images/tozsde/automata_sugo.png?raw=true">Súgó/példakép betanításhoz</a></span>\
<table class="vis" style="margin: auto; border-collapse: collapse;" id="tozsde_auto">\
<tr><th colspan="2">Automatika tanítása</th><th><span class="icon header wood"> </span> <button type="button" onclick="copyAuto(0)">=</button></th><th><span class="icon header stone"> </span>  <button type="button" onclick="copyAuto(1)">=</button></th><th><span class="icon header iron"> </span> <button type="button" onclick="copyAuto(2)">=</button></th></tr>\
<tr><td rowspan="4" style="text-align:center; border-right: 2px solid #F88">Nyerseladás '+generateAutoOptions('sell')+'</td><td><span class="icon header premium"> </span> Minimum limit '+generatePlusMinus("sell","minLimit")+'</td><td><input type="number" name="auto_sell_wood_minLimit"></td><td><input type="number" name="auto_sell_stone_minLimit"></td><td><input type="number" name="auto_sell_iron_minLimit"></td></tr>\
<tr><td><span class="icon header ressources"> </span> Minimum nyers a faluban</td><td><input type="number" name="auto_sell_wood_minRes"></td><td><input type="number" name="auto_sell_stone_minRes"></td><td><input type="number" name="auto_sell_iron_minRes"></td></tr>\
<tr><td><span class="icon header premium"> </span> Maximum limit '+generatePlusMinus("sell","maxLimit")+'</td><td><input type="number" name="auto_sell_wood_maxLimit"></td><td><input type="number" name="auto_sell_stone_maxLimit"></td><td><input type="number" name="auto_sell_iron_maxLimit"></td></tr>\
<tr><td><span class="icon header ressources"> </span> Maximum nyers a faluban</td><td><input type="number" name="auto_sell_wood_maxRes"></td><td><input type="number" name="auto_sell_stone_maxRes"></td><td><input type="number" name="auto_sell_iron_maxRes"></td></tr>\
\
<tr style="border-top: 2px solid #F88"><td rowspan="4" style="text-align:center; border-right: 2px solid #F88">Nyersvásárlás '+generateAutoOptions('buy')+'</td><td><span class="icon header premium"> </span> Minimum limit '+generatePlusMinus("buy","minLimit")+'</td><td><input type="number" name="auto_buy_wood_minLimit"></td><td><input type="number" name="auto_buy_stone_minLimit"></td><td><input type="number" name="auto_buy_iron_minLimit"></td></tr>\
<tr><td><span class="icon header ressources"> </span> Minimum limit tartása</td><td><input type="number" name="auto_buy_wood_minRes"></td><td><input type="number" name="auto_buy_stone_minRes"></td><td><input type="number" name="auto_buy_iron_minRes"></td></tr>\
<tr><td><span class="icon header premium"> </span> Maximum limit '+generatePlusMinus("buy","maxLimit")+'</td><td><input type="number" name="auto_buy_wood_maxLimit"></td><td><input type="number" name="auto_buy_stone_maxLimit"></td><td><input type="number" name="auto_buy_iron_maxLimit"></td></tr>\
<tr><td><span class="icon header ressources"> </span> Maximum nyers a faluban</td><td><input type="number" name="auto_buy_wood_maxRes"></td><td><input type="number" name="auto_buy_stone_maxRes"></td><td><input type="number" name="auto_buy_iron_maxRes"></td></tr>\
</table>\
<div style="width:500px; text-align:center;margin:10px auto"><img src="/graphic/buildings/market.png"> Automata által meghagyott kereskedők: <input type="number" name="left_merch"></div></div>\
\
<h3 align="center" onclick="setTabVisibility(\'h3_3\', this)">Egyéb beállítások</h3>\
<div id="h3_3" style="display:none"><table class="vis" style="margin: auto; border-collapse: collapse;" id="tozsde_nyelv">\
<tr><th>Nyelvbeállítás</th><th><i>...a te nyelveden</i></th></tr>\
<tr><td>"Beérkező"</td><td><input name="nameOfBeerkezo"></td>\
<tr><td>"Elad"</td><td><input name="nameOfElad"></td>\
<tr><td>"Vásárolj"</td><td><input name="nameOfVasarolj"></td></tr></table>\
<p style="width: 500px;margin: 10px auto;text-align: center;">\
	<input type="checkbox" onclick="setAgressiveRefresh(this)"><strong>AGRESSZÍV LAPFRISSÍTÉS</strong> (nem ajánlott)<br>\
	<input type="checkbox" onclick="setAgressiveRefresh2(this)"><strong>GYORS REAGÁLÁS</strong> (nem ajánlott)\
</p></div>\
<div style="width:800px; text-align:center;margin:10px auto"><button type="button" disabled onclick="saveTozsdeData()" id="tozsde_save">Hangbeállítások alkalmazása</button> <button type="button" onclick="loadData(); loadSoundData();">Visszaállítás</button> <button type="button" id="auto_save" onclick="saveAuto()">Automata beállításainak alkalmazása</button></div></form>\
<h3 align="center" class="openedH3" onclick="setTabVisibility(\'h3_4\', this)">Árfolyam alakulása</h3>\
<div id="h3_4"><table id="cnc_stats"><tr><th>Statisztika</th><th><span class="icon header wood"> </span></th><th><span class="icon header stone"> </span></th><th><span class="icon header iron"> </span></th><th><span class="icon header premium"> </span></th></tr>\
<tr><td>Legkisebb észlelt ár</td><td>0</td><td>0</td><td>0</td><td></td></tr>\
<tr><td>Legmagasabb észlelt ár</td><td>0</td><td>0</td><td>0</td><td></td></tr>\
<tr><td>Idő alapú átlag</td><td>-</td><td>-</td><td>-</td><td></td></tr>\
<tr><td>Automata által eladott</td> <td>0</td><td>0</td><td>0</td><td>0</td></tr>\
<tr><td>Automata által vásárolt</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></table>\
<div id="allapot" style="background-color: #622; margin: auto; width: 690px; padding: 0 15px; color: white; height: 300px; overflow: auto;">\
<table><thead style="color: black"><tr><th rowspan="2" style="width: 60px">Dátum</th><th colspan="3" style="width: 200px">Arány 1 <span class="icon header premium"> </span> &LeftArrowRightArrow;</th><th colspan="3" style="width: 250px">Készlet</th><th rowspan="2" style="width:150px">Értesítés</th></tr>\
<tr><th class="header50" style="text-align: center"><span class="icon header wood"> </span></th><th class="header50"><span class="icon header stone"> </span></th><th class="header50"><span class="icon header iron"> </span></th>\
	<th class="header60"><span class="icon header wood"> </span></th><th class="header60"><span class="icon header stone"> </span></th><th class="header60"><span class="icon header iron"> </span></th></tr>\</thead>\
<tbody style="color: white"></tbody></table></div></div>';

function hangero(value) {
	for (var i in BELL) {
		if (value==-20 && BELL[i].volume>=0.2) BELL[i].volume -= 0.2;
		if (value== 20 && BELL[i].volume<=0.8) BELL[i].volume += 0.2;
	}
	document.getElementById("hangero").getElementsByTagName("p")[0].innerHTML = Math.round(BELL.bot.volume*100)+'%';
	BELL.bot.play();
}
function stopSound(butt) {
	EVENT.hangSzunet = new Date();
	var timeDiv = document.getElementById("stopSoundTime");
	
	if (butt.innerHTML == 'Hang visszakapcsolása') {
		butt.innerHTML = 'Hangszünet';
		timeDiv.innerHTML = '';
		clearTimeout(EVENT.hangSzunetTIME);
	} else {
		document.getElementById("stoptime").value = document.getElementById("stoptime").value.match(/[0-9]+/g)[0];
		var time = document.getElementById("stoptime").value;
		if (time == '') return;
		time=parseInt(time,10);
		EVENT.hangSzunet.setMinutes(EVENT.hangSzunet.getMinutes()+time);
		butt.innerHTML = 'Hang visszakapcsolása';
		timeDiv.innerHTML = 'Hang visszakapcsolása ekkor: '+prettyDatePrint(EVENT.hangSzunet);
		EVENT.hangSzunetTIME = setTimeout(function(){butt.innerHTML = 'Hangszünet'; document.getElementById("stopSoundTime").innerHTML = '';}, time*60000);
	}
}
function stopSoundIf(el) {
	EVENT.noSoundIf = el.checked;
}
function setAgressiveRefresh(el) {
	EVENT.agressiveRefresh_win = el.checked;
}
function setAgressiveRefresh2(el) {
	EVENT.agressiveRefresh = el.checked;
}
function setTabVisibility(id, el) {
	var x = document.getElementById(id);
	if (x.style.display=="none") {
		x.style.display = 'block';
		if (!el.classList.contains("openedH3")) el.classList.add("openedH3");
	} else {
		x.style.display = 'none';
		el.classList.remove("openedH3");
	}
}
function changeSound(el, id) {
	var vol = BELL.bot.volume;
	TOZSDE_DATA.sound[id] = el.value;
	BELL[id] = new Audio(SOUND_LOC + el.value);
	BELL[id].volume = vol;
	setTimeout(function() {
		if (BELL[id].readyState == 4) {
			BELL[id].play();
		} else {
			addEvent('&#9432; Probléma adódott a hang váltásával', 'info');
		}
	},1000);
}
function copyAuto(inputNo) {
	if (!confirm('Szeretné az ehhez tartozó automata beállításokat a többi nyersanyaghoz is átmásolni?')) return;
	var x=document.getElementById("tozsde_auto").rows, val, inputs;
	for (var i=1;i<x.length;i++) {
		inputs = $(x[i]).find('input[type=number]');
		val = inputs[inputNo].value;
		inputs.val(val).change();
	}
}
function roundDown2(val) {
	if (val == 0) return 0;
	let newVal = val;
	if (val < 500)
		newVal = Math.floor(val/50) * 50;
	else if (val < 2500)
		newVal = Math.floor(val/100) * 100;
	else
		newVal = Math.floor(val/500) * 500;
	if (newVal == 0) return 1;
	return newVal;
}

// notificationClass: info, sell, buy, incoming-warning
function addEvent(data, notificationClass) {try{
	var myTable = document.getElementById("allapot").getElementsByTagName("tbody")[0];
	var row = myTable.insertRow(0);
	var dateCell = row.insertCell(0); dateCell.innerHTML = prettyDatePrint(new Date());
	var cell;
	
	if (notificationClass) {
		cell = row.insertCell(1); cell.setAttribute("colspan", "7");
		cell.innerHTML = data;
		cell.setAttribute("class","item-"+notificationClass);
	} else {
		for (var i=1;i<4;i++) {
			cell = row.insertCell(i);
			cell.innerHTML = convertToArrow(data[2][i-1]) + ' ' + data[0][i-1];
		}
		for (var i=4;i<7;i++) {
			cell = row.insertCell(i); cell.innerHTML = data[3][i-4];
		}
		cell = row.insertCell(7); cell.innerHTML = new Array(...data[1]).join('<br>');
	}
	
	function convertToArrow(sign) {
		switch(sign) {
			case '+': return '<font style="color: red">&mapstoup;</font>'; break;
			case '-': return '<font style="color: #99F">&DownTeeArrow;</font>'; break;
			case '=': return '<font style="color: white; opacity: 0.5">&LeftArrowRightArrow;</font>'; break;
			default: return '?';
		}
	}
}catch(e){console.info('AddEvent error:', e);}}

function BotvedelemBe() {
	BOT = true;
	addEvent('BOT VÉDELEM AKTÍV! Oldd fel a játékot, vagy frissíts a lapra. <a href="javascript:BotvedelemKi();" style="color: #66D;">Frissítés</a>', 'info');
	csengess('bot');
	
	BOTTIME = setInterval(function() {
		if (REF && !(REF.document.getElementById('bot_check') || REF.document.getElementById('popup_box_bot_protection') || REF.document.title=="Bot védelem" || REF.document.getElementById('botprotection_quest'))) {
			BotvedelemKi();
			return;
		}

		if (typeof(window.URL) != "undefined") {
			var worker2 = createWorker(function(self){
				self.addEventListener("message", function(e) {
					postMessage('');
				}, false);
			});

			worker2.onmessage = function(e) {
				csengess('bot');
			};
			worker2.postMessage({});
		} else {
			csengess('bot');
		}
	}, 2500);
}
function BotvedelemKi() {
	REF.location.reload();
	if (BOT==false) return;
	BELL['bot'].pause();
	addEvent('Bot védelem rendben.', 'info');
	BOT = false;
	clearInterval(BOTTIME);
}
function isPageLoaded(ref){try{
	if (ref.closed) {STATUS = 1; return false;}
	try{
		ref.status;
	} catch(e) {
		csengess("bot");
		if (ISLOGIN) {
			addEvent("A rendszer vélhetőleg kiléptette", 'info');
			ISLOGIN = false;
		}
		return false;
	}
	ISLOGIN=true;
	
	if (ref.document.readyState !== "complete") return false;

	if (ref.document.getElementById('botprotection_quest')) {
		ref.document.getElementById('botprotection_quest').click();
		BotvedelemBe();
		return false;
	}
	if (ref.document.getElementById('bot_check')) {
		ref.document.getElementById('bot_check').getElementsByTagName('a')[0].click();
		BotvedelemBe();
		return false;
	}
	
	if (ref.document.getElementById('bot_check') || ref.document.getElementById('popup_box_bot_protection') || ref.document.title=="Bot védelem") {
		BotvedelemBe();
		return false;
	}
	if (ref.document.location.href.indexOf("sid_wrong")>-1){
		BotvedelemBe();
		return false;
	}
	

	if (ref.document.location.href.indexOf("exchange") == -1) {
		STATUS = 1;
		return false;
	}

	if (ref.document.getElementById("serverTime").innerHTML.length<4){
		return false;
	}
	
	if (!ref.PremiumExchange || !ref.document.getElementById("premium_exchange_form")) return false;
	
	return true;
}catch(e){return false;}
return false;}

function stopStartAuto(el, mode, resType) {
	ISTOZSDE_AUTO[resType][mode] = el.checked;
}
function saveAuto() {
	var x = document.getElementById('cnc_tozsde'), tmp;
	var resources = ['wood', 'stone', 'iron'];
	TOZSDE_AUTO = {
		wood: {
			sell: {},
			buy: {}
		},
		stone: {
			sell: {},
			buy: {}
		},
		iron: {
			sell: {},
			buy: {}
		},
		left_merch: 0
	};
	
	//SELL
	for (var j=0;j<resources.length;j++) {
		for (var i=0;i<AUTO_FIELDS_SELL.length;i++) {
			tmp = x['auto_sell_'+resources[j]+'_'+AUTO_FIELDS_SELL[i]];
			TOZSDE_AUTO[resources[j]].sell[AUTO_FIELDS_SELL[i]] = parseInt(tmp.value, 10);
		}
	}
	
	//BUY
	for (var j=0;j<resources.length;j++) {
		for (var i=0;i<AUTO_FIELDS_BUY.length;i++) {
			tmp = x['auto_buy_'+resources[j]+'_'+AUTO_FIELDS_BUY[i]];
			TOZSDE_AUTO[resources[j]].buy[AUTO_FIELDS_BUY[i]] = parseInt(tmp.value, 10);
		}
	}
	TOZSDE_AUTO.left_merch = parseInt(x['left_merch'].value,10);
	
	localStorage.setItem('PF_tozsde_Auto'+ID, JSON.stringify(TOZSDE_AUTO));
	
	setButtonBack("auto_save");
}
function saveTozsdeData() {
	var myForm = document.getElementById("cnc_tozsde");
	TOZSDE_DATA = {
		sound: {}
	};
	for (var i=0;i<CHK_FIELDS.length;i++) {
		TOZSDE_DATA[CHK_FIELDS[i]] = myForm[CHK_FIELDS[i]].checked;
		TOZSDE_DATA.sound[CHK_FIELDS[i]] = myForm[CHK_FIELDS[i]+'_sound'].value;
	};
	TOZSDE_DATA.sound.bot = myForm.bot_sound.value;
	for (var i=0;i<FIELDS.length;i++) {
		if (FIELDS[i].indexOf("nameOf")==-1) myForm[FIELDS[i]].value = myForm[FIELDS[i]].value.replace(/[^0-9]/g, '');
		if (myForm[FIELDS[i]].value == '') myForm[FIELDS[i]].value = TOZSDE_DATA_DEFAULT[FIELDS[i]];
		if (FIELDS[i].indexOf("nameOf")==-1) {
			TOZSDE_DATA[FIELDS[i]] = parseInt(myForm[FIELDS[i]].value,10);
		} else {
			TOZSDE_DATA[FIELDS[i]] = myForm[FIELDS[i]].value;
		}
	}
	localStorage.setItem('PF_tozsde'+ID, JSON.stringify(TOZSDE_DATA));
	if (isPageLoaded(REF)) putQuickButtons();
	
	setButtonBack("tozsde_save");
}
function setButtonBack(id) {
	var butt = document.getElementById(id);
	butt.disabled = true;
	butt.innerHTML = butt.innerHTML.replace("*","");
}
function loadData() {
	try{TOZSDE_DATA = JSON.parse(localStorage.getItem('PF_tozsde'+ID));}catch(e){TOZSDE_DATA=null;}
	var myForm = document.getElementById("cnc_tozsde");
	if (!TOZSDE_DATA || TOZSDE_DATA == null) {
		// Default érték nem lementett adat esetén
		TOZSDE_DATA = JSON.parse(JSON.stringify(TOZSDE_DATA_DEFAULT));
	}
	
	for (var i=0;i<CHK_FIELDS.length;i++) {
		myForm[CHK_FIELDS[i]].checked = TOZSDE_DATA[CHK_FIELDS[i]];
	}
	for (var i=0;i<FIELDS.length;i++) {
		myForm[FIELDS[i]].value = TOZSDE_DATA[FIELDS[i]] || TOZSDE_DATA_DEFAULT[FIELDS[i]];
	}
	
	// Load avtomat
	try{TOZSDE_AUTO = JSON.parse(localStorage.getItem('PF_tozsde_Auto'+ID));}catch(e){TOZSDE_AUTO=null;}
	if (!TOZSDE_AUTO || TOZSDE_AUTO==null) {
		TOZSDE_AUTO = {
			wood: {
				sell: {},
				buy: {}
			},
			stone: {
				sell: {},
				buy: {}
			},
			iron: {
				sell: {},
				buy: {}
			},
			left_merch: 0
		};
	} else {
		for (var i=0;i<AUTO_FIELDS_SELL.length;i++) {
			var a=AUTO_FIELDS_SELL[i];
			myForm['auto_sell_wood_'+a].value = TOZSDE_AUTO.wood.sell[a];
			myForm['auto_sell_stone_'+a].value = TOZSDE_AUTO.stone.sell[a];
			myForm['auto_sell_iron_'+a].value = TOZSDE_AUTO.iron.sell[a];
		}
		for (var i=0;i<AUTO_FIELDS_BUY.length;i++) {
			var a=AUTO_FIELDS_BUY[i];
			myForm['auto_buy_wood_'+a].value = TOZSDE_AUTO.wood.buy[a];
			myForm['auto_buy_stone_'+a].value = TOZSDE_AUTO.stone.buy[a];
			myForm['auto_buy_iron_'+a].value = TOZSDE_AUTO.iron.buy[a];
		}
		myForm['left_merch'].value = TOZSDE_AUTO.left_merch || 0;
		saveAuto();
	}
	
	setButtonBack("tozsde_save");
	setButtonBack("auto_save");
}
function loadSoundData() {
	var i,j, vol = BELL.bot?BELL.bot.volume:1;
	if (!TOZSDE_DATA.sound) {TOZSDE_DATA.sound = JSON.parse(JSON.stringify(TOZSDE_DATA_DEFAULT.sound));}
	
	var myForm = document.getElementById("cnc_tozsde");
	for (j in CHK_FIELDS) {
		i = CHK_FIELDS[j];
		putSound(i);
	}
	putSound('bot');
	saveTozsdeData();
	
	setTimeout(function checkAudioAvailability() {
		var isProblem = false;
		for (var i in BELL) {
			if (BELL[i].readyState !== 4) {
				isProblem=true;
				addEvent('&#9432; Probléma van a '+TOZSDE_DATA.sound[i].split('.')[0] +' hang betöltésével. Használd a hang újrabetöltését vagy a lejátszás gombot.', 'info');
			}
		}
		if (!isProblem) addEvent('&#9432; Hangok sikeresen betölve.', 'info');
	},3000);
	
	function putSound(i) {
		if (!TOZSDE_DATA.sound[i]) TOZSDE_DATA.sound[i] = defaultSound;
		myForm[i+'_sound'].value = TOZSDE_DATA.sound[i];
		BELL[i] = new Audio(SOUND_LOC + TOZSDE_DATA.sound[i]);
		BELL[i].volume = vol;
	}
}

function prettyDatePrint(m){
	return ("0" + m.getHours()).slice(-2) + ":" +
	("0" + m.getMinutes()).slice(-2) + ":" +
	("0" + m.getSeconds()).slice(-2);
}

function csengess(id){try{
	if (!BELL[id].paused) {
		BELL[id].pause();
		return;
	}
	if (BELL[id].readyState == 4) BELL[id].play();
	else BELL[id].load();
}catch(e){console.error("HIBA::Playsound",e)}}


function updateStatistic(newValues, lastValues) {
	var d = new Date(); 
	var delta = (d - STATS.lastStat)/60000; // perc különbség
	
	for (var i=0;i<3;i++) {
		if (newValues[i]<30) return;
		if (STATS.min[i] > newValues[i]) STATS.min[i] = newValues[i];
		if (STATS.max[i] < newValues[i]) STATS.max[i] = newValues[i];
		STATS.avg[i] = (STATS.avg[i] * STATS.avg[3] + lastValues[i] * delta) / (STATS.avg[3]+delta);
	}
	STATS.avg[3] += delta;
	STATS.lastStat = d;
	
	updateStatTable();
	
	function updateStatTable() {
		var x = document.getElementById("cnc_stats");
		for (var i=0;i<3;i++) {
			x.rows[1].cells[i+1].innerHTML = STATS.min[i];
			x.rows[2].cells[i+1].innerHTML = STATS.max[i];
			x.rows[3].cells[i+1].innerHTML = Math.round(STATS.avg[i]);
		}
	}
}
function updateAutoStatistic(mode, type, resValue, ppValue) {
	// mode type sellValue
	var x = document.getElementById("cnc_stats");
	var resIndex = 0;
	if (type=="stone") resIndex=1; if (type=="iron") resIndex=2;
	if (mode=="sell") {
		STATS.autoSell[resIndex]+=resValue;
		STATS.autoSell[3]+=ppValue;
	} else {
		STATS.autoBuy[resIndex]+=resValue;
		STATS.autoBuy[3]+=ppValue;
	}
	for (var i=0;i<4;i++) {
		x.rows[4].cells[i+1].innerHTML = STATS.autoSell[i];
		x.rows[5].cells[i+1].innerHTML = STATS.autoBuy[i];
	}
}

/**
	3rdparty from game, extended with custom stock value! Search for these code in formatted version!
	@param {stringEnum} nyersType Resource eg. "wood"
	@param {number} keszlet Simulated stock size
	@param {stringEnum} mode sell/buy
	@param {boolean} isFullOk in case of sell. capacity extend is a price too
*/
function getClearValue(nyersType, keszlet, mode, isFullOk) {
	if (mode=="sell") {
		for (var i=63;i<10000;i++) {
			if (getRealClearValue(nyersType,-i,keszlet) <= -1) break;
		}
	} else {
		for (var i=63;i<10000;i++) {
			if (getRealClearValue(nyersType,i,keszlet) >= 1) break;
		}
	}
	var hiany = REF.PremiumExchange.data.capacity[nyersType] - keszlet;
	if (mode == 'sell' && isFullOk && hiany>0 && (i-1) > hiany) return hiany;
	if (mode == 'buy' && keszlet < i) return keszlet;
	return i-1;
	
	function getRealClearValue(e, a, t) { //e: nyerstype, pl. "wood", a: Mennyi, negatív ha eladod a nyerset, t: stock
		var n = REF.PremiumExchange.data.capacity[e];
		return (1 + (a >= 0 ? REF.PremiumExchange.data.tax.buy : REF.PremiumExchange.data.tax.sell)) * (REF.PremiumExchange.calculateMarginalPrice(t, n) + REF.PremiumExchange.calculateMarginalPrice(t - a, n)) * a / 2
	}
}

function putQuickButtons(){try{
	var table = REF.document.getElementById("premium_exchange_form").getElementsByTagName("table")[0];
	var limits = [
		parseInt(table.rows[2].cells[1].innerText,10) - parseInt(table.rows[1].cells[1].innerText,10),
		parseInt(table.rows[2].cells[2].innerText,10) - parseInt(table.rows[1].cells[2].innerText,10),
		parseInt(table.rows[2].cells[3].innerText,10) - parseInt(table.rows[1].cells[3].innerText,10)
	];
	var merchs = REF.PremiumExchange.data.merchants;
	var resources = [REF.game_data.village.wood, REF.game_data.village.stone, REF.game_data.village.iron];
	for (var i=0;i<limits.length;i++) {
		if (limits[i] > resources[i]) {
			limits[i] = roundDown(resources[i], i);
		}
		if (limits[i] > (merchs*1000)) {
			limits[i] = roundDown(merchs*1000, i);
		}
	}
	
	if (!table.classList.contains("cnc_transformed")) {
		var theScript = REF.document.createElement("script");
		theScript.innerHTML="function setValue(cellId, value) { $('#premium_exchange_sell_'+cellId+' input').val(value).trigger('input');	}\
							function setNull(cellId)   { $('#premium_exchange_sell_'+cellId+' input, #premium_exchange_buy_'+cellId+' input').val('').trigger('input'); }\
							function setSellValue(cellId, value) { $('#premium_exchange_buy_'+cellId+' input').val(value).trigger('input'); }";
		REF.document.body.appendChild(theScript);
		table.rows[5].cells[1].style.position="relative";
		table.rows[5].cells[2].style.position="relative";
		table.rows[5].cells[3].style.position="relative";
		
		for (var i=0;i<3;i++) {
			var cellId = '';
			switch(i) {case 0:cellId+='wood';break;case 1:cellId+='stone';break;case 2:cellId+='iron';break;}
			var maxButton = REF.document.createElement("div");
			maxButton.setAttribute("style","position: absolute; right: 0px; top: 20px;");
			maxButton.innerHTML='\
				<button type="button" onclick="setSellValue(\''+cellId+'\','+roundDown2(getAutoBuyValue(i))+')" style="background: #F66">A</button>\
				<button type="button" onclick="setValue(\''+cellId+'\','+roundDown2(getAutoSellValue(i))+')">A</button><button type="button" onclick="setValue(\''+cellId+'\','+limits[i]+')">Max</button><button type="button" style="background: linear-gradient(140deg, #eee 50%, #F66 51%,#F66 100%);" onclick="setNull(\''+cellId+'\')">X</button>';
			
			list = table.rows[5].cells[(i+1)].getElementsByClassName("cost-container")[0];
			list.insertBefore(maxButton, list.childNodes[i]);
		}
	} else {
		for (var i=0;i<3;i++) {
			var cellId = '';
			switch(i) {case 0:cellId+='wood';break;case 1:cellId+='stone';break;case 2:cellId+='iron';break;}
			table.rows[5].cells[(i+1)].getElementsByTagName("button")[0].setAttribute("onclick",'setSellValue("'+cellId+'",'+roundDown2(getAutoBuyValue(i))+')'); //AutoBuyButton
			table.rows[5].cells[(i+1)].getElementsByTagName("button")[1].setAttribute("onclick",'setValue("'+cellId+'",'+roundDown2(getAutoSellValue(i))+')'); //AutoButton
			table.rows[5].cells[(i+1)].getElementsByTagName("button")[2].setAttribute("onclick",'setValue("'+cellId+'",'+limits[i]+')'); //MaxButton
		}
	}
	table.classList.add("cnc_transformed");
	
	function roundDown(nyers, type) {
		type++;
		var keszlet = parseInt(table.rows[1].cells[type].innerText,10)+nyers;
		var kapacitas = parseInt(table.rows[2].cells[type].innerText,10);
		var result = Math.floor(nyers - (1/REF.PremiumExchange.calculateMarginalPrice(keszlet, kapacitas)));
		return result<0?0:result;
	}
	
	function getAutoSellValue(type) {
		var upperLimit = 0, curr_price, maxxx = merchs*1000;
		if (maxxx > resources[type]) maxxx = resources[type];
		switch(type) {
			case 0: type="wood"; upperLimit = TOZSDE_DATA.min_wood; break;
			case 1: type="stone"; upperLimit = TOZSDE_DATA.min_stone; break;
			case 2: type="iron"; upperLimit = TOZSDE_DATA.min_iron; break;
		}
		
		var keszlet = REF.PremiumExchange.data.stock[type];
		
		var result = 0;
		
		do {
			curr_price = getClearValue(type, keszlet, "sell");
			result+=Math.floor(curr_price);
			keszlet+=Math.floor(curr_price);
		} while (Math.round(curr_price) <= upperLimit && result <= maxxx)
		result-= Math.floor(curr_price);
	
		return Math.floor(result);
	}
	
	function getAutoBuyValue(type) {
		var lowerLimit;
		switch(type) {
			case 0: type="wood"; lowerLimit = TOZSDE_DATA.max_wood; break;
			case 1: type="stone"; lowerLimit = TOZSDE_DATA.max_stone; break;
			case 2: type="iron"; lowerLimit = TOZSDE_DATA.max_iron; break;
		}
		
		var keszlet = REF.PremiumExchange.data.stock[type], curr_price, result = 0;
		
		do {
			curr_price = getClearValue(type, keszlet, "buy");
			result+=Math.floor(curr_price);
			keszlet-=Math.floor(curr_price);
		} while (Math.floor(curr_price) >= lowerLimit);
		result-=Math.floor(curr_price);
		
		return Math.floor(result);
	}
}catch(e){console.error(e);}}

/**
	@desc Eldönti hozzá kell-e adni a jelenlegi árat az auto vásárláshoz.
	@param currPrice {Int} A jelenlegi ár amit hozzáadnánk
	@param result {Int} Eddig már megvenni kívánt nyers
	@param type {enum} wood/stone/iron
	@param mode {enum} sell/buy
	@return {Int} Megemelt auto-ajánlat (result+currPrice, ha kell - ellenben result)
*/
function autoAdd(currPrice, result, type, mode) {try{
	var availableRes = REF.game_data.village[type];
	var cache;
	
	// Mennyi a beérkező nyersanyag a piacról?
	var marketStatus = REF.document.getElementById("market_status_bar").getElementsByTagName("table");
	if (marketStatus.length>1) {
		marketStatus = marketStatus[1].rows[0].cells;
		if (marketStatus[0].innerText.indexOf(TOZSDE_DATA.nameOfBeerkezo) > -1) {
			marketStatus = $(marketStatus[0]).find('>span');
			for (var i=0;i<marketStatus.length;i++) {
				if (marketStatus[i].getAttribute("class") == 'nowrap' && marketStatus[i].getElementsByTagName("span")[0].getAttribute("class").indexOf(type) > -1) {
					availableRes += parseInt(marketStatus[i].innerText.replace(".",""));
					break;
				}
			}
		}
	}
	
	// SELL - feltételek
	if (mode=='sell' && ISTOZSDE_AUTO[type].sell) {
		cache = TOZSDE_AUTO[type].sell;
		
		if (currPrice > cache.maxLimit ||
			(REF.PremiumExchange.data.merchants-TOZSDE_AUTO.left_merch) * 1000 < result+currPrice ||
			REF.game_data.village[type] < result+currPrice ||
			(availableRes-result-currPrice) < cache.minRes) return false; 

		if (REF.PremiumExchange.data.capacity[type] < REF.PremiumExchange.data.stock[type]+result+currPrice) {
			if (result==0)
				return REF.PremiumExchange.data.capacity[type] - (REF.PremiumExchange.data.stock[type]+result);
			else
				return false;
		}
		if (currPrice < cache.minLimit) return true;
		if (availableRes-result > cache.minRes + ((currPrice-cache.minLimit)*((cache.maxRes-cache.minRes)/(cache.maxLimit-cache.minLimit))) ) return true; else return false;
	}
	
	// BUY - feltételek
	if (mode=='buy' && ISTOZSDE_AUTO[type].buy) {
		cache = TOZSDE_AUTO[type].buy;
		if (currPrice < cache.minLimit ||
			REF.PremiumExchange.data.stock[type] < result+currPrice ||
			(availableRes+result+currPrice) >= cache.maxRes) return false;
		if (currPrice >= cache.maxLimit) return availableRes+result+currPrice < cache.maxRes;
		if ( availableRes+result <= cache.minRes + ((currPrice-cache.minLimit)*((cache.maxRes-cache.minRes)/(cache.maxLimit-cache.minLimit))) ) return true; else return false;
	}
	return false;
}catch(e) {console.error(e); return false;}}
function resetAutoState(isReloadRequire=true) {
	TOZSDE_AUTOINFO = {
		inProgress: false,
		startProgress: new Date(),
		mode: '',
		type: '',
		ppValue: 0,
		sellValue: 0,
		minMaxPrice: 0,
		isError: false,
		lastSuccess: new Date()
	};
	AUTO_STATUS=0;
	if (isReloadRequire) REF.location.reload();
}
function startAutoProcess() {
	//TOZSDE_AUTO
	var currPrice, keszlet, resources=['wood', 'stone', 'iron'], temp;
	
	if (TOZSDE_AUTOINFO.inProgress && TOZSDE_AUTOINFO.isError) {
		var val = parseInt(REF.document.getElementById("premium_exchange_form")[TOZSDE_AUTOINFO.mode+'_'+TOZSDE_AUTOINFO.type].value,10);
		val-=(TOZSDE_AUTOINFO.minMaxPrice*1.1);
		if (isNaN(val) || val<=0) { resetAutoState(); return; }
		REF.document.getElementById("premium_exchange_form")[mode+'_'+type].value = val;
		REF.$('#premium_exchange_form .btn.btn-premium-exchange-buy').click();
	} else {
		var sellType = {};
		for (var i=0;i<resources.length;i++) {
			keszlet=REF.PremiumExchange.data.stock[resources[i]];
			if (ISTOZSDE_AUTO[resources[i]].sell) {
				currPrice = getClearValue(resources[i], keszlet, "sell", true);
				temp = autoAdd(currPrice, 0, resources[i], 'sell');
				if (temp === true) {
					if ((sellType.type && sellType.currPrice > currPrice) || !sellType.type) {
						sellType.type = resources[i];
						sellType.amount = currPrice;
						sellType.currPrice = currPrice;
					}
				} else if (typeof temp == "number" && temp > 0) { 
					if ((sellType.type && sellType.currPrice > currPrice) || !sellType.type) {
						sellType.type = resources[i];
						sellType.amount = temp;
						sellType.currPrice = currPrice;
					}
				}
			}
			if ( !sellType.type && ISTOZSDE_AUTO[resources[i]].buy ) {
				currPrice = getClearValue(resources[i], keszlet, "buy");
				if (currPrice > TOZSDE_AUTO[resources[i]].buy.minLimit && autoAdd(currPrice, 0, resources[i], 'buy')) {
					console.info('startAutoInsert call to buy with: ', resources[i], 'buy', currPrice);
					startAutoInsert(resources[i], 'buy', currPrice);
					return;
				}
			}
		}
		if (sellType.type) {
			startAutoInsert(sellType.type, 'sell', sellType.amount);
		}
	}
	
	function startAutoInsert(type, mode, startPrice) {
		// DELAYER
		if (!EVENT.agressiveRefresh && new Date() - TOZSDE_AUTOINFO.lastSuccess > 60000) {
			TOZSDE_AUTOINFO.lastSuccess = new Date();
			return;
		}

		var currPrice=startPrice,
			result=0,
			lastCurrPrice,
			helper=true
			noInteration=0;
		while (helper) {
			if (typeof helper == "number") result += helper; else result += currPrice;
			lastCurrPrice = currPrice;
			currPrice = getClearValue(type, mode=='sell' ? REF.PremiumExchange.data.stock[type] + result:REF.PremiumExchange.data.stock[type] - result, mode);
			helper = autoAdd(currPrice, result, type, mode)
			noInteration++;
		}
		if (result==0) return;
		
		TOZSDE_AUTOINFO.inProgress=true;
		TOZSDE_AUTOINFO.startProgress=new Date();
		TOZSDE_AUTOINFO.mode=mode;
		TOZSDE_AUTOINFO.type=type;
		TOZSDE_AUTOINFO.minMaxPrice=lastCurrPrice;
		if (noInteration == 1) result = 1;
		
		console.info(`Eredmény (${mode}/${noInteration}pp):`, result, '-->', limitMech(roundDown2(Math.floor(result)), mode));
		REF.document.getElementById("premium_exchange_form")[mode+'_'+type].value = limitMech(roundDown2(Math.floor(result)));
		REF.$('#premium_exchange_sell_'+type+' input').trigger('input');
		REF.$('#premium_exchange_form .btn.btn-premium-exchange-buy').click();
		
		AUTO_STATUS = 1;
	}

	function limitMech(amount, mode) {
		if (mode == 'buy') return amount;
		let allMerch = parseInt(REF.document.getElementById('market_merchant_total_count').textContent,10);
		let maxLimit = Math.floor(allMerch / 3) * 1000;
		if (maxLimit < 100) return amount; // Ha < 3 kereskedőm van
		return Math.min(maxLimit, amount);
	}
}
function checkTransactionPopup() {
	if (REF.document.getElementById("premium_exchange") == null || REF.document.getElementById("fader").style.display=='none') {
		//Nem jelent meg a popup, baj van. Nyomkodjuk a BUY-t újra és újra, 5mp-ig. Tranzakció folyamatban?
		if (new Date() - TOZSDE_AUTOINFO.startProgress < 5000) {
			REF.$('#premium_exchange_form .btn.btn-premium-exchange-buy').click();
		} else { // Fatal error
			console.info('WTF-error: Nem jelenik meg a lightbox');
			resetAutoState();
		}
		return;
	}

	// Nincs Confirm gomb, szóval fatal-error (nincs nyers v nincs ennyi készleten) -> reload
	if (!REF.document.querySelector('#premium_exchange .btn-confirm-yes')) {
		resetAutoState();
		console.log('Nincs többé confirm. ', REF.document.querySelector('#premium_exchange .warn').textContent);
		return;
	}
	
	// Ha megváltozott az arány útközbe, reload
	var prices = REF.document.getElementById("confirmation-msg").getElementsByTagName("table")[0].rows[1].cells[1].innerText.match(/[0-9]+/g);
	prices[0] = parseInt(prices[0],10); prices[1] = parseInt(prices[1],10);
	switch (TOZSDE_AUTOINFO.mode) {
		case 'sell': if (TOZSDE_AUTOINFO.minMaxPrice < (prices[0]/prices[1])*0.97) {console.info('Hiba, végső ár nem jó',(prices[0]/prices[1])*0.97,TOZSDE_AUTOINFO.minMaxPrice); resetAutoState(); return;} break;
		case 'buy': if (TOZSDE_AUTOINFO.minMaxPrice > (prices[0]/prices[1])*1.03) { console.info('Hiba, végső ár nem jó',(prices[0]/prices[1])*1.03,TOZSDE_AUTOINFO.minMaxPrice); resetAutoState(); return;} break;
	}

	TOZSDE_AUTOINFO.sellValue = prices[0];
	TOZSDE_AUTOINFO.ppValue = prices[1];
	REF.document.querySelector("#premium_exchange .btn-confirm-yes").click(); //.innerHTML = 'ALMA';
	AUTO_STATUS=2;
}
function checkSuccessfulTransaction() {
	var popupBox = REF.document.getElementById("confirmation-box");
	if (REF.document.getElementById("fader").style.display=='none') { // ALL OK
		addEvent('Automata '+(TOZSDE_AUTOINFO.mode=="sell"?'eladás':'vásárlás')+': '+TOZSDE_AUTOINFO.sellValue+'<span class="icon header '+TOZSDE_AUTOINFO.type+'"> </span> &LeftArrowRightArrow; '+TOZSDE_AUTOINFO.ppValue +'<span class="icon header premium"> </span> (Átlagár: '+Math.round(TOZSDE_AUTOINFO.sellValue / TOZSDE_AUTOINFO.ppValue)+')', TOZSDE_AUTOINFO.mode);
		updateAutoStatistic(TOZSDE_AUTOINFO.mode,TOZSDE_AUTOINFO.type,TOZSDE_AUTOINFO.sellValue,TOZSDE_AUTOINFO.ppValue);
		AUTO_STATUS=0;
		if (TOZSDE_DATA.autotrans) {csengess('autotrans')}
		resetAutoState(false);
		TOZSDE_AUTOINFO.lastSuccess=new Date();
	} else {
		if (popupBox.getElementsByClassName("error").length>0) { // Nem teljesíthető
			TOZSDE_AUTOINFO.isError=true;
			REF.document.getElementById("premium_exchange").getElementsByClassName("btn-confirm-no")[0].click();
			console.info("Error, nem teljesíthető a parancs mert ",popupBox.getElementById("confirmation-msg").innerHTML);
			REF.location.reload();
			AUTO_STATUS=0;
		} else if (popupBox.getElementsByClassName("warn").length>0) { // Új ajánlat
			checkTransactionPopup();
		} else { // Minden ok, elvileg lehetetlen
			TOZSDE_AUTOINFO.isError=false;
			console.info('Lehetetlen esemény: ', REF.document.getElementById("confirmation-msg").innerHTML);
		}
	}
}

function windowOperation(operation) {
	switch(operation) {
		case 'open': REF = window.open(LINK, 'PF_tozsde_'+ID); break;
	}
}

/** Lightbox override */
function transformPage() {try{
	var lightbox = REF.document.getElementById("confirmation-msg");
	var pipa = '';
	var isTransformed = false;
	if (lightbox && lightbox !== null) {
		if (lightbox.classList.contains("cnc_transformed")) {
			isTransformed=true;
		} else {
			lightbox.classList.add("cnc_transformed");
		}
		
		var cell = lightbox.getElementsByTagName("table")[0].rows[1].cells[1];
		var arany = cell.innerText.match(/[0-9]+/g);
		arany = Math.round(parseInt(arany[0],10) / parseInt(arany[1],10));
		if (cell.innerText.indexOf(TOZSDE_DATA.nameOfElad) > -1) {
			if (cell.getElementsByTagName("img")[0].src.indexOf('wood')>-1 && arany<=TOZSDE_DATA.min_wood ||
				cell.getElementsByTagName("img")[0].src.indexOf('stone')>-1 && arany<=TOZSDE_DATA.min_stone ||
				cell.getElementsByTagName("img")[0].src.indexOf('iron')>-1 && arany<=TOZSDE_DATA.min_iron) 
				pipa = '✔'; else pipa = 'X';
		}
		if (cell.innerText.indexOf(TOZSDE_DATA.nameOfVasarolj) > -1) {
			if (cell.getElementsByTagName("img")[0].src.indexOf('wood')>-1 && arany>=TOZSDE_DATA.max_wood ||
				cell.getElementsByTagName("img")[0].src.indexOf('stone')>-1 && arany>=TOZSDE_DATA.max_stone ||
				cell.getElementsByTagName("img")[0].src.indexOf('iron')>-1 && arany>=TOZSDE_DATA.max_iron) 
				pipa = '✔'; else pipa = 'X';
		}
		if (!isTransformed) lightbox.getElementsByTagName("p")[0].innerHTML += '<br><b>Arány: 1 pp = '+arany+' nyers '+pipa+'</b>';
		return arany;
	}
	return null;
}catch(e){console.error(e);}}
function tozsdekereses() {try{
	var route = false;
	var soundID = '';
	var currentPrices = [
		parseInt(REF.document.getElementById("premium_exchange_rate_wood").innerText.match(/[0-9]+/g)[0],10),
		parseInt(REF.document.getElementById("premium_exchange_rate_stone").innerText.match(/[0-9]+/g)[0],10),
		parseInt(REF.document.getElementById("premium_exchange_rate_iron").innerText.match(/[0-9]+/g)[0],10)
	];
	var incoming_atk = REF.document.getElementById("incomings_amount")?parseInt(REF.document.getElementById("incomings_amount").innerHTML,10):0;
	if (TOZSDE_DATA.newMail && REF.document.getElementById("menu_mail_count").innerHTML.match(/[0-9]+/g)) {
		var count_mail = REF.document.getElementById("menu_mail_count").innerHTML.match(/[0-9]+/g)[0];
		if (NEWMAIL < count_mail) {
			csengess("newMail");
			addEvent('<span class="icon header new_mail" style="height:16px"> </span> Új üzeneted érkezett ('+count_mail+')', 'info');
		}
		NEWMAIL = count_mail;
	} else NEWMAIL=0;
		
	if (INCOMING < incoming_atk && TOZSDE_DATA.newAttack) {
		csengess("newAttack");
		addEvent('<img src="/graphic/buildings/barracks.png"> Bejövő támadások száma '+incoming_atk+'-re emelkedett', 'incoming-warning');
	}
	INCOMING = incoming_atk;
	
	if (currentPrices[0]<10) return;
	if (new Date() - EVENT.lastChange > 300000) {STATUS = 1; EVENT.lastChange = new Date();} 
	if (!REF.document.getElementById("premium_exchange_form").getElementsByTagName("table")[0].classList.contains("cnc_transformed")) {putQuickButtons();route=true;}
	
	
	var table = REF.document.getElementById("premium_exchange_form").getElementsByTagName("table")[0];
	const onStock = [
		parseInt(table.rows[1].cells[1].innerText,10),
		parseInt(table.rows[1].cells[2].innerText,10),
		parseInt(table.rows[1].cells[3].innerText,10)
	];
	const capacity = [
		parseInt(table.rows[2].cells[1].innerText,10),
		parseInt(table.rows[2].cells[2].innerText,10),
		parseInt(table.rows[2].cells[3].innerText,10)
	];

	if (EVENT.lastResult[0] == currentPrices[0] && EVENT.lastResult[1] == currentPrices[1] && EVENT.lastResult[2] == currentPrices[2] &&
		EVENT.lastResult[3] == onStock[0] && EVENT.lastResult[4] == onStock[1] && EVENT.lastResult[5] == onStock[2]) return;
	EVENT.lastChange = new Date();
	
	updateStatistic(currentPrices, EVENT.lastResult);
	const notification = new Set();
	var isNeedSell = false;
	
	// RESET default cell colors
	var nyersIDs = ['wood', 'stone', 'iron'];
	for (var k=0;k<nyersIDs.length;k++) {
		REF.document.getElementById("premium_exchange_rate_"+nyersIDs[k]).style.background = '#f4e4bc';

		let currentBuyPrice = getClearValue(nyersIDs[k], REF.PremiumExchange.data.stock[nyersIDs[k]], 'buy');
		if (TOZSDE_DATA.maximum && currentBuyPrice >= TOZSDE_DATA['max_'+nyersIDs[k]]) {
			notification.add('Limit feletti ár');
			if (!soundID) soundID='maximum';
			REF.document.getElementById("premium_exchange_rate_"+nyersIDs[k]).style.background = '#F66';
		}

		let currentSellPrice = getClearValue(nyersIDs[k], REF.PremiumExchange.data.stock[nyersIDs[k]], 'sell');
		if (TOZSDE_DATA.minimum && (currentSellPrice <= TOZSDE_DATA['min_'+nyersIDs[k]] || (capacity[k] - onStock[k] > 0 && capacity[k] - onStock[k] < TOZSDE_DATA['min_'+nyersIDs[k]]))) {
			notification.add('Limit alatti ár');
			soundID='minimum';
			isNeedSell = true;
			REF.document.getElementById("premium_exchange_rate_"+nyersIDs[k]).style.background = '#9bF';
		}
	}
	
	if (TOZSDE_DATA.any && (
		parseInt(table.rows[2].cells[1].innerText,10) !== parseInt(table.rows[1].cells[1].innerText,10) ||
		parseInt(table.rows[2].cells[2].innerText,10) !== parseInt(table.rows[1].cells[2].innerText,10) ||
		parseInt(table.rows[2].cells[3].innerText,10) !== parseInt(table.rows[1].cells[3].innerText,10)))
	{
		notification.add('Nyers ELADHATÓ');
		soundID='any';
		isNeedSell = true;
	}
	if (TOZSDE_DATA.keszlet && (
		parseInt(table.rows[1].cells[1].innerText,10) > TOZSDE_DATA.keszlet_wood ||
		parseInt(table.rows[1].cells[2].innerText,10) > TOZSDE_DATA.keszlet_stone ||
		parseInt(table.rows[1].cells[3].innerText,10) > TOZSDE_DATA.keszlet_iron)) {
		notification.add('Készleten');
		soundID='keszlet';
	}
	if (TOZSDE_DATA.action && (
		(1 - (currentPrices[0] / EVENT.lastResult[0])) * 100 > TOZSDE_DATA.action_wood ||
		(1 - (currentPrices[1] / EVENT.lastResult[1])) * 100 > TOZSDE_DATA.action_stone ||
		(1 - (currentPrices[2] / EVENT.lastResult[2])) * 100 > TOZSDE_DATA.action_iron)) {
		notification.add('Árzuhanás');
		soundID='action';
		isNeedSell = true;
	}
	if (TOZSDE_DATA.some && (
		REF.PremiumExchange.data.capacity.wood == REF.PremiumExchange.data.stock.wood ||
		REF.PremiumExchange.data.capacity.stone == REF.PremiumExchange.data.stock.stone ||
		REF.PremiumExchange.data.capacity.iron == REF.PremiumExchange.data.stock.iron)) {
		notification.add('Nyers TELÍTETT');
		soundID='some';
	}
	
	var changes = []; //-: csökkent, +: nőtt, =: stagnált
	for (var i=0;i<3;i++) {
		if (EVENT.lastResult[i] < currentPrices[i]) {
			changes.push('+');
		} else if (EVENT.lastResult[i] > currentPrices[i]) {
			changes.push('-');
		} else changes.push('=');
	}
	EVENT.lastResult = currentPrices.slice(0);
	EVENT.lastResult.push(...onStock);
	EVENT.lastChange = new Date();
	
	
	if (!route) putQuickButtons();

	addEvent([currentPrices, notification, changes, onStock ]);

	if (notification.size > 0 && new Date() > EVENT.hangSzunet && !(EVENT.noSoundIf && isNeedSell && REF.PremiumExchange.data.merchants < 1)) {
		csengess(soundID);
	}
}catch(e){STATUS = 1; console.error(e);}}
function main() {try{
	next = 1000;
	if (EVENT.agressiveRefresh) next = 150 + (Math.random() * 100);
	if (!BOT){
	switch(STATUS) {
		case 1: HIBA = 0; windowOperation('open'); STATUS = 2; next = 1333; break;
		case 2: if (isPageLoaded(REF)) {
			HIBA = 0;
			tozsdekereses();
			transformPage();
			autoMotor();
			if (EVENT.agressiveRefresh_win) {
				if (AUTO_STATUS==0 && EVENT.agressiveRefreshTime>10) {REF.location.reload(); EVENT.agressiveRefreshTime = 0;}
				else EVENT.agressiveRefreshTime++;
			} 
		} else {
			next = 1000; HIBA++; if (HIBA>6) STATUS=1;
		} break;
	}}
}catch(e){console.error(e);}
try{
	worker.postMessage(next);
}catch(e){console.error(e);setTimeout(function(){main();}, next);}
}

function autoMotor() {try{
	switch(AUTO_STATUS) {
		case 0: //Kell-e eladni v venni? Beilleszti és "Számítás"
			if ((EVENT.agressiveRefresh || new Date() - TOZSDE_AUTOINFO.lastSuccess > (REF.PremiumExchange.COOLDOWN_SECONDS * 1000) + 1000) && (
				ISTOZSDE_AUTO.wood.buy || ISTOZSDE_AUTO.wood.sell ||
				ISTOZSDE_AUTO.stone.buy || ISTOZSDE_AUTO.stone.sell ||
				ISTOZSDE_AUTO.iron.buy || ISTOZSDE_AUTO.iron.sell)) startAutoProcess();
			break;
		case 1: //Megjelent-e az ablak?
					//Ha nem akkor "Számítás". Nézi az időt, szükséges cooldown + 1mp után refresh-el és AUTO_STATUS=0
					//Ha igen akkor megnézi hogy jó-e a végleges ár és leokézza
			checkTransactionPopup();
			break;
		case 2: // Csekkolja, hogy nincs-e error. Ha van akkor refresh, ERRORCODE++. Ha warning van akkor case1-es fg-t meghívja (nincs stateváltás)
			checkSuccessfulTransaction();
			AUTO_STATUS=0; break;
	}
}catch(e) {console.error(e); resetAutoState(); }}

loadData();	
main();
loadSoundData();
window.onbeforeunload = function() {return true;}
$('#h3_2').on('change', 'input:not([type="checkbox"])', function() { //Automata
	var butt = document.getElementById("auto_save");
	if (butt.disabled!==false) {
		butt.disabled = false;
		butt.innerHTML = butt.innerHTML+'*';
	}
});

$('#h3_1 input, #h3_1 select, #h3_3 input:not([type="checkbox"])').on('change', function() { //Hang
	var butt = document.getElementById("tozsde_save");
	if (butt.disabled!==false) {
		butt.disabled = false;
		butt.innerHTML = '*'+butt.innerHTML;
	}
});

/*
 BUG: Dupla vásárlás van. Néha. (Lehet jobb is?) Nem a kerekítés miatt? BUY-nál FEL kéne kerekítani, de amúgyis a current_price kéne hogy megmondja a kerekítést
 BUG: Nem tudja mennyi kereskedőm van  miután már volt tranzakció, mivel már nem frissít a lapra. Honnan nézi ezt? Nézd má' meg la'
 BUG: Néha 0 <-> 0 az ajánlat. Ez játék-hiba, ilyenkor refresh-page
 FEAT: Alarm: legyen kiiktatható ha csak a capacity miatt olcsó a nyers - ekkor színezze, csak soundplay ne legyen
 FEAT: Lehetséges eladni valamit/Nem lehet: Ezek is pipálhatónak kéne h legyen
 FEAT: Külön hang mikor az automata vesz v elad
 */
