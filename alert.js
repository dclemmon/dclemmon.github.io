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
//    '<link href="https://getbootstrap.com/dist/css/bootstrap.min.css" rel="stylesheet">',
    '<button id="showLetter" type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal">',
    'View Cover Letter',
    '</button>',
    '<div class="modal fade" id="myModal" tabindex="-1" role="dialog" area-labelledby="myModalLabel">',
    '   <div class="modal-dialog" role="document">',
    '       <div class="modal-content">',
    '           <div class="modal-header">',
    '               <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
    '               <h4 class="modal-title" id="myModalLabel">Modal title</h4>',
    '           </div>',
    '           <div class="modal-body">',
    '               <p>Text</p>',
    '           </div>',
    '           <div class="modal-footer">',
    '               <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>',
    '           </div>',
    '       </div>',
    '   </div>',
    '</div>',
    '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>',
    '<script>window.jQuery || document.write(\'<script src="https://getbootstrap.com/assets/js/vendor/jquery.min.js"><\\/script>\')</script>',
    '<script src="https://getbootstrap.com/dist/js/bootstrap.min.js"></script>',
].join("\n");

parentObj.innerHTML = content;

var l = document.getElementById('showLetter');
l.click();

