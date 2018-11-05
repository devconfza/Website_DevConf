Welcome to the DevConf Website

# Installation
If you are on Windows see the then you need Ruby `choco install ruby` and node `choco install nodejs`.

The website uses [Jekyll](https://jekyllrb.com/) so you need to install that first with `gem install jekyll`.

Once done you also need to run `gem install jekyll-redirect-from` to install the dependencies.

Next is to run `npm install` to get gulp and the other tools we use installed. You will likely need gulp too `npm install -g gulp` and `npm i -g gulp-cli`.

# compile

To compile it is
```
gulp style
gulp update
jekyll build
```

You can swop `build` for `serve` to run the web server which does incremental updates as you change files.

---

Useful tools
- https://www.textfixer.com/html/convert-text-html.php
- https://app.grammarly.com
  