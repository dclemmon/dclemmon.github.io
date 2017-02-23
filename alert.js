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

parentObj = found.parentNode;
while(parentObj.getAttribute('name') != 'div') {
    parentObj = parentObj.parentNode;
}

console.log(found);
console.log(parentObj);
