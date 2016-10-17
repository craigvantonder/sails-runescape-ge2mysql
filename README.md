# sails-runescape-ge2mysql

This is a Runescape Grand Exchange API wrapper / crawler which exports available item information to MySQL and is written in Node via the Sails framework.

More information on the Runescape Grand Exchange API is available within the [Application programming interface](http://runescape.wikia.com/wiki/Application_programming_interface) wiki.

I started this project in order to help a friend who wanted to try to build a fan site that included a search feature for the in-game items but wanted a database of items to start with. I thought that this would be an interesting task to undertake whilst learning the Sails framework.

RuneScape is a registered trademark of Jagex Ltd. I am not affiliated with Jagex Ltd. and do not condone any unintended use of this software.

## Setup

The following assumes that you have [Node](https://nodejs.org/en/), [Sails](http://sailsjs.org/) and [MySQL](http://www.mysql.com/) installed on your system.

Download this repository and extract to a location on your computer or clone the repository if you have Git installed:

    git clone https://github.com/craigvantonder/sails-runescape-ge2mysql

Navigate to the application directory:

    cd sails-runescape-ge2mysql

Install the dependencies:

    npm install

At this point you will need to import the database and table schema into your MySQL server.

You will then need to configure your MySQL server access details within the mysqlServer values of the /config/connections.js file.

You can then execute the following comment to begin syncing the item data with your MySQL database:

    node 0_create_all.js

There are some screenshots of the cli output during operation available in the /screenshots/ folder.

## Available processes

create_alphas: Stores information from:

    http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json?category=<CATEGORY ID>

create_items: Stores information from:

    http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?category=<CATEGORY ID>&alpha=<ALPHA LETTER>&page=<PAGE NUMBER>

create_icons: Stores the icons associated to each item from:

    http://services.runescape.com/m=itemdb_rs/<LAST UPDATE RUNEDAY>_obj_sprite.gif?id=<ITEM ID>

and:

    http://services.runescape.com/m=itemdb_rs/<LAST UPDATE RUNEDAY>_obj_big.gif?id=<ITEM ID>

The following list contains the amount of time that it took to complete each available process whilst testing out the functionality:

* create_alphas: 1 minute
* create_items: 1 hour
* create_icons: 1 hour

## Notes

* The current Categories were taken from the abovementioned wiki and manually entered as records into the Categories table which is available in the sql directory.
* Using the Category ID we can access the api to extract the Alpha information for each Category. At the same time and based on the amount of Items available we work out how many pages exist given 12 Items per page. It's important to note that where the Alpha is # (beginning in a numeric value) this needs to be converted to %23 in order for the API to understand which Alpha it needs to serve.
* Using the Category ID, Alpha ID and page number, we can extract the Item information for each Alpha.
* The Item information contains icon and icon_large urls and this is what we use to extract the Items icons.
* The icon URLs contain the runeday and the item id.
* The GE API has some measures in place to avoid DoS attacks and as a result your requests will be throttled if you try to access too many pages at once. The key here is to access the API in series and try to space out the time between requests.
* The majority of the functional code is stored in /api/services/.

## Todo

* Add support for adding the detailed information to the items.
* Add support for updating the item information.

## Licence

The MIT License (MIT)

Copyright © 2016 Craig van Tonder, https://craigvantonder.co.za

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.