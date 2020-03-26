window.onerror = function(msg,url,line,col,error){
    if (msg != "Script error." && !url){
        return true;
    }
    if(url.indexOf(".js")==-1){
        return true;
    }
    setTimeout(function(){
        var data = {
            url: encodeURIComponent(url),
            line: encodeURIComponent(line),
            col: col || (window.event && window.event.errorCharacter) || 0
        };

        if (!!error && !!error.stack){
            data.msg = error.stack.toString();
        }else if (!!arguments.callee){
            var ext = [];
            var f = arguments.callee.caller, c = 3;
            while (f && (--c>0)) {
               ext.push(f.toString());
               if (f  === f.caller) {
                    break;//如果有环
               }
               f = f.caller;
            }
            ext = ext.join(",");
            data.msg = error.stack.toString();
        };
        data.msg = encodeURIComponent(data.msg);

        var api = "//moco.imooc.com/monitor/api/jslog.html?url="+data.url+"&line="+data.line+"&col="+data.col+"&msg="+data.msg;

        var xmlhttp;
        if (window.XMLHttpRequest){
            xmlhttp=new XMLHttpRequest();
        }else if (window.ActiveXObject){
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (xmlhttp!=null) {
            xmlhttp.onreadystatechange=function(){};
            xmlhttp.open("GET",api,true);
            xmlhttp.send();
        }
    },0);
    return true;
};