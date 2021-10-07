
//////////////////////////////////////
//fire a get request, returns jqxhr for promise
function get(url,result_function){
  var jqxhr = $.ajax( {
      type:"GET",
      url:url,
      cache:false
    } )
    .done(function(d) {
      if (result_function){
        result_function(d);
      }
      else{
        inspectJSON(d)
      }
    })
    .fail(function() {
      console.error( "Error get:" + url );
    })
  return jqxhr;
}

//////////////////////////////////////
//fire a get request, returns jqxhr for promise - note the naming is wrong it means async is disabled here, will sort this out later
function async_get(url,result_function){
  var jqxhr = $.ajax( {
      type:"GET",
      url:url,
      cache:false,
      async: false
    } )
    .done(function(d) {
      if (result_function){
        result_function(d);
      }
      else{
        inspectJSON(d)
      }
    })
    .fail(function() {
      console.error( "Error get:" + url );
    })
  return jqxhr;
}

//////////////////////////////////////
//fire a get request, returns jqxhr for promise
function del(url,data,result_function){
  var jqxhr = $.ajax( {
      type:"DELETE",
      url:url,
      data:JSON.stringify(data),
      contentType:"application/json",
      dataType: "json"
    } )
    .done(function(d) {
      if (result_function){
        result_function(d);
      }
      else{
        inspectJSON(d)
      }
    })
    .fail(function() {
      console.error( "Error get:" + url );
    })
  return jqxhr;
}
//////////////////////////////////////

//fire a post request, returns jqxhr for promise
function post(url,data,result_function){
  //console.log(data);
  var jqxhr = $.ajax( {
      type:"POST",
      url:url,
      data:JSON.stringify(data),
      contentType:"application/json",
      dataType: "json"
    } )
    .done(function(d) {
      if (result_function){
        result_function(d,data);
      }
      else{
        inspectJSON(d,data)
      }
    })
    .fail(function() {
      console.error( "Error get:" + url );
    })
  return jqxhr;
}
//////////////////////////////////////
//fire a post request, returns jqxhr for promise
function async_post(url,data,result_function){
  //console.log(data);
  var jqxhr = $.ajax( {
      type:"POST",
      url:url,
      data:JSON.stringify(data),
      contentType:"application/json",
      dataType: "json",
      async: false
    } )
    .done(function(d) {
      if (result_function){
        result_function(d,data);
      }
      else{
        inspectJSON(d,data)
      }
    })
    .fail(function() {
      console.error( "Error get:" + url );
    })
  return jqxhr;
}
//////////////////////////////////////

//fire a post request, returns jqxhr for promise
function promise_post(url,data,result_function){
    
  return new Promise((resolve, reject) => {
    $.ajax( 
        {
            type:"POST",
            url:url,
            data:JSON.stringify(data),
            contentType:"application/json",
            dataType: "json",
            success: function (data) {
                resolve(data)
                if (result_function){
                    result_function(data);
                }
                else{
                    inspectJSON(data)
                }
            },
            error: function (error) {
                reject(error)
            }
        }
    )
  })
}
//////////////////////////////////////
//general utility: converts identity to number in javascript
function toNumber({ low, high }) {
    let res = high
    for (let i = 0; i < 32; i++) {
      res *= 2
    }
    return low + res
}

//////////////////////////////////////

