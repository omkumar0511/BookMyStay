class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'city', 'minPrice', 'maxPrice', 'starRating', 'amenities'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    let filters = JSON.parse(queryStr);
    
    if (this.queryString.city) {
      filters['address.city'] = { $regex: this.queryString.city, $options: 'i' };
    }
    
    if (this.queryString.minPrice || this.queryString.maxPrice) {
      filters.priceFrom = {};
      if (this.queryString.minPrice) filters.priceFrom.$gte = Number(this.queryString.minPrice);
      if (this.queryString.maxPrice) filters.priceFrom.$lte = Number(this.queryString.maxPrice);
    }
    
    if (this.queryString.starRating) {
      filters.starRating = { $gte: Number(this.queryString.starRating) };
    }
    
    if (this.queryString.amenities) {
      const amenitiesArr = this.queryString.amenities.split(',');
      filters.amenities = { $all: amenitiesArr };
    }

    this.query = this.query.find(filters);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
