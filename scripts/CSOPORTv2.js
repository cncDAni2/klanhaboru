javascript:
/*Minify notes: %60-at cserélni " % 60"-ra + tabulátorokat szóközre (metszetképzés résznél az img-k között csak tab-ok vannak*/
if (typeof cURL=='undefined') var cURL=document.location.href; else exit(0);
if(cURL.indexOf('screen=overview_villages')==-1) exit(0);

function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) xhttp=new XMLHttpRequest();
		else xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xhttp.open("GET",dname,false);
	xhttp.send();
	return xhttp.responseXML;
}
function setCookie(c_name,value){
	localStorage.setItem(c_name,value);
}
function getCookie(Name){try{
	return localStorage.getItem(Name);
}catch(e){return null;}
}

function pic(tipus){
    return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/csoport/"+tipus+".png";
}
function picT(tipus){
	if (tipus=="att")
		return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/utility/attack.png"; 
	else
		return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/utility/"+tipus+".png";
}

function distCalc(S,D){
	S[0]=parseInt(S[0]);
	S[1]=parseInt(S[1]);
	D[0]=parseInt(D[0]);
	D[1]=parseInt(D[1]);
	return Math.abs(Math.sqrt(Math.pow(S[0]-D[0],2)+Math.pow(S[1]-D[1],2)));
}

function massRename(){try{
	var t=document.getElementById("production_table").rows;
	/*További terv: [Sx,y]: x és y szövegek. Az jelenlegi falu neve, de x helyére y lesz írva.\n\*/
	var uj=prompt("Mi legyen az új név?\n\nHasználható helyettesítő karakterek:\n\
	[N]: A jelenlegi falu neve \n\
	[Nx,y]: x és y számok. Kivágást csinál a jelenlegi név alapján, az x-edik karaktertől y DARAB karaktert\n\
	[Cx,y,z]: x,y,z számok. Sorszámot csinál, x kezdőértékkel, y léptetéssel, z számjeggyel (utóbbi max 9 lehet)\n\
	[T]: A \"Távolság\" oszlopba írt szám, ha van. (Ha nincs és mégis írod, a pontértékkel lesz egyenlő)\n\n\
	Ha a legelejére [!]-t teszel, akkor nem fogja leokézni azonnal a faluneveket; ha pedig csak annyit írsz be hogy OK, akkor csak okéz.","[!][N]");
	if (uj=="" || uj==null) return;
	/*Kéne elölteszt, hogy most vannak e OK-ok vagy nem, v mi a FASZ VAN??? XD*/
	var okez=true; var patt=/^(\[!\])/;if (patt.test(uj)) {okez=false; uj=uj.substr(3,uj.length);}
	for (var i=1;i<t.length;i++){
		if (t[i].style.display=="none") continue;
		if (t[i].cells[0].getElementsByClassName("quickedit-content")[0].style.display!="none") t[i].cells[0].getElementsByTagName("a")[1].click();
	}
	var t=document.getElementById("production_table").rows;	
		var sor=new Array(0,0,0,"0"); /*Kezdőérték: */ var patt=/\[C[0-9]+,[0-9]+,[0-9]\]/g; if (patt.test(uj)) {sor[0]=parseInt(uj.match(patt)[0].split(",")[0].replace("[C","")); var szam=true; sor[1]=parseInt(uj.match(patt)[0].split(",")[1]); sor[2]=parseInt(uj.match(patt)[0].split(",")[2]);}
		var kivag=/\[N[0-9]+,[0-9]+\]/g; if(kivag.test(uj)) var ki=uj.match(kivag).length; else var ki=0; var ujnev=""; var rnev="";
	for (var i=1;i<t.length;i++){
		if (t[i].style.display=="none") continue;
		rnev=t[i].cells[0].getElementsByClassName("quickedit-label")[0].getAttribute("data-text");
		
		ujnev=uj.replace(/\[N\]/g,rnev);
		
		sor[3]=sor[0]+""; while (sor[3].length<sor[2]) sor[3]="0"+sor[3];
		ujnev=ujnev.replace(patt,sor[3]);
		for (var j=0;j<ki;j++){
			ujnev=ujnev.replace(/\[N[0-9]+,[0-9]+\]/,rnev.substr( parseInt(ujnev.match(kivag)[0].split(",")[0].replace("[N",""))-1, parseInt(ujnev.match(kivag)[0].split(",")[1]) ) );
		}
		ujnev=ujnev.replace(/\[T\]/g,t[i].cells[1].textContent);
		if (uj!="OK") t[i].cells[0].getElementsByTagName("input")[1].value=ujnev;
		if (okez) t[i].cells[0].getElementsByTagName("input")[2].click();
		sor[0]+=sor[1];
	}
}catch(e){alert("Hiba történt:\n"+e);}}

function ModOpenType(fa,erre){
try{
    a=T.getElementsByTagName("img");
    for (var i=0;i<a.length;i++){
	a[i].style.backgroundColor="transparent";
    }
    fa.style.backgroundColor="brown";
    OPENTYPE=erre;
	
	suti=getCookie("cnc_csoport");
	Fsuti=suti.split(";");
	Fsuti[0]=erre;
	str=Fsuti[0];
	for (var i=1;i<Fsuti.length;i++){str+=";"+Fsuti[i];}
	setCookie("cnc_csoport",str);
}catch(e){alert(e);}
return;
}

function manager(job){
    if (job=="del"){
        sure=confirm("Minden csoport törl\u0151dik, folytatja?");
        if (sure) localStorage.removeItem('cnc_csoport'); else return;
        location.reload();
    }
    if (job=="exp"){
        exp=getCookie('cnc_csoport');
        displayMessage('Export', "<p>Mentse el az alábbi sort, melyet kés\u0151bb megadhat importáláskor adatainak visszállításához:</p><p style='width: 300px; word-wrap: break-word;'>"+exp+"</p>");
    }
    if (job=="imp"){
        input=prompt("Adja meg a korábban lementett adatot visszaállításhoz: ");
        if (input==null || input=="") return;
        setCookie('cnc_csoport',input,30);
        imp=input.match(/;[^;]+/g);G.innerHTML="";
        for (var j=0;j<imp.length;j++){
            imp[j]=imp[j].replace(/;/g,"");
            if (imp[j].search(/[^0-9]/g)>=0) G.innerHTML+='&nbsp;&nbsp;&nbsp; <a href=\'javascript: csoport("'+imp[j]+'");\'>'+imp[j]+'</a>';
        }
        kivalasztott="";
		frissit();
    }
    return;
}

function frissit(){
	try{
	suti=getCookie("cnc_csoport");
	Fsuti=suti.split(";");
	G.innerHTML="";
	var raktarStr = "";
	switch(Fsuti[2][0]) {
		case 'W': raktarStr='fa'; break;
		case 'S': raktarStr='agyag'; break;
		case 'I': raktarStr='vas'; break;
		case 'M': raktarStr='a legkisebb nyerstípus'; break;
		case 'X': raktarStr='a legnagyobb nyerstípus'; break;
		case 'A': raktarStr='az átlagos nyersanyagérték'; break;
	}
	document.getElementById("D_tanya").setAttribute("title","≥"+Fsuti[1]+" fő. Kattints a módosításhoz.");
	document.getElementById("D_raktar").setAttribute("title","≥"+Fsuti[2].match(/[0-9]+/g)[0]+"% telítettség, "+raktarStr+" alapján. Kattints a módosításhoz.");
	document.getElementById("D_pont").setAttribute("title","≥"+Fsuti[3]+" pont. Kattints a módosításhoz.");
	for (var i=4;i<Fsuti.length;i++){
		if (Fsuti[i].indexOf(",")==-1) var csopnev=Fsuti[i]; else var csopnev=Fsuti[i].split(",")[0];
		if (csopnev==KIVALASZTOTT) var kieg='style="background-color:#B0B0FF; padding:2px; margin:2px; border:1px solid black;"'; else var kieg='style="padding:2px; margin:2px; border:1px solid black;"';
		G.innerHTML+='<a '+kieg+' href=\'javascript: csoport("'+csopnev+'");\'>'+csopnev+"</a> ";
	}
	}catch(e){alert(e);}
	return;
}

function addFalu(koord){
	if (KIVALASZTOTT=="") return;
	try{
		var suti=getCookie("cnc_csoport");
		sutiF=suti.split(";");
		var ures=false;
		for (var i=4;i<sutiF.length;i++){
			if (sutiF[i].indexOf(",")==-1) {
				if (sutiF[i]==KIVALASZTOTT) {ures=true; break;}
			} else {
				if (sutiF[i].split(",")[0]==KIVALASZTOTT) break;
			}
		}
		if (!ures){
			var sutiFF=sutiF[i].split(","); var talalat=false;
			for (var j=1;j<sutiFF.length;j++){ /*Duplikáció keresése*/
				if (sutiFF[j]==koord) { sutiF[i]=sutiF[i].replace(","+koord,""); talalat=true;}
			}
			if (!talalat) sutiF[i]+=","+koord;
		} else sutiF[i]+=","+koord;
		
		var str="";
		for (var i=0;i<sutiF.length-1;i++){
			str+=sutiF[i]+";";
		} str+=sutiF[i];
		setCookie("cnc_csoport",str);
	} catch(e){alert("Hiba faluhozzáadáskor\n"+e);}
    return;
}

function csoport(csnev){try{
	var table=document.getElementById("production_table");
	for (var i=1;i<table.rows.length;i++){try{CHECK=table.rows[i].cells[getOszlopNo("falunev")].getElementsByTagName("input")[0];	CHECK.setAttribute("style","display:none");}catch(e){}} /*checkbox-ok eltüntetése*/
	
	if (ISHALMAZ=="") {KIVALASZTOTT=csnev; frissit();}
	var suti=getCookie("cnc_csoport");
	var Fsuti=suti.split(";");
	var aktnev=""; ures=false;
	for (var i=4;i<Fsuti.length;i++){
		if (Fsuti[i].indexOf(",")>-1) {ures=false; aktnev=Fsuti[i].split(",")[0];} else {ures=true; aktnev=Fsuti[i];}
		if (aktnev == csnev) break;
	}
	
	var CHECK2;
	var a=document.getElementById("production_table").rows;
	if (ures) {
		for (var i=1;i<a.length;i++){
			CHECK2=a[i];
			if (CHECK2.style.display!="none") regi=true; else regi=false;
			uj=false;
			if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
		}
		return;
	}
	var oszl=getOszlopNo("falunev");
	var v=Fsuti[i].split(",");
	for (var i=1;i<a.length;i++){
		CHECK2=a[i];
		if (CHECK2.style.display!="none") regi=true; else regi=false;
		
		var koord=a[i].cells[oszl].innerText.match(/[0-9]+(\|)[0-9]+/g);
		koord=koord[koord.length-1];
		uj=false;
		for (var j=1;j<v.length;j++) {
			if (koord==v[j]) {uj=true; break;}
		}
		if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
	}
	sethalmaz("");
	szamlal();
	return;
}catch(e){alert("Hiba csoportkiválasztáskor:\n"+e);}}

function szamlal(){try{
	var szamlal=document.getElementById("production_table").rows; var szamlalS=0;
	
	for (var i=1;i<szamlal.length;i++){
		if (szamlal[i].style.display!="none") {
			szamlalS++;
			try {
				var cc=szamlal[i].cells[getOszlopNo('falunev')].textContent.match(/[0-9]+\|[0-9]+/g);
				var felsorol = ' <i>-</i>';
				cc = cc[cc.length-1];
				cc = getRelatedVillages(cc);
				if (cc.length > 0) {
					felsorol = '<ul><li>' + cc.join('<li>') + '</ul>';
				}
				szamlal[i].getElementsByClassName('cnc_toolTipText')[0].innerHTML='<p><strong>' + szamlalS+".</strong> falu</p><strong>Csoportok:</strong> " + felsorol;
			} catch(e){}
		} else {
			try{szamlal[i].getElementsByTagName("img")[0].title="";}catch(e){}
		}
	}
	if (document.getElementById('csoportNyers')) {
		var nyersek = getAllNyers(true);
		var nyersExtStr = '';;
		if (szamlalS < (szamlal.length-1)) {
			nyersExtStr = 'Csoport összes nyersanyag: <img src="'+picT('holz')+'"> '+prettyNumberPrint(nyersek[0])+
			' <img src="'+picT('lehm')+'"> '+prettyNumberPrint(nyersek[1])+
			' <img src="'+picT('eisen')+'"> '+prettyNumberPrint(nyersek[2])+'<br>';
		}
		nyersExtStr += 'Átlagosan: <img src="'+picT('holz')+'"> '+prettyNumberPrint(Math.round(nyersek[0]/szamlalS))+
			' <img src="'+picT('lehm')+'"> '+prettyNumberPrint(Math.round(nyersek[1]/szamlalS))+
			' <img src="'+picT('eisen')+'"> '+prettyNumberPrint(Math.round(nyersek[2]/szamlalS));
		document.getElementById('csoportNyers').innerHTML = nyersExtStr;
	}
	szamlal[0].cells[getOszlopNo("falunev")].innerHTML=szamlal[0].cells[getOszlopNo("falunev")].innerHTML.replace(/\([0-9]+\)/g,"("+szamlalS+")");
	return szamlalS;
}catch(e) {alert("Számlál hiba: " + e); return 0;}}

