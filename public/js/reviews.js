'use strict'

document.addEventListener("DOMContentLoaded", async () => {
  const reviewsContainer = document.getElementById("reviews-container");
  const invId = reviewsContainer.dataset.invId;
  const accountId = reviewsContainer.dataset.account_id;
  const accountType = reviewsContainer.dataset.account_type;

  // URL to fetch reviews
  const reviewsUrl = `/review/getReviews/${invId}`;

  // Fetch reviews for the vehicle
  try {
    const response = await fetch(reviewsUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch reviews.");
    }
    const reviews = await response.json();

    // Fetch account information for each review
    const reviewsWithAccountData = await Promise.all(reviews.map(async review => {
      try {
        const accountResponse = await fetch(`/account/getAccount/${review.client_id}`);
        if (!accountResponse.ok) {
          throw new Error(`Failed to fetch account data for client ID: ${review.client_id}`);
        }
        const accountData = await accountResponse.json();
        review.first_name = accountData.account_firstname;
        review.last_name = accountData.account_lastname;
        return review;
      } catch (error) {
        console.error("Error fetching account data:", error);
        return review;
      }
    }));

    // Separate client review and other reviews
    const yourReviewContainer = document.getElementById("your-review-container");
    const allReviewsContainer = document.getElementById("all-reviews-container");

    const yourReviews = reviewsWithAccountData.filter(review => review.client_id === parseInt(accountId));
    const otherReviews = reviewsWithAccountData.filter(review => review.client_id !== parseInt(accountId));

    // Display the client's review (only if logged in as Client)
    if (accountType === "Client") {
      if (yourReviews.length > 0) {
        const yourReviewHtml = yourReviews.map(review => generateReviewHtml(review, true, accountType)).join('');
        yourReviewContainer.innerHTML = yourReviewHtml;
      } else {
        yourReviewContainer.innerHTML = "<p>You haven't reviewed this vehicle yet.</p>";
      }
    }

    // Display all other reviews
    if (otherReviews.length > 0) {
      const otherReviewsHtml = otherReviews.map(review => generateReviewHtml(review, false, accountType)).join('');
      allReviewsContainer.innerHTML = otherReviewsHtml;
    } else {
      allReviewsContainer.innerHTML = "<p>No reviews available.</p>";
    }

  } catch (error) {
    console.error("There was a problem fetching reviews: ", error.message);
  }
});

// Generate review HTML
function generateReviewHtml(review, isClientReview, accountType) {
  const { review_id, review_text, rating, created_at, updated_at, first_name, last_name } = review;
  const createdDate = new Date(created_at).toLocaleDateString();
  const updatedDate = updated_at !== created_at ? new Date(updated_at).toLocaleDateString() : null;

  let html = `
    <div class="review">
      <h5>${first_name} ${last_name} (${rating} stars)</h5>
      <p>${review_text}</p>
      <small>Posted on: ${createdDate}${updatedDate ? ` | Edited on: ${updatedDate}` : ''}</small>
  `;

  // Allow edit/delete buttons if it's the client's review
  if (isClientReview || accountType === "Admin" || accountType === "Employee") {
    html += `
      <div class="review-actions">
        ${isClientReview ? `<a href="/review/edit-review/${review_id}">Edit</a>` : ""}
        <a href="/review/delete-review/${review_id}">Delete</a>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}
