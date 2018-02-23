
var target_id_list;
var target_id;
var target_id_info;
var file;

$(document).ready(function(){
    /*动态生成广告位菜单*/
    $.ajax({
    	type: "GET",
    	url: "./data/ad2.json",
    	dataType: "json",
    	success:function(response){
    	    var ad = eval(response);
    	    var ad_list = ad["ad"];
    	     console.log("广告位ID列表:%o", ad);
    	    var panel_heading_html = "";
    	    for(var i=0; i<ad_list.length; i++){
    	        var ad_id = ad_list[i]["id"];          //广告位ID
    	        var ad_text = ad_list[i]["text"];      //广告位文字
    	        var ad_target = ad_list[i]["target"];  //广告位投放页面
    	        //一级菜单的html
    	        panel_heading_html = panel_heading_html + '<div class="panel-heading" role="tab" id=ad-'+ ad_id +'">'+
                    '<h4 class="panel-title">'+
                    '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse'+ ad_id + 
                    '" aria-expanded="true" aria-controls="collapse'+ ad_id +'">'+
                    ad_text+
                    '</a></h4></div>'+
                    '<div id="collapse'+ ad_id +'" class="panel-collapse collapse" role="tabpanel"></div>';
    	    }
    	    $("#accordion-body").html(panel_heading_html);     //生成一级菜单
    	    
    	    //生成二级菜单
    	    for(var i=0; i<ad_list.length; i++){
    	        var ad_id = ad_list[i]["id"];
    	        var ad_target = ad_list[i]["target"];
    	        var ad_name = ad_list[i]["name"];
    	        var panel_body_html = "";
                for(var j=0; j<ad_target.length; j++){
                    panel_body_html = panel_body_html +'<div class="panel-body"><ul><a href="#" id="'+ ad_name +'-'+ ad_target[j] +'" ad_id="'+ad_id+'" ad_target="' +ad_target[j]+ '">'+ ad_target[j] +'</a></ul></div>';
                }
                //panel_body_html = panel_body_html + '</div>';
                $("#collapse"+ad_id).html(panel_body_html);
    	    }  
    	},
    	error:function(){
    	    alert("请求广告位ID列表失败，请联系技术人员");
    	}
    });
    
    /*获得定向页面ID列表*/
    $.ajax({
            type: "GET",
            url: "./data/target.json",
            dataType: "json",
            success: function(response){
                target_id_list = eval(response);  
                console.log("定向页面ID列表:%o", target_id_list);
            },
            error: function(){
                alert("请求定向页面ID列表失败，请联系技术人员");
            }
    });
});


//二级菜单添加点击监听事件
$(document).on('click','.panel-body ul a',function(){
    if($(this).attr("ad_id") && $(this).attr("ad_target")){
        var ad_id = $(this).attr("ad_id");              //广告位ID
        var ad_target = $(this).attr("ad_target");      //定向页面ID
        //console.log(ad_id);
        //console.log(ad_target);
        target_id = ad_id + target_id_list[ad_target];  //广告投放页面ID
        console.log("广告定向页面ID: %s", target_id);
        if(target_id){
            var target_id_url = "./data/" + target_id +".json";
            $.ajax({
                type: "GET",
                url: target_id_url,
                dataType: "json",
                success: function(response){
                    //根据广告定向页面信息动态生成配置表单
                    target_id_info = eval(response);
                    console.log(target_id_info);
                    $("#setting").html("");
                    $("#setting").append('<div class="form-group">'+
                        '<label for="img-upload">选择图片物料</label><input type="file" id="img-upload" accept="image/*" />'+
                        '</div>'
                    );
                    //是否有广告角标
                    if(target_id_info["is_adtag"]){
                        $("#setting").append('<div class="form-group">'+
                            '<input type="checkbox" id="adtag" /><label for="adtag">广告角标</label>'+
                            '</div>'
                        );
                    }
                    $("#setting").append('<div id="btn-generate" class="btn btn-primary">生成</div>');
                    $("#setting").append('</form>');
                    
                   
                    
                    console.log($("#demo"))
                },
                error: function(){
                    alert("获取广告定向页面信息失败，请联系技术人员");
                }
            });
        }
    }else{
        return;
    }
});

$(document).on('change', '#img-upload', function(event){
    file = event.target.files[0];
    console.log(file);
    //判断是否是图片
    if(!/image\/\w+/.test(file.type)){
        alert("对不起，你确定这是一张图片？");
        return false;
    }
});

$(document).on('click', '#btn-generate', function(){
    var reader = new FileReader();
    reader.readAsDataURL(file);     //转为base64
    reader.onload = function(e){
        if(target_id == 101){
            draw101(this.result);
        }
    }
});


function draw101(imgData){
    var canvas = document.getElementById("demo");
    //设置canvas宽高        
    canvas.width = target_id_info["demo_size"][0];
    canvas.height = target_id_info["demo_size"][1];
    
     if(canvas.getContext){
        var ctx = canvas.getContext("2d");
    }
     
    var img_bg = new Image();
        img_bg.src = target_id_info["img1"];
        //console.log(img_bg.src);
        img_bg.onload = function(){
            ctx.drawImage(img_bg, 0, 0, target_id_info["demo_size"][0], target_id_info["demo_size"][1]);
            var img_ad = new Image();
            img_ad.src = imgData;
            img_ad.onload = function(){
                ctx.drawImage(img_ad, target_id_info["canvas_pos"][0], target_id_info["canvas_pos"][1], target_id_info["canvas_size"][0], target_id_info["canvas_size"][1]);
                
            }
        }
}

function draw2Canvas(imgData){
    var canvas = document.getElementById("iphonex");
    if(canvas.getContext){
        var ctx = canvas.getContext("2d");
    }
    var img_ad = new Image();
    img_ad.src = imgData
    //console.log(img_ad.src);
    img_ad.onload = function(){
        ctx.drawImage(img_ad, 28, 20, 375, 700);
        var img_bg = new Image();
        img_bg.src = "iphonex.png";
        img_bg.onload = function(){
            ctx.drawImage(img_bg, 0, 0, 433, 852);
        }
    }
}





