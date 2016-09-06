# installation
The website uses [Jekyll](https://jekyllrb.com/) so you need to install that first with `gem install jekyll`.
If you are on Windows see the [special Windows instructions](https://jekyllrb.com/docs/windows/#installation).

Once done you also need to run `gem install jekyll-redirect-from` to install the dependencies.

Next is to run `npm install` to get gulp and the other tools we use installed.

# compile

To compile it is
```
gulp style
gulp scripts
jekyll build
```

You can swop `build` for `serve` to run the web server which does incremental updates as you change files.
  