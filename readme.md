#   gulp-jspool   #

include any files
![](https://img.shields.io/npm/v/gulp-pool.svg?style=flat)

## Installation
```base
npm install gulp-pool
```

## use
```js  
//in code
'@include(./src/ctr.js)'

//in gulpfile.js
  ...
  let pool=require("gulp-pool");
  ...
  gulp.src("main.js").pipe(pool()).pipe(gulp.dest("dest"));
  //you can use pool({data:{name:"",age:""}}) to configure data parameters in the template
```

## write
```js
//file structure
main.js
index.html
html
    header.html
    footer.html
lib  
   utils.js
app
   action
         index.js
         lib
            slide.js


//in main.js
.... some code
'@include(./lib/utils.js)';
'@include(./app/action/index.js)';
.... some code


//in action.js
'@include(./lib/slide.js)'


//in index.html
....some code
'@include(./html/header.html)';
...
'@include(./html/footer.html)';
...some code

//in header.html,?name? use ths value in the configuration of ...pipe(pool({name:"your"}))
<div>?name?</div>

```

## next release
* supports global profile path