function ujcsoport(){
	try{suti=getCookie("cnc_csoport");
	nev=prompt("Mi legyen az új csoport neve?");
		if (nev==null) return;
		if (nev.search(";")>=0) {alert("A ; karakter nem megengedett, pont (.)-ra alakul át.");nev=nev.replace(";",".");}
		if (nev.search(",")>=0) {alert("A , karakter nem megengedett, pont (.)-ra alakul át.");nev=nev.replace(",",".");}
		if (nev.search("\"")>=0) {alert("A \" karakter nem megengedett, törlődik.");nev=nev.replace("\"","");}
        if (nev.length<1) {alert("A csoport neve nem lehet üres");return;}
	/*Duplikáció?*/
	Fsuti=suti.split(";");
	for (var i=4;i<Fsuti.length;i++){ if (Fsuti[i].indexOf(",")>=0) if(Fsuti[i].split(",")[0]==nev) {alert("Ilyen nevű csoport már létezik"); return;}}
	
	setCookie("cnc_csoport",suti+";"+nev);
	frissit();
	}catch(e){alert(e);}
	return;
}

function Dcsoport(tipus){ try{
	var uj=false; var regi=false;
	var ertek;
	var table=document.getElementById("production_table");
	for (var i=1;i<table.rows.length;i++){try{CHECK=table.rows[i].cells[getOszlopNo("falunev")].firstChild;	CHECK.setAttribute("style","display:none");}catch(e){}} /*checkbox-ok eltüntetése*/
	KIVALASZTOTT="";
	if (tipus=="ossz"){
		var a=document.getElementById("production_table").rows;
		for (var i=1;i<table.rows.length;i++){
            CHECK2=a[i];
			if (CHECK2.style.display!="none") regi=true; else regi=false;
			uj=true;
			if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
		}
	}
	if (tipus=="tanya"){
		suti=getCookie("cnc_csoport");
		ertek=suti.split(";")[1]; ertek=parseInt(ertek);
		var a=document.getElementById("production_table").rows;
		for (var i=1;i<table.rows.length;i++){
			CHECK2=a[i];
			/*HALMAZ MEGVALÓSÍTÁS: megnézi hogy benne lenne e. Átküldi a régi és új értéket, majd visszatérési értéke az, hogy benne lenne e. Ha nincs ISMHALMAZ visszatér az újjal.*/
			if (CHECK2.style.display!="none") regi=true; else regi=false;
			oszl=getOszlopNo("tanya");
			if (ertek>0) {
				if (parseInt(CHECK2.cells[oszl].innerHTML.split("/")[0]) >= ertek) uj=true; else uj=false;
			} else {
				if (parseInt(CHECK2.cells[oszl].innerHTML.split("/")[0])-parseInt(CHECK2.cells[oszl].innerHTML.split("/")[1]) >= ertek) uj=true; else uj=false;
			}
			if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
		}
	}
	if (tipus=="raktar"){
		suti=getCookie("cnc_csoport");
		ertek=[suti.split(";")[2][0], parseInt(suti.split(";")[2].match(/[0-9]+/g)[0], 10)];
		var a=document.getElementById("production_table").rows;
		for (var i=1;i<table.rows.length;i++){
			CHECK2=a[i];
			if (CHECK2.style.display!="none") regi=true; else regi=false;
			var M=table.rows[i].cells[getOszlopNo("nyers")].textContent.replace(/\./g,"").match(/[0-9]+/g);
			
			fa=parseInt(M[0]);
			agyag=parseInt(M[1]);
			vas=parseInt(M[2]);
			compare=fa;
			switch(ertek[0]) {
				case 'W': compare = fa; break;
				case 'S': compare = agyag; break;
				case 'I': compare = vas; break;
				case 'M': if (agyag<fa) compare = agyag; if (vas<compare) compare = vas; break;
				case 'X': if (agyag>fa) compare = agyag; if (vas>compare) compare = vas; break;
				case 'A': compare = Math.round((fa+agyag+vas) / 3); break;
			}
			
			raktar=parseInt(table.rows[i].cells[getOszlopNo("raktar")].textContent);
			if ((compare/raktar)*100 >= ertek[1]) uj=true; else uj=false;
			if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
		}
	}
	if (tipus=="pont"){
		suti=getCookie("cnc_csoport");
		ertek=suti.split(";")[3]; ertek=parseInt(ertek);
		var a=document.getElementById("production_table").rows;
		for (var i=1;i<table.rows.length;i++){
			CHECK2=a[i];
			if (CHECK2.style.display!="none") regi=true; else regi=false;
			if (parseInt(CHECK2.cells[getOszlopNo("pont")].innerText.replace(".","")) >= ertek) uj=true; else uj=false;
			if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
		}
	}
	if (tipus=="regexp"){
		var patt2p=prompt("Adja meg azt a reguláris kifejezést, amely szerint a faluneveket szűrni szeretné!\nA falu neve alatt a koordináta és a kontinens szám is értendő!");
		if (patt2p==null) return;
		var patt2=new RegExp(patt2p,"");
		var a=document.getElementById("production_table").rows;
		var oszl=getOszlopNo("falunev");
		for (var i=1;i<a.length;i++){
			CHECK2=a[i];
			nev = $.trim(CHECK2.cells[oszl].innerText);
			if (CHECK2.style.display!="none") regi=true; else regi=false;
			if (patt2.test(nev)) uj=true; else uj=false;
			if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
		}
	}
	if (tipus=="tamad"){
		var a=document.getElementById("production_table").rows;
		for (var i=1;i<table.rows.length;i++){
			CHECK2=a[i];
			oszl=getOszlopNo("falunev");
			if (CHECK2.style.display!="none") regi=true; else regi=false;
			var vizsga=CHECK2.cells[oszl].innerHTML;
			if (typeof(vizsga)!='undefined' && vizsga!=null){
				if (vizsga.indexOf("attack.png")>0) uj=true; else uj=false;
			} else uj=false;
			if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
		}
	}
	
	if (tipus=="headtail"){
		var fej=prompt("Mely falukat akarod a jelenlegi sorrendből megtartani?\nElső X falu megtartásához írj be egy számot.\nUtolsó X falu megadásához írj egy '-'-t, és aztán a számot! (pl. -20)\n\nHa tól-ig jelölést szeretnél megadni, arra is lehetőséged van szám-szám megadásával (pl. 10-40) - ekkor csak az első x-első x lehetőség nyitott.");
		if (fej==null) return;
		var tolig=new Array(1,szamlal());
		
	try{
		if (fej[0]=="-") { /*Utolsó X keresése */
			tolig[0]=szamlal()-parseInt(fej.match(/[0-9]+/g)[0]);
			tolig[0]=tolig[0]+1;
		} else {
			var patt = new RegExp("[0-9]+(\-)[0-9]+");
			if (patt.test(fej)) { /*Tól-ig típus*/
				tolig[0]=parseInt(fej.match(/[0-9]+/g)[0]);
				tolig[1]=parseInt(fej.match(/[0-9]+/g)[1]);
			} else { /*Ellenben: Első n találat típus*/
				tolig[1]=parseInt(fej.match(/[0-9]+/g)[0]);
			}
		}		
	}catch(e){alert("Hibás megadás."); return;}

		var szamlalo=0; var a=document.getElementById("production_table").rows;
		
		for (var i=1;i<a.length;i++){
			CHECK2=a[i];
			if (CHECK2.style.display!="none") {
				szamlalo++;
				regi=true;
				if (szamlalo>=tolig[0]) {
					if (szamlalo<=tolig[1]) uj=true; else uj=false;
				} else uj=false; 
				if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
			}
		}
	}
	
	if (tipus=="RND"){
		var a=document.getElementById("production_table").rows;
		var maxvill=szamlal();
		var dbszam=prompt("Mennyi falut szeretnél kiválasztani véletlenszerűen a jelenlegi látott listából?\nMaximum "+(maxvill-1));
		if (dbszam==null || dbszam=="") return;
		dbszam=dbszam.replace(/[^0-9]/g,"");
		if (dbszam=="") return;
		dbszam=parseInt(dbszam);
		if (dbszam>=maxvill) {alert("Ennyi falut nem tudok kiválasztani ("+dbszam+")!"); return; }
		
		var rand=0; var kival=new Array();
		while (kival.length<dbszam){
			rand=Math.floor((Math.random()*(maxvill))+1);
			if (kival.indexOf(rand)==-1) kival.push(rand);
		}
		rand=0; /*Ezektúl látható falusorszámot néz.*/
		for (var i=1;i<a.length;i++){
			CHECK2=a[i];
			if (CHECK2.style.display!="none") {
				rand++;
				regi=true;
				if (kival.indexOf(rand)!=-1) uj=true; else uj=false; 
				if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
			}
		}
	}
	
	if (tipus=="grafgomb"){
		var visz_faluk=prompt("Mely falukhoz viszonyítva legyenek a távolságok?");
		if (visz_faluk==null || visz_faluk=="") return;
		var visz_faluk=visz_faluk.match(/[0-9]{1,3}(\|)[0-9]{1,3}/g);
		
		var dbszam=prompt("Ezen falukhoz mennyi legközelebbit írjak ki?");
		if (dbszam==null || dbszam=="") return;
		dbszam=dbszam.replace(/[^0-9]/g,"");
		if (dbszam=="") return;
		dbszam=parseInt(dbszam);
		
		var a=document.getElementById("production_table").rows;
		var maxvill=a.length;
		if (visz_faluk.length*dbszam>=maxvill) {alert("Nem áll rendelkezésre elegendő falu, avagy minden falu listázódna"); return; }
		
		var vane=false;
		if (document.getElementById("tav")==undefined) vane=false; else vane=true;
		
		for (var i=0;i<a.length;i++){
			if (!vane) var cell=a[i].insertCell(getOszlopNo("falunev")+1); else var cell=a[i].cells[getOszlopNo("tav")];
			if (i==0) {cell.innerHTML='<b><a href=\'javascript: rendez(false,"tav", "tav")\'>Távolság</a>/<a href=\'javascript: rendez(false,"falu","tav")\'>Falu</a></b>'; cell.setAttribute("id","tav");continue;}
			else cell.innerHTML="---";
		}
		var antidup=new Array();
		for (var j=0;j<visz_faluk.length;j++){
			var tavok=new Array(); tavok[0]=-1;
			for (var i=1;i<a.length;i++){
				var CCORD=a[i].cells[0].textContent.match(/[0-9]{1,3}(\|)[0-9]{1,3}/g);
				CCORD=CCORD[CCORD.length-1];
				tavok[i]=-1;
				if (antidup.indexOf(CCORD)>-1) continue;
				
				tavok[i]=roundNumber(distCalc(visz_faluk[j].split("|"),CCORD.split("|")),2);
			}
			for (var i=0;i<dbszam;i++){
				var min=-1;
				for (var k=0;k<tavok.length;k++){ /*Minker*/
					if (tavok[k]==-1) continue;
					if (min==-1) {min=k; continue;}
					if (tavok[k]<tavok[min]) {min=k;}
				}
				a[min].cells[getOszlopNo("tav")].innerHTML=tavok[min]+"/"+visz_faluk[j];
				var CCORD=a[min].cells[0].textContent.match(/[0-9]{1,3}(\|)[0-9]{1,3}/g);
				CCORD=CCORD[CCORD.length-1];
				antidup.push(CCORD);
				tavok[min]=-1;
			}
		}
		for (var i=1;i<a.length;i++){
			if (a[i].cells[getOszlopNo("tav")].innerHTML=="---") 
				a[i].setAttribute("style","display:none"); 
			else 
				a[i].setAttribute("style","display:line");
		}
		rendez(false,"falu", "tav");
	}
	sethalmaz("");
	frissit();
	szamlal();
	return;
}catch(e){alert(e);}}

function halmaz(regi,uj){
	if (ISHALMAZ=="") return uj;
	if (NEG2)  uj=!uj;
	if (ISHALMAZ=="metszet"){
		if (!regi || !uj) return false; else return true;
	}
	if (ISHALMAZ=="unio"){
		if (regi || uj) return true; else return false;
	}
	if (ISHALMAZ=="kulonbseg"){
		if (!regi) return false;
		if (regi && uj) return false;
		return true;
	}
	return uj;
}

function sethalmaz(tipus){
	if (tipus!="negalt") {
		if (tipus=="negalt2") {NEG2=!NEG2;} else {
		if (ISHALMAZ==tipus) ISHALMAZ=""; else ISHALMAZ=tipus; 
		if (tipus=="") NEG2=false;
		}
	}
	/*Nem return kell, hanem jelezni a jelenlegi halmazműveleteket valahol!*/
	
	if (document.getElementById("halmazallapot")) document.getElementById("halmazallapot").innerHTML='Halmazművelet: <b>'+ISHALMAZ+'</b><br>Negált 2? <b>'+NEG2+'</b>';
	if (tipus!="negalt") return;
	var table=document.getElementById("production_table");
	for (var i=1;i<table.rows.length;i++){CHECK=table.rows[i].cells[getOszlopNo("falunev")].firstChild; CHECK.setAttribute("style","display:none");} 
	KIVALASZTOTT="";	
	for (var i=1;i<table.rows.length;i++){
		var CHECK2=table.rows[i];
		if (CHECK2.style.display!="none") CHECK2.setAttribute("style","display:none"); else CHECK2.setAttribute("style","display:line");
	}
	szamlal();
	return;
}

