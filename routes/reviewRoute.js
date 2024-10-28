// Needed Resources 
const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities")
const validate = require('../utilities/review-validation')

router.get("/add-review/:invId", utilities.checkLogin, utilities.checkClient, utilities.handleErrors(reviewController.buildAddReview));

router.get("/delete-review/:reviewId", utilities.checkLogin, utilities.checkClient, utilities.verifyReviewOwner, utilities.handleErrors(reviewController.buildDeleteReview));

router.get("/edit-review/:reviewId", utilities.checkLogin, utilities.checkClient, utilities.verifyReviewOwner, utilities.handleErrors(reviewController.buildEditReview));

router.get("/getReviews/:invId", utilities.handleErrors(reviewController.getReviewsJSON));

router.post("/add-review", utilities.checkLogin, validate.reviewRules(), validate.checkReviewData, utilities.handleErrors(reviewController.addReview));

router.post("/delete-review", utilities.checkLogin, utilities.handleErrors(reviewController.deleteReview));

router.post("/edit-review", utilities.checkLogin, validate.reviewRules(), validate.checkReviewData, utilities.handleErrors(reviewController.editReview));

module.exports = router;