const reviewModel = require("../models/review-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const reviewCont = {};

/* ****************************************
*  Build Add Review View
* *************************************** */
reviewCont.buildAddReview = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId);
  const vehicle = await invModel.getVehicleById(inv_id);
  let nav = await utilities.getNav();
  try {
    res.render("./review/add-review", {
      title: `Add Review for ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      inv_id,
      errors: null
    });
  } catch (error) {
    console.error("Error while building review view:", error);
    error.status = 500;
    next(error);
  }
};

/* ****************************************
*  Add a New Review
* *************************************** */
reviewCont.addReview = async function (req, res, next) {
  const { inv_id, account_id, rating, review_text } = req.body;
  let nav = await utilities.getNav();
  const vehicle = await invModel.getVehicleById(inv_id);

  try {
    const result = await reviewModel.insertReview(inv_id, account_id, rating, review_text);
    if (result) {
      req.flash("notice", "Review added successfully!");
      res.status(201).redirect(`/inv/detail/${inv_id}`);
    } else {
      req.flash("notice", "Sorry, adding the review failed.");
      res.status(500).render("./review/add-review", {
        title: `Add Review for ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        invId: inv_id,
        errors: null,
      });
    }
  } catch (error) {
    req.flash("notice", "Error adding review.");
    res.status(500).render("./review/add-review", {
      title: `Add Review for ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      invId: inv_id,
      errors: null,
    });
  }
};

/* ****************************************
*  Build Edit Review View
* *************************************** */
reviewCont.buildEditReview = async function (req, res, next) {
  const reviewId = parseInt(req.params.reviewId);
  let nav = await utilities.getNav();
  try {
    const review = await reviewModel.getReviewById(reviewId);
    if (review) {
      res.render("./review/edit-review", {
        title: `Edit Review`,
        nav,
        review_id: review.review_id,
        inv_id: review.inv_id,
        rating: review.rating,
        review_text: review.review_text,
        errors: null,
      });
    } else {
      req.flash("notice", "Review not found.");
      res.redirect(`/inv/details/${review.inv_id}`);
    }
  } catch (error) {
    console.error("Error while building edit review:", error);
    error.status = 500;
    next(error);
  }
};

/* ****************************************
*  Edit Review
* *************************************** */
reviewCont.editReview = async function (req, res, next) {
  const { review_id, rating, review_text } = req.body;
  let nav = await utilities.getNav();

  try {
    const result = await reviewModel.updateReview(review_id, rating, review_text);
    if (result) {
      req.flash("notice", "Review updated successfully!");
      res.status(201).redirect(`/inv/detail/${result.inv_id}`);
    } else {
      req.flash("notice", "Sorry, the review update failed.");
      res.status(500).render("./review/edit-review", {
        title: "Edit Review",
        nav,
        review: { review_id, rating, review_text },
        errors: null,
      });
    }
  } catch (error) {
    req.flash("notice", "Error updating review.");
    res.status(500).render("./review/edit-review", {
      title: "Edit Review",
      nav,
      review: { review_id, rating, review_text },
      errors: null,
    });
  }
};

/* ****************************************
*  Build Delete Review Confirmation View
* *************************************** */
reviewCont.buildDeleteReview = async function (req, res, next) {
  const reviewId = parseInt(req.params.reviewId);
  let nav = await utilities.getNav();

  try {
    const review = await reviewModel.getReviewById(reviewId);
    if (review) {
      res.render("./review/delete-review", {
        title: "Delete Review",
        nav,
        review_id: review.review_id,
        inv_id: review.inv_id,
        rating: review.rating,
        review_text: review.review_text,
        errors: null,
      });
    } else {
      const error = new Error("We could not access the review, try again later.");
      error.status = 500;
      console.error("Error fetching reviews: ", error);
      next(error);
    }
  } catch (error) {
    console.error("Error while building delete review:", error);
    error.status = 500;
    next(error);
  }
};

/* ****************************************
*  Delete Review
* *************************************** */
reviewCont.deleteReview = async function (req, res, next) {
  const { review_id } = req.body;
  let nav = await utilities.getNav();

  try {
    // Get the review details to retrieve the inv_id before deleting
    const review = await reviewModel.getReviewById(review_id);

    if (!review) {
      req.flash("notice", "Review not found.");
      return res.redirect("/inv/");
    }

    // Proceed to delete the review
    const result = await reviewModel.deleteReview(review_id);
    if (result) {
      req.flash("notice", "Review deleted successfully!");
      res.redirect(`/inv/detail/${review.inv_id}`);
    } else {
      req.flash("notice", "Sorry, the review delete failed.");
      res.status(500).render("./review/delete-review", {
        title: "Delete Review",
        nav,
        review_id,
        errors: null,
      });
    }
  } catch (error) {
    req.flash("notice", "Error deleting review.");
    res.status(500).render("./review/delete-review", {
      title: "Delete Review",
      nav,
      review_id,
      errors: null,
    });
  }
};


/* ***************************
 *  Return Review List As JSON
 * ************************** */
reviewCont.getReviewsJSON = async (req, res, next) => {
  const invId = parseInt(req.params.invId);
  try {
    const reviewData = await reviewModel.getReviewsByInventoryId(invId);

    if (reviewData.length > 0) {
      return res.json(reviewData);
    } else {
      return res.json([]);
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    error.status = 500;
    next(error);
  }
};

module.exports = reviewCont;
