function stop(){
	var x = setTimeout('',100); for (var i = 0 ; i < x ; i++) clearTimeout(i);
}
stop(); /*Időstop*/
document.getElementsByTagName("html")[0].setAttribute("class","");
var KTID = {};
var VILL1ST;
var BOT = false;
UNITS=["spear","sword","axe","archer","spy","light","marcher","heavy", 'ram', 'catapult', 'snob'];
var STATES = {
	no: 0,
	refs: [],
	states: []
};
var TEST_STATE = {
	no: 0,
	refs: [],
	states: [],
	data: []
};
var worker = createWorker(function(self){
	// worker.postMessage({'id': 'farm', 'time': nexttime});
	self.addEventListener("message", function(e) {
		setTimeout(() => { postMessage(e.data); }, e.data.time);
	}, false);
});
var PONTOS = 0;
var PONTOS_DATE = new Date('2000.01.01 12:00:00');
worker.onmessage = function(worker_message) {
	worker_message = worker_message.data;
	switch(worker_message.id) {
		case 'startProbaMotor': startProbaMotor(); break;
		case 'sendAttack': bagolyStartAttack(STATES[worker_message.no]); break;
		case 'sendTestAttack': bagolyStartAttack(TEST_STATE.refs[worker_message.no]); break;
		// default: debug('worker','Ismeretlen ID', JSON.stringify(worker_message))
	}
};
function createWorker(main){
	var blob = new Blob(
		["(" + main.toString() + ")(self)"],
		{type: "text/javascript"}
	);
	return new Worker(window.URL.createObjectURL(blob));
}

