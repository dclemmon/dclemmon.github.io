alert('xss');

var imgTags = document.getElementsByTagName("img");
var searchText = "targetImg";
var found;
var parentObj;

for (var i = 0; i < imgTags.length; i++) {
    if (imgTags[i].getAttribute('alt') == searchText) {
        found = imgTags[i];
        break;
    }
}

console.log(found);

parentObj = found.parentNode;

console.log(parentObj);
console.log(parentObj.nodeType);
console.log(parentObj.tagName);
console.log(parentObj.attributes);
console.log(parentObj.getAttribute("name"));

while( parentObj.tagName != 'DIV') {
    parentObj = parentObj.parentNode;
}

console.log(parentObj);