function szerkeszt(){ try{
	HALMAZ=""; if (KIVALASZTOTT=="") return;
	var table=document.getElementById("production_table");
	var oszl=getOszlopNo("falunev");
	for (var i=1;i<table.rows.length;i++){ /*Összes falu és checkbox megjelenítése*/
		CHECK=table.rows[i].cells[oszl].firstChild;	CHECK.setAttribute("style","display:line"); CHECK.checked=false;
		CHECK2=table.rows[i]; CHECK2.setAttribute("style","display:line");
	}
	
	suti=getCookie("cnc_csoport");
	sutiF=suti.split(";");
	for (var i=4;i<sutiF.length;i++){if (sutiF[i].indexOf(",")==-1) {if (sutiF[i]==KIVALASZTOTT) return;} else if (sutiF[i].split(",")[0]==KIVALASZTOTT) no=i;}
	for (var i=1;i<table.rows.length;i++){ /*Pipa rakása a megfelelő helyekre*/
		koord=table.rows[i].cells[oszl].innerText.match(/[0-9]+(\|)[0-9]+/g);
		koord=koord[koord.length-1];
		CHECK2=table.rows[i].cells[oszl].firstChild;
		if (sutiF[no].indexOf(koord)>0) CHECK2.checked=true;
	}
	}catch(e){alert(e);}
}

function atnevez(){try{
	if (KIVALASZTOTT=="") {alert("Csak általad létrehozott és kijelölt csoportot tudsz átnevezni"); return;}
	suti=getCookie("cnc_csoport");
	nev=prompt("Mi legyen az új csoport neve?",KIVALASZTOTT);
		if (nev==KIVALASZTOTT) return;
		if (nev==null) return;
		if (nev.search(";")>=0) {alert("A ; karakter nem megengedett, pont (.)-ra alakul át.");nev=nev.replace(";",".");}
		if (nev.search(",")>=0) {alert("A , karakter nem megengedett, pont (.)-ra alakul át.");nev=nev.replace(",",".");}
		if (nev.search("\"")>=0) {alert("A \" karakter nem megengedett, törlődik.");nev=nev.replace("\"","");}
        if (nev.length<1) {alert("A csoport neve nem lehet üres");return;}
	/*Duplikáció?*/
	Fsuti=suti.split(";");
	for (var i=4;i<Fsuti.length;i++){
		if (Fsuti[i].indexOf(",")>=0) {
			if (Fsuti[i].split(",")[0]==nev) {alert("Ilyen nevű csoport már létezik"); return;}
		} else {
			if (Fsuti[i]==nev) {alert("Ilyen nevű csoport már létezik"); return;}
		}
	}
	suti=suti.replace(";"+KIVALASZTOTT,";"+nev);
	setCookie("cnc_csoport",suti);
	}catch(e){alert(e);}
	frissit();
	return;
}

function torol(){ try{
	if (KIVALASZTOTT=="") return;
	if (!confirm("Biztosan törli ezt a csoportot?\n"+KIVALASZTOTT)) return;
	suti=getCookie("cnc_csoport");
	Fsuti=suti.split(";");
	
	str=Fsuti[0];
	for (var i=1;i<Fsuti.length;i++){ if (i>3) {
		if (Fsuti[i].indexOf(",")==-1) {
			if (Fsuti[i]!=KIVALASZTOTT) str+=";"+Fsuti[i];
		} else {
			if (Fsuti[i].split(",")[0]!=KIVALASZTOTT) str+=";"+Fsuti[i];
		}
	} else str+=";"+Fsuti[i];
	}
	setCookie("cnc_csoport",str);
	frissit();
	return;
}catch(e){alert(e);}
}

function mod(ezt){ /*Default csoportok értékeinek változtatása*/
	if (ezt==1) {
		erre=prompt("Adja meg az új értéket.\nTanyahelyes érték (50-30000)\nJelentése: azon faluk, melyek lakossága ezen értékű, vagy feletti.\n\nSpeciális lehetőség: - jel utáni szám jelentése, hogy minimum ennyi hiányzik a teljes tanyaértékhez."); 
		if (erre==null) return;
		try{if (isNaN(erre)) throw "error"; erre=parseInt(erre); if (erre>30000) throw "error";} catch(e){alert("Hibásan megadott érték"); return;}
	}
	if (ezt==2){
		displayMessage('Raktárszűrő', '\
		<form name="raktarForm">\
		Mi alapján akarsz szűrni?<br>\
			&nbsp;&nbsp;&nbsp;<input type="radio" name="cnc_rak" value="M"> Legkisebb nyersanyagtípus<br>\
			&nbsp;&nbsp;&nbsp;<input type="radio" name="cnc_rak" value="X" checked> Legnagyobb nyersanyagtípus<br>\
			&nbsp;&nbsp;&nbsp;<input type="radio" name="cnc_rak" value="A"> Átlagos nyersanyagérték<br>\
			&nbsp;&nbsp;&nbsp;<input type="radio" name="cnc_rak" value="W"> <span class="res wood" style="width: 18px;height: 15px;display: inline-block;"></span> Fa<br>\
			&nbsp;&nbsp;&nbsp;<input type="radio" name="cnc_rak" value="S"> <span class="res stone" style="width: 18px;height: 15px;display: inline-block;"></span> Agyag<br>\
			&nbsp;&nbsp;&nbsp;<input type="radio" name="cnc_rak" value="I"> <span class="res iron" style="width: 18px;height: 15px;display: inline-block;"></span> Vas<br>\
			Mekkora %-os telítettség legyen listázva? ≥<input type="text" name="val" size="2">%<br>\
			<button type="button" onclick="set_raktarszuro('+ezt+')">Beállít</button>\
		</form>');
		document.forms['raktarForm'].cnc_rak.value = getCookie("cnc_csoport").split(";")[ezt][0];
		document.forms['raktarForm'].val.value = getCookie("cnc_csoport").split(";")[ezt].match(/[0-9]+/g)[0];
		return;
	}
	if (ezt==3){
		erre=prompt("Adja meg az új értéket.\nPontérték (50-13000)\nJelentése: azon faluk, melyek a megadott pont feletti értékkel rendelkeznek."); 
		if (erre==null) return;
		try{if (isNaN(erre)) throw "error"; erre=parseInt(erre); if (erre>13000||erre<50) throw "error";} catch(e){alert("Hibásan megadott érték"); return;}
	}
	
	suti=getCookie("cnc_csoport");
	Fsuti=suti.split(";");
	Fsuti[ezt]=erre;
	setCookie("cnc_csoport",Fsuti.join(';'));
	
	frissit();
}

function set_raktarszuro(ezt) {
	var values = [document.forms['raktarForm'].cnc_rak.value, document.forms['raktarForm'].val.value];
	if (values[0]=='' || values[0] == null || values[1] == '' || isNaN(values[1]) || parseInt(values[1], 10) < 1 || parseInt(values[1], 10) > 100) {
		alert("Érvénytelen megadás");
		return;
	}
	
	suti=getCookie("cnc_csoport");
	Fsuti=suti.split(";");
	Fsuti[ezt]=values.join('');
	setCookie("cnc_csoport",Fsuti.join(';'));
	frissit();
	displayMessage('disable');
}

function getOszlopNo(ezt){ /*megkeresi hanyadik oszlopba van a keresett érték*/
	tabla=document.getElementById("production_table").rows[0];
	for (var i=0;i<tabla.cells.length;i++){
		if (tabla.cells[i].getAttribute("id")==ezt) return i;
	}
	return -1;
}

function megnyit(){ /*nem none display-ű falukat megnyitja, OPENTYPE változó alapján*/
try{
	var faluNO = szamlal();
	if (faluNO > 25 && !confirm(faluNO + ' lapot készült megnyitni. Biztos?')) return;
    var nyit="";
	var FALUK=document.getElementById("production_table");
	oszlopno=getOszlopNo("falunev");
	openedREFS = [];
	/*CIK = 0;
	for (var i=0;i<refarray.length;i++) {
		setTimeout(function(){
			refarray[CIK].document.forms["units"].support.click();
			CIK++;
		},TIME*i);
	}*/
	TABHELPER = 0;
	TABHELPER_LIST = [];
	var no=0;
    for (var q=1;q<FALUK.rows.length;q++){
        if (FALUK.rows[q].style.display!="none") {
            nyit=FALUK.rows[q].cells[getOszlopNo("falunev")].getElementsByTagName("a")[0].getAttribute("href");
            nyit=nyit.replace("overview",OPENTYPE);
			TABHELPER_LIST.push(nyit);
            /*openedREFS.push(window.open(nyit));*/
        }
    }
	for (var q=0;q<TABHELPER_LIST.length;q++) {
		setTimeout(function(){
			openedREFS.push(window.open(TABHELPER_LIST[TABHELPER]));
			TABHELPER++;
		}, (150+(Math.random()*100))*q);
	}
	displayMessage('Megnyitott lapok', TABHELPER_LIST.length + 'lap megnyitva.<br><button type="button" onclick="closeAllTab()">Kattints ide a bezáráshoz</button>');
	var limit = 10;
	setTimeout(function() {addCsoportJelzo(openedREFS)}, TABHELPER_LIST.length*200);
	
	function addCsoportJelzo(openedREFS) {
		var allOk = true;
		limit--; if (limit < 1) return;
		for (var lap = 0;lap<openedREFS.length;lap++) {
			if (openedREFS[lap].document && openedREFS[lap].document.getElementById("serverTime") && openedREFS[lap].document.getElementById("serverTime").innerHTML.length>4) {
				referenceCsoport(openedREFS[lap]);
			} else allOk=false;
		}
		if (!allOk) {
			setTimeout(function() {addCsoportJelzo(openedREFS)}, 1000);
		}
	}
}catch(e){alert("Open_ERROR:"+e);}
return;
}
function closeAllTab() {
	for (var i=0;i<openedREFS.length;i++) {
		openedREFS[i].close();
	}
	displayMessage('', 'disable');
}

function referenceCsoport(lapRef) {
	if (lapRef.document.getElementById("cnc_csoport_box")) return;
	var relatedCsoport = getRelatedVillages(lapRef.game_data.village.coord);
	
	var newElem = lapRef.document.createElement("div");
	newElem.setAttribute("id", "cnc_csoport_box");
	var htmlString = '<div id="cnc_csoport" style="position: fixed; top: 100px; left: 30%; z-index: 1; background: rgb(51, 170, 85); padding: 0px 0px 10px 0px;"><div id="cnc_csoport_header" style="padding: 5px; background: #379; cursor: move; margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid black;">Csoportok:</div>';
	
	if (relatedCsoport.length == 0) {
		htmlString += '<i>Ez a falu nincs csoportba felvéve</i>';
	} else {
		for (var i=0;i<relatedCsoport.length;i++) {
			htmlString += '<a href="#" style="padding:3px; margin:0 3px; border:1px solid black;">'+ relatedCsoport[i] +'</a>';
		}
	}
	htmlString += '</div>';
	newElem.innerHTML=htmlString;
	lapRef.document.body.insertBefore(newElem, lapRef.document.body.firstChild);
	lapRef.$("#cnc_csoport").draggable({handle: "#cnc_csoport_header"});
}
function getRelatedVillages(coord) {/*Visszaadja a coord csoportjait tömbbe*/
	var suti = localStorage.getItem('cnc_csoport').split(';');
	var relatedCsoport = [];
	for (var i=4;i<suti.length;i++) {
		var faluk = suti[i].split(',');
		for (var j=1;j<faluk.length;j++) {
			if (coord == faluk[j]) {
				relatedCsoport.push(faluk[0]);
				break;
			}
		}
	}
	return relatedCsoport;
}

function iskivalaszt(ez){
	suti=getCookie("cnc_csoport");
	if (suti.split(";")[0]==ez) return 'style="background-color:brown"'; else return '';
}

function mentes(){
	var a=document.getElementById("production_table").rows;
	var oszl=getOszlopNo("falunev");
	var suti=getCookie("cnc_csoport");
	
	nev=prompt("Mi legyen ennek a falucsoportnak a neve?");
		if (nev==null) return;
		if (nev.search(";")>=0) {alert("A ; karakter nem megengedett, pont (.)-ra alakul át.");nev=nev.replace(";",".");}
		if (nev.search(",")>=0) {alert("A , karakter nem megengedett, pont (.)-ra alakul át.");nev=nev.replace(",",".");}
		if (nev.search("\"")>=0) {alert("A \" karakter nem megengedett, törlődik.");nev=nev.replace("\"","");}
        if (nev.length<1) {alert("A csoport neve nem lehet üres");return;}
	/*Duplikáció?*/
	Fsuti=suti.split(";");
	for (var i=4;i<Fsuti.length;i++){ if (Fsuti[i].indexOf(",")>=0) if(Fsuti[i].split(",")[0]==nev) {alert("Ilyen nevű csoport már létezik"); return;}}
	
	var str=";"+nev;
	for (var i=1;i<a.length;i++){
		CHECK2=a[i];
		if (CHECK2.style.display!="none") { 
			var koord=CHECK2.cells[oszl].innerText.match(/[0-9]+(\|)[0-9]+/g);
			str+=","+koord[koord.length-1]; }
	}
	/*if (str.indexOf(",")==-1) {alert("Üres csoportot nem lehet lementeni"); return;}*/
	suti+=str;
	setCookie("cnc_csoport",suti);
	frissit();
	return;
}