function init() {try{
	let PFA;
	if (document.getElementById("production_table")) PFA=document.getElementById("production_table"); else 
	if (document.getElementById("combined_table")) PFA=document.getElementById("combined_table"); else 
	if (document.getElementById("buildings_table")) PFA=document.getElementById("buildings_table"); else 
	if (document.getElementById("techs_table")) PFA=document.getElementById("techs_table");
	else {
		alert("Ilyen nézetbe való futtatás nem támogatott. Kísérlet az áttekintés betöltésére...\n\nLaunching from this view is not supported. Trying to load overview...");
		document.location.href=document.location.href.replace(/screen=[a-zA-Z]+/g,"screen=overview_villages");
		return false;
	}
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (patt.test(PFA.rows[1].cells[0].textContent)) var oszl=0; else
	if (patt.test(PFA.rows[1].cells[1].textContent)) var oszl=1; else
	if (patt.test(PFA.rows[1].cells[2].textContent)) var oszl=2; else
	{alert("Nem találok koordinátákat ebbe a listába.\n\nI can not find coordinates in this view."); return false;}
	VILL1ST=PFA.rows[1].cells[oszl].getElementsByTagName("a")[0].href;
	for (var i=1;i<PFA.rows.length;i++) {
		var kord=PFA.rows[i].cells[oszl].textContent.match(/[0-9]+(\|)[0-9]+/g);
		kord=kord[kord.length-1];
		KTID[kord] = {
			id: PFA.rows[i].cells[oszl].getElementsByTagName("span")[0].getAttribute("data-id").match(/[0-9]+/g)[0],
			name: PFA.rows[i].cells[oszl].textContent.trim()
		};
	}
	const styleContent = `
		body { background: black; color: white; }
		.bagoly_header {
			margin: auto;
			width: 300px;
			text-align: center;
		}
		#bagoly_img { height: 300px; }
		.bagoly_header h1 {
			margin: 0;
			font-size: 55px;
			font-weight: 100;
		}
		.bagoly_header span {
			display: flex;
			align-items: center;
		}
		.bagoly_header span img {
			padding-left: 20px;
		}
		#naploka { color: black; }
		#naploka a { color:blue; }
		#naploka td, th { padding: 2px 6px; }
		#alert2 a { color: yellow; }
		.bagoly_body {
			width: 1140px;
			margin: auto;
			margin-top: 30px;
			border: 1px solid green;
			padding: 20px;
		}
		.bagoly_teszt {
			background: rgb(30,30,30);
			border-radius: 10px;
			padding: 20px;
		}
		#bagoly-teszt {
			margin: auto;
			margin-top: 20px;
			text-align:center;
			width: 800px;
		}
		#bagoly-teszt > table {
			margin: auto;
		}
		#bagoly-teszt td {
			width: 350px;
			padding-bottom: 10px;
		}
		.naplobox {
			max-height: 500px;
			margin-top: 30px;
			overflow: auto;
		}
		.naplobox h2 {
			text-align: center;
			margin-bottom: 5px;
		}
		.sereg_options {
			margin-top: 20px;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.unitTable {
			color: black;
		}
		.unitTable .units th {
			text-align: center;
		}
		.sereg_option {
			padding: 12px 20px;
			margin-bottom: 10px;
			background: rgb(30,30,30);
			border-radius: 10px;
		}
		.sereg_option .btn.btn-target-action {
			padding: 6px 10px;
		}
		.sereg_option.unarmed {
			border-left: 2px solid red;
			animation: unarmedAnimation 1s infinite;
		}
		@keyframes unarmedAnimation {
			0% {
				box-shadow: 0 0 0 rgba(250, 0, 0, 0);
			}
			50% {
				box-shadow: 0 0 10px rgba(250, 0, 0, 1);
			}
			100% {
				box-shadow: 0 0 0 rgba(250, 0, 0, 0);
			}
		}
		.sereg_quick_buttons {
			display: flex;
			margin-bottom: 10px;
		}
		.bagoly_button {
			padding: 5px 14px;
			margin: 0 10px;
			background: rgb(180,180,255);
			border-radius: 10px;
			opacity: 0.7;
			cursor: pointer;
		}
		.bagoly_button:hover {
			opacity: 1;
		}
		.sereg_quick_buttons button.bagoly_button.all_arm {
			background: rgb(235,0,0);
		}
	`;
	const styleElement = document.createElement('style');
	styleElement.textContent = styleContent;
	document.getElementById('favicon').href=pic('moon.png');
	document.head.appendChild(styleElement);

	document.getElementsByTagName("body")[0].innerHTML=`
		<div class="bagoly_header">
			<img id="bagoly_img" onclick="playSound('huhogas')" data-state="normal" src="${pic('header_own_normal.png')}">
			<span>
				<h1>Éjjeli őr</h1>
				<img height="40px" src="${pic('warning.png')}" title="Ez egy szuperfegyver script.\nSemmilyen prémium funkció nem képes működését helyettesíteni, és vélhetőleg nem is fog ilyen lenni. Túlzott használata ugyan nagyban javít teljesítményeden, de átalakítja játékmódod mely negatív hatással lehet">
			</span>
		</div>
		<audio style="display: none" id="audio1" controls="controls" autoplay="autoplay"><source id="wavhang" src="" type="audio/wav"></audio>

		<div class="bagoly_body">
			<div class="bagoly_teszt">
				Ahhoz, hogy pontosan tudjon támadni, az éjjeli őr próbatámadásokat (erősítéseket) fog küldeni, ez által kiszámítva a szerver-rendszer idő közti különbséget. Adj meg egy forrás- és egy cél falut, amit zavartalanul lehet használni ez ügyben
				<form id="bagoly-teszt"><table>
					<tr><td><strong>Forrás falu</strong> (itt legyen mindig legalább 1 egység)</td>
						<td><strong>Cél falu</strong> (egy létező falu, mindegy mi) </td></tr>
					<tr><td><input type="text" class="input-nicer" value="486|440" name="forras"><br></td>
					<td><input class="input-nicer" type="text" value="507|405" name="cel"></td></tr>
					<tr><td style="text-align: right"><button type="button" class="bagoly_button" onclick="triggerProbaMotor()">Automata pontosítás indítása most</button></td>
						<td style="text-align: left"><button type="button" class="bagoly_button" onclick="setManualPontos()">Saját érték megadása</button></td></tr>
					<tr><td colspan="2" id="pontos_display">PONTOS = ${PONTOS}</td></tr>
				</table></form>
			</div>

			<div class="sereg_options">
		  		<div class="sereg_quick_buttons">
					<button type="button" class="bagoly_button">Egyediek Nuke-ra</button>
					<button type="button" class="bagoly_button">Egyediek Fake-ra</button>
					<button type="button" class="bagoly_button">Egyediek Nemes-re</button>
					<button type="button" class="bagoly_button">Rendezés</button>
					<button type="button" class="bagoly_button all_arm">Összes élesítése</button>
				</div>
				<div id="bagoly_sereg"></div>
				<button type="button" onclick="addBagolyAttack()">+ Új időzés hozzáadása</button>
			</div>

			<div class="naplobox">
				<h2>Napló</h2>
				<table align="center" class="vis" id="naploka">
					<tr>
						<th>Dátum</th>
						<th>Script</th>
						<th>Esemény</th>
					</tr>
				</table>
			</div>
		</div>

		<div id="alert2" style="width: 275px; background-color: #60302b; color: #FFA; position: fixed; left:40%; top:40%; border:3px solid black; font-size: 11pt; padding: 5px; z-index:200; display:none">
			<div id="alert2head" style="width:100%;cursor:all-scroll; text-align:right; background: rgba(255,255,255,0.1)">
				<a href='javascript: alert2("close");'>X (Bezár)</a>
			</div>
			<p id="alert2szov"></p>
		</div>
	`;
	document.title="Éjjeli őr";
	preloadImage(pic('header_own_closed.png'));
	preloadImage(pic('header_own_leftclosed.png'));
	preloadImage(pic('header_own_rightclosed.png'));

	return true;

	function preloadImage(url) {
		const image = new Image();
		image.src = url;
	}
}catch(e){alert("Hiba indításkor:\n\nError at starting:\n"+e); return false;}}

