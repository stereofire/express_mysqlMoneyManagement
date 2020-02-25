//获取指定form中的所有的<input>对象 
function getElements(userLogin) { 
    var form = document.getElementById(formId); 
    var elements = new Array(); 
    var tagElements = form.getElementsByTagName('input'); 
    for (var j = 0; j < tagElements.length; j++){ 
      elements.push(tagElements[j]); 
    } 
    var tagElements = form.getElementsByTagName('select'); 
    for (var j = 0; j < tagElements.length; j++){ 
      elements.push(tagElements[j]); 
    } 
    var tagElements = form.getElementsByTagName('textarea'); 
    for (var j = 0; j < tagElements.length; j++){ 
      elements.push(tagElements[j]); 
    }
    return elements; 
  } 
  //组合URL 
  function serializeElement(userLogin) { 
    var method = element.tagName.toLowerCase(); 
    var parameter; 
    if(method == 'select'){
      parameter = [element.name, element.value]; 
    }
    switch (element.type.toLowerCase()) { 
      case 'submit': 
      case 'hidden': 
      case 'password': 
      case 'text':
      case 'date':
      case 'textarea': 
         parameter = [element.name, element.value];
         break;
      case 'checkbox': 
      case 'radio': 
        if (element.checked){
          parameter = [element.name, element.value]; 
        }
        break;    
    } 
    if (parameter) { 
      var key = encodeURIComponent(parameter[0]); 
      if (key.length == 0) 
        return; 
      if (parameter[1].constructor != Array) 
        parameter[1] = [parameter[1]]; 
      var values = parameter[1]; 
      var results = []; 
      for (var i = 0; i < values.length; i++) { 
        results.push(key + '=' + encodeURIComponent(values[i])); 
      } 
      return results.join('&'); 
    } 
  } 
  //调用方法  
  function serializeForm(userLogin) { 
    var elements = getElements(formId); 
    var queryComponents = new Array(); 
    for (var i = 0; i < elements.length; i++) { 
      var queryComponent = serializeElement(elements[i]); 
      if (queryComponent) {
        queryComponents.push(queryComponent); 
      } 
    } 
    return queryComponents.join('&'); 
  } 
  console.log(serializeForm(userLogin));