function szinez(){ try{
	oszl=getOszlopNo("falunev");
	var a=document.getElementById("production_table").rows;
	var szinek=["black","maroon","green","olive","navy","purple","teal","gray","silver","red","lime","yellow","blue","fuchsia","aqua","white"];
	rnd=Math.floor((Math.random()*16));
	szin=szinek[rnd]; var ures=true;
	for (var i=1;i<a.length;i++){
		CHECK2=a[i];
		if (CHECK2.style.display!="none") {
			ures=false;
			CHECK2.cells[oszl].setAttribute('style', 'background-color: ' + szin + " !important");
		}
	}
	if (ures){
		for (var i=1;i<a.length;i++){
			CHECK2=a[i];
			CHECK2.cells[oszl].setAttribute("style", "background-color:none;border:none;");
		}
	}
}catch(e){alert(e);}}

function szinez1(ez){ try{
	var szinek=new Array("","purple","yellow","black");
	var szinindex=szinek.indexOf(ez.parentNode.style.backgroundColor);
	szinindex++; if (szinindex>3) szinindex=0;
	ez.parentNode.setAttribute('style', 'background-color: ' + szinek[szinindex] + " !important");
	return;
}catch(e){alert(e);}}

function toredezett(){try{
	suti=getCookie("cnc_csoport");
	sutiORIGINAL=suti;
	oszl=getOszlopNo("falunev");
	var table=document.getElementById("production_table").rows;
	sutiF=suti.split(";");
	faluk=new Array();
	for (var j=4;j<sutiF.length;j++){
		if (sutiF[j].indexOf(",")>=0){
			addon=sutiF[j].split(",");
			for (var k=1;k<addon.length;k++){
				faluk=faluk.concat(addon[k]);
			}
		}
	}
	
	var falukITT=new Array();
	for (var i=1;i<table.length;i++){
		koord=table[i].cells[oszl].innerText.match(/[0-9]+(\|)[0-9]+/g);
		falukITT=falukITT.concat(koord[koord.length-1]);
	}
	
	var ok=false; var str="";
	for (i=0;i<faluk.length;i++){
		ok=false;
		for (j=0;j<falukITT.length;j++){
			if (faluk[i]==falukITT[j]) {ok=true; break;}
		}
		if (!ok) {suti=suti.replace(","+faluk[i],""); str+=faluk[i]+", ";}
	}
	
	if (str=="") alert("Nincsenek olyan faluk a lementett csoportleosztásba, amik nem léteznek nálad!"); else 
	alert ("Egy vagy több falut kitöröltem a csoportleosztásból, mivel ilyenek nem léteznek:\n"+str+"\n\n Ha biztonsági mentést szeretne végezni a törlés előtt, mentse el az alábbi szöveget, melyet importáláskor később megadhat:\n"+sutiORIGINAL);
	
	setCookie("cnc_csoport",suti);
	return;
}catch(e){alert(e);}}

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

function politavolsag(silent){try{
	if (typeof silent == "undefined") var silent=false;
	var result=new Array();
	var X=document.getElementById("production_table").rows;
	var temp="";
	var Mero="";
	if (X.length*0.75<szamlal()) {
		Mero=game_data.village.coord;
	} else {
		for (var i=1;i<X.length;i++){
			if (X[i].style.display!="none"){
				temp=X[i].cells[getOszlopNo("falunev")].innerText.match(/[0-9]+(\|)[0-9]+/g);
				Mero+=temp[temp.length-1]+" ";
			}
		}
	}
	if (silent) Mero=silent; else Mero=prompt("Mely falukhoz viszonyítva szeretnéd a távolságokat kiíratni?\n(A kiírt távolság a listában szereplő faluk közül a legközelebbihez lesz mérve.\nEzt a falut megnézheted, ha ráteszed az egered a távolságra.)",Mero);
	if (Mero==null || Mero=="") return;
	try{Mero=Mero.match(/[0-9]+(\|)[0-9]+/g); if (Mero.length<1) throw "error"; }catch(e){alert("Érvénytelen koordináta megadás\n"+Mero); return;}
	var vane=false;
	if (document.getElementById("tav")==undefined) vane=false; else vane=true;
	
	var prodtable=document.getElementById("production_table").rows;
	var min=-1; var temp=0; var minF=""; var RNum=0;
	for (var i=0;i<prodtable.length;i++){
		min=-1;
		var cell;
		if (!vane) cell=prodtable[i].insertCell(getOszlopNo("falunev")+1); else cell=prodtable[i].cells[getOszlopNo("tav")];
		var rendezcsoport= '';
		var head="Távolság"; if (silent) {head="Fontosság"; rendezcsoport='fontos';}
		if (i==0) {cell.innerHTML='<a href="javascript: rendez(false, \''+ rendezcsoport +'\', \'tav\')"><b>'+head+'</b></a>'; cell.setAttribute("id","tav");continue;}
		
		JFalu=prodtable[i].cells[getOszlopNo("falunev")].innerText.match(/[0-9]+(\|)[0-9]+/g);
		JFalu=JFalu[JFalu.length-1].split("|");
		for (var j=0;j<Mero.length;j++){
			temp=roundNumber(distCalc(Mero[j].split("|"),JFalu),2);
			if (temp<min || min==-1) {min=temp; minF=Mero[j];}
		}
		result.push(minF);
		var ut=min*(1/SPEED)*(1/UNITS);
		var ut_l=ut*18;
		var ut_k=ut*22;
		var ut_kem=ut*9;
		var ut_kl=ut*10;
		var ut_nl=ut*11;
		var ut_kos=ut*30;
		var ut_fn=ut*35;
		cell.setAttribute('class', 'cnc_toolTip cnc_toolTip_middle');
		var tavToolTip = document.createElement('span');
		tavToolTip.setAttribute('class', 'cnc_toolTipText');
		if (!silent) {
			cell.innerHTML='<div class="tavolsag">'+min+'</div>';
			tavToolTip.innerHTML = "Legközelebbi: "+minF+"<br>Távolság Időben (óra:perc)";
		} else {
			cell.innerHTML='<div class="tavolsag">'+minF+'</div>';
			tavToolTip.innerHTML = "A legközelebbi falu.<br>Távolsága: "+min+" mező";
		}
		tavToolTip.innerHTML += 
			'<table class="tavTable"><tbody>' +
			'<tr><td>Lándzsás</td><td>' + parseInt(ut_l/60)+":"+FN((parseInt(ut_l) % 60)) + '</td></tr>' +
			'<tr><td>Kardforgató</td><td>'+ parseInt(ut_k/60)+":"+FN((parseInt(ut_k) % 60)) +'</td></tr>' +
			'<tr><td>Felderítő</td><td>'+ parseInt(ut_kem/60)+":"+FN((parseInt(ut_kem) % 60)) +'</td></tr>' +
			'<tr><td>Könnyűlovas</td><td>'+ parseInt(ut_kl/60)+":"+FN((parseInt(ut_kl) % 60)) +'</td></tr>' +
			'<tr><td>Nehézlovas</td><td>'+ parseInt(ut_nl/60)+":"+FN((parseInt(ut_nl) % 60)) +'</td></tr>' +
			'<tr><td>Kos</td><td>'+ parseInt(ut_kos/60)+":"+FN((parseInt(ut_kos) % 60)) +'</td></tr>' +
			'<tr><td>Főnemes</td><td>'+ parseInt(ut_fn/60)+":"+FN((parseInt(ut_fn) % 60)) +'</td></tr>' +
			'</tbody></table>';
		cell.appendChild(tavToolTip);
	}
	return result;
	
	function FN(num) {
		if (num < 10) return '0' + num;
		return num;
	}
}catch(e){alert(e);}}

$("#uzi").keyup(function(event){
    if(event.keyCode == 13){
		event.preventDefault();
    }
});

function smasher_sulyoz(faluk, list, listE,tav){
	var result=0;
	for (var i=0;i<faluk.length;i++){
		for (var j=0;j<list.length+1;j++){
			if (j==list.length) {
				if (listE=="") break;
				if (distCalc(listE.split("|"),faluk[i].split("|"))<tav) result++;
			} else {
				if (distCalc(list[j].split("|"),faluk[i].split("|"))<tav) {result++;break;}
			}
		}
	}
	return result;
}
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};
function smasher(szamol){try{
	var faluk = new Array(); var temp; var X=document.getElementById("production_table").rows;
	for (var i=1;i<X.length;i++){
		temp=X[i].cells[getOszlopNo("falunev")].innerText.match(/[0-9]+(\|)[0-9]+/g);
		faluk.push(temp[temp.length-1]);
	}
	
	if (!szamol){
		/*Bázis közepének meghatározása*/
		var center=new Array(0,0);
		for (i=0;i<faluk.length;i++){
			center[0]+=parseInt(faluk[i].split("|")[0]);
			center[1]+=parseInt(faluk[i].split("|")[1]);
		}
		center[0] = Math.round(center[0] / X.length);
		center[1] = Math.round(center[1] / X.length);
		
		displayMessage("Hálózat-kereső beállítások",'<table>\
		<tr><td>Melyek azok amik biztos csomópontok?<br>Mindenképp adj meg 1-et, és létező falukat.<br>Jelenlegi a bázisod közepe, ami <u>nem biztos hogy létező falu</u>!)</td><td><textarea cols="35" rows="3">'+center.join("|")+'</textarea></td></tr>\
		<tr><td>Melyek azok amiket nem szeretnél csomópontnak?<br><i>Ettől függetlenül lehet hogy a része lesz</i></td><td><textarea cols="35" rows="3"></textarea></td></tr>\
		<tr><td>Max hány faluig menjünk?</td><td><input size="3" value="20"></td></tr>\
		<tr><td>Mekkora táv legyen a faluk között?</td><td><input size="3" value="8"></td></tr></table>\
		<input type="submit" onclick=smasher(true) value="Keresd"><br><div id="smasherRes" style="display: none; margin: 10px auto 0 auto; width: 300px; padding: 5px; background-color: green; color:black;"></div>');
		return;
	}
	
	var tavsor=new Array(); var resultList=new Array();
	
	
	var center=document.getElementById("uzi").getElementsByTagName("textarea")[0].value; if(center=="" || center==null || center.indexOf("|")==-1) return;
	/*FIXME: Keressük a megadotthoz legközelebbi létező faluk (most ez SKIP)*/
	resultList = center.match(/[0-9]+(\|)[0-9]+/g);
	var maxFalu = document.getElementById("uzi").getElementsByTagName("input")[1].value; if(maxFalu=="" || maxFalu==null || isNaN(maxFalu)) return;
	var tav     = document.getElementById("uzi").getElementsByTagName("input")[2].value; if(tav=="" || tav==null || isNaN(tav)) return;
	var ex		= document.getElementById("uzi").getElementsByTagName("textarea")[1].value; try{ex=ex.match(/[0-9]+(\|)[0-9]+/g);}catch(e){ex=new Array();}
	maxFalu=parseInt(maxFalu); tav=parseInt(tav);
	
	while (resultList.length<maxFalu && faluk.length>1){
		var min=-1; var temp=0; var RNum=0; tavsor=new Array();
		/*Távot számít*/
		for (var i=0;i<faluk.length;i++){
			min=-1;
			for (var j=0;j<resultList.length;j++){
				temp=roundNumber(distCalc(resultList[j].split("|"),faluk[i].split("|")),2);
				if (temp<min || min==-1) min=temp;
			}
			tavsor.push(min);
		}
		
		/*Maxkiválasztás*/
		var max=tavsor.max(); if (max<=tav) break;
		
		/*Súlyozás*/
		var suly=new Array();
		for (var i=0;i<faluk.length;i++){
			if (tavsor[i]<=(tav)){
				suly[i]=-120;
			} else {
				suly[i] = smasher_sulyoz(faluk,resultList,faluk[i],tav);
				if (faluk[i].indexOf(ex)>-1) suly[i]-=100;
			}
		}
		var max2=suly.max();
		for (var i=0;i<suly.length;i++){
			if (suly[i]==max2) {
				resultList.push(faluk[i]);
				break;
			}
		}
		for (var i=faluk.length-1;i>-1;i--){
			if (tavsor[i]<tav) {
				faluk.splice(i, 1);
			}
		}
	}
	falulista_import(resultList.join(", "));
	centerFinder(resultList.join(", "));
	$("#smasherRes").show();
	alert(faluk);
	if (faluk.length<2) max="Kevesebb mint "+tav;
	document.getElementById("smasherRes").innerHTML='<b>Eredmény:</b><br><u>Max táv:</u> '+max+'<br><u>Faluk száma:</u> '+resultList.length+' falu';
}catch(E){alert(E)}}