function pic(file) {
	return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/bagoly/"+file;
}
function playSound(hang) {try{
	var play="https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/bagoly/"+hang+".wav";
	document.getElementById("wavhang").src=play;
	document.getElementById("audio1").load();
	setTimeout(function() { if (document.getElementById("audio1").paused) document.getElementById("audio1").play()}, 666);
}catch(e){alert2(e);}}
function naplo(script,szoveg){
	var d=new Date();
	var perc=d.getMinutes(); var mp=d.getSeconds(); if (perc<10) perc="0"+perc; if (mp<10) mp="0"+mp;
	var honap=new Array("Jan","Febr","March","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
	var table=document.getElementById("naploka");
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	var cell3=row.insertCell(2);
	cell1.innerHTML=honap[d.getMonth()]+" "+d.getDate()+", "+d.getHours()+":"+perc+":"+mp;
	cell2.innerHTML=script;
	cell3.innerHTML=szoveg;
	playSound("huhogas");
	return;
}
function alert2(szov){
	szov=szov+"";
	if (szov=="close") {$("#alert2").hide(); return;}
	szov=szov.replace("\n","<br>");
	document.getElementById("alert2szov").innerHTML="<b>Üzenet:</b><br>"+szov;
	$("#alert2").show();
}
function isPageLoaded(ref,faluid,address){try{
	if (ref.closed) return false;
	if (ref.document.getElementById('bot_check') || ref.document.title=="Bot védelem") {
		naplo("Globális","Bot védelem aktív!!!");
		document.getElementById("audio1").volume=0.2;
		BotvedelemBe();
		return false;
	}
	if (ref.document.location.href.indexOf("sid_wrong")>-1) {
		naplo("Globális","Kijelentkezett fiók. Jelentkezzen be újra, vagy állítsa le a programot.");
		BotvedelemBe();
		return false;
	}
	if (!address) return false;
	if (address.indexOf("not ")>-1) var neg=true; else var neg=false;
	if (faluid>-1) if (ref.game_data.village.id!=faluid) return false;
	if (ref.document.getElementById("serverTime").innerHTML.length>4) {
		if (neg) {
			if (ref.document.location.href.indexOf(address.split(" ")[1])==-1) return true;
		} else {
			if (ref.document.location.href.indexOf(address)>-1)	return true;
		}
	}
	return false;
}catch(e){return false;}}
function BotvedelemBe(){try{
	playSound("bot");
	BOT=true;
	alert2('BOT VÉDELEM!!!<br>Írd be a kódot, és kattints ide lentre!<br><br><a href="javascript: BotvedelemKi()">Beírtam a kódot, mehet tovább!</a>');
	}catch(e){nap('BotvedelemBe()', 'ERROR: ' + e);}
	BOTORA=setTimeout(() => BotvedelemBe(), 1500);
}
function BotvedelemKi(){
	BOT=false;
	//BOT_VOL=0.0;
	document.getElementById("audio1").pause;
	alert2("OK");
	clearTimeout(BOTORA);
	return;
}
function bagolyImageSwitcher() {
	let nexttime = 3000;
	try {
		let img = document.getElementById('bagoly_img');
		if (img.getAttribute('data-state') !== 'normal') {
			img.src = pic('header_own_normal.png');
			img.setAttribute('data-state', 'normal');
		} else {
			let event = Math.random();
			if (event > 0.9) {
				img.src = pic('header_own_leftclosed.png');
			} else if (event > 0.8) {
				img.src = pic('header_own_rightclosed.png');
			} else if (event > 0.6) {
				img.src = pic('header_own_closed.png');
			}
			if (event > 0.6) {
				img.setAttribute('data-state', 'evented');
				nexttime = 250;
			}
		}
	}catch(e){console.error('bagolyImageSwitcher', e); }
	setTimeout(() => bagolyImageSwitcher(), nexttime)
}
function getVillageLink(koord, screen='place') {
	return VILL1ST
		.replace(/village=[0-9]+/,"village="+KTID[koord].id)
		.replace('screen=overview', `screen=${screen}`);
}
function writeoutDate(d, isOnlyTime) {
	var date = "";
	d=new Date(d);
	if (!isOnlyTime) date = d.getFullYear() + "." + leadNull((d.getMonth()+1)) + "." + leadNull(d.getDate()) + " ";
	return date +
		leadNull(d.getHours()) + ":" + leadNull(d.getMinutes()) + ":" + leadNull(d.getSeconds()) + ":" + leadNull(d.getMilliseconds(), true);
	
	function leadNull(num, triple) {
		num = parseInt(num, 10);
		if (triple && num<10) return "00" + num;
		if (triple && num<100) return "0" + num;
		if (num<10) return "0" + num;
		return num;
	}
}
function setManualPontos() {
	let ido = prompt('Pontosítás mértéke?');
	if (ido && !isNaN(ido)) {
		PONTOS = parseInt(ido, 10);
		document.getElementById("pontos_display").innerHTML = `PONTOS = ${PONTOS}`;
	}
}
function addBagolyAttack() {
	let attackEl = document.getElementById('bagoly_sereg');
	let newEl = document.createElement('div');
	newEl.className = 'sereg_option unarmed';
	let unitsRow = '';
	let inputrow = '';
	for (let i=0;i<UNITS.length;i++) {
		unitsRow += `<th><img src="graphic/unit/unit_${UNITS[i]}.png"></th>`;
		inputrow += `<td><input class="input-nicer" type="text" size="5" placeholder="0" name="${UNITS[i]}"></td>`;
	}
	unitsRow += '<th>Típus</th>';
	inputrow += `<td>
		<select class="input-nicer" name="attacktype">
			<option value="nuke">Full támadó</option>
			<option value="nemes">Nemes</option>
			<option value="fake">Fake</option>
			<option value="normal" selected="selected">Egyedi/pontos</option>
		</select>
	</td>`;
	newEl.innerHTML = `<form>
		<div class="unitRowCalculations">
			Honnan: <input class="input-nicer" type="text" size="8" placeholder="0" name="forras">
			Hova: <input class="input-nicer" type="text" size="8" placeholder="0" name="forras">
			Mikor: <input class="input-nicer" type="text" size="18" value="${new Date().toLocaleString()}:000" placeholder="0" name="forras">
			<button type="button" name="arm_button" class="btn btn-target-action">ÉLESÍTÉS</button>
			<button type="button" name="remove_button" class="bagoly_button">❌ Törlés</button>
			Indítás: <span class="print_out_text print_important">...</span>
		</div>
		<table class="vis unitTable">
			<tr class="units">${unitsRow}</tr>
			<tr>${inputrow}</tr>
		</table>
	</form>`;
	attackEl.appendChild(newEl);
}
/* ----------- KÉSLELTETÉS MEGÁLLAPÍTÓ --------------- */
function getIdotartam(ref) {
	var patt=/(<td>)[0-9]+(:)[0-9]+(:)[0-9]+/g;
	var utIdo=ref.document.getElementById("content_value").innerHTML.match(patt)[0].match(/[0-9]+/g);
	for (var i=0;i<utIdo.length;i++) utIdo[i]=parseInt(utIdo[i],10);
	return utIdo;
}
function calculateDifference(originalTime, resultTime) {
	const originDate = new Date(originalTime);
	const givenTime = new Date(originDate.toDateString() + ' ' + resultTime.join(':'));

	return givenTime.getTime() - originDate.getTime();
}
function bagoly_teszt_1openVillage(no, refArray) {try{
	const tesztForm = document.getElementById('bagoly-teszt');
	const patt = /[0-9]{1,3}\|[0-9]{1,3}/g;
	let forrasFalu = tesztForm.forras.value;
	if (patt.test(forrasFalu)) forrasFalu = forrasFalu.match(patt)[0];
	if (!patt.test(forrasFalu) || !KTID[forrasFalu]) {
		naplo('openVillage', 'Teszteslére való forrás falu érvénytelen vagy nincs megadva');
		return false;
	}
	patt.lastIndex = 0;
	tesztForm.forras.value = forrasFalu;

	let celFalu = tesztForm.cel.value;
	if (!patt.test(celFalu)) {
		naplo('openVillage', 'Teszteslére való cél falu érvénytelen vagy nincs megadva');
		return false;
	}
	patt.lastIndex = 0;
	celFalu = tesztForm.cel.value.match(patt)[0];
	tesztForm.cel.value = celFalu;

	TEST_STATE.data[no] = {
		villageId: KTID[forrasFalu].id,
		targetVillage: celFalu
	};
	refArray[no] = window.open(getVillageLink(forrasFalu), `bagoly-teszt-${no}`);
	return true;
}catch(e) {console.error(e); naplo('openVillage', 'Error: ' + e); }}

function bagoly_teszt_2insertTestUnits(no, refArray) {
	const ref = refArray[no];
	const celpont = TEST_STATE.data[no].targetVillage;
	var C_form=ref.document.forms["units"];
	let targetUnit = '';
	for (let i=0;i<UNITS.length;i++) {
		if (ref.document.getElementById(`units_entry_all_${UNITS[i]}`).textContent !== '(0)') {
			targetUnit = UNITS[i];
			break;
		}
	}
	if (targetUnit == '') {
		naplo('insertTesztUnits', 'ERROR: Nincs egység a teszteléshez kiírt faluban...');
		return false;
	}

	C_form[targetUnit].value = 1;
	C_form.x.value=celpont.split("|")[0];
	C_form.y.value=celpont.split("|")[1];
	C_form.support.click();
	return true;
}

function bagoly_teszt_3startTestTimer(no, refArray) {
	const ref = refArray[no];
	const utido = getIdotartam(ref);
	const utidoMp = utido[0] * 3600 + utido[1] * 60 + utido[2];
	let celIdo = new Date();
	celIdo.setSeconds(celIdo.getSeconds() + utidoMp + 10);
	celIdo.setMilliseconds(0);
	celIdo = celIdo.getTime();

	TEST_STATE.data[no].celIdo = celIdo;
	TEST_STATE.data[no].start = setBagolyTimer(no, celIdo, true);
}
function bagoly_teszt_4searchTestResult(no, refArray) {
	const ref = refArray[no];
	const attackTable = ref.document.getElementById('commands_outgoings');
	if (!attackTable) {
		naplo('searchTestResult', 'ERROR: Nem találok elküldött sereget, pedig most küldtem...');
		return;
	}
	const originalTargetTime = new Date(TEST_STATE.data[no].celIdo);
	const allAttack = attackTable.querySelectorAll('.command-row');
	for (let i=0;i<allAttack.length;i++) {
		if (allAttack[i].querySelector('.command-cancel') && allAttack[i].querySelector('[data-command-type="support"]')) {
			let targetCoord = allAttack[i].cells[0].textContent.match(/[0-9]{1,3}\|[0-9]{1,3}/)[0];
			if (targetCoord == TEST_STATE.data[no].targetVillage) {
				let time = allAttack[i].cells[1].textContent.match(/[0-9]+/g).map(str => parseInt(str, 10));
				PONTOS += calculateDifference(originalTargetTime, time);
				naplo('Bemérés', `Időbemérés megtörtént, pontosítás ${PONTOS}ms-re állítva`);
				document.getElementById("pontos_display").innerHTML = `PONTOS = ${PONTOS}`;
				allAttack[i].querySelector('.command-cancel').click();
				setTimeout(() => TEST_STATE.refs[no].close(), 1000);
				break;
			}
		}
	}
}
function startProbaMotor() {
	nexttime = 1000;
	let no = TEST_STATE.no;
	if (!TEST_STATE.states[no]) TEST_STATE.states[no] = 0;
	try {
		switch (TEST_STATE.states[no]) {
			case 0:
				if (bagoly_teszt_1openVillage(no, TEST_STATE.refs))
					TEST_STATE.states[no] = 1;
				break;
			case 1:
				if (TEST_STATE.refs[no].document.location.href.indexOf("try=confirm") == -1 && isPageLoaded(TEST_STATE.refs[no], TEST_STATE.data[no].villageID, "screen=place")) {
					if (bagoly_teszt_2insertTestUnits(no, TEST_STATE.refs)) {
						TEST_STATE.states[no] = 2;
					} else {
						nexttime = 5000;
						TEST_STATE.states[no] = 0;
					}
				}
				break;
			case 2:
				if (isPageLoaded(TEST_STATE.refs[no], TEST_STATE.data[no].villageID, "try=confirm")) {
					bagoly_teszt_3startTestTimer(no, TEST_STATE.refs);
					TEST_STATE.states[no] = 3;
				}
				break;
			case 3:
				if (new Date().getTime() < TEST_STATE.data[no].start) break;
				if (TEST_STATE.refs[no].document.location.href.indexOf("try=confirm") == -1 && isPageLoaded(TEST_STATE.refs[no], TEST_STATE.data[no].villageID, "screen=place")) {
					bagoly_teszt_4searchTestResult(no, TEST_STATE.refs);
					return;
				}
				break;
		}
//		if (no == 0) no = 1; else no = 0;
	} catch(e) {
		console.error(e);
		naplo('startProbaMotor', '❗Error: Motorhiba: ' + e);
	}
	// PROBA_STATE.refs[PROBA_STATE.no]
	worker.postMessage({'id': 'startProbaMotor', 'time': nexttime});
}
function triggerProbaMotor() {
	TEST_STATE = {
		no: 0,
		refs: [],
		states: [],
		data: []
	};
	startProbaMotor();
}

function setBagolyTimer(no, celIdo, isTest=false) {try{
	let ref;
	if (isTest) {
		ref = TEST_STATE.refs[no];
	} else {
		ref = STATES.refs[no];
	}
	const kieg=ref.document.createElement("p");
	let utido = getIdotartam(ref);
	let utidoMp = utido[0] * 3600 + utido[1] * 60 + utido[2];
	let temp = new Date();
	temp.setSeconds(temp.getSeconds() + utidoMp);
	temp = temp.getTime();
	const inditas = new Date().getTime() + (celIdo - temp);

	let indIdoText = "Indítás ideje: <font style='color: #FF00FF; font-weight: bold; font-size: 115%;'>" + writeoutDate(inditas, true) + '</font><br>';

	kieg.innerHTML="Felülbírálva:<br>c&amp;c időzítő beállítva erre:<br><b>" + writeoutDate(celIdo, false) + "</b><br>" + indIdoText + "Pontosítás: <font style='color: red;'>"+PONTOS+"ms</font>"; 
	ref.document.getElementById("date_arrival").setAttribute('style', 'background: #f4e4bc url(http://cncdani2.000webhostapp.com/!Files/images/ido_dead2.png) no-repeat; background-position: right top; background-size: 40px;');
	ref.document.getElementById("date_arrival").innerHTML="";
	ref.document.getElementById("date_arrival").appendChild(kieg);
	worker.postMessage({'id': 'sendTestAttack', 'time': ((celIdo - temp) - PONTOS), 'no': no});
	return inditas;
}catch(e) { console.error(e); naplo('setBagolyTimer', 'ERROR: Nem tudtam beállítani az időzítőt'); }
return false;}

function bagolyStartAttack(ref) {try{
	ref.document.getElementById("troop_confirm_submit").click();
}catch(e) { console.error(e); naplo('bagolyStartAttack', 'ERROR: Nem tudtam elindítani a támadást/erősítést'); }}

if (init()) {
	bagolyImageSwitcher();
	naplo('Indítás', 'Éjjeli őr elindult. <ALFA VERZIÓ>');

	$(document).ready(function(){
		$(function() {
			$("#alert2").draggable({handle: $('#alert2head')});
			$('#sugo').mouseover(function() {sugo(this,"Ez itt a súgó");});
			$('#fejresz').mouseover(function() {sugo(this,"");});
		});
	});
	//window.onbeforeunload = () => true;
}