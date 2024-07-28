const scrapers = require("./scraper");
const fs = require("fs");

const scrapeController = async (browserInstance) => {
  const url = "https://books.toscrape.com/";
  const indexs = [0, 1, 2, 3, 4];
  try {
    let browser = await browserInstance;
    console.log("1111: ", browser);
    // Gọi hàm cạo ở file scrape
    const categories = await scrapers.scrapeCategory(browser, url);
    const selectedCategories = categories.filter((category, index) => indexs.some((i) => i === index));
    let result1 = await scrapers.scraper(browser, selectedCategories[0].link);
    fs.writeFile("data.json", JSON.stringify(result1), (err) => {
      if (err) console.log("Ghi data vô file json thất bại " + err);
      console.log("Thêm data thành công");
    });
    await browser.close(">> Trình duyệt đã đóng.");
  } catch (e) {
    console.log("Lỗi ở scrape controller" + e);
  }
};

module.exports = scrapeController;