function centerFinder(list){try{
	if (!list || typeof list=="undefined") var list=prompt("Add meg, mely falukat vizsgáljam meg. \n Eredményül kiírom, mennyi falud tartozik hozzá legközelebb a listából");
	if (list.indexOf("|")==-1) return;
	list=list.match(/[0-9]+(\|)[0-9]+/g);
	var listRes=new Array();
	
	var result = politavolsag(list.join(", "));
	
	var X=document.getElementById("production_table").rows;
	var tavOszlop=getOszlopNo("tav");
	var faluOszlop=getOszlopNo("falu");
	for (var i=1;i<X.length;i++){
		var falu=X[i].cells[faluOszlop].innerText.match(/[0-9]+(\|)[0-9]+/g); falu=falu[falu.length-1];
		var k=list.indexOf(falu);
		if (k==-1) continue;
		
		var tavCell=X[i].cells[tavOszlop];
		var db=0;
		for (var j=0;j<result.length;j++) {
			if (result[j]==list[k]) db++;
		}
		tavCell.innerHTML=db;
		tavCell.style.background="rgb(100,100,255)";
	}
	rendez(false,"fontos","tav");
}catch(e){}}

function rendez(bool, oszlopSubSel, oszlopId){try{
	var OBJ = document.getElementById("production_table");
	var oszlop = getOszlopNo(oszlopId);
	var prodtable=OBJ.rows;
	var tavok=new Array(); var sorok=new Array(); var indexek=new Array();
	var no=0;
	var fix=0; if (prodtable[0].cells.length!=prodtable[prodtable.length-1].cells.length) fix=1;
	var vizsgal=$.trim(prodtable[1].cells[oszlop].innerText).replace(" ","");
	var tipus="";
	
	if (prodtable[1].cells[oszlop].getElementsByClassName("tavolsag").length>0) {
		if (oszlopSubSel=='fontos') tipus="szoveg"; else tipus="tavolsag";
	} else if (isNaN(vizsgal) && isNaN(vizsgal.replace(/\./g,''))) {
		console.info('isNaN');
		var patt=new RegExp(/^[0-9]+(\/)[0-9]+$/g);
		var patt2=new RegExp(/^[0-9\.]+(\/)[0-9\|]+$/g);
		if (patt.test(vizsgal)) {
			tipus="peres1";
		} else {
			if (oszlopSubSel=="falu" && patt2.test(vizsgal)) tipus="falu_peres2";
		}
		patt=new RegExp(/^[0-9][0-9](\:)[0-9][0-9](\:)[0-9][0-9]$/g);
		if (patt.test(vizsgal)) tipus="ido";
	} else { /*szám lesz, a pont is OKÉ*/
		console.info('szám lesz, a pont is OKÉ');
		if (vizsgal=="") {
			tipus="nyersOssz";
			if (prodtable[1].cells[oszlop].getElementsByTagName("div").length==0) tipus="szoveg";
		}
		if (tipus=="") tipus="szam";
		if (tipus=='szam' && vizsgal.indexOf(".") == -1 && prodtable[1].cells[oszlop].getElementsByClassName('grey').length == 0) tipus="szam_Float";
		if (prodtable[1].cells[oszlop].innerHTML.indexOf('class="rename-icon"')>0 || prodtable[1].cells[oszlop].innerHTML.indexOf('screen=info_player')>0) tipus="szoveg";
	}
	if (oszlopSubSel == "wood") tipus="nyers1";
	if (oszlopSubSel == "stone") tipus="nyers2";
	if (oszlopSubSel == "iron") tipus="nyers3";
	if (tipus=="") tipus="szoveg";
	console.info('Type:', tipus);
	for (var i=1;i<prodtable.length-fix;i++){
		switch (tipus) {
			case "szoveg": tavok[i-1]=$.trim(prodtable[i].cells[oszlop].innerText); break;
			case "peres1": tavok[i-1]=parseInt(prodtable[i].cells[oszlop].innerText.split("/")[0]); break;
			case "peres2": tavok[i-1]=parseInt(prodtable[i].cells[oszlop].innerText.split("/")[1]); break;
			case "falu_peres2": if (prodtable[i].cells[oszlop].innerText === '---') tavok[i-1] = 0; else tavok[i-1]=parseInt(prodtable[i].cells[oszlop].innerText.split("/")[1].replace("|","")); break;
			case "nyers1": tavok[i-1]=parseInt(prodtable[i].cells[oszlop].innerText.replace(/\./g,"").match(/[0-9\-]+/g)[0]); break;
			case "nyers2": tavok[i-1]=parseInt(prodtable[i].cells[oszlop].innerText.replace(/\./g,"").match(/[0-9\-]+/g)[1]); break;
			case "nyers3": tavok[i-1]=parseInt(prodtable[i].cells[oszlop].innerText.replace(/\./g,"").match(/[0-9\-]+/g)[2]); break;
			case "nyersOssz": tavok[i-1]=parseFloat(prodtable[i].cells[oszlop].getElementsByTagName("div")[0].style.width.replace("px","")); break;
			case "ido": if (parseInt(prodtable[i].cells[oszlop].innerText.split(":")[0])<10) tavok[i-1]="0"+prodtable[i].cells[oszlop].innerText; else tavok[i-1]=prodtable[i].cells[oszlop].innerText; break;
			case "szam": tavok[i-1]=parseInt(prodtable[i].cells[oszlop].innerText.replace(/\./g,"")); break;
			case "szam_Float": tavok[i-1]=parseFloat(prodtable[i].cells[oszlop].innerText); break;
			case "tavolsag": tavok[i-1]=parseFloat(prodtable[i].cells[oszlop].getElementsByClassName("tavolsag")[0].innerText); break;
			default: alert("Nem értelmezhető mi szerint kéne rendezni."); return;
		}
		sorok[i-1]=prodtable[i];
		indexek[i-1]=i-1;
	}
	
	for (var i=0;i<tavok.length;i++){
		var min=i;
		for (var j=i;j<tavok.length;j++){
			if (bool) {if (tavok[j]>tavok[min]) min=j;}
			else {if (tavok[j]<tavok[min]) min=j;}
		}
		var Ttemp=tavok[i];
		tavok[i]=tavok[min];
		tavok[min]=Ttemp;
		
		var Ttemp=indexek[i];
		indexek[i]=indexek[min];
		indexek[min]=Ttemp;
		
	}
	
	for (var i=prodtable.length-1;i>0;i--){
		OBJ.deleteRow(i);
	}
	
	for (var i=0;i<tavok.length;i++){
		OBJ.appendChild(sorok[indexek[i]]);
	}

	if (!oszlopSubSel) oszlopSubSel = "";
	var link = 0;
	switch(oszlopSubSel) {
		case 'tav': link=0; break;
		case 'falu': link=1; break;
		case 'wood': link=0; break;
		case 'stone': link=1; break;
		case 'iron': link=2; break;
		default: link=getLinkByOszlop(oszlopId);
	}
	
	document.getElementById(oszlopId).getElementsByTagName("a")[link].setAttribute("href",'javascript: rendez('+!bool+',"'+oszlopSubSel+'", "'+oszlopId+'");');
	
	function getLinkByOszlop(oszlopId) {
		if (oszlopId == 'falunev') return 1;
		return 0;
	}
	szamlal();
}catch(e){alert("Hiba rendezéskor:\n"+e);}}

function warningMeter(szamol){try{
	if (!szamol) {
		displayMessage("Veszély Indikátor",'<table>\
		<tr><td>Adj meg falukat, melyek veszélyt jelentenek falvaidra</td><td><textarea cols="35" rows="3"></textarea></td></tr>\
		<tr><td>Mekkora távolságra vetítve jelentenek veszélyt?<br></td><td><input size="3" value="6"></td></td></tr></table>\
		Eredményül kiírja, hogy az egyes faluid körzetébe mennyi veszélyesnek ítélt falu van.<br><br>\
		<input type="submit" onclick=warningMeter(true) value="Keresd">');
		return;
	}
	var list=document.getElementById("uzi").getElementsByTagName("textarea")[0].value;
	if (list.indexOf("|")==-1) return;
	list=list.match(/[0-9]+(\|)[0-9]+/g);
	var tav = document.getElementById("uzi").getElementsByTagName("input")[1].value;
	if (isNaN(tav)) return;
	tav=parseInt(tav,10);
	
	var X=document.getElementById("production_table").rows;
	var faluk=new Array(); var temp, col=getOszlopNo("falunev");
	for (var i=1;i<X.length;i++){
		temp=X[i].cells[col].innerText.match(/[0-9]+(\|)[0-9]+/g);
		faluk.push(temp[temp.length-1]);
	}
	
	var vane=false;
	var vaneRatio=false;
	if (document.getElementById("tav")==undefined) vane=false; else vane=true;
	if (document.getElementById("dangerRatio")==undefined) vaneRatio=false; else vaneRatio=true;
	
	var cell;
	var cell2;
	var tavAB;
	col = getOszlopNo("tav");
	var col2 = getOszlopNo("dangerRatio");
	var colFaluNev = getOszlopNo("falunev");
	var dominationMatrix = {}; // faluId: {2: Array(enemy, ally), 4: 6: 8: 10: ...};
	var tavToolTip, tableContent, matrixRow, faluSzumm;
	for (var i=0;i<X.length;i++){
		if (!vane) cell=X[i].insertCell(colFaluNev+1); else cell=X[i].cells[col];
		if (!vaneRatio) cell2 = X[i].insertCell(colFaluNev+2); else cell2 = X[i].cells[col2];
		if (i==0) {
			cell.innerHTML='<a href="javascript: rendez(false, \'\', \'tav\')"><b>Közeli faluk</b></a>';
			cell.setAttribute("id","tav");
			cell2.innerHTML='<a href="javascript: rendez(false, \'\', \'dangerRatio\')"><b>Veszély-index</b></a>';
			cell2.setAttribute("id","dangerRatio");
			continue;
		}
		dominationMatrix[getFaluId(X[i].cells[colFaluNev])] = {
			2: [0,0],
			4: [0,0],
			6: [0,0],
			8: [0,0],
			10: [0,0]
		};
		matrixRow = dominationMatrix[getFaluId(X[i].cells[colFaluNev])];
		temp=0;
		for (var j=0;j<list.length;j++) {
			tavAB = distCalc(list[j].split("|"),faluk[i-1].split("|"));
			insertMatrix(matrixRow, 'enemy', tavAB);
			if (tavAB<=tav) temp++;
		}
		cell.innerHTML=temp;
		
		for (var j=0;j<faluk.length;j++){
			if ((j+1)==i) continue;
			tavAB = distCalc(faluk[i-1].split("|"), faluk[j].split("|"));
			insertMatrix(matrixRow, 'ally', tavAB);
		}
		cell2.setAttribute("class", 'cnc_toolTip');
		
		tavToolTip = document.createElement('span');
		tavToolTip.setAttribute('class', 'cnc_toolTipText');
		
		faluSzumm = [0,0,0]; //Enemy, Ally, Ratio
		tableContent = 'Ezen falu körüli faluk száma: <table class="tavTable"><tbody>\
		<tr><td></td><td>Saját</td><td>Ellenséges</td><td>%</td></tr>';
		for (var key in matrixRow) {
			faluSzumm[0] += matrixRow[key][0];
			faluSzumm[1] += matrixRow[key][1];
			faluSzumm[2] += calcIndex(parseInt(key,10), faluSzumm);
			tableContent += '<tr><td>'+key+' mezőn belül</td><td>'+faluSzumm[1]+'</td><td>'+faluSzumm[0]+'</td><td>'+getSzazalek(faluSzumm)+'%</td></tr>';
		}
		tableContent += '</tbody></table>';
		tavToolTip.innerHTML = tableContent;
		cell2.innerHTML = faluSzumm[2];
		cell2.appendChild(tavToolTip);
	}
	rendez(true,"", 'tav');
	
	function insertMatrix(matrixRow, type, tavAB) {
		var sub = 0;
		if (tavAB <= 2) sub = 2;
		else if (tavAB <= 4) sub = 4;
		else if (tavAB <= 6) sub = 6;
		else if (tavAB <= 8) sub = 8;
		else if (tavAB <= 10) sub = 10;
		
		if (sub == 0) return;
		if (type=="enemy") matrixRow[sub][0]++;
		else matrixRow[sub][1]++;
	}
	function calcIndex(mezo, Mrow) {
		if (Mrow[0] + Mrow[1] == 0) return 0;
		var domination = Math.round(Mrow[0] / (Mrow[0] + Mrow[1]) * 100);
		
		switch(mezo) {
			case 2:  domination*=10; break;
			case 4:  domination*=6; break;
			case 6:  domination*=4; break;
			case 8:  domination*=2; break;
			case 10: domination*=1; break;
			default: console.error("Invalid mezotav:", mezo);
		}
		return domination;
	}
	function getSzazalek(arr) {
		if (arr[0] + arr[1] == 0) return 100;
		return Math.round(arr[1] / (arr[0] + arr[1]) * 100);
	}
}catch(e){alert("Hiba"+e)}}

