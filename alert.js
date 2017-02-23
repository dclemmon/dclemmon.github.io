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

while( parentObj.getAttribute('name') != 'div') {
    parentObj = parentObj.parentNode;
}

console.log(parentObj);
