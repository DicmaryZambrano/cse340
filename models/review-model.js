const pool = require("../database/")

/* ***************************
 *  Get all reviews by inventory ID
 * ************************** */
async function getReviewsByInventoryId(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.reviews
      WHERE inv_id = $1`,
      [invId]
    );
    return data.rows;
  } catch (error) {
    console.error("getReviewsByInventoryId error: " + error);
    throw error;
  }
}

/* ***************************
 *  Insert a new review
 * ************************** */
async function insertReview(inv_id, account_id, rating, review_text) {
  try {
    const sql = `INSERT INTO public.reviews (inv_id, client_id, rating, review_text)
                 VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await pool.query(sql, [inv_id, account_id, rating, review_text]);
    return result.rows[0];
  } catch (error) {
    console.error("Insert Review Error: " + error);
    throw error;
  }
}

/* ***************************
 *  Update a Review
 * ************************** */
async function updateReview(review_id, rating, review_text) {
  try {
    const sql = `UPDATE public.reviews
                 SET rating = $1, review_text = $2, updated_at = NOW()
                 WHERE review_id = $3 RETURNING *`;
    const result = await pool.query(sql, [rating, review_text, review_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Update Review Error: " + error);
    throw error;
  }
}

/* ***************************
 *  Delete a Review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM public.reviews WHERE review_id = $1 RETURNING *`;
    const result = await pool.query(sql, [review_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Delete Review Error: " + error);
    throw error;
  }
}

async function getReviewById(review_id) {
  try {
    const result = await pool.query("SELECT * FROM public.reviews WHERE review_id = $1", [review_id]);
    return result.rows[0];
  } catch (error) {
    console.log("Error while getting review: " + error)
    throw new Error('Getting Review Error: ' + error.message);
  }
}

module.exports = { getReviewsByInventoryId, insertReview, updateReview, deleteReview, getReviewById };