function getFaluId(faluCell){
	return faluCell.getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace("village=","");
}

function displayMessage(cim,str){try{
	if (cim=="disable" || str=="disable") {$( "#uzi" ).hide(); return;}
	document.getElementById("uzi").innerHTML='<div style="background: rgba(255,255,0,0.1); cursor: move; margin-bottom: 10px; padding: 5px;" id="uzi_drag"><p align="left" style="margin: 0;display:inline-block; font-weight: bold">'+cim+'</p><p align="right" style="float:right; margin: 0; display:inline-block;"><input type="button" onclick=displayMessage("","disable") style="font-weight:bold;color:#FFFFFF;background-color:#FF0000; border-style:double;border-color:#666666;"  title="Bezár" value="X"></p></div>'+str;
	$( "#uzi" ).show();
}catch(e){alert(e);}}
function falulista_export(tipus){try{
	var X=document.getElementById("production_table").rows;
	var temp="";
	var str='<textarea cols="40" rows="20" onclick="this.select()" onmouseover="this.select()">';
	
	for (var i=1;i<X.length;i++){
		if (X[i].style.display!="none"){
			temp=X[i].cells[getOszlopNo("falunev")].innerText.match(/[0-9]+(\|)[0-9]+/g);
			switch (tipus){
				case "BB": str+="[coord]"+temp[temp.length-1]+"[/coord]\n"; break;
				case "ujsor": str+=temp[temp.length-1]+"\n"; break;
				case "egysor": str+=temp[temp.length-1]+" "; break;
			}
		}
	}
	str+="</textarea>";
	displayMessage("Falulista",str);
}catch(e){alert(e);}}

function addExFalu() {
	var iHTML = '<form name="addExFalu">Adj meg falukat, amiket látni szeretnél, mintha a te faluid lennének.<br>Csak koordináták megadására van lehetőség, a többi adat a listád legelső sorából lesz másolva!<br><i>A hozzáadott falukra kattintva a térkép nyílik meg új lapon, a faluval középpontba</i><br><br>Faluk: <input name="exFaluk" placeholder="xxx|xxx xxx|xxx ..."><br><input type="radio" name="exType" value="E">Kiegészít<br><input type="radio" checked name="exType" value="S">Lecserél<br><br><button type="button" onclick="onAddExFalu()">Hozzáad</button></form>';
	displayMessage('Extra falu szimuláció', iHTML);
}
function onAddExFalu() {
	var data = document.forms["addExFalu"];
	var table = document.getElementById("production_table");
	if (table.rows.length < 2) {alert("Legalább 1 listázott falu szükséges. Frissítsd az oldalt."); return;}
	var firstRow = table.rows[1];
	var clone, tmp;
	var faluToAdd = data.exFaluk.value.match(/[0-9]{1,3}\|[0-9]{1,3}/g);
	if (faluToAdd.length < 1) return;
	
	if (data.exType.value == "S") {
		while(table.rows.length>1) {
			table.deleteRow(-1);
		}
	}
	for (var i=0;i<faluToAdd.length;i++) {
		tmp = faluToAdd[i].split("|");
		clone = firstRow.cloneNode(true);
		clone.cells[0].getElementsByTagName("a")[0].href = clone.cells[0].getElementsByTagName("a")[0].href
			.replace(/x=[0-9]+&y=[0-9]+/g, "x="+tmp[0]+"&y="+tmp[1])
			.replace("screen=overview","screen=map&x="+tmp[0]+"&y="+tmp[1]);
		clone.cells[0].getElementsByTagName("a")[0].setAttribute("target","_BLANK");
		clone.cells[0].getElementsByClassName("quickedit-label")[0].innerHTML = "Külső falu ("+faluToAdd[i]+") K"+tmp[1][0]+tmp[0][0];
		table.appendChild(clone); 
	}
	szamlal();
	displayMessage("","disable");
}
function falulista_import(pre){try{
	if (!pre) var be_Adat=prompt("Add meg a falulistát, amit szeretnél látni.\nElválasztás nem számít");
		else  var be_Adat=pre;
	if (be_Adat==null || be_Adat=="" || be_Adat.search(/[0-9]+(\|)[0-9]+/g)==-1) return;
	be_Adat=be_Adat.match(/[0-9]+(\|)[0-9]+/g);
	var a=document.getElementById("production_table").rows;
	var oszl=getOszlopNo("falunev"); var uj=false;
	for (var i=1;i<a.length;i++){
		var CHECK2=a[i];
		var nev = $.trim(CHECK2.cells[oszl].innerText).match(/[0-9]+(\|)[0-9]+/g); nev=nev[nev.length-1];
		if (CHECK2.style.display!="none") regi=true; else regi=false;
		uj=false;
		for (var j=0;j<be_Adat.length;j++){
			if (be_Adat[j]==nev) {uj=true; break;}
		}
		if (halmaz(regi,uj)) CHECK2.setAttribute("style","display:line"); else CHECK2.setAttribute("style","display:none");
	}
	sethalmaz("");
	frissit();
	szamlal();
}catch(e){alert(e);}}

function kivag(){try{
	var X=document.getElementById("production_table").rows;
	for (var i=X.length-1;i>0;i--){
		if (X[i].style.display=="none") document.getElementById("production_table").deleteRow(i);
	}
	return;
}catch(e){alert(e);}}

function krit(){try{
	var kritp=prompt("Kritikus nyersanyagszint?",50000);
	kritp=parseInt(kritp);
	krintp2=(-1)*kritp;
	var tempike=document.getElementById("production_table").rows;
	for (var i=1;i<tempike.length;i++){
		if (tempike[i].style.display!="none") var regi=true; else var regi=false;
		var curr_fa=parseInt(tempike[i].cells[getOszlopNo("gazdType")].getElementsByTagName("span")[0].innerText.replace(/\./g, ''));
		var curr_ag=parseInt(tempike[i].cells[getOszlopNo("gazdType")].getElementsByTagName("span")[1].innerText.replace(/\./g, ''));
		var curr_va=parseInt(tempike[i].cells[getOszlopNo("gazdType")].getElementsByTagName("span")[2].innerText.replace(/\./g, ''));
		if (curr_fa>kritp || curr_fa<krintp2 || curr_ag>kritp || curr_ag<krintp2 || curr_va>kritp || curr_va<krintp2){
			var uj=true;
		} else {
			var uj=false;
		}
		if (halmaz(regi,uj)) tempike[i].setAttribute("style","display:line"); else tempike[i].setAttribute("style","display:none");
	}
	szamlal();
}catch(e){alert("Hiba\n"+e);}}

