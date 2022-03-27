class WhereClause {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const search = this.queryStr.search
      ? {
          name: {
            $regex: this.queryStr.search,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...search });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    ///Removing Filed for category
    const removeField = ["search", "page", "limit"];

    removeField.forEach((key) => delete queryCopy[key]);

    //filter price range

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));

    // console.log(queryStr);
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = WhereClause;
