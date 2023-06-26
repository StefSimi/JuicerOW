const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const sass = require("sass");
const { eventNames } = require("process");
const jsonFile = path.join(__dirname,"Resources/json/galerie.json");
const {Client} = require('pg');
const AccesBD=require("./module_proprii/accesbd.js");
const formidable=require("formidable");
const {Utilizator}=require("./module_proprii/utilizator.js")
const session=require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");



AccesBD.getInstanta().select({
    tabel:"produse",
    campuri:["nume","pret"],
    conditiiAnd:["pret>30"]
},function(err,rez){
    console.log(err);
    console.log(rez);
})

var client =  new Client({database:"juicerow",
    user:"stef",
    password:"parola",
    host:"localhost",
    port:5432});
client.connect();
/*client.query("select * from produse",function(err,rez){
    console.log("Eroare BD",err);
    console.log("Rezultat BD",rez.rows);
});*/

obGlobal={
    obErr:null,
    obImg:null,
    folderScss: path.join(__dirname,"Resources/SCSS"),
    folderCss: path.join(__dirname,"Resources/CSS"),
    folderBackup: path.join(__dirname,"backup")
}

app=express();
console.log("Project folder: ",__dirname);
console.log("File path: ",__filename);
console.log("Working directory: ",process.cwd());

folderArray=["temp","temp1","backup"]
for(let folder of folderArray){
    let pathName=path.join(__dirname,folder);
    if(!fs.existsSync(pathName))
        fs.mkdirSync(pathName);
}
/*
function compileScc(scssPath,cssPath){
    if(!cssPath){
        let vectorCale = scssPath.split("\\");
        let numeFisExt=vectorCale[vectorCale.length-1];
        let numeFis=numeFisExt.split(".")[0];
        cssPath=numeFis+".css";
    }
    if(!path.isAbsolute(scssPath))
        scssPath=path.join(obGlobal.folderScss,scssPath);
    if(!path.isAbsolute(cssPath))
        cssPath=path.join(obGlobal.folderCss,cssPath);
    let vectorCale = cssPath.split("\\");
    let numeFisCss = vectorCale[vectorCale.length-1];
    if (fs.existsSync(cssPath)){
        fs.copyFileSync(cssPath,path.join(obGlobal.folderBackup,cssPath))
    }
    rez=sass.compile(scssPath,{"sourceMap":true})
    fs.writeFileSync(cssPath,rez.css)
    //console.log("scss comp",rez);
}
//compileScc("test.scss");

fs.watch(obGlobal.folderScss,function(eveniment,numeFis){
    console.log(eveniment,numeFis);
    if(eveniment=="change"||eveniment=="rename"){
        let caleCompleta = path.join(obGlobal.folderScss,numeFis);
        if(fs.existsSync(caleCompleta)){
            compileScc(caleCompleta);
        }
    }
})
*/
function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){
        // TO DO
        // let vectorCale=caleScss.split("\\")
        // let numeFisExt=vectorCale[vectorCale.length-1];
        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    
    // la acest punct avem cai absolute in caleScss si  caleCss
    //TO DO
    // let vectorCale=caleCss.split("\\");
    // let numeFisCss=vectorCale[vectorCale.length-1]
    let caleBackup=path.join(obGlobal.folderBackup,"Resources/CSS");
    if(!fs.existsSync(caleBackup))
        fs.mkdirSync(caleBackup,{recursive:true})

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup,numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    //console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
/*vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}*/


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})




app.set("view engine","ejs");

app.use("/Resources",express.static(__dirname+"/Resources"));
app.use("/node_modules",express.static(__dirname+"/node_modules"));