function makeform(jsonobj,config){
    //jsonobj - single level {key:value}
    //config - [{key,label,type]
    
    var htmlStr = "";
    htmlStr += "<fieldset><ol>";
    
    for (var i in config){
        var item = config[i];

        //if (item.key in jsonobj ){
            var value = jsonobj[item.key];
            if (value == undefined){
                value = ""
            }
            if (item.type != "hidden"){
                
                if ("placeholder" in item){
                    placeholder = `placeholder="${item.placeholder}"`
                }else{
                    placeholder = ''
                }
                
                htmlStr += `<li class="row-${item.key}">`;
                htmlStr += `<label class="FLabel" for="${item.key}">${item.label}</label>`;
                
                //htmlStr += value;
                if (item.type == "date"){
                    dateStr = ""
                    try{
                        date = formatDate(get_date_from_str(value))
                        if (date != "NaN-aN-aN"){
                            dateStr = `value="${date}"`
                        }
                    }catch(e){
                        dateStr = ""
                    }
                    htmlStr += `<input id="${item.key}" type="date" name="${item.key}" ${dateStr} class="editor">`;
                }
                else if (item.type == 'number'){
                     htmlStr += `<input id="${item.key}" type="number" name="${item.key}" value="${value}" class="editor">`;
                }
                else if (item.type == 'boolean'){
                    /*
                    if (value == 'true'){ isTrue = " selected"; isFalse = "";}
                    else{ isTrue = ""; isFalse = " selected";}
                     htmlStr += `<select id="${item.key}" name="${item.key}" class="editor"><option value="true" ${isTrue}>YES</option><option value="false" ${isFalse}>NO</option></select>`;*/
                     var checked = "";
                     if (value == 'true'){ checked = " checked";}
                    htmlStr += `<input type="checkbox" id="${item.key}" name="${item.key}" class="editor checkbox" ${checked}>`
                    htmlStr += `<label for="${item.key}"></label>`
                }
                else if (item.type == 'textarea'){
                     htmlStr += `<textarea id="${item.key}" name="${item.key}" class="editor" ${placeholder}>${value}</textarea>`;
                }
                else if (item.type == 'link'){
                    //standard text input + link
                    htmlStr += `<input id="${item.key}" type="text" name="${item.key}" value="${value}" class="editor" ${placeholder}>`;
                    if (value){
                        htmlStr += `<div style="text-align:right"><a href="${value}">[open]</a></span>`;
                    }
                }
                else if (item.type == 'select'){
                  
                 
                  htmlStr += `<select id="${item.key}" name="${item.key}" class="editor" ${placeholder}>`;
                  
                  for (var ii in item.candidate){
                    var selected = ""
                    if (item.candidate[ii] == value){
                      selected = "selected"
                    }
                    htmlStr += `<option value="${item.candidate[ii]}" ${selected}>${item.candidate[ii]}</option>`;
                  }
                  
                  htmlStr += "</select>";
                }
                else{
                    //standard text input
                    htmlStr += `<input id="${item.key}" type="text" name="${item.key}" value="${value}" class="editor" ${placeholder}>`;
                }
                htmlStr += "</li>";
            }
            else{
                htmlStr += `<input type="hidden" id="${item.key}" name="${item.key}" value="${value}" class="editor">`;
            }
            
            
        // }
        
    }
    htmlStr += "</ol>";
    //htmlStr += "<div style='text-align:right'>";
    //htmlStr += "<button onclick="+submit_function+">Update record</button>";
    //htmlStr += "</div>";
    htmlStr += "</fieldset>";

    return htmlStr
}
function parseform(domid){
    postobj = {status: 1, param:{} }
    
    $(domid).each(function( index ) {
		key = $( this ).attr("name");
		datatype = $( this ).attr("type");
		//console.log( key );
        
        if (datatype == "checkbox"){
            val = $( this ).is(":checked").toString();
        }
		//else if (key == "Label"){
		//	val = $("#Label option:selected").val(); //tmp only for exceptions
		//}
        else{
			val = $(this).val();
		}
		//todo: add client side verification here
		if (key == 'eventStartDate'){
			if (val == ''){
				error_message("invalid date")
				postobj.status = 0
				
			}
		}
        
        
        
        
		postobj.param[key] = val;
	});
    
    return postobj;
}

/////////////////////////////////
//page interaction
function scrollTo(domid){
    $('html, body').animate({
    scrollTop: $(domid).offset().top-50
    }, 200);
}


/////////////////////////////////
function get_timestamp_from_str(str){
  return get_date_from_str(str).getTime();
}
function get_date_from_str(str){
  //return new Date(new Date(str).toUTCString());
  return new Date(str);
}

function getdate(year,month,day){
    return new Date(year, month, day).getTime();
}
function date_to_timestamp(year,month,day){
    return new Date(year, month, day).getTime();
}
function timestamp_to_date(timestamp){
    return new Date(timestamp);
}

//https://codewithhugo.com/add-date-days-js/
function addDays(date, days) {
  const copy = new Date(Number(date))
  copy.setDate(date.getDate() + days)
  return copy
}
//addDays(get_date_from_str("2021-06-26"), 10)

function formatDate(date) {
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day;
}

//////////////////// common api endpoints access


function logout(){
  get("/api/action/user/logout",function(d){ window.location.href='/' });
}

//////////////////// navigation



function applinks() {
  $("#myLinks").toggle();
  if($("#myLinks").is(':visible')){
    $(".block").show();
  }else{
    $(".block").hide();
  }
}
$(".mobile-nav .pagelink").on("click",function(e){
  //console.log($(e.target).hasClass('icon'));
  $("#myLinks").hide();
  $(".block").hide();

});

$( document ).ready(function() {
   $(".block").on("click",function(e){
    $("#myLinks").hide();
    $(".block").hide();
  });
});



$(window).on("resize",function(e){
  console.log("resize");
  setView();
});
$(window).on("load",function(e){
  console.log("load");
  setView();
});
function setPage(hash){
  $('.panel').hide();
  $("#myLinks").hide();
  //$("#qrcode").hide();
  $('.block').hide();
  $(hash).show(0,  function() {
      //console.log($("html").scrollTop())
      //$("html").scrollTop(0);
      //$("html, body").animate({ scrollTop: "0" });
       scrollTo(hash);
  });
 
}
function setView(){

  if($(window).width() > 500){
     $(".panel").show();
     $("#myLinks").hide();
     $(".block").hide();
  }else{

      //on mobile
      //$(".mobile-nav").show();
      //$(".mobile-spacer").show();
      $(".panel").hide();
      
      if(window.location.hash){
        //$(":target").show();
        //$(window.location.hash).show();
        setPage(window.location.hash)
      }else{
        $("#intro").show();
      }
  }
}


