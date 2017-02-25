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

while( parentObj.tagName != 'P') {
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
    '               <h4 class="modal-title" id="myModalLabel">D. Cameron Lemmon <small>Cover Letter</small></h4>',
    '           </div>',
    '           <div class="modal-body">',
    '               <p class="text-left">Dear Jason, Timm, and Kristen,</p>',
    '               <p class="text-left">&emsp;&emsp;I first discovered SparkFun while working on a class robotics project during my junior year of college.  Since then, I’ve continued to return to the website both for project components, and the incredible educational resources.  I love to spend my free time building and tinkering, making new and exciting projects, and the opportunity to bring my experience to this kind of collaborative and sharing environment is very exciting.</p>',
    '               <p class="text-left">&emsp;&emsp;I began my development experience in the open source world by diving into bug fixing CNC G-Code creator software and haven’t looked back.  More recently, I’ve spent the last three years at Hewlett Packard Enterprise working in their internal Linux team developing an OS level test and automation framework.  This project has really allowed me to expand my knowledge base, creating components ranging from back-end web services, databases, and APIs, to front-end user interfaces written in PHP complete with interactive data graphics.</p>',
    '               <p class="text-left">&emsp;&emsp;I’m very interested in a change of pace from my all-too-coperate cubical, and I am looking forward to the opportunity to work with a skilled and dynamic team.  I am looking forward to being able to contributing my experiences and continue to learn and grow as a developer.</p>',
    '               <p class="text-left">&emsp;&emsp;Thank you very much for taking the time to review my application.  If there are any question I can answer, please don’t hesitate to contact me by email or phone.  I can be reached at dclemmon@gmail.com or 970.818.6033</p>',
    '               <p class="text-left">Sincerely,</p>',
    '               <p class="text-left">Cameron Lemmon</p>',
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