app.use(/^\/Resources(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function(req,res){
    shErr(res,403);
});


app.get("/produse",function(req, res){


    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul categ_prajitura
    client.query("select * from unnest(enum_range(null::tipuri_produse))",function(err,rezCategorie){
        if(err){
            console.log(err);
            shErr(res,2);
        }
        else{
            //console.log(rezCategorie);
            let conditieWhere=""; 
            if (req.query.tip)
                conditieWhere= ` where tip='${req.query.tip}'`;

            client.query("select * from produse "+conditieWhere , function( err, rez){
                console.log(300)
                if(err){
                    console.log(err);
                    shErr(res, 2);
                }
                else
                    res.render("Pages/produse", {produse:rez.rows, optiuni:rezCategorie.rows});
            });
        }


    })
        
        


});


app.get("/produs/:id",function(req, res){
    console.log(req.params);
   
    client.query(` select * from produse where id=${req.params.id} `, function( err, rezultat){
        if(err){
            console.log(err);
            shErr(res, 2);
        }
        else
            res.render("Pages/produs", {prod:rezultat.rows[0]});
    });
});


app.post("/inregistrare",function(req, res){
    var username;
    var poza;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){//4
        console.log("Inregistrare:",campuriText);

        console.log(campuriFisier);
        var eroare="";

        var utilizNou=new Utilizator();
        try{
            utilizNou.setareNume=campuriText.nume;
            utilizNou.setareUsername=campuriText.username;
            utilizNou.email=campuriText.email
            utilizNou.prenume=campuriText.prenume
            
            utilizNou.parola=campuriText.parola;
            utilizNou.culoare_chat=campuriText.culoare_chat;
            utilizNou.poza= poza;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru ,eroareUser ){
                if (eroareUser==-1){//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else{
                    eroare+="Mai exista username-ul";
                }

                if(!eroare){
                    res.render("Pages/inregistrare", {raspuns:"Inregistrare cu succes!"})
                    
                }
                else
                    res.render("Pages/inregistrare", {err: "Eroare: "+eroare});
            })
            

        }
        catch(e){ 
            console.log(e);
            eroare+= "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("Pages/inregistrare", {err: "Eroare: "+eroare})
        }
    



    });
    formular.on("field", function(nume,val){  // 1 
	
        console.log(`--- ${nume}=${val}`);
		
        if(nume=="username")
            username=val;
    }) 
    formular.on("fileBegin", function(nume,fisier){ //2
        console.log("fileBegin");
		
        console.log(nume,fisier);
		//TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser=path.join(__dirname, "poze_uploadate",username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
        poza=fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })    
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    }); 
});





/*
client.query("select * from unnest(enum_range(null::categ_prajitura))",function(err, rez){
    console.log(err);
    console.log(rez);
})
*/

app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/Resources/Assets/favicon.ico");
})

app.get("/test",function(req,res){
    res.send("testing123");
});

app.get(["/index", "/", "/home"],function(req,res){
    res.render("Pages/index",{imagini:obGlobal.obImg.imagini});
});

//app.get(/[a-zA-Z0-9]*\.ejs$/)
app.get("*.ejs",function(req,res){
    shErr(res,400);
})

app.get("/*",function(req,res){
    try{
        res.render("Pages"+req.url, function(err,resRender){
            if(err){
                console.log(err);
                if (err.message.startsWith("Failed to lookup view"))
                    //shErr(res, {_identificator:404,_titlu:"test"});
                    shErr(res,404);
                else
                    shErr(res);
                //res.send("Error");
            }
            else{
                console.log(resRender);
                res.send(resRender);
            }
        });
    }catch(err){
        if (err.message.startsWith("Cannot find module"))
            shErr(res,404); 
    }
});

function errInit(){
    var content = fs.readFileSync(__dirname+"/Resources/json/erori.json").toString("utf-8");
    obGlobal.obErr = JSON.parse(content);
    let vErr = obGlobal.obErr.info_erori;
    for(let err of vErr){
        err.imagine="/"+obGlobal.obErr.cale_baza+"/"+err.imagine;
    }

}
errInit();



function imgInit(){
    var content = fs.readFileSync(__dirname+"/Resources/json/galerie.json").toString("utf-8");
    obGlobal.obImg = JSON.parse(content);
    let vImg = obGlobal.obImg.imagini;
    let caleAbs = path.join(__dirname,obGlobal.obImg.cale_galerie);
    let caleAbsMed = path.join(caleAbs,"Med");
    if(!fs.existsSync(caleAbsMed))
        fs.mkdirSync(caleAbsMed);
    for(let imag of vImg){
        [numefis, ext]=imag.fisier.split(".");
        imag.fisier_mediu="/"+path.join(obGlobal.obImg.cale_galerie,"Med",numefis+".webp");
        let caleAbsFisMediu= path.join(__dirname,imag.fisier_mediu);
        sharp(path.join(caleAbs,imag.fisier)).resize(400).toFile(caleAbsFisMediu);

        imag.fisier="/"+path.join(obGlobal.obImg.cale_galerie,imag.fisier);
        
    }

}
imgInit();




function shErr(res, _identificator,_titlu,_text,_imagine){
    let vErr = obGlobal.obErr.info_erori;
    let err = vErr.find(function(elem){return elem.identificator==_identificator;});
    if (err){
        let titlu1= _titlu || err.titlu;
        let text1= _text || err.text;
        let imagine1= _imagine || err.imagine;
        if(err.status)
            res.status(err.identificator).render("Pages/eroare",{titlu:titlu1, text:text1, imagine:imagine1});
        else
            res.render("Pages/eroare",{titlu:titlu1, text:text1, imagine:imagine1});
    }
    else{
        let errDef= obGlobal.obErr.eroare_default;
        res.render("Pages/eroare",{titlu:errDef.titlu, text:errDef.text, imagine:obGlobal.obErr.cale_baza+"/"+errDef.imagine});
    }
}




app.listen(8080);
console.log("Server is up");