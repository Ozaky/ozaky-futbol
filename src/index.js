const app = require("express")();
const cors = require('cors')
const cheerio = require("cheerio");
const rs = require("request");
const port = 5000;

app.use(cors());

app.get("/", (req, res) => {
    let info = {
        list: "http://localhost:5000/api/list",
        return_url: "http://localhost:5000/api/return/url/:link",
    };
    res.send(info);
});

app.get("/api/list", (req, res) => {
    let results = [];
    
    
    url = 'https://www.rojadirectaenvivo.pl/programacion.php';
    rs(url, (error, response, html) => {
      if (!error) {
        try {

            var $ = cheerio.load(html);

            $('body > .container > div.main > #wraper > ul.menu > li').each((index , element) =>{
                const $element = $(element);
                const className = $element.attr('class') || '';
               
                let links = [];
                /* const name = $element.find('a').first().text(); */

                const $aElement = $element.find('a').first();
                const name = $aElement.contents().filter(function() {
                    return this.type === 'text'; // Filtrar solo los nodos de tipo texto (excluir spans)
                }).text().trim();
                const date = $element.find('a span.t').text();
                $element.find('ul > li').each((index , element) =>{
                    const $element = $(element);
                    
                    let name_link = $element.find('a').text();
                    let link = $element.find('a').attr('href');
                    
                    links.push({name_link: name_link, link: link})
                })
                
                /* console.log(links, name) */
                
                results.push({
                  name: name || null,
                  date: date || null,
                  links: links || null,
                  className: className || null
                })
      
            })
             
          res.status(200).json(results);
        } catch (e) {
          res.status(404).json({ e: "500 server error!" });
        }
      }
    });
});

app.get("/api/return/url/:link", (req, res) => {
    let results = {};
    let url = req.params.link;
    console.log(url)
    rs(url, (error, response, html) => {
      if (!error) {
        try {

          var $ = cheerio.load(html);

          const link = $('.main > .embed-responsive > iframe').attr('src');
          console.log(link)

          results.link = link || null;
            
          res.status(200).json(results);
        } catch (e) {
          res.status(404).json({ e: "500 server error!" });
        }
      }
    });
});

app.listen(port, () => console.log("running on 5000"));

module.exports = app;