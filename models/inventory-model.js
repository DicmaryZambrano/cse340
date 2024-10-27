const pool = require("../database/")

/* *****************************
 * Insert a new classification
 ***************************** */
async function insertClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name)
                 VALUES ($1) RETURNING *`;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.log("Error while inserting to classification: " + error)
    throw new Error('Insert Classification Error: ' + error.message);
  }
}

/* *****************************
 * Insert a new inventory item
 ***************************** */
async function insertInventory({
  inv_make, inv_model, inv_year, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_miles,
  inv_color, classification_id
}) {
  try {
    const sql = `INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const result = await pool.query(sql, [
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    ]);
    return result.rows[0];
  } catch (error) {
    console.log("Error while inserting to inventory: " + error)
    throw new Error('Insert Inventory Error: ' + error.message);
  }
}

/* *****************************
 * Update inventory item
 ***************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.log("Error while updating inventory: " + error)
    throw new Error('Update Inventory Error: ' + error.message);
  }
}

/* *****************************
 * Delete inventory item
 ***************************** */
async function deleteInventoryItem(
  inv_id
) {
  try {
    const sql =
      "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [
      inv_id
    ])
    return data
  } catch (error) {
    console.log("Error while deleting from inventory: " + error)
    throw new Error('Deleting Inventory Error: ' + error.message);
  }
}

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
  } catch (error) {
    console.log("Error while deleting from inventory: " + error)
    throw new Error('Error while fetching classification: ' + error.message);
  }
}

/* **********************
 *   Check for existing classification name
 * ********************* */
async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM public.classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error) {
    console.log("Error while checking classification: " + error)
    throw new Error('Checking Classification Error: ' + error.message);
  }
}

/* **********************
 *   Check for classification by id
 * ********************* */
async function checkClassificationById(classification_id) {
  try {
    const sql = "SELECT * FROM public.classification WHERE classification_id = $1"
    const classification = await pool.query(sql, [classification_id])
    return classification.rowCount
  } catch (error) {
    console.log("Error while checking classification: " + error)
    throw new Error('Checking Classification Error: ' + error.message);
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.log("Error while getting classification: " + error)
    throw new Error('Getting classification Error: ' + error.message);
  }
}

async function getVehicleById(invId) {
  try {
    const result = await pool.query("SELECT * FROM public.inventory WHERE inv_id = $1", [invId]);
    return result.rows[0];
  } catch (error) {
    console.log("Error while getting vehicle: " + error)
    throw new Error('Getting Vehicle Error: ' + error.message);
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, checkExistingClassification, checkClassificationById, insertClassification, insertInventory, updateInventory, deleteInventoryItem };