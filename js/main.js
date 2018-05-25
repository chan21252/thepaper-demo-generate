var ad_list;                //广告位列表
var ad_dict = new Array();  //广告位字典,便于属性访问
var page_list;              //投放页面列表
var ad_id_clk;              //选中的广告位ID
var campaign_id;            //广告活动ID，由广告位ID和投放页面ID组成
var file;                   //上传的图片文件
var demo_canvas;            //canvas画布
var ctx;

$(document).ready(function(){
    /*获得定向页面ID列表*/
    $.ajax({
        type: "GET",
        url: "./data/page.json",
        dataType: "json",
        success: function(response){
            page_list = eval(response);  
            console.log("投放页面ID列表:%o", page_list);
            $("#info").text("投放页面列表加载成功");    
        },
        error: function(){
            $("#info").text("投放页面列表加载失败，请联系技术人员");
        }
    });

    /*动态生成广告位菜单*/
    $.ajax({
    	type: "GET",
    	url: "./data/ad.json",
    	dataType: "json",
    	success:function(response){
    	    var ad = eval(response);
    	    ad_list = ad["ad"];
    	    for(var i=0; i<ad_list.length; i++){
    	        var ad_id = ad_list[i]["id"];               //广告位ID
    	        var ad_text = ad_list[i]["name_cn"];        //广告位文字
                var ad_target = ad_list[i]["target_page"];  //广告位投放页面
                ad_dict[ad_id] = ad_list[i];                //添加元素
    	        $("#menu").append('<button type="button" ad_id="'+ ad_id + '" class="list-group-item">' +ad_text+ '</button>');
            }
            $("#info").text("广告位列表加载成功");
            console.log("广告位ID列表:%o", ad_dict);
    	},
    	error:function(){
            $("#info").text("广告位列表加载失败，请联系技术人员");
    	}
    });
});


//广告位菜单点击监听
$(document).on('click','.list-group button',function(){
    $("#page").html("");
    $("#setting").html("");
    if($(this).attr("ad_id")){
        ad_id_clk = $(this).attr("ad_id");          //选中的广告位ID
        console.log("选中广告位的ID: %s", ad_id_clk);
        $("#info").text(ad_dict[ad_id_clk]["name_cn"]);

        //根据选择广告位，动态生成投放页面下拉选单
        var target_page_list = ad_dict[ad_id_clk]["target_page"]    //所选广告位支持的投放页面ID列表
        console.log("选中广告位支持的投放页面ID列表: %o", target_page_list);

        $("#page").append('<div id="legend"><legend>投放页面</legend></div>'+
            '<div class="control-group" id="target_page_form"></div>'
        );
        $("#target_page_form").append('<div class="controls"><select class="form-control" id="target_page_select"></select></div>');
        $("#target_page_select").append('<option disabled="disabled" selected="selected">--请选择--</option>');
        for(var i=0; i<target_page_list.length; i++){
            $("#target_page_select").append('<option value="'+ target_page_list[i] +'">'+ page_list[target_page_list[i]] +'</option>');     //添加选项
        }
    }else{
        return;
    }
});

//投放页面下拉选单监听
$(document).on('change', '#target_page_select', function(){

    //动态生成配置项
    $("#setting").html("");
    $("#setting").append('<div id="legend"><legend>配置项</legend></div>');
    
    //物料上传
    $("#setting").append('<div class="control-group">'+
        '<label for="img-upload" class="control-label">图片物料</label>'+
        '<div class="controls"><input type="file" id="img_upload" accept="image/*" /></div></div>'
    );
    
    //广告角标
    if(ad_dict[ad_id_clk]["ad_tag_set"]){
        $("#setting").append('<div class="control-group">'+
            '<div class="controls"><input type="checkbox" id="ad_tag" /><label for="ad_tag" class="control-label">广告角标</label>'+
            '</div></div>'
        );
    }

    //栏目名称
    if($("#target_page_select").val() == "08"){
        $("#setting").append('<div class="control-group">'+
            '<label class="control-label" for="input_column">栏目名称</label>'+
            '<div class="controls"><input type="text" placeholder="请输入栏目名称" class="input-xlarge" id="input_title" />'+
            '<p class="help-block">栏目名称和线上栏目一致</p></div></div>'
        );
    }

    //文章标题
    if(ad_dict[ad_id_clk]["is_news"]){
        $("#setting").append('<div class="control-group">'+
            '<label class="control-label" for="input_title">文章标题</label>'+
            '<div class="controls"><input type="text" placeholder="请输入文章标题" class="input-xlarge" id="input_title" />'+
            '<p class="help-block">28个字以内</p></div></div>'
        );
    }

    //生成按钮
    $("#setting").append('<div class="btn btn-primary" id="btn_generate">生成</div>');
});

/*
$(document).on('change', '#img_upload', function(event){
    file = event.target.files[0];
    console.log(file);
    //判断是否是图片
    if(!/image\/\w+/.test(file.type)){
        $("#info").text("请上传一张图片");
        return false;
    }
    $("#info").text("图片上传成功");
});*/

//生成按钮点击监听
$(document).on('click', '#btn_generate', function(){
    file = $("#img_upload").get(0).files[0];    //获取input文件信息
    //console.log(file);

    //检验是否上传文件
    if(typeof(file) == "undefined"){
        $("#info").text("您没有上传图片，请重试");
        return false;
    }

    //检验是否是图片
    if(!/image\/\w+/.test(file.type)){
        $("#info").text("文件类型不是图片，请重试");
        return false;
    }

    var campaign_id = ad_id_clk + $("#target_page_select").val();        //选择的广告位和投放页面拼出广告活动ID
    console.log("广告活动ID: %s", campaign_id);

    //请求广告活动接口
    $.ajax({
        type: "GET",
        url: "./data/campaign/"+ campaign_id +".json",
        dataType: "json",
        success: function(response){
            var campaign_info = eval(response);     //广告活动信息
            var canvas_size = campaign_info["canvas"]["size"];      //画布大小
            var material = campaign_info["material"];       //物料
            //console.log(canvas_size);
            //console.log(material);
            var reader = new FileReader();
            reader.readAsDataURL(file);     //转为base64
            reader.onload = function(e){
                drawDemo(this.result, canvas_size, material);
            }
        },
        error: function(){
            $("#info").text("请求广告活动接口失败，请联系技术人员");
        }
    });   
});

//绘制demo
function drawDemo(imgData, canvas_size, material){
    demo_canvas = document.getElementById("demo");

    //设置画布大小
    demo_canvas.width = canvas_size[0];
    demo_canvas.height = canvas_size[1];

    if(demo_canvas.getContext){
        ctx = demo_canvas.getContext("2d");
    }else{
        return false;
    }

    var img_arr = new Array();
    //遍历物料
    for(var x in material){
        if(x == "img_ad"){
            drawAD(material[x], imgData);   //广告物料
        }else{
            drawUI(material[x]);    //其他物料
        }
    }
}

function drawUI(mr){
    var img = new Image();
    img.onload = function(){
        console.log(img.width);
        ctx.drawImage(img, mr["position"][0], mr["position"][1], mr["size"][0], mr["size"][1]);
    }
    img.src = mr["url"];
    
}

function drawAD(mr, imgData){
    var img = new Image();
    img.onload = function(){
        console.log(img.width);
        ctx.drawImage(img, mr["position"][0], mr["position"][1], mr["size"][0], mr["size"][1]);
    }
    img.src = imgData;
}






