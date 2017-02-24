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

// console.log(found);

parentObj = found.parentNode;

while( parentObj.tagName != 'DIV') {
    parentObj = parentObj.parentNode;
}

// console.log(parentObj);

var content = [
    "<h1>Test Content!</h1>",
    "<h2>Hello World!</h2>"
].join("\n");

parentObj.innerHTML = content;
