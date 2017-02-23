alert('xss');

var imgTags = document.getElementsByTagName("img");
var searchText = "targetImg";
var found;

for (var i = 0; i < imgTags.length; i++) {
    if (imgTags[i].getAttribute('alt') == searchText) {
        found = imgTags[i];
        break;
    }
}

console.log(found);
