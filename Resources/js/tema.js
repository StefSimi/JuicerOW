let tema=localStorage.getItem("tema");
if(!tema){
    document.body.classList.add("tema","main");
}
if(tema){
    if(tema=="dark")
        document.body.classList.add("dark");
    if(tema=="third")
        document.body.classList.add("third");
    if(tema=="main")
        document.body.classList.add("main");
}
window.addEventListener("load",function(){
    document.getElementById("tema").onclick=function(){
        if(document.body.classList.contains("dark")){
            localStorage.setItem("tema","third")

            document.body.classList.remove("dark");
            document.body.classList.add("third");
            


            //localStorage.removeItem("tema");
        }
        else 
        if(document.body.classList.contains("third")){
            localStorage.setItem("tema","main");
            document.body.classList.remove("third");
            document.body.classList.add("main");
            
            /*
            document.body.classList.remove("third");
            localStorage.removeItem("tema");*/
            
        }
        else{
            document.body.classList.remove("main");
            document.body.classList.add("dark");
            //document.body.classList.add("dark");
            localStorage.setItem("tema","dark");
        }
    }
});