// const moment = require('moment-timezone');
const { error } = require('../common/res.common');
const { http_codes, messages } = require('../constant/text.constant');
// const { sign } = require("jsonwebtoken");
// const { hash, compare } = require("bcrypt");
const axios = require('axios');
const cheerio = require('cheerio');
// const { SECRET_KEY, PDF_TO_PPTX_API_URL } = process.env

const checkMissingParameters = (
    req,
    res,
    config = {
        params: undefined,
        query: undefined,
        body: undefined,
    }
) => {
    const missingParams = [];

    for (const reqProp in config) {
        if (Object.hasOwnProperty.call(config, reqProp)) {
            const reqPropArr = config[reqProp];

            reqPropArr.forEach((el) => {
                const value = req[reqProp][el];
                if (value == 0) return;
                if (!value || value == `:${el}`) missingParams.push(el);
            });
        }
    }

    //checking missing params
    if (missingParams.length) {
        return error({
            code: http_codes.badRequest,
            msg: messages.missingfields.replace("@Fields", `${missingParams.join(",")}`),
            res,
            method: "checkMissingParameters"
        })
    } else {
        return null;
    }
};

const  getGoogleNewsImage = async (articleUrl) => {
    try {
      const { data } = await axios.get(articleUrl);
      const $ = cheerio.load(data);
      const imageUrl = $('meta[property="og:image"]').attr("content");
      return imageUrl || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  


module.exports = {
    checkMissingParameters,
    getGoogleNewsImage
}