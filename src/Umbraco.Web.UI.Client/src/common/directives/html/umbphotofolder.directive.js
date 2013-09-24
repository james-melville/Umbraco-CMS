/**
* @ngdoc directive
* @name umbraco.directives.directive:umbPhotoFolder
* @restrict E
**/
angular.module("umbraco.directives.html")
.directive('umbPhotoFolder', function ($compile, $log, $timeout, imageHelper) {

  return {
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    terminate: true,
    templateUrl: 'views/directives/html/umb-photo-folder.html',
    link: function(scope, element, attrs, ngModel) {
      
      element.ready(function(){
        var wat = 1;

      });

      ngModel.$render = function() {

        if(ngModel.$modelValue){

          $timeout(function(){

          var photos = ngModel.$modelValue;
          var rows = [];

          scope.baseline = element.attr('baseline') | 0;
          scope.minWidth = element.attr('minwidth') | 420;
          scope.minHeight = element.attr('minheight') | 200;
          scope.border = element.attr('border') | 5;

          scope.lastWidth = Math.max(element.width(), scope.minWidth);

          // get row width - this is fixed.
          var w = scope.lastWidth;


          // initial height - effectively the maximum height +/- 10%;
          var h = Math.max(scope.minHeight,Math.floor(w / 5));
         

          // store relative widths of all images (scaled to match estimate height above)
          var ws = [];
          $.each(photos, function(key, val) {
            val.width_n = $.grep(val.properties, function(val, index) {return (val.alias === "umbracoWidth");})[0].value;
            val.height_n = $.grep(val.properties, function(val, index) {return (val.alias === "umbracoHeight");})[0].value;
            val.url_n = imageHelper.getThumbnail({ imageModel: val, scope: scope });
            
            var wt = parseInt(val.width_n, 10);
            var ht = parseInt(val.height_n, 10);
            
            if( ht !== h ) { 
              wt = Math.floor(wt * (h / ht)); 
            }
            
            ws.push(wt);
          });


          var rowNum = 0;
          var limit = photos.length;

          while(scope.baseline < limit)
          {
              rowNum++;
              // number of images appearing in this row
              var c = 0;
              // total width of images in this row - including margins
              var tw = 0;

              // calculate width of images and number of images to view in this row.
              while( (tw * 1.1 < w) && (scope.baseline + c < limit))
              {
                tw += ws[scope.baseline + c++] + scope.border * 2;
              }

              // Ratio of actual width of row to total width of images to be used.
              var r = w / tw; 
              // image number being processed
              var i = 0;
              // reset total width to be total width of processed images
              tw = 0;

              // new height is not original height * ratio
              var ht = Math.floor(h * r);

              var row = {};
              row.photos = [];
              row.style = {};
              row.style = {"height": ht + scope.border * 2, "width": scope.lastWidth};
              rows.push(row);

              while( i < c )
              {
                var photo = photos[scope.baseline + i];
                // Calculate new width based on ratio
                var wt = Math.floor(ws[scope.baseline + i] * r);
                // add to total width with margins
                tw += wt + scope.border * 2;

                // Create image, set src, width, height and margin
                var purl = photo.url_n;
                photo.style = {"width": wt, "height": ht, "margin": scope.border+"px", "cursor": "pointer"};
                row.photos.push(photo);
                i++;
              }

              // set row height to actual height + margins
              scope.baseline += c;

              // if total width is slightly smaller than 
              // actual div width then add 1 to each 
              // photo width till they match
              i = 0;
              while( tw < w )
              {
                row.photos[i].style.width++;
                i = (i + 1) % c;
                tw++;
              }

              // if total width is slightly bigger than 
              // actual div width then subtract 1 from each 
              // photo width till they match
              i = 0;
              while( tw > w )
              {
                row.photos[i].style.width--;
                i = (i + 1) % c;
                tw--;
              }
            }

            //populate the scope
            scope.rows = rows;

            }, 500); //end timeout
          } //end if modelValue

        }; //end $render
    }
  };
});