function prettyNumberPrint(num) {
	var ret = num.toLocaleString().match(/[0-9]+/g).join('.');
	return num<0?'-'+ret:ret;
}
function load(){try{
	showGazdView();
	if (getOszlopNo("gazdType") > 0) return;
	var x=document.getElementById("production_table").rows;
	var nyersRendez=document.createElement("div");
	nyersRendez.innerHTML+= '<a href="javascript:rendez(false, \'wood\', \'gazdType\')"><span class="res wood"></span></a>';
	nyersRendez.innerHTML+= '<a href="javascript:rendez(false, \'stone\', \'gazdType\')"><span class="res stone"></span></a>';
	nyersRendez.innerHTML+= '<a href="javascript:rendez(false, \'iron\', \'gazdType\')"><span class="res iron"></span></a>';
	nyersRendez.innerHTML+= '&nbsp;&nbsp;&nbsp;<img src="'+BASE_URL+'graphic/buildings/market.png" title="Kritikus nyersanyagkülönbségek listázása" onclick="krit()">';
	for (i=0;i<x.length;i++){
		x[i].cells[getOszlopNo("nyers")].style.display = "none";
		var newCell = x[i].insertCell(getOszlopNo("nyers")+1);
		if (i==0) {
			newCell.setAttribute("id", "gazdType");
			newCell.setAttribute('style', 'text-align:center');
			newCell.innerHTML = '<p id="gazd_title" style="margin-bottom:0">Nyersanyag különbségek</p>';
			newCell.appendChild(nyersRendez);
		}
	}
	var nyersG = loadGazdView('AVG_RELATIVE'); /*Array: fa, agyag, vas, max_nyers*/
	
	try{
	var newline=x[0].insertCell(getOszlopNo("gazdType")+1);
	newline.outerHTML='<th id="nyersdiagam" style="width: 300px"><a href="javascript: rendez(true, \'\', \'nyersdiagam\')"><b>Összes nyersanyag</b></a></th>';
	for (i=1;i<nyersG.nyersek.length;i++){
		newline=x[i].insertCell(getOszlopNo("gazdType")+1);
		newline.style.position = 'relative';
		newline.innerHTML = '<div style="background-color: #0C0; height: 10px; width: '+Math.round((nyersG.nyersek[i]/nyersG.osszNyers[3])*300)+'px"></div><div style="position: absolute; top: 4px; left: 7px; text-shadow: 0px 0px 4px black; color:white;">'+prettyNumberPrint(nyersG.nyersek[i])+'</div>';
	}}catch(e){alert(e);}
	
	var newNode=document.createElement("div");
	var x2=document.getElementById("content_value");
	newNode.setAttribute("align","center");
	newNode.setAttribute("id","csoportNyers");
	newNode.innerHTML="";
	x2.insertBefore(newNode,x2.childNodes[1]);
	
	newNode=document.createElement("div");
	newNode.setAttribute("align","center");
	newNode.innerHTML="Összes nyersanyag: "+'<img src="'+picT('holz')+'"> '+prettyNumberPrint(nyersG.osszNyers[0])+
	' <img src="'+picT('lehm')+'"> '+prettyNumberPrint(nyersG.osszNyers[1])+
	' <img src="'+picT('eisen')+'"> '+prettyNumberPrint(nyersG.osszNyers[2]);
	x2.insertBefore(newNode,x2.childNodes[1]);
	szamlal();
	
	}catch(e){alert(e);}
	
	function showGazdView() {
		var iHTML = '<form name="gazdForm"><table id="gazdViewTable" cellspacing="0" cellpadding="5">\
		<tr><td>Eredeti nézet</td><td><input type="radio" name="gazdType" value="ORIGINAL">Eredeti nyersanyagok mutatása</td>\
		<tr><td>Átlaghoz képest</td><td>\
			<input type="radio" name="gazdType" value="G_AVG_RELATIVE">Összes falud átlagnyerségez képest<br>\
			<input type="radio" name="gazdType" checked value="AVG_RELATIVE">Aktuális falu átlagnyerséhez képest<br>\
			<input type="radio" name="gazdType" value="C_AVG_RELATIVE">Jelenlegi csoport átlagnyerséhez képest<br>\
		</td></tr>\
		\
		<tr><td>Üzleti nézet, 1:1 arányú<br>\
		<select name="business_mode"><option value="local">Helyi piac</option><option value="sector">Csoport-piac</option><option value="global">Globál-piac</option></select>\
		</td><td>\
		  <input type="radio" name="gazdType" value="FA_BUSINESS"><span class="res wood">&nbsp;&nbsp;&nbsp;&nbsp;</span> Fát akarok venni<br>\
		  <input type="radio" name="gazdType" value="AGYAG_BUSINESS"><span class="res stone">&nbsp;&nbsp;&nbsp;&nbsp;</span> Agyagot akarok venni<br>\
		  <input type="radio" name="gazdType" value="VAS_BUSINESS"><span class="res iron">&nbsp;&nbsp;&nbsp;&nbsp;</span> Vasat akarok venni<br>\
		</td></tr>\
		\
		<tr><td>Globális nyershez képest<br>(Globál balance)</td><td>\
		  <input type="radio" name="gazdType" value="G_FA_RELATIVE"><span class="res wood">&nbsp;&nbsp;&nbsp;&nbsp;</span> 1 falura vetített átlagos fához képest<br>\
		  <input type="radio" name="gazdType" value="G_AGYAG_RELATIVE"><span class="res stone">&nbsp;&nbsp;&nbsp;&nbsp;</span> 1 falura vetített átlagos agyaghoz képest<br>\
		  <input type="radio" name="gazdType" value="G_VAS_RELATIVE"><span class="res iron">&nbsp;&nbsp;&nbsp;&nbsp;</span> 1 falura vetített átlagos vashoz képest<br>\
		</td></tr>\
		\
		<tr><td>Csoport nyerséhez képest<br>(Csoport-balance)</td><td>\
		  <input type="radio" name="gazdType" value="C_FA_RELATIVE"><span class="res wood">&nbsp;&nbsp;&nbsp;&nbsp;</span> Csoportátlagos nyerskülönbség, fa szerint<br>\
		  <input type="radio" name="gazdType" value="C_AGYAG_RELATIVE"><span class="res stone">&nbsp;&nbsp;&nbsp;&nbsp;</span> Csoportátlagos nyerskülönbség, agyag szerint<br>\
		  <input type="radio" name="gazdType" value="C_VAS_RELATIVE"><span class="res iron">&nbsp;&nbsp;&nbsp;&nbsp;</span> Csoportátlagos nyerskülönbség, vas szerint<br>\
		</td></tr>\
		</table></form>\
		<button type="button" onclick="updateGazdView()">\
		 Nézet frissítése\
		</button>';
		
		displayMessage('Gazdasági analízis nézet', iHTML);
		document.forms['gazdForm'].gazdType.value = GAZDTYPE;
	}
}
function updateGazdView() {
	loadGazdView(document.forms['gazdForm'].gazdType.value)
}
function loadGazdView(type) {try{
	var osszNyers = [0, 0, 0, 0];
	var nyersek=['0'];
	var fa, agyag, vas, AVG, isRun;
	var no = 0;
	if (type.indexOf("AGYAG") > -1) no = 1;
	if (type.indexOf("VAS") > -1) no = 2;
			
	var x=document.getElementById("production_table").rows;
	console.info(type);
	switch (type) {
		case 'AVG_RELATIVE':
			osszNyers = getAllNyers(false);
			osszNyers[3] = 0;
			for (i=1;i<x.length;i++) {
				var M=getFaluNyers(x[i].cells[getOszlopNo("nyers")].childNodes);
				AVG=Math.round((M.fa+M.agyag+M.vas)/3);
				x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([M.fa-AVG, M.agyag-AVG, M.vas-AVG], 50000);
				nyersek[i]=M.fa+M.agyag+M.vas;
				if (nyersek[i]>osszNyers[3]) osszNyers[3]=nyersek[i];
			}
			return {
				osszNyers: osszNyers,
				nyersek: nyersek
			};
		case 'G_AVG_RELATIVE':
			osszNyers = getAllNyers(false);
			AVG = [Math.round(osszNyers[0] / (x.length - 1)), Math.round(osszNyers[1] / (x.length - 1)), Math.round(osszNyers[2] / (x.length - 1))];
			for (i=1;i<x.length;i++) {
				var M=getFaluNyers(x[i].cells[getOszlopNo("nyers")].childNodes);
				x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([M.fa-AVG[0], M.agyag-AVG[1], M.vas-AVG[2]], 50000);
			}
			break;
		case 'C_AVG_RELATIVE':
			osszNyers = getAllNyers(true);
			var xLength = szamlal();
			AVG = [Math.round(osszNyers[0] / xLength), Math.round(osszNyers[1] / xLength), Math.round(osszNyers[2] / xLength)];
			for (i=1;i<x.length;i++) {
				if (x[i].style.display == 'none') {x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([0, 0, 0], 1); continue;}
				var M=getFaluNyers(x[i].cells[getOszlopNo("nyers")].childNodes);
				x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([M.fa-AVG[0], M.agyag-AVG[1], M.vas-AVG[2]], 50000);
			}
			break;
		case 'FA_BUSINESS':
			var business_mode = document.forms['gazdForm'].business_mode.value;
			AVG = getBusinessRes(business_mode);
			for (i=1;i<x.length;i++) {
				var M=getFaluNyers(x[i].cells[getOszlopNo("nyers")].childNodes);
				if (business_mode == 'local') AVG=Math.round((M.fa+M.agyag+M.vas)/3);
				if (M.fa-AVG > 0) {
					x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([0, 0, 0], 50000);
				} else {
					var kiir = [M.agyag-AVG, M.vas-AVG];
					x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([0, kiir[0]<0?0:kiir[0], kiir[1]<0?0:kiir[1]], 50000);					
				}
			}
			break;
		case 'AGYAG_BUSINESS':
			var business_mode = document.forms['gazdForm'].business_mode.value;
			AVG = getBusinessRes(business_mode);
			for (i=1;i<x.length;i++) {
				var M=getFaluNyers(x[i].cells[getOszlopNo("nyers")].childNodes);
				if (business_mode == 'local') AVG=Math.round((M.fa+M.agyag+M.vas)/3);
				var kiir = [M.fa-AVG, M.vas-AVG];
				if (M.agyag-AVG > 0) {
					x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([0, 0, 0], 50000);
				} else {
					x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([kiir[0]<0?0:kiir[0], 0, kiir[1]<0?0:kiir[1]], 50000);
				}
			}
			break;
		case 'VAS_BUSINESS':
			var business_mode = document.forms['gazdForm'].business_mode.value;
			AVG = getBusinessRes(business_mode);
			for (i=1;i<x.length;i++) {
				var M=getFaluNyers(x[i].cells[getOszlopNo("nyers")].childNodes);
				if (business_mode == 'local') AVG=Math.round((M.fa+M.agyag+M.vas)/3);
				if (M.vas-AVG > 0) {
					x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([0, 0, 0], 50000);
				} else {
					var kiir = [M.fa-AVG, M.agyag-AVG];
					x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([kiir[0]<0?0:kiir[0], kiir[1]<0?0:kiir[1], 0], 50000);
				}
			}
			break;
		case 'G_FA_RELATIVE': case 'G_AGYAG_RELATIVE': case 'G_VAS_RELATIVE':
			osszNyers = getAllNyers(false);
			AVG = Math.round(osszNyers[no] / (x.length - 1));
			isRun = true;
		case 'C_FA_RELATIVE': case 'C_AGYAG_RELATIVE': case 'C_VAS_RELATIVE':
			if (!isRun) {
				osszNyers = getAllNyers(true);
				AVG = Math.round(osszNyers[no] / szamlal());
			}
			for (i=1;i<x.length;i++) {
				var M=getFaluNyers(x[i].cells[getOszlopNo("nyers")].childNodes);
				x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([M.fa-AVG, M.agyag-AVG, M.vas-AVG], 50000);
			}
			break;
		case 'ORIGINAL':
			for (i=1;i<x.length;i++) {
				var M=getFaluNyers(x[i].cells[getOszlopNo("nyers")].childNodes);
				x[i].cells[getOszlopNo("gazdType")].innerHTML = convertGCell([M.fa, M.agyag, M.vas], 200000);
			}
			break;
		default: alert("Ez a nézet nem elérhető"); return;
	}
	GAZDTYPE = type;
	
	function getFaluNyers(t) {
		return {
			fa: parseInt(t[0].innerHTML.replace(/[^0-9]+/g,"")),
			agyag: parseInt(t[2].innerHTML.replace(/[^0-9]+/g,"")),
			vas: parseInt(t[4].innerHTML.replace(/[^0-9]+/g,""))
		}
	}
	function convertGCell(nyersek, threshold) {
		if (nyersek[0] > threshold || nyersek[0] < -threshold) nyersek[0] = '<b>'+prettyNumberPrint(nyersek[0])+'</b>'; else nyersek[0] = prettyNumberPrint(nyersek[0]);
		if (nyersek[1] > threshold || nyersek[1] < -threshold) nyersek[1] = '<b>'+prettyNumberPrint(nyersek[1])+'</b>'; else nyersek[1] = prettyNumberPrint(nyersek[1]);
		if (nyersek[2] > threshold || nyersek[2] < -threshold) nyersek[2] = '<b>'+prettyNumberPrint(nyersek[2])+'</b>'; else nyersek[2] = prettyNumberPrint(nyersek[2]);
		return '<span class="res wood">'+nyersek[0]+'</span>' + ' <span class="res stone">'+nyersek[1]+'</span>' + ' <span class="res iron">'+nyersek[2]+'</span>'
	}
	function getBusinessRes(business_mode) {
		var osszNyers;
		if (business_mode == 'sector') {
			var xLength = szamlal();
			osszNyers = getAllNyers(true);
			return Math.round((osszNyers[0] + osszNyers[1] + osszNyers[2]) / (xLength * 3));
		}
		if (business_mode == 'global') {
			osszNyers = getAllNyers(false);
			return Math.round((osszNyers[0] + osszNyers[1] + osszNyers[2]) / ((x.length -1) * 3));
		}
	}
} catch(e){alert("NEM JÓÜ -- FIXME" + e);}}
function getAllNyers(isCsop) {try{ /* Returns array: [fa, agyag, vas]*/
	var ret = [0, 0, 0];
	var x=document.getElementById("production_table").rows;
	for (i=1;i<x.length;i++) {
		if (x[i].style.display == 'none' && isCsop) continue;
		var M=x[i].cells[getOszlopNo("nyers")].childNodes;
		ret[0]+=parseInt(M[0].innerHTML.replace(/[^0-9]+/g,""));
		ret[1]+=parseInt(M[2].innerHTML.replace(/[^0-9]+/g,""));
		ret[2]+=parseInt(M[4].innerHTML.replace(/[^0-9]+/g,""));
	}
	return ret;
}catch(e){console.error('Érvénytelen nyersnézet, vélhetőleg átalakított'); return [0,0,0];}}
function convertView(){
	if (!game_data.player.premium) return;
	if (game_data.player.converted) return;
	var X=document.getElementById("production_table").rows;
	var patt=/[0-9]+(\|)[0-9]+/g;
	var delCol=new Array();
	var hossz=X[1].cells.length;
	if (!patt.test(X[1].cells[0].textContent)) {
		delCol.push(0);
		for (var i=7;i<hossz;i++){
			delCol.push(i);
		}
	} else {
		for (var i=6;i<hossz;i++){
			delCol.push(i);
		}
	}
	X = document.getElementById("production_table");
    for (i = 0; i < X.rows.length; i++) {
		for (var j=delCol.length-1;j>-1;j--){
			X.rows[i].deleteCell(delCol[j]);
		}
    }
}

