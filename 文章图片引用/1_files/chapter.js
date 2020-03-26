// 专栏阅读页   页面需要的juicer的模板HTML都在tpl.phtml中
define(function(require, exports, module) {
    require('lib/juicer/juicer.min.js');
    require('/static/page/course/common/course_tipoff.js'); //举报
    require('lib/jquery-qrcode/jquery.qrcode.min.js'); 
    // require("/static/lib/ueditor/ueditor.parse.js"); // 评论已不用UEditor
    require('/static/lib/lazyload/jquery.lazyload.js');
    require('/static/moco/v1.0/dist/js/moco.min.js'); //图片预览
    var reference = require('./common/reference.js'); // 抓取文章锚点
    // html中引入了该文件，此处引入会导致UE.parse方法被覆盖
    //require("/static/lib/ueditor/ueditor.final.min.js")
    // require("/static/lib/ueditor/themes/imooc/css/ueditor.css"); // 评论已不用UEditor
    var loadingCatalog = 0;
    var loadingComments = 0;
    var moVerify = '',token;
    var videoIndex = 0;
    var articleNum = 0;
    var afterScrollTop = 0;
    var Event = {
        // 是否展示空白页 未开放不可阅读
        judgeCanIn: function(canTaste,hasBuy,ifOpen,taste2pay) {
            // 是否可免登录试读 是否购买 是否开放 是否点击上下一节进入
            // 可试读
            if(canTaste == 0){
                console.log("可以试读")
                return true;
            }
            if(isLogin){
                if(hasBuy){
                    // 买了
                    if(ifOpen == 0){
                        // 开放的
                        console.log("买了开放的")
                        return true;
    
                    }else{
                        // 未开放弹窗提示等待
                        console.log("买了未开放");
                        $.alert("该课程正在创作中，请您耐心等候...",{
                            modal:true
                        })
                        return false;
                    }

                }else{
                    // 没买弹窗提示购买
                    console.log("没买不能试读")
                    Event.initBuyModal(taste2pay)
                    return false;
                }
            }else{
                // 未登录弹窗登录
                console.log("不能试读需要登录")
                $('#js-signin-btn').length && $('#js-signin-btn')[0].click();
                $(document).on("click",".rl-close", function() {
                    window.location.href = "/read/" + column_id 
                })
                return false;
            }
        },
        // 加载左侧APP阅读二维码
        initReadQr: function(str) {
            $("#qrcode").qrcode({
                width: 96,
                height: 96,
                text: str
            });
        },
        // 左侧分享阅读延时hover
        initHover: function() {
            var timer1,timer2,timer3,timer4,scrollTop;
            $(".js-hover").hover(function(){
                var that = this;
                clearTimeout(timer2)
                timer1 = setTimeout(function(){
                    $(that).find(".hover").removeClass("opacity").addClass("opacity");
                },300)
            },function(){
                clearTimeout(timer1);
                timer2 = setTimeout(function(){
                    $(".hover").removeClass("opacity")
                },300)
            });

            // $('.js-category').hover(function(){
            //     clearTimeout(timer4);
            //     scrollTop = $(document).scrollTop();
            //     $('.js-modal-category').show();
            //     $('.js-catalog-arrow').show();
            //     timer3 = setTimeout(function(){
            //         $('.js-modal-category').css('opacity',1);
            //         $('.js-catalog-arrow').css('opacity',1);
            //     },300)
            //     $('body').css({'position':'fixed','width':'100%','top':'-'+scrollTop+'px'})
                
            // },function(){
            //     clearTimeout(timer3);
            //     timer4 = setTimeout(function(){
            //         $('.js-modal-category').hide().css('opacity',0);
            //         $('.js-catalog-arrow').hide().css('opacity',0);
            //     },300)
            //     $('body').css({'position':'relative','top':0})
            //     $(document).scrollTop(scrollTop)
            // })
        },
        /**
         * 过滤出开放节数据
         */
        filterChapterData: function (d) {
            var data = $.extend(true, {}, d); // 深拷贝
            if (data.list && data.list.length) {
                var index = 0;
                var z_list = data.list;
                var z_list2 = [];
                var j_size_free = 0;
                for (var i = 0; i < z_list.length; i++) {
                    var zhangItem = z_list[i];
                    var j_list = zhangItem.list;
                    var j_list2 = [];
                    if (j_list && j_list.length) {
                        for (var k = 0; k < j_list.length; k++) {
                            index++;
                            if (j_list[k] && j_list[k].is_open == 0) {
                                //开放的
                                j_size_free++;
                                j_list[k].c_index = index;
                                j_list2.push(j_list[k]);
                            }
                        }
                    }
                    if (j_list2.length) {
                        zhangItem.list = j_list2;
                        z_list2.push(zhangItem);
                    }
                }
                data.list = z_list2;
                data.j_size_free = j_size_free;
            }
            return data;
        },
        // 渲染弹窗目录
        initCatalogTpl: function() {
            if(loadingCatalog){
                return false;
            }
            loadingCatalog = 1;
            var param = {
                column_id: column_id
            }
            $.ajax({
                url: '/read/cataloglist',
                type: 'get',
                dataType: 'json',
                data: param,
                success: function(data) {
                    if (data.result === 1) {
                        var openData = Event.filterChapterData(data.data); // 过滤出开放的小节
                        var html = juicer($("#catalog-tpl").html(), {
                            data: $.extend(openData, {column_id:column_id, is_left_menu: 1})
                        });
                        // setTimeout(function(){
                        
                        // var height = window.innerHeight*0.8;
                        // var top = window.innerHeight*0.1;
                        // var parentTop = $('.js-category').offset().top - $(window).scrollTop();
                        html += '<p class="bottom-line">已到底部</p>';
                        $(".js-item-box").empty().append(html);
                        // $('.js-modal-category').css({height:height,top:-parentTop+top});
                            // $(".js-modal-category").show();
                        // },800)
                        
                        // $("body").css("overflow","hidden")
                        // $(".js-close").on("click", function() {
                        //     $(".js-mask").hide();
                        //     $(".js-item-box").empty()
                        //     $(".js-modal-category").hide();
                        //     $("body").css("overflow","scroll")
                        // })
                    } else{
                        alert(data.msg)
                    }
                },
                complete: function() {
                    loadingCatalog = 0;
                }
            });
            var countIndex = function(i) {  
                // i string  
                // return i*1+1;
                return ++articleNum;
            }
            juicer.register('count_index', countIndex); //注册自定义函数
        },
        showCatalog : function(){
            console.log('onlyshow')
            $(".js-modal-category").show();
            $(".js-catalog-arrow").show();
        },
        hideCatalog : function(){
            console.log('hide')
            $(".js-modal-category").hide();
            $(".js-catalog-arrow").hide();
        },
        // 目录角标转汉字章节名称
        translate_title:function(i){
            var array = ["一","二","三","四","五","六","七","八","九","十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十"]
            return array[i];
        },
        // 点击小锁弹窗 非法进入页面 提示订阅
        initBuyModal: function(flag) {
            var html = juicer($("#buyModal-tpl").html(), {
                data: {
                    isLogin:    isLogin,
                    pic    :    pic,
                    url    :    url,
                    name   :    title,
                    inSale :    inSale,
                    pay    :    pay,
                    ori    :    ori,
                    recover:    recover
                }
            });
            $("body .js-buyModal").remove().append(html)
            $("body").append(html)
            if(flag){
                // 从试读页想进入下一节需购买的 或者点击目录的
                $(document).on("click",".js-close-buyModal", function() {
                    $("body .js-buyModal").remove()
                })
                return false;
            }
            // 直接修改url 未购买不能试读未开放的 不合法进入
            $(document).on("click",".js-close-buyModal", function() {
                window.location.href = "/read/" + column_id 
            })
            
        },
        // 悬浮顶部购买菜单
        judgeFixedMenu: function() {
            var dis = 216;
            var scrollT = 0;
            $(document).scroll(function() {
                scrollT = $(document).scrollTop()
                if (dis <= scrollT) {
                    $(".js-top-buy-fixed").removeClass("animate").addClass("animate");
                } else {
                    $(".js-top-buy-fixed").removeClass("animate");
                }
            })
        },
        
        // 渲染第一页10条 或者 全部评论
        initCommentsTpl: function(flag) {
            if(loadingComments){
                return false;
            }
            var temp = {};
            if(flag !== true){
                // 展示剩余所有评论 否则只展示前十个
                $(".js-comments-list li").removeClass("hide");
                $(".js-getLeftComments").hide();
                return false;
            }
            var param = {
                chapter_id : chapter_id
            }
            
            loadingComments = 1;
            $.ajax({
                url: '/read/chaptercomment',
                type: 'post',
                dataType: 'json',
                data: param,
                success: function(data) {
                    if (data.result === 1) {
                        temp = {
                            isLogin : isLogin,
                            total   : data.data.total,
                            list    : data.data.list,
                            tip_url : tip_url,
                            article_uid : authorId
                        }
                        console.log("评论数据",temp)
                        //渲染全部 只展示前十个
                        var html = juicer($("#comments-tpl").html(), {
                            data: temp
                        });
                        if(twemoji){
                            html = twemoji.parse(html);
                        }
                        $(".js-comments-con").empty().append(html);

                    } else {
                        $.alert(data.msg,{
                            modal:true,
                            timeout:2000
                        })
                    }
                },
                complete: function() {
                    loadingComments = 0;
                }
            });
            
        },
        // 渲染三条以外 剩余所有回复
        initReplysTpl: function() {
            if(loadingComments){
                return false;
            }
            var id = $(this).data("id")
            var that = this;
            var param = {
                comment_id : id
            }
            loadingComments = 1;
            $.ajax({
                url: '/read/chapterreply',
                type: 'post',
                dataType: 'json',
                data: param,
                success: function(data) {
                    if (data.result === 1) {
                        var temp = {
                            isLogin : isLogin,
                            tip_url : tip_url,
                            article_uid : authorId
                        }
                        console.log("所有回复",$.extend(data, temp ))
                        var html = juicer($("#replys-tpl").html(), {
                            data: $.extend(data, temp )
                        });
                         /*新增单个回复 渲染*/
                        var ul = $(that).parents(".comment").find(".js-replys-list");
                        if(ul.size() > 0){
                             // 已有回复
                            ul.empty().append(html)
                        }else{
                            $(that).parents(".comment").find(".comment-detail").append('<ul class="replys-list js-replys-list">' + html + '</ul>')
                        }
                        $(that).hide()
                        
                    } else {
                        $.alert(data.msg,{
                            modal:true,
                            timeout:2000
                        })
                    }
                },
                complete: function() {
                    loadingComments = 0;
                }
            });
            
        },
        // 评论点赞
        doAgreeWith: function() {
            if (!isLogin) {
                $('#js-signin-btn').length && $('#js-signin-btn')[0].click();
                return;
            }
            var $this = $(this);
            var comId = $this.attr('data-commentid');
            
            if ($this.hasClass('loading')){
                return false;
            }
            $this.addClass('loading');
            $.ajax({
                url: "/read/addsupport",
                type: "post",
                dataType: "json",
                data: {
                    comment_id: comId
                },
                success: function(data) {
                    if (data.result == 0) {
                        $this.addClass('btn-has-agree').removeClass("js-agree");
                        var $elem = $this.find('span');
                        var num = parseInt($elem.text());
                        num = num + 1;
                        $elem.text(num);
                    }else{
                        $.alert(data.msg,{
                            modal:true,
                            timeout:2000
                        })
                    }
                },
                complete: function() {
                    $this.removeClass('loading');
                }
            });
        },
        // 回复调接口 回复评论和回复
        doReply: function() {
            if (!isLogin) {
                $('#js-signin-btn').length && $('#js-signin-btn')[0].click();
                return;
            }
            var $this = $(this),len,content;
            var submit = $(".js-submit-reply")
            if($this.parent(".com-other").size()){
                // 是回复 评论 后端要求传此参数
                var reply_type = 0
            }else{
                var reply_type = 1
            }
            if (submit.hasClass('loading')){
                return false;
            }
            content = $.trim($('#reply').val());
            len = content.length;
            // 2020-0323-姜健 说不要了
            // if (len < 10) {
            //     $('#feed-error').text('回复内容不能少于10个字！');
            //     return;
            // }
            if (len > 400) {
                $('#feed-error').text('回复字数不能超过400个字！');
                return;
            }
            $('#feed-error').text('');

            var param = {};
            param.chapter_id = chapter_id;
            param.reply_type = reply_type;
            param.content = content;
            param.reply_id =  $this.attr('data-replyid');
            if (token) {
                param.token = token;
            }
            submit.text("提交中...").addClass('loading');
            $.ajax({
                url: "/read/adddiscuss",
                type: "post",
                dataType: "json",
                data: param,
                success: function(data) {
                    if (data.result === 0) {
                        $(".js-modal-close").click();
                        
                        var more = $this.parents(".comment").find(".js-more-reply")
                        // 如果页面中回复少于四个
                        if(more.size() != 1){
                            var temp = [];
                            temp[0] = data.data;
                            var html = juicer($("#replys-tpl").html(), {
                                data: $.extend({data:temp}, {
                                    isLogin : isLogin,
                                    tip_url : tip_url,
                                    article_uid : authorId
                                } )
                            });
                            if(twemoji){
                                html = twemoji.parse(html);
                            }
                             /*新增单个回复 渲染*/
                            var ul = $this.parents(".comment").find(".js-replys-list");
                            if(ul.size() > 0){
                                 // 已有回复
                                ul.append(html)
                            }else{
                                $this.parents(".comment").find(".comment-detail").append('<ul class="replys-list js-replys-list">' + html + '</ul>')
                            }
                        }else{
                            more.click();
                        }
                        
                    } else if (data.data === 1 && data.result === -1) {
                        if ($('.js-reply-verify-box').length != 0) {
                            clearVerify($('.js-reply-verify-box'));
                        }
                        // 滑动验证码
                        $('.js-comment-verify-box').removeClass('hide');
                        moVerify = new mocaptcha('.js-comment-verify-box', {
                            type: 0,
                            success: function(t) {
                                token = t;
                                submit.trigger('click');
                            }
                        });
                        $('.js-mocaptcha').append('<span class="js-mocaptcha-close imv2-close"></span>');
                    } else if (data.result == -103002) {
                        moVerify.reset();
                        token = '';
                    } else {
                        $('#feed-error').html(data.msg);
                        if (moVerify != '') {
                            moVerify.reset();
                            token = '';
                        } else {
                            clearVerify($('.js-comment-verify-box'));
                        }
                    }
                },
                complete: function() {
                    submit.text("提交").removeClass('loading');
                    token = '';
                }
            });
        },
        // 发表回复计数
        countWord: function() {
            var len = $(this).val().length;
            var maxlength = $(this).attr('maxlength');
            var max = maxlength ? parseInt(maxlength) : 400;
            if (len > max) {
                $(this).val($(this).val().substr(0, max));
                $(this).siblings(".js-count").text(max+"/"+max);
                return false;
            }
            $(this).siblings(".js-count").text(len + "/"+ max)
            return false;
        },
        // 发布评论
        showPublishCommentModal: function() {
            if (!OP_CONFIG.userInfo) {
                seajs.use("login_sns", function(login) {
                    login.init();
                });
                return false;
            } else {
                var dialog;
                /*评论框弹窗渲染*/
                var publishCommentTpl = juicer($("#publishComment-tpl").html(), {
                    data: {}
                });
                dialog = $.dialog(publishCommentTpl, { title: "添加留言", width: "704px", height: "324px", modal: true });
                
                //评论
                var opts = {
                    initialFrameHeight: 120,
                    initialFrameWidth: 'auto',
                    autoHeightEnabled: false
                }
                //先删除之前实例的对象 否则不显示富文本编辑器
                // UE.delEditor('js-publish-editor-box'); 
                // var cueditor = UE.getEditor("js-publish-editor-box", opts);

                // ctrl+enter评论
                // cueditor.addListener("keydown", function(type, event) {
                //     if (event.keyCode == 13 && event.ctrlKey) {
                //         $('#js-submit').trigger('click');
                //     }
                // });
                $('.verify-code input').on('keydown', function(event) {
                    if (event.ctrlKey && event.keyCode == 13) {
                        $('#js-submit').trigger('click');
                    }
                })
                
                //提交评论
                $(document).on('click', '#js-submit', function(e) {
                    var $this = $(this),len,content;
                    if ($this.hasClass('loading')) {
                        return false;
                    }
                    // content = $.trim(UE.getEditor("js-publish-editor-box").getContent());
                    // len = UE.getEditor("js-publish-editor-box").getContentLength(true);
                    content = $.trim($('.js-comment-content').val());
                    len = content.length; 

                    if (len < 1) {
                        $('#feed-error').text('评论内容不能为空！');
                        return;
                    }
                    if (len > 1000) {
                        $('#feed-error').text('评论字数不能超过1000个字！');
                        return;
                    }
                    $('#feed-error').text('');

                    var param = {};
                    param.is_comment = 1;
                    param.chapter_id = chapter_id;
                    param.content = content;
                    if (token) {
                        param.token = token;
                    }

                    $this.addClass('loading').text('正在提交...');
                    $.ajax({
                        url: '/read/adddiscuss',
                        type: 'post',
                        dataType: 'json',
                        data: param,
                        success: function(data) {
                            if (data.result === 0) {
                                /*新增单个评论渲染*/
                                // var html = juicer($("#addComments-tpl").html(), {
                                //     data: $.extend(data.data, {
                                //         isLogin : isLogin,
                                //         tip_url : tip_url,
                                //         article_uid : authorId
                                //     } )
                                // });
                                // $(".noData").hide()
                                
                                $.prompt('提交成功！',{
                                    modal:true,
                                    callback:function(){
                                        $(".js-modal-close").click();
                                    }
                                })
                                // var total = $('.js-comments-con').find(".js-number").text()*1 + 1;
                                // if(!$('.js-comments-list').size()){
                                //     $(".js-comments-con").find(".comments").append('<ul class="comments-list js-comments-list"></ul>')
                                // }
                                // $('.js-comments-con').find(".js-number").text(total)
                                // $('.js-comments-list').prepend(html)
                                
                            } else if (data.data === 1 && data.result === -1) {
                                if ($('.js-reply-verify-box').length != 0) {
                                    clearVerify($('.js-reply-verify-box'));
                                }
                                // 滑动验证码
                                $('.js-comment-verify-box').removeClass('hide');
                                moVerify = new mocaptcha('.js-comment-verify-box', {
                                    type: 0,
                                    success: function(t) {
                                        token = t;
                                        $this.trigger('click');
                                    }
                                });
                                $('.js-mocaptcha').append('<span class="js-mocaptcha-close imv2-close"></span>');
                            } else if (data.result == -103002) {
                                moVerify.reset();
                                token = '';
                            } else {
                                $('#feed-error').html(data.msg);
                                if (moVerify != '') {
                                    moVerify.reset();
                                    token = '';
                                } else {
                                    clearVerify($('.js-comment-verify-box'));
                                }
                            }
                        },
                        complete: function() {
                            $this.removeClass('loading').text('提交');
                            token = '';
                        }
                    });
                });
            }
        },
        // 展示回复输入框 监听点击提交 
        showReplyModal: function() {
            if (!OP_CONFIG.userInfo) {
                seajs.use("login_sns", function(login) {
                    login.init();
                });
                return false;
            } else {
                /*评论框弹窗渲染*/
                var name = $(this).data("name") || 0;
                var publishReplyTpl = juicer($("#publishReply-tpl").html(), {
                    data: {
                        name:name
                    }
                });
                var dialog = $.dialog(publishReplyTpl, { title: "回复", width: "704px", height: "324px", modal: true });
                
                // ctrl+enter评论
                $(document).on("keydown", function(event) {
                    if (event.keyCode == 13 && event.ctrlKey) {
                        $('.js-submit-reply').trigger('click');
                    }
                });
                $(document).on("input","#reply",Event.countWord)
                var that = this;
                //提交回复
                $(document).off("click",".js-submit-reply")
                $(document).on('click', '.js-submit-reply', function(){
                    Event.doReply.call(that)
                })
            }
        },
        // 代码预览初始化
        initCodePreview: function () {
            $(document)
            // 鼠标移入，显示代码预览图标
            .on("mouseenter", ".art-content .cl-preview-section:not(.code-preview-box) pre", function (e) {
                var $el = $(e.currentTarget);
                if ($el.children("#code-preview").length) {
                    $("#code-preview", $el).show();
                } else {
                    $el.append('<span id="code-preview">预览</span>');
                }
                // 鼠标移出，隐藏代码预览图标
            }).on("mouseleave", ".art-content .cl-preview-section:not(.code-preview-box) pre", function (e) {
                var $el = $(e.currentTarget);
                $("#code-preview", $el).hide();
                // 点击代码预览图标
            }).on("click", ".art-content #code-preview", function (e) {
                var $el = $(e.currentTarget);
                // 克隆代码块
                var codeDom = $el.parent().clone();
                currentSection = $('<div class="cl-preview-section"></div>');
                currentSection.append(codeDom);
                // 插入代码预览标题，移除代码预览图标
                currentSection.prepend('\
                            <span class="code-preview-title">\
                                代码预览\
                                <i class="imv2-fullscreen_exit js-close-codepreview" title="关闭预览"></i>\
                            </span>').find('#code-preview').remove();

                $('body').addClass('moco-modal-body')
                    .append('<div class="code-preview-modal"></div>');

                $el.parents('.art-content > div').append(currentSection.addClass('code-preview-box'));
                calcCodePreviewHeight(); // 计算代码预览框高度
                $(".code-preview-modal, .code-preview-box").fadeIn(100);
                $(window).on('resize.code-preview', calcCodePreviewHeight); // 监听窗口大小变化
                // 点击关闭按钮
            }).on("click", ".code-preview-title .js-close-codepreview", function (e) {
                $('body').removeClass('moco-modal-body');
                $(".code-preview-modal, .code-preview-box").fadeOut(100, function () {
                    $(".code-preview-modal, .code-preview-box").remove();
                });
                $(window).off('resize.code-preview'); // 移除监听窗口大小变化
            });
        },
        // 播放视频
        playVideo: function() {
            var videoUrl = $(this).attr('src');
            var posterUrl = $(this).attr('poster');
            $videoBox = $(this).parents('.video-play-box');
            if ($('video', $videoBox).length == 0) {
                    // <div class="video_fix_wrapper">\
                    //     <i class="imwap-close close js-close-video"></i>\
                var str = '\
                        <video class="video-' + videoIndex + '" data-index="' + videoIndex + '" webkit-playsinline playsinline x5-playsinline x5-video-player-type="h5" x5-video-player-fullscreen="true" poster="'+ posterUrl +'" controls="controls" controlslist="nodownload" playsInline="true" src="' + videoUrl + '" style="display: none;">  Your browser does not support the video tag. </video>\
                ';
                $videoBox.append(str);
            }
            var videoObj = $('video', $videoBox)[0];
            videoObj.onplay = function() {
                $videoBox.css('background-image', 'url("")');
                $('.video-play-bg' ,$videoBox).hide();
                $(videoObj).show();
                Event.pauseOtherVideo($(videoObj).attr('class'));
            }
            videoObj.play();
            videoIndex++;
        },
        pauseOtherVideo: function(curClass) { // 停止其他视频播放
            var $videos = $('video:not(.'+curClass+')');
            $videos.each(function(i, v) {
                v.pause();
            });
        },
        //排序小节
        sortChapter : function(){
            var list = $('.js-item-box li');
            var parent = $('.js-item-box ul');
            var status = $(this).attr('data-status');//1 倒序 0 正序

            if(status == 1){
                $(this).find('span').html('正序');
                $(this).attr('data-status',0);
            }else{
                $(this).find('span').html('倒序')
                $(this).attr('data-status',1);
            }

            $(parent).html('');
            $(list).each(function(i,v){
                $(parent).prepend(v);
            })
        },
        // 索引展开收起
        slideReference: function() {
            var $parent = $(this).parents('.reference-con');
            if ($parent.hasClass('close')) {
                $('.tree-con').slideDown(300, function() {
                    $parent.removeClass('close');
                });
            } else {
                $('.tree-con').slideUp(300, function() {
                    $parent.addClass('close');
                });
            }
        },
        // 左侧菜单显示隐藏
        switchMenu: function() {
            if ($('.sub-header').hasClass('hide-menu')) {
                $(this).attr('title','隐藏目录');
                $('.sub-header, .main-con').removeClass('hide-menu');
                sessionStorage.setItem('read_hide_menu', 0);
            } else {
                $(this).attr('title','展开目录');
                $('.sub-header, .main-con').addClass('hide-menu');
                sessionStorage.setItem('read_hide_menu', 1);
            }
        },
        // 悬浮左侧目录&索引菜单
        judgeLeftFixedMenu: function () {
            var scrollT = $(document).scrollTop();
            var topoffset = (($("#globalTopBanner").length && $("#globalTopBanner").is(':hidden')) ? 0 : $('#globalTopBanner').height())
                             + ($('#new_header').height() || 0);
            if (topoffset <= scrollT) {
                $('.sub-header, .main-con').addClass('fixed');
                $('.left-menu').height('').css({
                    top: '68px'
                });
            } else {
                $('.sub-header, .main-con').removeClass('fixed');
                $('.left-menu').height(window.innerHeight - topoffset - ($('.sub-header').height() || 0) + scrollT).css({
                    'top': (topoffset + 68)+'px'
                });
            }
            if (scrollT > afterScrollTop) { // 向下滚动
                if(scrollT > 68) {
                    $('.sub-header, .main-con').addClass('scrolling');
                }
            } else { // 向上滚动
                $('.sub-header, .main-con').removeClass('scrolling');
            }
            afterScrollTop = scrollT;
        },
        // 显示加群弹框
        toggleJoinQQPopup: function(flag) {
            if (flag) {
                $("#modal-jiaQun").removeClass('hide');
                $('html,body').removeClass("body-fixed").addClass("body-fixed");
            } else {
                $("#modal-jiaQun").addClass('hide');
                $('html,body').removeClass("body-fixed");
            }
        },
        copyJoinQQCode: function () {
            var text = $('#joincode').text();
            $(this).after($('<input id="copy_code">').css({
                'position': 'fixed',
                'left': '-100000px'
            }).val(text));
            $('#copy_code').select();
            document.execCommand('Copy');
            $.prompt("复制成功");
            $('#copy_code').remove();
        }
    }
    // 清除滑动验证码
    var clearVerify = function(dom) {
        dom.addClass('hide').html('');
        token = '';
    }

    // 计算代码预览框高度
    var calcCodePreviewHeight = function () {
        if ($('.code-preview-box').length) {
            $('.code-preview-box pre').css('max-height', window.innerHeight * 0.9 - 48 + 'px');
        };
    }
    /* 节流 */
    var throttle = function(func, delay) {
        let timer = null;
        let startTime = Date.now();

        return function () {
            let curTime = Date.now();
            let remaining = delay - (curTime - startTime);
            const context = this;
            const args = arguments;

            clearTimeout(timer);
            if (remaining <= 0) {
                func.apply(context, args);
                startTime = Date.now();
            } else {
                timer = setTimeout(func, remaining);
            }
        }
    }
    
    var bind = function() {
        /*点击评论输入框*/
        $(document).on("click", ".js-showcommentModal", Event.showPublishCommentModal);
        /*评论赞同*/
        $(document).on("click", ".js-agree", Event.doAgreeWith);
        /*评论和回复 的回复*/
        $(document).on("click", ".js-reply", Event.showReplyModal);
        /*查看剩余所有评论*/
        $(document).on("click", ".js-getLeftComments", Event.initCommentsTpl);
        /*查看剩余回复*/
        $(document).on("click", ".js-more-reply", Event.initReplysTpl);
        // 目录中枷锁章节点击提示购买
        $(document).on("click",".js-lock",function(){
            Event.initBuyModal(true)
        })
        // 滑动验证码点击关闭
        $(document).on('click', '.js-mocaptcha-close', function() {
            clearVerify($('.captcha-verify-box'))
        })
        // 不合法的上下节点击
        $(document).on("click",".js-cantIn",function(){
            var ifOpen = $(this).data("ifOpen");
            var canTaste = $(this).data("canTaste");
            Event.judgeCanIn(canTaste,hasBuy,ifOpen,true);
        })
        // 回到页面顶部
        $(document).on("click",".js-backTop",function(){
            $("html,body").animate({ 
				scrollTop: 0
			}, 200);
        })
        
        //计算剩余评论字数
        $(document).on('input','.js-comment-content',Event.countWord)

        // 播放视频
        $(".js-play-video").on("click", Event.playVideo); 

        //排序章节
        $(document).on('click','.js-sort-chapter',Event.sortChapter);

        // 绑定copy事件  暂时不要啦 允许复制 20200129 by 姜健
        // $('.js-center_con .article-con').on('copy',function(e){//父元素绑定复制事件 
        //     e.preventDefault();
        // }) 

        $(document).on('copy','.cl-preview-section code',function(e){//指定子元素监听复制事件
            var str = window.getSelection().toString() || document.selection.createRange().text;
            var el = document.createElement('textarea');
            el.value = str;
            document.body.appendChild(el);
            $(el).css({'opacity':0,'bottom':0,'left':'10000px','position':'fixed'});

            el.select();
            document.execCommand("Copy");
        });

        // 索引
        $(document).on('click', '.top-head', Event.slideReference);
        // 目录
        $(document).on('click', '.js-switch-menu', Event.switchMenu);
        // 加群
        $(document).on('click', '.js-jiaqun', function() {
            Event.toggleJoinQQPopup(1);
        });
        // 关闭加群
        $(document).on("click", ".js-close-jiaQun", function () {
            Event.toggleJoinQQPopup();
        });
        // 复制加群信息
        $(document).on('click', '.js-copy-joincode', Event.copyJoinQQCode);
    }
    var init = function() { 
        // 左侧菜单滚动时处理
        Event.judgeLeftFixedMenu();
        $(document).scroll(throttle(Event.judgeLeftFixedMenu, 200));
        $(window).resize(throttle(Event.judgeLeftFixedMenu, 200));
        juicer.register('translate_title', Event.translate_title); //注册自定义函数
        Event.initCatalogTpl();//初始化目录
        Event.judgeFixedMenu();
        Event.initCommentsTpl(true);
        Event.initCodePreview(); //初始化代码预览
        //自动跳转评论区
        var hash = window.location.hash;
        if(hash == '#comments'){
            setTimeout(function(){
                $('.js-left_con .coments p').click();
            },300)
        }
        // 初始化倒计时
        if (window.inSale == 1) {
            var countdown = require('./common/countdown');
            $('.countdown').each(function (i, v) {
                countdown.init($(v), $(v).data('remain'));
            });
        }

        bind()

        reference.init('.article-con'); // 生成索引目录
        // 文章内容查看图片
        var match = /^https:\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+).*(\.png|\.jpg|\.jpeg|\.gif)$/;
        $('.js-lookimg img').each(function () {
            var src = $(this).attr('alt');
            if (match.test(src)) {
                $(this).attr('data-src', src);
            }
        })
        moco.imagePreview.init('.js-lookimg');
        // wap或者APP 都用此url 自动解析
        Event.initReadQr("https://m.imooc.com/read/"+ column_id + "/article/" + chapter_id); 
        Event.initHover();
    }
    $(function(){
        // 默认进入页面先隐藏 container，如果合法在展示渲染
        if(Event.judgeCanIn(canTaste,hasBuy,ifOpen)){
            $(".container").show()
            init();
        }
    })
    window.onload = function() {
        zhuge.track('LearnCourse', {
            'Category': '专栏',
            'Name': title,
            'CID': column_id,
            'Price': parseFloat(pay || 0),
            'Teacher': authorName,
            'Chapters': chapter_id
        })
    }
})