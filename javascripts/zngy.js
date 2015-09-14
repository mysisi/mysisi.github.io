/**
 * Defination
 * Author: Sisiliu
 * Date: 2015/9/9.
 */

$(function (){
    
    var setRem=function () {
        var clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            fontSize = 30;
        var nowRem = clientWidth*fontSize / 640;
        $("html").css("font-size", nowRem + "px");
    };
    onresize = setRem;
    setRem();

    $("#blackmask").css("width",$(window).width());
    $("#blackmask").css("height",$(window).height()+$(window).height());
    //关闭弹窗
    $(".popwrap").on("click",".pop-close",function(e){
        $(this).parents(".popwrap").css("display","none");
        $("#blackmask").css("display","none");
        isSroll=0;
    });
    //验证
    $("#validate").on("click",validate);
    //报名
    $("#submit").on("click",function(){
        checkInfo();
    });
    //邀请好友
    $("#yaoqing").on("click",function(){
        //判断是不是微信
        if(isWeiXin()){
            $("#blackmask").css("display","block");
            isSroll=1;
        }
    });
    //TODO 点哪里消失
    $("#blackmask").on("click",function(){
        $(this).hide();
        $(".popwrap").hide();
        isSroll=0;
    });
    if(!isWeiXin()){
        $(".share-icon").css("visibility","hidden");
    }

    var $infoList = $("#info-content");
    var wait = 300;
    var isSroll=0;

    document.addEventListener('touchmove', function(event) {
        //判断条件,条件成立才阻止背景页面滚动,其他情况不会再影响到页面滚动
        if(isSroll){
            event.preventDefault();
        }
    });

    function checkInfo(){
        var tag = 0;
        var username=$($infoList).find("li.info-name input").val();
        var qqNumber=$($infoList).find("li.info-qq input").val();
        var telNumber=$($infoList).find("li.info-tel input").val();
        var authcode=$($infoList).find("li.info-code input").val();
        var recTel=$($infoList).find("li.info-rectel input").val();
        if(!checkChName(username)){
            $($infoList).find("li.info-name .info-tips").css("display","block");tag=1;
        }else{
            $($infoList).find("li.info-name .info-tips").css("display","none");
        }
        if(!checkQQNumber(qqNumber)){
            $($infoList).find("li.info-qq .info-tips").css("display","block");tag=1;
        }else{
            $($infoList).find("li.info-qq .info-tips").css("display","none");
        }
        if(!checkTelNumber(telNumber)){
            $($infoList).find("li.info-tel .info-tips").css("display","block");tag=1;
        }else{
            $($infoList).find("li.info-tel .info-tips").css("display","none");
        }
        if(!checkCode(authcode)){
            $($infoList).find("li.info-code .info-tips").css("display","block");tag=1;
        }else{
            $($infoList).find("li.info-code .info-tips").css("display","none");
        }
        if(recTel!=""&&(!checkTelNumber(recTel))){
            $($infoList).find("li.info-rectel .info-tips").html("手机号码不正确");
            $($infoList).find("li.info-rectel .info-tips").css("display","block");tag=1;
        }else if(recTel!=""&&recTel==telNumber){
            $($infoList).find("li.info-rectel .info-tips").html("填写本人电话无效");
            $($infoList).find("li.info-rectel .info-tips").css("display","block");tag=1;
        }else{
            $($infoList).find("li.info-rectel .info-tips").css("display","none");
        }
        //没有通过验证
        if(tag){
            return ;
        }else{
            //发送接口
            $.ajax({
                type: "get",
                dataType: 'jsonp',
                url: "http://wx.supin.58.com"+"/spactivity/saveWorkmate",
                data: {
                    username:username,
                    qq:qqNumber,
                    mobile:telNumber,
                    authcode:authcode,
                    referrerMobile:recTel
                },
                error: function(data) {
                },
                success: function(data) {
                    if(data.isSuccess){
                        submitInfo(data);
                    }else{
                        alert(data.returnMessage);
                    }
                }
            });
        }
    }

    function submitInfo(data){
        //成功 else 失败
        if(data.isSuccess){
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            if(data.entity.exist==0){
                $("#bmSucc").show();
            }else if(data.entity.exist==1){
                $("#twSucc").show();
            }

            $("#blackmask").show();
            isSroll=1;
            return ;
        }

    }
    //验证
    function validate(){
        var tel = $($infoList).find("li.info-tel input").val();
        if(tel==""||!(checkTelNumber(tel))){
            $($infoList).find("li.info-tel .info-tips").css("display","block");
            return ;
        }else{
            //发送接口
            $.ajax({
                type: "get",
                dataType: 'jsonp',
                url: "http://wx.supin.58.com"+"/spactivity/authcode",
                data: {
                    "mobile":  tel
                },
                error: function(data) {
                },
                success: function(data) {
                    if(data.isSuccess){
                        countDown($("#validate"));
                        $($infoList).find("li.info-tel .info-tips").css("display","none");
                    }else{
                        alert(data.returnMessage);
                    }
                }
            });
        }
    }
    function countDown(o){
        if(wait==0){
            $("#validate").on("click",validate);
            o.html("验证");
            wait=300;
        }else{
            $("#validate").off("click",validate);
            o.html(wait+"秒");
            wait--;
            setTimeout(function(){
                countDown(o);
            },1000);
        }
    }
    //校验电话号码
    function checkTelNumber(tel){
        var re=/(^1\d{10}$)/g;
        return re.test(tel);
    }
    //校验QQ号码
    function checkQQNumber(qq){
        var re=/^\d\d{0,9}\d$/g;
        return re.test(qq);
    }
    //校验汉字编码
    function checkChName(name){
        var re=/^[\u4E00-\u9fa5][\u4E00-\u9fa5]{0,2}[\u4E00-\u9fa5]$/g;
        return re.test(name);
    }
    //校验6位验证码
    function checkCode(code){
        var re=/([a-z]|[A-Z]|[0-9]){6}/g;
        return re.test(code);
    }

    //判断是不是微信浏览器
    function isWeiXin(){
        var ua = window.navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i) == 'micromessenger'){
            return true;
        }else{
            return false;
        }
    }
    //微信分享
    (function() {
        wx.config({
            debug: false,
            appId: "",
            timestamp: new Date().getTime(),
            nonceStr: "",
            signature: "",
            jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo", "onMenuShareQZone"]
        });

        wx.ready(function() {
            var wxconfig={
                title: "速聘喊你来领5Q币!",
                desc: "牛×工友成长计划，喊你来领5Q币！",
                link: location.href,
                imgUrl: "http://c.58cdn.com.cn/crop/zt/sp/pugong/img/share_icon.jpg",
                success: function(){
                },
                cancel: function() {
                }
            };
            wx.onMenuShareTimeline(wxconfig);
            wx.onMenuShareAppMessage(wxconfig);
            wx.onMenuShareQQ(wxconfig);
            wx.onMenuShareWeibo(wxconfig);
            wx.onMenuShareQZone(wxconfig);
        })
    })()

});