function createView(){
	function setOszlopIds() {
		var X = document.getElementById("production_table").rows;
		var regexpBase = {
			falunev: 'order=name',
			pont: 'order=points',
			nyers: /(wood)(.)*(stone)(.)*(iron)/g,
			raktar: 'order=storage',
			tanya: 'order=pop',
			kereskedo: 'order=trader_available'
		};
		var oszlop2Remove = [];
		
		for (var i=0;i<X[1].cells.length;i++) {
			var type = '';
			if (X[0].cells[i].getElementsByTagName('a').length > 0) {
				if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.falunev) > -1) type="falunev";
				else if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.pont) > -1) type="pont";
				else if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.raktar) > -1) type="raktar";
				else if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.tanya) > -1) type="tanya";
				else if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.kereskedo) > -1) type="kereskedo";
			}
			else if (X[1].cells[i].innerHTML.match(regexpBase.nyers)) type="nyers";
			
			if (type==='') oszlop2Remove.push(i); else X[0].cells[i].setAttribute('id', type);
		}
		toNonPF(oszlop2Remove);
		
		function toNonPF(oszlop2Remove) {try{
			X=document.getElementById("production_table");
				for (var i=0;i<X.rows.length;i++){
					for (var j=oszlop2Remove.length-1;j>-1;j--) {
						X.rows[i].deleteCell(oszlop2Remove[j]);
					}
				}
		}catch(e){alert(e);}}
	}
	function setRendezLinks() {
		var headers = document.getElementById("production_table").rows[0].cells;
		headers[getOszlopNo('falunev')].getElementsByTagName('a')[0].href='javascript:rendez(true, "", "falunev")';
		headers[getOszlopNo('pont')].getElementsByTagName('a')[0].href='javascript:rendez(false, "", "pont")';
		headers[getOszlopNo('raktar')].getElementsByTagName('a')[0].href='javascript:rendez(false, "", "raktar")';
		if (getOszlopNo('kereskedo') > -1) headers[getOszlopNo('kereskedo')].getElementsByTagName('a')[0].href='javascript:rendez(false, "", "kereskedo")';
		headers[getOszlopNo('tanya')].getElementsByTagName('a')[0].href='javascript:rendez(false, "", "tanya")';
		
		var nyersRendez=document.createElement("div");
		nyersRendez.setAttribute("style", "display: inline; padding-left: 7px");
		nyersRendez.innerHTML = '<a href="javascript:rendez(false, \'wood\', \'nyers\')"><span class="res wood"></span></a>';
		nyersRendez.innerHTML+= '<a href="javascript:rendez(false, \'stone\', \'nyers\')"><span class="res stone"></span></a>';
		nyersRendez.innerHTML+= '<a href="javascript:rendez(false, \'iron\', \'nyers\')"><span class="res iron"></span></a>';
		headers[getOszlopNo('nyers')].appendChild(nyersRendez);
	}
	setOszlopIds(); /*Oszlopok neveinek rugalmassá alakítása*/
	setRendezLinks(); /*Átalakítja a linkeket belső rendezésesre*/
	
	var gazdasag=document.getElementById("production_table").rows[0].cells[getOszlopNo("falunev")];
	gazdasag.innerHTML='<a href="javascript:load();"><img width=30px" title="Gazdasági nézet: Nyerskülönbségek és diagramok" src="'+pic('gazd')+'"></a>'+gazdasag.innerHTML;
	game_data.player.converted=true;
	
	var csop_uzi=document.createElement("div");
	csop_uzi.setAttribute("id","uzi");
	csop_uzi.setAttribute("style","display: none; width: auto; background-color: #60302b; color: yellow; position: fixed; left: 60%; top:250px; border:3px solid black; padding: 10px; z-index:10;");
	document.getElementById("content_value").appendChild(csop_uzi);
    newNode=document.createElement("csoportok");
    x=document.getElementById("content_value");
    x.insertBefore(newNode,x.firstChild);
    x.childNodes[0].innerHTML=' <table><tr><td id="tools" width="200px"></td><td style="border: 1px solid black" id="defaults" width="245px">\
	<b><u>Alap\u00E9rtelmezett csoportok</u></b><br><br><a href=\'javascript: Dcsoport("ossz")\' title="Összes falu megjelenítése">Összes</a>&nbsp;&nbsp;\
	<a href=\'javascript: Dcsoport("tanya")\' title="Tanya lakosság alapján való szűkítés">Tanya</a><img onclick=mod(1) id="D_tanya" title="" src="'+pic("e_modify")+'">&nbsp;&nbsp;\
	<a href=\'javascript: Dcsoport("raktar")\' title="Raktár telítettsége alapján való szűkítés (legnagyobb értékű nyersanyag alapján)">Raktár</a><img onclick=mod(2) id="D_raktar" title="" src="'+pic("e_modify")+'">&nbsp;&nbsp;\
	<a href=\'javascript: Dcsoport("pont")\' title="Pontérték alapján való listaszűkítés"\'>Pont</a><img onclick=mod(3) id="D_pont" title="" src="'+pic("e_modify")+'"><br>\
	<a href=\'javascript: Dcsoport("tamad")\'><img title="Támadás alatt áll faluk kilistázása" src="'+picT("att")+'"></a>&nbsp;&nbsp;\
	<a href=\'javascript: Dcsoport("regexp")\' title="Reguláris kifejezéssel megadott listaszűkítés">RegExp</a>&nbsp;&nbsp;\
	<a href=\'javascript: Dcsoport("headtail")\' title="Első/utolsó X falu listázása. A jelenleg látott listával dolgozik!">Fej/Láb</a>&nbsp;&nbsp;\
	<a href=\'javascript: Dcsoport("RND")\' title="Véletlenszerűen kiválaszt a listából megadott számú falut. A jelenleg látott listából választ!">RND</a>\
	<img onclick=\'Dcsoport("grafgomb")\' style="cursor:pointer" alt="GG" title="Gráfgömböc" src=\''+pic("grafgomboc")+'\'>\
	&nbsp;<img onclick="smasher(false)" style="cursor:pointer;width:20px" alt="FK" title="Faluhálózat/csomópont kereső" src="'+pic("smasher_finder")+'" >\
	</td><td id="group" style="line-height:200%;"></td></tr></table>';
    var T=document.getElementById("tools");
    var D=document.getElementById("defaults");
    var G=document.getElementById("group");

     T.innerHTML='<a href=\'javascript: megnyit();\'><img src="'+pic("2_all")+'" alt="N" title="Minden falu megnyitása"></a>\n\
        	<img src="'+picT("barracks")+'"	title="Kiképzések megnyitása"/ '+iskivalaszt("train")+' onclick=ModOpenType(this,"train")>\n\
			<img src="'+picT("farm")+'"		title="Áttekintések megnyitása"/ '+iskivalaszt("overview")+' onclick=ModOpenType(this,"overview")>\n\
			<img src="'+picT("market")+'"	title="Piacok megnyitása"/ '+iskivalaszt("market")+' onclick=ModOpenType(this,"market")>\n\
			<img src="'+picT("main")+'"		title="F\u0151hadiszállások megnyitása"/ '+iskivalaszt("main")+' onclick=ModOpenType(this,"main")>\n\
			<img src="'+picT("snob")+'"		title="Akadémiák megnyitása"/ '+iskivalaszt("snob")+' onclick=ModOpenType(this,"snob")>\n\
            <img src="'+picT("place")+'"	title="Gyülekez\u0151helyek/parancsok megnyitása"/ '+iskivalaszt("place")+' onclick=ModOpenType(this,"place")>\n\
			<img src="'+picT("place")+'"	title="Gyülekez\u0151helyek/sereg megnyitása"/ '+iskivalaszt("place&mode=units")+' onclick=ModOpenType(this,"place&mode=units")>\n\
			<img src="'+pic("flag")+'"	title="Zászlók helyének megnyitása"/ '+iskivalaszt("flags")+' onclick=ModOpenType(this,"flags")>\n\
			<br><hr>\
			<img src="'+pic("metszet")+'" alt="∩" onclick=sethalmaz("metszet") title="Metszetképzés. A következőleg kiválasztott csoportból csak azon faluk fognak szerepelni, amik most is láthatóak.">\
			<img src="'+pic("unio")+'" alt="∪" onclick=sethalmaz("unio") title="Unióképzés. A jelenlegi listához hozzáadja a következőleg kiválasztott csoport faluit.">\
			<img src="'+pic("kulonbseg")+'" alt="/" onclick=sethalmaz("kulonbseg") title="Különbségképzés. A jelenlegi listából kiveszi a következőleg kiválasztott lista faluit.">\
			<img src="'+pic("negalt")+'" alt="¬" onclick=sethalmaz("negalt") title="Negációképzés. A jelenleg látott listát megfordítja.">\
			<img src="'+pic("negalt2")+'" alt="¬2" onclick=sethalmaz("negalt2") title="Negáció2* képzés. Egy másik halmazműveletet is kell utána választani. Ezt követően kiválasztott csoport negáltjával fog dolgozni.\n(csoport) <művelet> negált(csoport)">\
			<img src="'+pic("2_separator")+'">\
			<img src="'+pic("politavolsag2")+'" alt=">>" onclick="politavolsag(false)" title="Több faluhoz mért távolságokat számít.">\
			<a href=\'javascript: centerFinder();\'><img alt="HV" src="'+pic("centerSearch")+'" title="Hálózatvizsgáló"></a>\
			<a href=\'javascript: warningMeter(false);\'><img alt="VI" src="'+pic("warning")+'" title="Veszély indikátor"></a>\
			<br>\
			<a href=\'javascript: ujcsoport();\'><img src="'+pic("uj")+'" alt="+" title="Új csoport felvétele"></a>\
			<a href=\'javascript: if (KIVALASZTOTT!="") szerkeszt();\'><img alt="E"  src="'+pic("szerk")+'" title="Kiválasztott csoport szerkesztése"></a>\
			<a href=\'javascript: atnevez();\'><img alt="R" src="'+pic("2_rename")+'" title="Kiválasztott csoport átnevezése"></a>\
			<a href=\'javascript: torol();\'><img alt="X" src="'+pic("2_delete")+'" title="Kiválasztott csoport törlése"></a>\
			<img src="'+pic("2_separator")+'">\
			<a href=\'javascript: mentes();\'><img alt="S" src="'+pic("save")+'" title="Jelenleg látott lista csoportba mentése"></a>\
			<a href=\'javascript: szinez();\'><img alt="C" src="'+pic("colorize")+'" title="Jelenleg látott lista színezése véletlenszerű színnel"></a>\
			<a href=\'javascript: kivag();\'><img alt="->" src="'+pic("cut_16")+'" title="A jelenleg nem látott falukat törli az oldal listájából, így semmi más nem fogja ezentúl látni azokat! (Az adatok nem törlődnek)"></a>\
			<a href=\'javascript: massRename();\'><img alt="E" src="'+pic("rename")+'" title="Tömeges faluátnevező"></a>\
			<br>\
            <a href=\'javascript: manager("exp");\'><img alt="Exp" src="'+pic("2_exp")+'" title="Adatok Exportálása"></a>\
            <a href=\'javascript: manager("imp");\'><img alt="Imp" src="'+pic("2_imp")+'" title="Adatok importálása"></a>\
            <a href=\'javascript: manager("del");\'><img alt="DEL" src="'+pic("2_delall")+'" title="ADATMEGSEMMISÍTÉS (minden elvész)"></a>\
			<img src="'+pic("2_separator")+'">\
			<a href=\'javascript: toredezett();\'><img alt="Defr" src="'+pic("defrag")+'" title="Adategyeztetés: olyan faluk törlése a csoportod lementéséből, melyek nem léteznek (mert pl. elfoglalták)"></a>\
			<a href=\'javascript: addExFalu();\'><img alt="Falu+" src="'+pic("switchVillages")+'" height="16px" title="Külső faluk hozzáadása saját listádhoz"></a>';
	document.getElementById("production_table").rows[0].cells[0].innerHTML+=' Export &rarr; <a href="javascript: falulista_export(\'BB\');">BB</a>|<a href="javascript: falulista_export(\'ujsor\');">Soronként</a>|<a href="javascript: falulista_export(\'egysor\');">Egy sorba</a>. <a href="javascript: falulista_import()">Import</a>';
	document.getElementById("header_info").innerHTML+='<p style="margin: 0" id="halmazallapot">Halmazművelet: <b>---</b><br>Negált 2? <b>false</b></p>';
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML =  ".cnc_toolTip { position: relative; }\
		.cnc_toolTip .cnc_toolTipText { visibility: hidden; width: auto; pointer-events: none; background-color: rgba(0,0,0,0.75); color: #fff; border-radius: 6px; padding: 6px 10px 8px 8px; position: absolute; z-index: 1; bottom: 110%; left: 82px; margin-left: -60px; }\
		.cnc_toolTip .cnc_toolTipText ul { padding-left: 20px; margin-top: 5px; margin-bottom: 0px;}\
		.cnc_toolTip .cnc_toolTipText::after { content: ''; position: absolute; top: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: rgba(0,0,0,0.75) transparent transparent; }\
		.cnc_toolTip.cnc_toolTip_right .cnc_toolTipText::after { left: 70% }\
		.cnc_toolTip:hover .cnc_toolTipText { visibility: visible; }\
		.cnc_toolTip.cnc_toolTip_middle .cnc_toolTipText { left: 0; }\
		.cnc_toolTip.cnc_toolTip_right .cnc_toolTipText { left: inherit; right: 0; margin:0; }\
		.tavTable td { background: initial !important; }";
	document.getElementById("content_value").appendChild(css);
	
	for (var i=1;i<document.getElementById("production_table").rows.length;i++){
		var csop_elotagok=document.createElement("img");
		csop_elotagok.setAttribute("onclick","szinez1(this)");
		csop_elotagok.setAttribute("src",pic("pin"));
		csop_elotagok.setAttribute("alt","Pin It!");
		csop_elotagok.setAttribute("title","Pin It!");
		document.getElementById("production_table").rows[i].cells[0].insertBefore(csop_elotagok,document.getElementById("production_table").rows[i].cells[0].childNodes[0]);
		document.getElementById("production_table").rows[i].cells[0].setAttribute('class', 'cnc_toolTip');
		csop_elotagok=document.createElement("span");
		csop_elotagok.setAttribute('class', 'cnc_toolTipText');
		csop_elotagok.innerHTML = '1. falu<br><strong>Csoportok:</strong><ul><li>Védő</li><li>Támadó</li><li>Nemes</li><li>Templom</li></ul>';
		document.getElementById("production_table").rows[i].cells[0].appendChild(csop_elotagok);
		csop_elotagok=document.createElement("input");
		csop_elotagok.setAttribute("type","checkbox");
		csop_elotagok.setAttribute("style","display:none");
		document.getElementById("production_table").rows[i].cells[0].insertBefore(csop_elotagok,document.getElementById("production_table").rows[i].cells[0].childNodes[0]);
	}
}

try{
	var TABHELPER, TABHELPER_LIST, openedREFS;
	convertView();
	
	/*Süti analizálás*/
	suti=getCookie("cnc_csoport");
	if (suti==null || suti=="" ) {alert("Első indítás!\n Nem érzékeltem lementett csoportleosztást."); setCookie("cnc_csoport","overview;23000;80;8500");}
	suti=getCookie("cnc_csoport");
	if (suti.split(";").length<4) {alert("Az értékelt csoportfelosztás szerkezetileg helytelen:\n"+suti+"\n\nEz a lementés törlésre kerül, és új generálódik."); setCookie("cnc_csoport","overview;23000;80;8500");}
	var KIVALASZTOTT=""; var OPENTYPE=suti.split(";")[0]; var ISHALMAZ=""; var NEG2=false;
	
	createView();
	
	/*Setting up Global Variable*/
	var G=document.getElementById("group");	
	var T=document.getElementById("tools");
	var D=document.getElementById("defaults");
	var BASE_URL=document.location.href.split("game.php")[0];
	var CONFIG=loadXMLDoc(BASE_URL+"interface.php?func=get_config");
	var ARCHERS=CONFIG.getElementsByTagName("archer")[0].textContent; if (ARCHERS=="0") ARCHERS=false; else ARCHERS=true;
	var SPEED=CONFIG.getElementsByTagName("speed")[0].textContent;
	var UNITS=CONFIG.getElementsByTagName("unit_speed")[0].textContent;
	
	frissit();
	szamlal();
	GAZDTYPE = 'AVG_RELATIVE';
} catch(e){alert("Hiba indításkor \n"+e);}

$(document).ready(function(){
	$( "#uzi" ).draggable({handle: "#uzi_drag"});
	$(":checkbox").change(function(){try{
		var Oszlop=getOszlopNo("falunev");
		var ThisOszlop=$(this).parent().children().index($(this));
		if (KIVALASZTOTT!="" && Oszlop==ThisOszlop){
			koord=this.parentNode.innerText.match(/[0-9]+(\|)[0-9]+/g);
			koord=koord[koord.length-1];
			addFalu(koord);
		}
	} catch(e){alert("Hiba bejelöléskor\n"+e);}});
});

void(0);