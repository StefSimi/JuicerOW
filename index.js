const express = require("express");
const fs = require("fs");
const path = require("path");

obGlobal={
    obErr:null,
    obImg:null
}

app=express();
console.log("Project folder: ",__dirname);
console.log("File path: ",__filename);
console.log("Working directory: ",process.cwd());

folderArray=["temp","temp1"]
for(let folder of folderArray){
    let pathName=path.join(__dirname,folder);
    if(!fs.existsSync(pathName))
        fs.mkdirSync(pathName);
}


app.set("view engine","ejs");

app.use("/Resources",express.static(__dirname+"/Resources"));

app.use(/^\/Resources(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function(req,res){
    shErr(res,403);
});

app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/Resources/Assets/favicon.ico");
})

app.get("/test",function(req,res){
    res.send("testing123");
});

app.get(["/index", "/", "/home"],function(req,res){
    res.render("Pages/index");
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