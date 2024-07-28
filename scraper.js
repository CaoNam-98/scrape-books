const scrapeCategory = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let page = await browser.newPage();
      console.log(">> Mở tab mới ...");
      await page.goto(url);
      console.log(">> truy cập vào " + url);
      // đợi cho selector trong () load xong
      await page.waitForSelector("#default");
      console.log(">> Website đã load xong...");

      const dataCategory = await page.$$eval(".side_categories > ul.nav-list > li > ul > li", (els) => {
        dataCategory = els.map((el) => {
          return {
            category: el.querySelector("a").innerText,
            link: el.querySelector("a").href,
          };
        });
        return dataCategory;
      });

      console.log(dataCategory);
      await page.close();
      console.log(">> Tab đã đóng.");
      resolve(dataCategory);
    } catch (error) {
      console.log("lỗi ở scrape category" + error);
      reject(error);
    }
  });

const scraper = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let newPage = await browser.newPage();
      console.log(">> Đã mở tab mới");
      await newPage.goto(url);
      console.log(">> Đã truy cập vào trang " + url);
      await newPage.waitForSelector(".page_inner");
      console.log(">> Đã load xong tag main...");

      const scrapeData = {};

      // Lấy link detail item
      const detailLinks = await newPage.$$eval("section > div > ol.row > li", (els) => {
        detailLinks = els.map((el) => {
          return el.querySelector("article.product_pod > .image_container > a").href;
        });
        return detailLinks;
      });

      // Get title header
      var titleCategory = await newPage.$eval(".row .page-header", (el) => {
        return el.querySelector("h1").innerText.toLowerCase();
      });

      console.log("1111: ", titleCategory);

      const scraperDetail = async (link) =>
        new Promise(async (resolve, reject) => {
          try {
            let pageDetail = await browser.newPage();
            await pageDetail.goto(link);
            console.log(">> Truy cập " + link);
            await pageDetail.waitForSelector(".container-fluid.page");

            let detailData = {};

            // Bắt đầu cạo
            // Cạo ảnh detail
            const images = await pageDetail.$eval(
              ".page_inner > .content > #content_inner > article.product_page > .row > div > #product_gallery > .thumbnail > .carousel-inner",
              (el) => {
                return {
                  imageUrl: el.querySelector("div.item > img").src,
                };
              }
            );

            // console.log(images);
            // detailData.imageUrl = images;

            // Lấy header detail
            const header = await pageDetail.$eval("div.product_main", (el) => {
              return {
                bookTitle: el.querySelector("h1").innerText,
                bookPrice: el.querySelector(".price_color").innerText?.replace(/^\D+/g, ""),
                available: el
                  .querySelector(".instock.availability")
                  .innerText?.replace(/^\D+/g, "")
                  ?.replace(" available)", ""),
              };
            });

            // Get description
            const description = await pageDetail.$eval("#content_inner", (el) => {
              return {
                bookDescription: el.querySelector("article.product_page > p").innerText,
              };
            });

            //   Get upc
            const upc = await pageDetail.$eval("#content_inner", (el) => {
              return {
                upc: el.querySelector("table.table-striped > tbody > tr:first-child > td").innerText,
              };
            });

            detailData = {
              ...header,
              ...images,
              ...description,
              ...upc,
            };

            await pageDetail.close();
            console.log(">>  Đã đóng tab " + link);

            console.log("Nam cao: ", detailData);
            resolve(detailData);
          } catch (error) {
            console.log("error: ", error);
            reject(error);
          }
        });

      const details = [];
      console.log("detailLinks: ", detailLinks);
      for (let link of detailLinks) {
        console.log("link: ", link);
        const detail = await scraperDetail(link);
        details.push(detail);
      }

      scrapeData[titleCategory] = details;
      console.log("heheheh: ", scrapeData);

      resolve(scrapeData);
    } catch (error) {
      reject(error);
    }
  });

module.exports = {
  scrapeCategory,
  scraper,
};
