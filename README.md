Welcome to the DevConf 2.0 Website

# Installation

## Setup for Windows
If you are on Windows see the then you need Ruby `choco install ruby` and node `choco install nodejs`.

## Setup for Linux
Currently this is the latest that has been tested with WSL

`sudo apt-get install ruby-full`
`sudo apt-get install -y nodejs`
`sudo apt-get install build-essential`
`curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`
`echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`
`sudo apt-get update && sudo apt-get install yarn`

## Next Steps

The website uses [Jekyll](https://jekyllrb.com/) so you need to install that first with `gem install bundler jekyll`.

Once done you also need to run `gem install jekyll-redirect-from` to install the dependencies.

Next install the development tools with `yarn install`

# development

```
yarn start
```

# compile
  
To compile it is
```
jekyll build
```
  
You can swop `build` for `serve` to run the web server which does incremental updates as you change files.

---

Useful tools
- https://www.textfixer.com/html/convert-text-html.php
- https://app.grammarly.com
  