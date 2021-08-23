
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

function makeform(jsonobj,config){
    //jsonobj - single level {key:value}
    //config - [{key,label,type]
    
    var htmlStr = "";
    htmlStr += "<fieldset><ol>";
    
    for (var i in config){
        var item = config[i];

        if (item.key in jsonobj ){
            var value = jsonobj[item.key];

            if (item.type != "hidden"){
                
                if ("placeholder" in item){
                    placeholder = `placeholder="${item.placeholder}"`
                }else{
                    placeholder = ''
                }
                
                htmlStr += "<li>";
                htmlStr += `<label class='FLabel' for="${item.key}">${item.label}</label>`;
                
                //htmlStr += value;
                if (item.type == "date"){
                    htmlStr += `<input type="date" name="${item.key}" value="${formatDate(get_date_from_str(value))}" class="editor">`;
                }
                else if (item.type == 'number'){
                     htmlStr += `<input type="number" name="${item.key}" value="${value}" class="editor">`;
                }
                else if (item.type == 'boolean'){
                    if (item == 'true'){ isTrue = " selected"; isFalse = "";}
                    else{ isTrue = ""; isFalse = " selected";}
                     htmlStr += `<select name="${item.key}" class="editor"><option ${isTrue}>true</option><option ${isFalse}>false</option></select>`;
                }
                else if (item.type == 'textarea'){
                     htmlStr += `<textarea name="${item.key}" class="editor" ${placeholder}>${value}</textarea>`;
                }
                else{
                    htmlStr += `<input type="text" name="${item.key}" value="${value}" class="editor" ${placeholder}>`;
                }
                htmlStr += "</li>";
            }
            else{
                htmlStr += `<input type="hidden" name="${item.key}" value="${value}" class="editor">`;
            }
            
            
        }
        
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
		if (key == "Label"){
			val = $("#Label option:selected").val(); //tmp only for exceptions
		}else{
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